import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import API_URL from "../config/api";

function AdminDashboard() {

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0
  });

  const [viewMode, setViewMode] = useState("cards");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [dreams, setDreams] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [denyComment, setDenyComment] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/admin/dashboard-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const deniedRes = await axios.get(
        `${API_URL}/admin/dreams?status=denied`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats({
        ...res.data,
        denied: deniedRes.data.length
      });

    } catch (error) {

      console.log("Stats error", error);

    }

  };

  const openList = async (status) => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/admin/dreams?status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDreams(res.data);
      setSelectedFilter(status);
      setViewMode("list");

    } catch (error) {

      console.log("Fetch dreams error", error);

    }

  };

  const updateStatus = async (id, status, comment = "") => {

    try {

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/admin/update-dream-status/${id}`,
        { status, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedDream(null);
      setConfirmAction(null);
      setDenyComment("");

      fetchStats();
      openList(selectedFilter);

    } catch (error) {

      console.log("Update error", error);

    }

  };

  const renderStatus = (status) => {

  if (!status) return null;

  const style = {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "white"
  };

  if (status === "pending") style.background = "#f0ad4e";       // orange
  if (status === "approved") style.background = "#5a67ff";      // blue
  if (status === "denied") style.background = "red";

  if (status === "chosen") style.background = "#f0ad4e";        // mecenas pending
  if (status === "confirmed") style.background = "#5a67ff";     // mecenas confirmed
  if (status === "fulfilled") style.background = "green";
  if (status === "request_denied") style.background = "red";

  return <span style={style}>{status.toUpperCase()}</span>;
};

  return (

    <AdminLayout>

      <h1 style={{ marginBottom: "30px" }}>Parent Submissions</h1>

      {/* CARDS */}

      {viewMode === "cards" && (

        <div style={cardsGrid}>

          <StatCard title="Total Dreams" number={stats.total} onClick={() => openList("all")} />

          <StatCard title="Pending Dreams" number={stats.pending} onClick={() => openList("pending")} />

          <StatCard title="Approved Dreams" number={stats.approved} onClick={() => openList("approved")} />

          <StatCard title="Denied Dreams" number={stats.denied} onClick={() => openList("denied")} />

        </div>

      )}

      {/* LIST */}

      {viewMode === "list" && (

        <div style={{ marginTop: "20px" }}>

          <button style={backBtn} onClick={() => setViewMode("cards")}>
            ← Back
          </button>

          <h2 style={{ marginBottom: "20px" }}>
            {selectedFilter === "all"
              ? "All Dreams"
              : `${selectedFilter.toUpperCase()} Dreams`}
          </h2>

          {dreams.length === 0 ? (
            <p>No dreams found.</p>
          ) : (

            <table style={tableStyle}>

              <thead>

                <tr>

                  <th>Child</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Parent</th>
                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {dreams.map((dream) => (

                  <tr key={dream._id}>

                    <td>{dream.childName}</td>

                    <td>{dream.title}</td>

                    <td>{renderStatus(dream.status)}</td>

                    <td>{dream.parentId?.fullName}</td>

                    <td>

                      <button
                        style={viewBtn}
                        onClick={() => setSelectedDream(dream)}
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      )}

      {/* DREAM MODAL */}

      {selectedDream && (

        <div style={overlayStyle}>

          <div style={modalStyle}>

            <h2>{selectedDream.title}</h2>

            <p><strong>Child:</strong> {selectedDream.childName}</p>
            <p><strong>Age:</strong> {selectedDream.age}</p>
            <p><strong>Gender:</strong> {selectedDream.gender}</p>
            <p><strong>City:</strong> {selectedDream.city}</p>

            <p style={{ marginTop: "15px" }}>
              <strong>Description:</strong>
            </p>

            <p>{selectedDream.description}</p>

            {selectedDream.document && (

              <iframe
                src={selectedDream.document}
                title="Document"
                style={{
                  width: "100%",
                  height: "300px",
                  border: "1px solid #ddd",
                  marginTop: "15px"
                }}
              />

            )}

            {selectedDream.status === "pending" && (

              <div style={{ marginTop: "20px" }}>

                <button
                  style={approveBtn}
                  onClick={() => setConfirmAction("approve")}
                >
                  Approve
                </button>

                <button
                  style={denyBtn}
                  onClick={() => setConfirmAction("deny")}
                >
                  Deny
                </button>

              </div>

            )}

            <button
              style={closeBtn}
              onClick={() => setSelectedDream(null)}
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* CONFIRM MODAL */}

      {confirmAction && (

        <div style={overlayStyle}>

          <div style={confirmModal}>

            {confirmAction === "approve" && (

              <>
                <h3>Approve this dream?</h3>

                <button
                  style={approveBtn}
                  onClick={() => updateStatus(selectedDream._id, "approved")}
                >
                  Confirm
                </button>

                <button
                  style={closeBtn}
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              </>

            )}

            {confirmAction === "deny" && (

              <>

                <h3>Deny this dream</h3>

                <textarea
                  placeholder="Write reason..."
                  value={denyComment}
                  onChange={(e) => setDenyComment(e.target.value)}
                  style={{ width: "100%", height: "80px", marginTop: "10px" }}
                />

                <button
                  style={denyBtn}
                  onClick={() => {

                    if (!denyComment.trim()) {
                      alert("Comment required");
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
                  style={closeBtn}
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

/* COMPONENT */

function StatCard({ title, number, onClick }) {

  return (

    <div style={cardStyle} onClick={onClick}>
      <h3>{title}</h3>
      <p style={{ fontSize: "28px", fontWeight: "bold" }}>{number}</p>
    </div>

  );

}

/* STYLES */

const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "25px"
};

const cardStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "8px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  cursor: "pointer",
  textAlign: "center"
};

const tableStyle = {
  width: "100%",
  background: "white",
  borderCollapse: "collapse"
};

const viewBtn = {
  background: "#5a67ff",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer"
};

const approveBtn = {
  background: "green",
  color: "white",
  border: "none",
  padding: "8px 14px",
  marginRight: "10px",
  cursor: "pointer",
  borderRadius: "4px"
};

const denyBtn = {
  background: "red",
  color: "white",
  border: "none",
  padding: "8px 14px",
  marginRight: "10px",
  cursor: "pointer",
  borderRadius: "4px"
};

const backBtn = {
  marginBottom: "20px",
  padding: "6px 12px",
  background: "#eee",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
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
  width: "650px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "8px"
};

const confirmModal = {
  background: "white",
  padding: "25px",
  width: "400px",
  borderRadius: "8px",
  textAlign: "center"
};

const closeBtn = {
  marginTop: "20px",
  padding: "8px 15px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer"
};

export default AdminDashboard;