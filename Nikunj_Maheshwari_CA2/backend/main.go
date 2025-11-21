package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

var db *sql.DB

// Tag struct → represents a row in the tags table
type Tag struct {
	ID    int    `json:"id"`
	Label string `json:"label"`
}

// Note struct → represents a row in the notes table
type Note struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Markdown string `json:"markdown"`
	Tags     []Tag  `json:"tags,omitempty"`
}

// User struct → represents a row in the users table
type User struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
}

// UserTag struct → represents a row in the user_tags table which corresponds to each user's preferred tags
type UserTag struct {
	UserID int `json:"user_id"`
	TagID  int `json:"tag_id"`
}

// enhancedRouter wraps mux.Router with middleware
func enhancedRouter() *mux.Router {
	r := mux.NewRouter()
	r.Use(enableCORS) // CORS middleware must be first!
	r.Use(JSONContentTypeMiddleware)
	return r
}

// Middleware → always set Content-Type: application/json
func JSONContentTypeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

// Middleware → enable CORS properly
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("CORS middleware: %s %s\n", r.Method, r.URL.Path)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	var err error

	// Connect to Postgres
	db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("✅ Connected to Postgres")

	// Create tables if they don’t exist
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS notes (
			id SERIAL PRIMARY KEY,
			title TEXT NOT NULL,
			markdown TEXT
		);

		CREATE TABLE IF NOT EXISTS tags (
			id SERIAL PRIMARY KEY,
			label TEXT UNIQUE NOT NULL
		);

		CREATE TABLE IF NOT EXISTS note_tags (
			note_id INT REFERENCES notes(id) ON DELETE CASCADE,
			tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
			PRIMARY KEY (note_id, tag_id)
		);

		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email TEXT UNIQUE NOT NULL
		);

		CREATE TABLE IF NOT EXISTS user_tags (
			user_id INT REFERENCES users(id) ON DELETE CASCADE,
			tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
			PRIMARY KEY (user_id, tag_id)
		);
    `)
	if err != nil {
		log.Fatalf("❌ Failed to create tables: %v", err)
	}

	fmt.Println("✅ Tables are ready")

	// Router
	r := enhancedRouter()

	// Routes -> Tags
	r.HandleFunc("/tags", createTag).Methods("POST")
	r.HandleFunc("/tags", getTags).Methods("GET")
	r.HandleFunc("/tags/{id}", getTag).Methods("GET")
	r.HandleFunc("/tags/{id}", updateTag).Methods("PUT")
	r.HandleFunc("/tags/{id}", deleteTag).Methods("DELETE")

	// Routes -> Notes
	r.HandleFunc("/notes/by-tags", getNotesByTagsHandler).Methods("GET")
	r.HandleFunc("/notes", createNote).Methods("POST")
	r.HandleFunc("/notes", getNotes).Methods("GET")
	r.HandleFunc("/notes/{id}", getNote).Methods("GET")
	r.HandleFunc("/notes/{id}", updateNote).Methods("PUT")
	r.HandleFunc("/notes/{id}", deleteNote).Methods("DELETE")

	// Routes -> User Interests
	r.HandleFunc("/users/{id}/tags", getUserTags).Methods("GET")
	r.HandleFunc("/users/{id}/tags", setUserTags).Methods("POST")
	r.HandleFunc("/users/{id}/tags", replaceUserTags).Methods("PUT")
	r.HandleFunc("/users/{id}/tags", deleteUserTags).Methods("DELETE")

	// Routes -> Users
	r.HandleFunc("/users/{id}", getUser).Methods("GET")
	r.HandleFunc("/users/by-supabase/{uuid}", getUserByUUID).Methods("GET")

	// Handle all OPTIONS requests globally (for CORS preflight)
	r.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		http.NotFound(w, r)
	})

	// Start server
	log.Println("🚀 Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func atoi(s string) int {
	i, _ := strconv.Atoi(s)
	return i
}

// Add this helper function above your handlers
func getOrCreateTagID(tag Tag) (int, error) {
	// Case 1: ID is provided
	if tag.ID != 0 {
		var existingLabel string
		err := db.QueryRow("SELECT label FROM tags WHERE id=$1", tag.ID).Scan(&existingLabel)
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("tag with ID %d does not exist", tag.ID)
		} else if err != nil {
			return 0, err
		}

		// If label is also provided, check consistency
		if tag.Label != "" && tag.Label != existingLabel {
			return 0, fmt.Errorf("tag ID %d exists but label mismatch (%s vs %s)", tag.ID, existingLabel, tag.Label)
		}

		return tag.ID, nil
	}

	// Case 2: Label is provided
	if tag.Label != "" {
		var id int
		err := db.QueryRow("SELECT id FROM tags WHERE label=$1", tag.Label).Scan(&id)
		if err == sql.ErrNoRows {
			// Insert new tag
			err = db.QueryRow("INSERT INTO tags(label) VALUES($1) RETURNING id", tag.Label).Scan(&id)
			if err != nil {
				return 0, err
			}
			return id, nil
		} else if err != nil {
			return 0, err
		}
		return id, nil
	}

	return 0, fmt.Errorf("invalid tag: must provide id or label")
}

// Handler → create a new tag
func createTag(w http.ResponseWriter, r *http.Request) {
	var t Tag

	// Decode request body into struct
	err := json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Insert into DB
	err = db.QueryRow("INSERT INTO tags(label) VALUES($1) RETURNING id", t.Label).Scan(&t.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}

// Handler → Fetch all tags
func getTags(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT * FROM tags")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tags []Tag
	for rows.Next() {
		var t Tag
		if err := rows.Scan(&t.ID, &t.Label); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tags = append(tags, t)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}

// Handler → Get a single tag by ID
func getTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var t Tag
	err := db.QueryRow("SELECT * FROM tags WHERE id = $1", id).Scan(&t.ID, &t.Label)
	if err == sql.ErrNoRows {
		http.Error(w, "Tag not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(t)
}

// Handler → Update a tag
func updateTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var t Tag
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := db.Exec("UPDATE tags SET label = $1 WHERE id = $2", t.Label, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	t.ID = atoi(id) // helper to convert string→int
	json.NewEncoder(w).Encode(t)
}

// Handler → Delete a tag
func deleteTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := db.Exec("DELETE FROM tags WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204, no body
}

// Handler → Create a new note
func createNote(w http.ResponseWriter, r *http.Request) {
	var n Note
	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Insert into notes table
	err := db.QueryRow(
		`INSERT INTO notes (title, markdown) 
         VALUES ($1, $2) 
         RETURNING id`,
		n.Title, n.Markdown,
	).Scan(&n.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Handle tags
	var tags []Tag
	for _, tag := range n.Tags {
		tagID, err := getOrCreateTagID(tag)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		_, err = db.Exec("INSERT INTO note_tags (note_id, tag_id) VALUES ($1, $2)", n.ID, tagID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tags = append(tags, Tag{ID: tagID, Label: tag.Label})
	}

	n.Tags = tags
	json.NewEncoder(w).Encode(n)
}

// Handler → Fetch all notes
func getNotes(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT * FROM notes")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notes []Note
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.Title, &n.Markdown); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// fetch tags for this note
		tagRows, err := db.Query(`
            SELECT t.id, t.label
            FROM tags t
            INNER JOIN note_tags nt ON nt.tag_id = t.id
            WHERE nt.note_id = $1`, n.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer tagRows.Close()

		for tagRows.Next() {
			var t Tag
			if err := tagRows.Scan(&t.ID, &t.Label); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			n.Tags = append(n.Tags, t)
		}

		notes = append(notes, n)
	}

	json.NewEncoder(w).Encode(notes)
}

// Handler → Get a single note by ID
func getNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var n Note
	err := db.QueryRow(
		"SELECT id, title, markdown FROM notes WHERE id=$1", id,
	).Scan(&n.ID, &n.Title, &n.Markdown)

	if err == sql.ErrNoRows {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// fetch tags for this note
	tagRows, err := db.Query(`
        SELECT t.id, t.label
        FROM tags t
        INNER JOIN note_tags nt ON nt.tag_id = t.id
        WHERE nt.note_id = $1`, n.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tagRows.Close()

	for tagRows.Next() {
		var t Tag
		if err := tagRows.Scan(&t.ID, &t.Label); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		n.Tags = append(n.Tags, t)
	}

	json.NewEncoder(w).Encode(n)
}

// Handler → Update a note
func updateNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var n Note
	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// update note details
	err := db.QueryRow(
		`UPDATE notes 
         SET title=$1, markdown=$2, updated_at=now() 
         WHERE id=$3 
         RETURNING id, title, markdown`,
		n.Title, n.Markdown, id,
	).Scan(&n.ID, &n.Title, &n.Markdown)

	if err == sql.ErrNoRows {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// clear old tags
	_, err = db.Exec("DELETE FROM note_tags WHERE note_id=$1", n.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// re-insert tags
	var tags []Tag
	for _, tag := range n.Tags {
		tagID, err := getOrCreateTagID(tag)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		_, err = db.Exec("INSERT INTO note_tags (note_id, tag_id) VALUES ($1, $2)", n.ID, tagID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tags = append(tags, Tag{ID: tagID, Label: tag.Label})
	}

	n.Tags = tags
	json.NewEncoder(w).Encode(n)
}

// Handler → Delete a note
func deleteNote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	res, err := db.Exec("DELETE FROM notes WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204 No Content
}

// GET /users/{id}/tags → fetch a user's selected interests
func getUserTags(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	rows, err := db.Query(`
        SELECT t.id, t.label
        FROM tags t
        INNER JOIN user_tags ut ON ut.tag_id = t.id
        WHERE ut.user_id = $1
    `, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tags []Tag
	for rows.Next() {
		var t Tag
		if err := rows.Scan(&t.ID, &t.Label); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tags = append(tags, t)
	}

	json.NewEncoder(w).Encode(tags)
}

// POST /users/{id}/tags → set a user's interests
func setUserTags(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	var tags []Tag
	if err := json.NewDecoder(r.Body).Decode(&tags); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Clear old tags
	_, err = tx.Exec("DELETE FROM user_tags WHERE user_id=$1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert new tags
	for _, tag := range tags {
		_, err = tx.Exec("INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2)", userID, tag.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// PUT /users/{id}/tags → replace a user's interests
func replaceUserTags(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	var tags []Tag
	if err := json.NewDecoder(r.Body).Decode(&tags); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Clear old tags
	_, err = tx.Exec("DELETE FROM user_tags WHERE user_id=$1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert new tags
	for _, tag := range tags {
		_, err = tx.Exec("INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2)", userID, tag.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if err = tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "replaced"})
}

// DELETE /users/{id}/tags → remove all interests for a user
func deleteUserTags(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	res, err := db.Exec("DELETE FROM user_tags WHERE user_id=$1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "No tags found for this user", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

// GET /users/{id} → fetch a single user
func getUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	var u User
	err := db.QueryRow("SELECT id, email FROM users WHERE id=$1", userID).Scan(&u.ID, &u.Email)
	if err == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(u)
}

// GET /users/by-supabase/{uuid} → fetch user by Supabase UUID
func getUserByUUID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uuid := vars["uuid"]

	var u User
	err := db.QueryRow("SELECT id, email FROM users WHERE supabase_id=$1", uuid).Scan(&u.ID, &u.Email)
	if err == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(u)
}

// GET /notes/by-tags?tagIds=1,2,3
func getNotesByTagsHandler(w http.ResponseWriter, r *http.Request) {
	tagIdsQuery := r.URL.Query().Get("tagIds")
	if tagIdsQuery == "" {
		http.Error(w, "tagIds parameter is required", http.StatusBadRequest)
		return
	}

	tagIds := strings.Split(tagIdsQuery, ",")
	placeholders := make([]string, len(tagIds))
	args := make([]interface{}, len(tagIds))
	for i, id := range tagIds {
		placeholders[i] = fmt.Sprintf("$%d", i+1) // Postgres style
		args[i] = id
	}

	// 1️⃣ First, fetch notes matching tags
	query := fmt.Sprintf(`
        SELECT DISTINCT n.id, n.title, n.markdown
        FROM notes n
        JOIN note_tags nt ON n.id = nt.note_id
        WHERE nt.tag_id IN (%s)
    `, strings.Join(placeholders, ","))

	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notes []Note
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.Title, &n.Markdown); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 2️⃣ Fetch tags for each note
		tagRows, err := db.Query(`
            SELECT t.id, t.label
            FROM tags t
            INNER JOIN note_tags nt ON nt.tag_id = t.id
            WHERE nt.note_id = $1
        `, n.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for tagRows.Next() {
			var t Tag
			if err := tagRows.Scan(&t.ID, &t.Label); err != nil {
				tagRows.Close()
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			n.Tags = append(n.Tags, t)
		}
		tagRows.Close()

		notes = append(notes, n)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}
