import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Stack,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactSelect from "react-select";
import { Tag } from "./App";
import styles from "./NoteList.module.css";

type SimplifiedNote = {
  tags: Tag[];
  title: string;
  id: string;
};

type NoteListProps = {
  availableTags: Tag[];
  notes: SimplifiedNote[];
  onDeleteTag: (id: string) => Promise<void>;
  onUpdateTag: (id: string, label: string) => Promise<void>;
  currentUser: any;
  onLogout: () => void;
  userTagIds: string[]; // ✅ new prop
  loading: boolean;
};

type EditTagsModalProps = {
  show: boolean;
  availableTags: Tag[];
  handleClose: () => void;
  onDeleteTag: (id: string) => Promise<void>;
  onUpdateTag: (id: string, label: string) => Promise<void>;
};

export function NoteList({
  availableTags,
  notes,
  onUpdateTag,
  onDeleteTag,
  currentUser,
  onLogout,
  userTagIds,
  loading = false,
}: NoteListProps) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading recommended projects...</span>
      </div>
    );
  }

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState("");
  const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);

  console.log("Printing UserTagIds: ", userTagIds);
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesTitle =
        title === "" || note.title.toLowerCase().includes(title.toLowerCase());

      // If user has no tags selected, ignore tag filtering
      const matchesUserTags =
        userTagIds.length === 0 ||
        note.tags.some((tag) => userTagIds.includes(tag.id));

      return matchesTitle && matchesUserTags;
    });
  }, [title, notes, userTagIds]);

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Projects</h1>
        </Col>
        <Col xs="auto">
          <Stack gap={2} direction="horizontal">
            <Link to="/new">
              <Button variant="primary">Create</Button>
            </Link>
            <Link to="/interests">
              <Button variant="outline-primary">Update Interests</Button>
            </Link>
            {currentUser && (
              <>
                {currentUser.user_metadata.user_name === "still-nikk" && (
                  <Button
                    onClick={() => setEditTagsModalIsOpen(true)}
                    variant="outline-secondary"
                  >
                    Edit Tags
                  </Button>
                )}
                <Button variant="danger" onClick={onLogout}>
                  Logout
                </Button>
              </>
            )}
          </Stack>
        </Col>
      </Row>
      <Form>
        <Row className="mb-4">
          <Col>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="tags">
              <Form.Label>Tags</Form.Label>
              <ReactSelect
                value={selectedTags.map((tag) => ({
                  label: tag.label,
                  value: tag.id,
                }))}
                options={availableTags.map((tag) => ({
                  label: tag.label,
                  value: tag.id,
                }))}
                onChange={(tags) => {
                  setSelectedTags(
                    tags.map((tag) => ({ label: tag.label, id: tag.value }))
                  );
                }}
                isMulti
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
        {filteredNotes.map((note) => (
          <Col key={note.id}>
            <NoteCard id={note.id} title={note.title} tags={note.tags} />
          </Col>
        ))}
      </Row>
      <EditTagsModal
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
        show={editTagsModalIsOpen}
        handleClose={() => setEditTagsModalIsOpen(false)}
        availableTags={availableTags}
      />
    </>
  );
}

function NoteCard({ id, title, tags }: SimplifiedNote) {
  return (
    <Card
      as={Link}
      to={`/${id}`}
      className={`h-100 text-reset text-decoration-none ${styles.card}`}
    >
      <Card.Body>
        <Stack
          gap={2}
          className="align-items-center justify-content-center h-100"
        >
          <span className="fs-5">{title}</span>
          {tags.length > 0 && (
            <Stack
              gap={1}
              direction="horizontal"
              className="justify-content-center flex-wrap"
            >
              {tags.map((tag) => (
                <Badge className="text-truncate" key={tag.id}>
                  {tag.label}
                </Badge>
              ))}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function EditTagsModal({
  availableTags,
  handleClose,
  show,
  onDeleteTag,
  onUpdateTag,
}: EditTagsModalProps) {
  const [localTags, setLocalTags] = useState<Tag[]>([]);
  const [loadingTagId, setLoadingTagId] = useState<string | null>(null);

  // Sync local state with availableTags when modal opens
  useEffect(() => {
    setLocalTags(availableTags);
  }, [availableTags, show]);

  const handleLabelChange = (id: string, newLabel: string) => {
    setLocalTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, label: newLabel } : tag))
    );
  };

  const handleBlur = async (id: string, label: string) => {
    setLoadingTagId(id);
    await onUpdateTag(id, label);
    setLoadingTagId(null);
  };

  const handleDelete = async (id: string) => {
    setLoadingTagId(id);
    await onDeleteTag(id);
    setLocalTags((prev) => prev.filter((tag) => tag.id !== id));
    setLoadingTagId(null);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Stack gap={2}>
            {localTags.map((tag) => (
              <Row key={tag.id}>
                <Col>
                  <Form.Control
                    type="text"
                    value={tag.label}
                    onChange={(e) => handleLabelChange(tag.id, e.target.value)}
                    onBlur={(e) => handleBlur(tag.id, e.target.value)}
                    disabled={loadingTagId === tag.id}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    onClick={() => handleDelete(tag.id)}
                    variant="outline-danger"
                    disabled={loadingTagId === tag.id}
                  >
                    &times;
                  </Button>
                </Col>
              </Row>
            ))}
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
