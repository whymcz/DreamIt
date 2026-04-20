import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import API_URL from "../config/api";

function AdminPendingDreams() {
  const [dreams, setDreams] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);
  const [denyComment, setDenyComment] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  
  
  // "approve" or "deny"

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/admin/pending-dreams`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDreams(res.data);
    } catch (error) {
      console.log("Failed to fetch dreams", error);
    }
  };

  const updateStatus = async (id, status, comment = "") => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/admin/update-dream-status/${id}`,
        { status, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSelectedDream(null);
      setConfirmAction(null);
      setDenyComment("");
      fetchDreams();

    } catch (error) {
      console.log("Failed to update status", error);
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: "30px" }}>Pending Dreams</h1>

      {dreams.length === 0 ? (
        <p>No pending dreams.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Child</th>
              <th>Age</th>
              <th>City</th>
              <th>Title</th>
              <th>Parent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dreams.map((dream) => (
              <tr key={dream._id}>
                <td>{dream.childName}</td>
                <td>{dream.age}</td>
                <td>{dream.city}</td>
                <td>{dream.title}</td>
                <td>{dream.parentId?.fullName}</td>
                <td>
                  <button
                    onClick={() => setSelectedDream(dream)}
                    style={viewStyle}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* DREAM DETAILS MODAL */}
      {selectedDream && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>{selectedDream.title}</h2>

            <p><strong>Child:</strong> {selectedDream.childName}</p>
            <p><strong>Age:</strong> {selectedDream.age}</p>
            <p><strong>Gender:</strong> {selectedDream.gender}</p>
            <p><strong>City:</strong> {selectedDream.city}</p>

            <p><strong>Description:</strong></p>
            <p style={{ marginBottom: "15px" }}>
              {selectedDream.description}
            </p>

            {selectedDream.document && (
              <>
                <p><strong>Disability Document:</strong></p>
                <iframe
                  src={selectedDream.document}
                  title="Document Preview"
                  style={{
                    width: "100%",
                    height: "300px",
                    border: "1px solid #ddd",
                    marginBottom: "15px"
                  }}
                />
              </>
            )}

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => setConfirmAction("approve")}
                style={approveStyle}
              >
                Approve
              </button>

              <button
                onClick={() => setConfirmAction("deny")}
                style={denyStyle}
              >
                Deny
              </button>

              <button
                onClick={() => {
                  setSelectedDream(null);
                  setDenyComment("");
                }}
                style={closeStyle}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div style={overlayStyle}>
          <div style={confirmModalStyle}>

            {confirmAction === "approve" && (
              <>
                <h3>Approve this dream?</h3>
                <div style={{ marginTop: "20px" }}>
                  <button
                    style={approveStyle}
                    onClick={() =>
                      updateStatus(selectedDream._id, "approved")
                    }
                  >
                    Confirm
                  </button>

                  <button
                    style={closeStyle}
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {confirmAction === "deny" && (
              <>
                <h3>Deny this dream</h3>

                <textarea
                  placeholder="Write reason for denial..."
                  value={denyComment}
                  onChange={(e) => setDenyComment(e.target.value)}
                  style={{
                    width: "100%",
                    height: "80px",
                    marginTop: "15px",
                    marginBottom: "15px",
                    padding: "8px"
                  }}
                />

                <button
                  style={denyStyle}
                  onClick={() => {
                    if (!denyComment.trim()) {
                      alert("Comment is required.");
                      return;
                    }

                    updateStatus(
                      selectedDream._id,
                      "denied",
                      denyComment
                    );
                  }}
                >
                  Confirm Deny
                </button>

                <button
                  style={closeStyle}
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </AdminLayout>
  );
}

/* STYLES */

const tableStyle = {
  width: "100%",
  background: "white",
  borderCollapse: "collapse"
};

const viewStyle = {
  background: "#5a67ff",
  color: "white",
  border: "none",
  padding: "6px 12px",
  cursor: "pointer",
  borderRadius: "4px"
};

const approveStyle = {
  background: "green",
  color: "white",
  border: "none",
  padding: "8px 14px",
  marginRight: "10px",
  cursor: "pointer",
  borderRadius: "4px"
};

const denyStyle = {
  background: "red",
  color: "white",
  border: "none",
  padding: "8px 14px",
  marginRight: "10px",
  cursor: "pointer",
  borderRadius: "4px"
};

const closeStyle = {
  background: "#ccc",
  border: "none",
  padding: "8px 14px",
  cursor: "pointer",
  borderRadius: "4px"
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle = {
  background: "white",
  padding: "30px",
  width: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "8px"
};

const confirmModalStyle = {
  background: "white",
  padding: "25px",
  width: "400px",
  borderRadius: "8px",
  textAlign: "center"
};

export default AdminPendingDreams;