import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";

type InterestSelectionProps = {
  currentUser: any;
  currentDbUser: any; // add this
  updateUserInterests: (selectedIds: string[]) => Promise<void>;
};

type Interest = {
  id: string;
  label: string;
};

const InterestSelection: React.FC<InterestSelectionProps> = ({
  currentUser,
  currentDbUser, // new prop
  updateUserInterests,
}) => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch all available interests
  useEffect(() => {
    async function fetchInterests() {
      try {
        const res = await fetch("http://localhost:8080/tags");
        if (!res.ok) throw new Error("Failed to fetch interests");
        const data: Interest[] = await res.json();
        setInterests(data.map((i) => ({ ...i, id: i.id.toString() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // <-- move setLoading(false) here
      }
    }

    fetchInterests();
  }, []);

  // Fetch the user's already-selected interests
  useEffect(() => {
    async function fetchUserSelectedInterests() {
      if (!currentDbUser) return; // wait until DB user is loaded

      try {
        const res = await fetch(
          `http://localhost:8080/users/${currentDbUser.id}/tags`
        );
        if (!res.ok) throw new Error("Failed to fetch user interests");
        const userTags: Interest[] = await res.json();
        setSelectedIds(userTags.map((t) => t.id.toString()));
      } catch (err) {
        console.error(err);
      }
      // Do NOT setLoading(false) here!
    }

    fetchUserSelectedInterests();
  }, [currentDbUser]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!currentUser || !currentDbUser) {
      alert("User not logged in");
      return;
    }

    if (selectedIds.length < 3) return;

    setSaving(true);
    try {
      await updateUserInterests(selectedIds);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Failed to save interests. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Select Your Interests</h2>
      <p className="text-center text-muted mb-4">
        Choose the topics that interest you the most. This helps us personalize
        your experience.
      </p>
      {selectedIds.length < 3 && (
        <p className="text-muted mt-2">
          Please select at least 3 interests to continue.
        </p>
      )}
      <Row className="justify-content-center">
        {interests.map((interest) => (
          <Col xs={6} md={4} lg={3} className="mb-3" key={interest.id}>
            <Button
              variant={
                selectedIds.includes(interest.id)
                  ? "primary"
                  : "outline-primary"
              }
              className="w-100"
              onClick={() => toggleSelection(interest.id)}
            >
              {interest.label}
            </Button>
          </Col>
        ))}
      </Row>
      <div className="text-center mt-4">
        <Button
          variant="dark"
          onClick={handleSave}
          disabled={selectedIds.length < 3 || saving}
        >
          {saving ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </Container>
  );
};

export default InterestSelection;
