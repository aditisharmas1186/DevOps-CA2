import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useMemo, useState } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import { NewNote } from "./NewNote";
import { NoteList } from "./NoteList";
import { NoteLayout } from "./NoteLayout";
import { Note } from "./Note";
import { EditNote } from "./EditNote";
import OAuthCallback from "./OAuthCallback";
import LoginPage from "./LoginPage";
import { supabase } from "./lib/supabaseClient";
import { useNavigate } from "react-router-dom"; // add this at top
import ProtectedRoute from "./ProtectedRoute";
import InterestSelection from "./InterestSelection";

export type Note = {
  id: string;
} & NoteData;

export type RawNote = {
  id: string;
} & RawNoteData;

export type RawNoteData = {
  title: string;
  markdown: string;
  tagIds: string[];
};

export type NoteData = {
  title: string;
  markdown: string;
  tags: Tag[];
};

export type Tag = {
  id: string;
  label: string;
};

function App() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<RawNote[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentDbUser, setCurrentDbUser] = useState<any>(null);
  const [userTagIds, setUserTagIds] = useState<string[]>([]);

  useEffect(() => {
    // Check current session on mount
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user ?? null);
    };
    getUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  console.log("Printing Current User: ", currentUser);

  // Getting the currentDbUser info from our users table
  async function fetchDbUserByUUID(uuid: string) {
    try {
      const res = await fetch(
        `http://localhost:8080/users/by-supabase/${uuid}`
      );
      if (!res.ok) throw new Error("Failed to fetch DB user");
      const data = await res.json();
      setCurrentDbUser(data);
    } catch (err) {
      console.error("Error fetching DB user:", err);
    }
  }
  useEffect(() => {
    if (currentUser?.id) {
      fetchDbUserByUUID(currentUser.id);
    }
  }, [currentUser]);
  console.log("Printing Current DB User State:", currentDbUser);

  useEffect(() => {
    if (currentDbUser?.id) {
      fetch(`http://localhost:8080/users/${currentDbUser.id}/tags`)
        .then((res) => res.json())
        .then((data) => {
          setUserTagIds(data.map((t: any) => t.id.toString()));
        });
    }
  }, [currentDbUser]);

  // Fetch notes and tags from backend
  // useEffect(() => {
  //   async function fetchNotesAndTags() {
  //     try {
  //       const [notesRes, tagsRes] = await Promise.all([
  //         fetch("http://localhost:8080/notes"),
  //         fetch("http://localhost:8080/tags"),
  //       ]);

  //       const notesData: {
  //         id: number;
  //         title: string;
  //         markdown: string;
  //         tags: { id: number; label: string }[];
  //       }[] = await notesRes.json();

  //       const tagsData: { id: number; label: string }[] = await tagsRes.json();

  //       const rawNotes: RawNote[] = notesData.map((note) => ({
  //         id: note.id.toString(),
  //         title: note.title,
  //         markdown: note.markdown,
  //         tagIds: (note.tags ?? []).map((tag) => tag.id.toString()),
  //       }));

  //       setNotes(rawNotes);

  //       const formattedTags: Tag[] = (tagsData ?? []).map((tag) => ({
  //         id: tag.id.toString(),
  //         label: tag.label,
  //       }));

  //       setTags(formattedTags);

  //       setLoading(false);
  //     } catch (err) {
  //       console.error("Failed to fetch notes or tags:", err);
  //       setLoading(false);
  //     }
  //   }
  //   fetchNotesAndTags();
  // }, []);

  useEffect(() => {
    async function fetchFilteredNotes() {
      if (!currentDbUser || userTagIds.length === 0) {
        setNotes([]);
        setLoading(false);
        return;
      }

      try {
        const queryParam = userTagIds.join(",");
        const res = await fetch(
          `http://localhost:8080/notes/by-tags?tagIds=${queryParam}`
        );
        if (!res.ok) throw new Error("Failed to fetch filtered notes");

        const notesData = await res.json();
        console.log("Fetched notesData:", notesData); // <-- ADD THIS

        const rawNotes: RawNote[] = notesData.map((note: any) => ({
          id: note.id.toString(),
          title: note.title,
          markdown: note.markdown,
          tagIds: (note.tags ?? []).map((tag: any) => tag.id.toString()),
        }));

        setNotes(rawNotes);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch filtered notes:", err);
        setNotes([]);
        setLoading(false);
      }
    }

    fetchFilteredNotes();
  }, [currentDbUser, userTagIds]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("http://localhost:8080/tags");
        if (!res.ok) throw new Error("Failed to fetch tags");
        const tagsData: { id: number; label: string }[] = await res.json();
        setTags(
          tagsData.map((tag) => ({
            id: tag.id.toString(),
            label: tag.label,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    }
    fetchTags();
  }, []);

  const notesWithTags = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
    }));
  }, [notes, tags]);

  // Create Note
  async function onCreateNote({ tags: noteTags, ...data }: NoteData) {
    try {
      const res = await fetch("http://localhost:8080/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags: noteTags.map((tag) => ({
            id: Number(tag.id),
            label: tag.label,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to create note");

      const note: {
        id: number;
        title: string;
        markdown: string;
        tags: { id: number; label: string }[];
      } = await res.json();

      setNotes((prev) => [
        ...prev,
        {
          id: note.id.toString(),
          title: note.title,
          markdown: note.markdown,
          tagIds: note.tags.map((tag) => tag.id.toString()),
        },
      ]);

      setTags((prev) => {
        const newTags = note.tags.map((tag) => ({
          id: tag.id.toString(),
          label: tag.label,
        }));
        const merged = [...prev];
        newTags.forEach((t) => {
          if (!merged.some((pt) => pt.id === t.id)) merged.push(t);
        });
        return merged;
      });
    } catch (err) {
      console.error("Error creating note:", err);
    }
  }

  // Update Note
  async function onUpdateNote(
    id: string,
    { tags: noteTags, ...data }: NoteData
  ) {
    try {
      const res = await fetch(`http://localhost:8080/notes/${Number(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tags: noteTags.map((tag) => ({
            id: Number(tag.id),
            label: tag.label,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");

      const note: {
        id: number;
        title: string;
        markdown: string;
        tags: { id: number; label: string }[];
      } = await res.json();

      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                id: note.id.toString(),
                title: note.title,
                markdown: note.markdown,
                tagIds: note.tags.map((tag) => tag.id.toString()),
              }
            : n
        )
      );

      setTags((prev) => {
        const newTags = note.tags.map((tag) => ({
          id: tag.id.toString(),
          label: tag.label,
        }));
        const merged = [...prev];
        newTags.forEach((t) => {
          if (!merged.some((pt) => pt.id === t.id)) merged.push(t);
        });
        return merged;
      });
    } catch (err) {
      console.error("Error updating note:", err);
    }
  }

  // Delete Note
  async function onDeleteNote(id: string) {
    try {
      const res = await fetch(`http://localhost:8080/notes/${Number(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  }

  // Add Tag
  async function addTag(tag: Tag) {
    try {
      const res = await fetch("http://localhost:8080/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: tag.label }),
      });
      if (!res.ok) throw new Error("Failed to add tag");
      const data: { id: number; label: string } = await res.json();
      setTags((prev) => [
        ...prev,
        { id: data.id.toString(), label: data.label },
      ]);
    } catch (err) {
      console.error("Error adding tag:", err);
    }
  }

  // Update Tag
  async function updateTag(id: string, label: string) {
    try {
      const res = await fetch(`http://localhost:8080/tags/${Number(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error("Failed to update tag");
      const data: { id: number; label: string } = await res.json();
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === id ? { id: data.id.toString(), label: data.label } : tag
        )
      );
    } catch (err) {
      console.error("Error updating tag:", err);
    }
  }

  // Delete Tag
  async function deleteTag(id: string) {
    try {
      const res = await fetch(`http://localhost:8080/tags/${Number(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete tag");
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    } catch (err) {
      console.error("Error deleting tag:", err);
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      // ✅ redirect to login page
      navigate("/login");
    }
  };

  async function updateUserInterests(selectedIds: string[]) {
    if (!currentDbUser) {
      console.error("DB user not loaded yet");
      return;
    }

    try {
      const payload = selectedIds.map((id) => ({ id: Number(id) }));
      const res = await fetch(
        `http://localhost:8080/users/${currentDbUser.id}/tags`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update interests");

      // Immediately re-fetch user tags and update state
      const tagsRes = await fetch(
        `http://localhost:8080/users/${currentDbUser.id}/tags`
      );
      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setUserTagIds(data.map((t: any) => t.id.toString()));
      }

      const result = await res.json();
      console.log("User interests updated:", result);
    } catch (err) {
      console.error(err);
      alert("Failed to save interests. Check console for details.");
    }
  }

  if (loading) {
    // Show loader while checking auth/db user
    return <div>Loading user data...</div>;
  }

  if (!currentUser) {
    // Not logged in, show login page
    return <LoginPage />;
  }

  if (!currentDbUser) {
    // User is logged in but not in DB yet, show interests selection
    return (
      <InterestSelection
        currentUser={currentUser}
        currentDbUser={currentDbUser}
        updateUserInterests={updateUserInterests}
      />
    );
  }

  // if (loading || !currentDbUser) return <div>Loading user data...</div>;

  return (
    <Container className="my-4">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <NoteList
                notes={notesWithTags}
                availableTags={tags}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
                currentUser={currentUser}
                onLogout={handleLogout}
                userTagIds={userTagIds}
                loading={loading}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <NewNote
                onSubmit={onCreateNote}
                onAddTag={addTag}
                availableTags={tags}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
          <Route index element={<Note onDelete={onDeleteNote} />} />
          <Route
            path="edit"
            element={
              <ProtectedRoute>
                <EditNote
                  onSubmit={onUpdateNote}
                  onAddTag={addTag}
                  availableTags={tags}
                />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/interests"
          element={
            <InterestSelection
              currentUser={currentUser}
              currentDbUser={currentDbUser}
              updateUserInterests={updateUserInterests}
            />
          }
        />
      </Routes>
    </Container>
  );
}

export default App;
