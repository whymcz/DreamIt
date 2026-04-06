import { useEffect, useState } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";

function MecenasDreams() {

  const [dreams, setDreams] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const navigate = useNavigate();

  /* ================= FETCH DREAMS ================= */

  const fetchDreams = async () => {
  try {

    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(
      `http://localhost:5000/dreams/approved?mecenasId=${user._id}`
    );

    const data = await response.json();

    setDreams(data);

  } catch (error) {
    console.log("Failed to fetch dreams", error);
  }
};

  useEffect(() => {
    fetchDreams();
  }, []);

  /* ================= SEND REQUEST ================= */

  const handleFulfillDream = async () => {

    try {

      setSendingRequest(true);

      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(
        "http://localhost:5000/dreams/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            dreamId: selectedDream._id,
            mecenasId: user._id
          })
        }
      );

      const data = await response.json();

      alert(data.message || "Request sent successfully!");

      setConfirmModal(false);
      setSelectedDream(null);

      fetchDreams();

    } catch (error) {
      console.log(error);
      alert("Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div style={pageWrapper}>

        <button
  onClick={() => navigate("/")}
  style={{
    marginBottom: "20px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#555"
  }}
>
  ← Back
</button>

      <h1 style={titleStyle}>Dream List</h1>

      <p style={subtitleStyle}>
        Choose a dream and make a child happy 
      </p>

      <div style={listWrapper}>

        {dreams.length === 0 && (
          <p>No approved dreams available yet.</p>
        )}

        {dreams.map((dream) => (
          <div key={dream._id} style={dreamCard}>

            <h2>{dream.title}</h2>

            <p>
              <strong>Child:</strong> {dream.childName}
            </p>

            <p>
              <strong>Age:</strong> {dream.age}
            </p>

            <p>
              <strong>City:</strong> {dream.city}
            </p>

            {/* NEW: request count */}
            <p style={{ color: "#666", marginTop: "6px" }}>
   {dream.requestCount || 0} mecenas requested
</p>

{dream.userRequested && (
  <p style={{ color: "#6ab187", fontWeight: "600", marginTop: "4px" }}>
    ✔ You already requested this dream
  </p>
)}

            <p style={{ marginTop: "10px" }}>
              {dream.description.slice(0, 120)}...
            </p>

            <button
              style={viewButton}
              onClick={() => setSelectedDream(dream)}
            >
              View Dream
            </button>

          </div>
        ))}

      </div>

      {/* ================= DREAM MODAL ================= */}

      {selectedDream && (
        <div style={overlayStyle}>

          <div style={modalStyle}>

            <button
              style={closeButton}
              onClick={() => setSelectedDream(null)}
            >
              ✕
            </button>

            <h2>{selectedDream.title}</h2>

            <p>
              <strong>Child:</strong> {selectedDream.childName}
            </p>

            <p>
              <strong>Age:</strong> {selectedDream.age}
            </p>

            <p>
              <strong>Gender:</strong> {selectedDream.gender}
            </p>

            <p>
              <strong>City:</strong> {selectedDream.city}
            </p>

            <p style={{ marginTop: "20px" }}>
              {selectedDream.description}
            </p>

            {selectedDream.document && (
              <iframe
                src={selectedDream.document}
                title="Document"
                style={{
                  width: "100%",
                  height: "300px",
                  marginTop: "20px",
                  border: "1px solid #ddd"
                }}
              />
            )}

            <button
  style={{
    ...fulfillButton,
    background: selectedDream.userRequested ? "#ccc" : "#f4b942",
    cursor: selectedDream.userRequested ? "not-allowed" : "pointer"
  }}
  onClick={() => {
    if (!selectedDream.userRequested) {
      setConfirmModal(true);
    }
  }}
  disabled={sendingRequest || selectedDream.userRequested}
>
  {selectedDream.userRequested
    ? "Already Requested"
    : "Make Dream Come True ✨"}
</button>

          </div>

        </div>
      )}

      {/* ================= CONFIRM MODAL ================= */}

      {confirmModal && (
        <div style={overlayStyle}>

          <div style={confirmModalStyle}>

            <h2 style={{ marginBottom: "10px" }}>
              Confirm Dream
            </h2>

            <p style={{ marginBottom: "25px", color: "#555" }}>
              Are you sure you want to make this dream come true?
            </p>

            <div style={confirmButtons}>

              <button
                style={cancelButton}
                onClick={() => setConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                style={confirmButton}
                onClick={handleFulfillDream}
              >
                Yes, Confirm
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* ================= STYLES ================= */

const pageWrapper = {
  maxWidth: "900px",
  margin: "60px auto",
  padding: "20px"
};

const titleStyle = {
  fontFamily: "Montserrat",
  fontSize: "36px",
  marginBottom: "10px"
};

const subtitleStyle = {
  color: "#555",
  marginBottom: "40px"
};

const listWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "25px"
};

const dreamCard = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const viewButton = {
  marginTop: "15px",
  background: "#6ab187",
  border: "none",
  color: "white",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer"
};

const fulfillButton = {
  marginTop: "30px",
  background: "#f4b942",
  border: "none",
  color: "white",
  padding: "12px 20px",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer"
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle = {
  background: "white",
  padding: "40px",
  width: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "12px",
  position: "relative"
};

const closeButton = {
  position: "absolute",
  top: "15px",
  right: "20px",
  background: "none",
  border: "none",
  fontSize: "22px",
  cursor: "pointer"
};

/* ===== CONFIRM MODAL STYLES ===== */

const confirmModalStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  width: "420px",
  textAlign: "center"
};

const confirmButtons = {
  display: "flex",
  justifyContent: "center",
  gap: "20px"
};

const cancelButton = {
  padding: "10px 18px",
  border: "1px solid #ccc",
  background: "white",
  borderRadius: "8px",
  cursor: "pointer"
};

const confirmButton = {
  padding: "10px 18px",
  background: "#6ab187",
  border: "none",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer"
};

export default MecenasDreams;