import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

function AdminMecenasRequests() {

  const [stats, setStats] = useState({
    total: 0,
    chosen: 0,
    confirmed: 0,
    fulfilled: 0,
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

  /* ================= FETCH STATS ================= */

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/admin/mecenas-requests-stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const deniedRes = await axios.get(
        "http://localhost:5000/admin/mecenas-requests?status=request_denied",
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

  /* ================= OPEN LIST ================= */

  const openList = async (status) => {

  try {

    const token = localStorage.getItem("token");

    let url = "";

    // special route for pending cards
    if (status === "pending") {
      url = "http://localhost:5000/admin/pending-dreams-with-requests";
    } else {
      url = `http://localhost:5000/admin/mecenas-requests?status=${status}`;
    }

    const res = await axios.get(
      url,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setDreams(res.data);
    setSelectedFilter(status);
    setViewMode("list");

  } catch (error) {

    console.log("Fetch requests error", error);

  }

};

  /* ================= UPDATE REQUEST ================= */

  const updateRequest = async (id, action, comment = "") => {

    try {

      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/admin/mecenas-request/${id}`,
        { action, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmAction(null);
      setDenyComment("");

      fetchStats();
      openList(selectedFilter);

    } catch (error) {
      console.log("Update request error", error);
    }
  };

  /* ================= STATUS BADGE ================= */

  const renderStatus = (status) => {

  if (!status) return null;

  const style = {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "white"
  };

  if (status === "chosen") style.background = "#f0ad4e";        // Pending
  if (status === "confirmed") style.background = "#5a67ff";     // Confirmed
  if (status === "fulfilled") style.background = "green";       // Fulfilled
  if (status === "request_denied") style.background = "red";    // Denied

  return <span style={style}>{status.toUpperCase()}</span>;
};
  return (
    <AdminLayout>

      <h1 style={{ marginBottom: "30px" }}>
        Mecenas Requests
      </h1>

      {/* ================= CARDS ================= */}

      {viewMode === "cards" && (

        <>
        <div style={cardsGrid}>

          <StatCard
            title="Total Requests"
            number={stats.total}
            onClick={() => openList("all")}
          />

          <StatCard
            title="Pending Requests"
            number={stats.chosen}
            onClick={() => openList("pending")}
          />

          <StatCard
            title="Confirmed Requests"
            number={stats.confirmed}
            onClick={() => openList("confirmed")}
          />

          <StatCard
            title="Fulfilled Requests"
            number={stats.fulfilled}
            onClick={() => openList("fulfilled")}
          />

        </div>

        <div style={{ display:"flex", justifyContent:"center", marginTop:"25px" }}>
          <div style={{ width:"48%" }}>
            <StatCard
              title="Denied Requests"
              number={stats.denied}
              onClick={() => openList("request_denied")}
            />
          </div>
        </div>

        </>
      )}

      {/* ================= LIST ================= */}

      {viewMode === "list" && (

  <div style={{ marginTop: "20px" }}>

    <button
      style={backBtn}
      onClick={() => setViewMode("cards")}
    >
      ← Back
    </button>

    <h2 style={{ marginBottom: "20px" }}>
      {selectedFilter.toUpperCase()} REQUESTS
    </h2>

   

{selectedFilter === "pending" && (

  dreams.map((item) => (

    <div key={item.dream._id} style={dreamCardAdmin}>

      <h3>{item.dream.title}</h3>

      <p><strong>Child:</strong> {item.dream.childName}</p>
      <p><strong>Age:</strong> {item.dream.age}</p>
      <p><strong>City:</strong> {item.dream.city}</p>

      <p style={{ marginTop: "10px", color: "#666" }}>
        {item.requests.length} mecenas requested
      </p>

      <div style={{ marginTop: "20px" }}>

        {item.requests.map((req) => (

          <div key={req._id} style={requestRow}>

            <span>{req.mecenasId?.fullName}</span>

            <div>

              <button
                style={approveBtn}
                onClick={() => {
                  setSelectedDream({
  _id: req._id,
  dreamId: item.dream._id,
  title: item.dream.title,
  childName: item.dream.childName,
  age: item.dream.age,
  city: item.dream.city,
  description: item.dream.description,
  status: item.dream.status,
  document: item.dream.document
});
                  setConfirmAction("approve");
                }}
              >
                Approve
              </button>

              <button
                style={denyBtn}
                onClick={() => {
                  setSelectedDream({
  _id: req._id,
  dreamId: item.dream._id,
  title: item.dream.title,
  childName: item.dream.childName,
  age: item.dream.age,
  city: item.dream.city,
  description: item.dream.description,
  status: item.dream.status,
  document: item.dream.document
});
                  setConfirmAction("deny");
                }}
              >
                Deny
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  ))

)}

    {/* TABLE VIEW FOR NON-PENDING REQUESTS */}

{/* TABLE VIEW FOR NON-PENDING REQUESTS */}

{/* TABLE VIEW FOR NON-PENDING REQUESTS */}

{selectedFilter !== "pending" && (

  dreams.length === 0 ? (

    <p>No requests found.</p>

  ) : (

    <table style={tableStyle}>

      <thead>
        <tr>
          <th>Child</th>
          <th>Title</th>
          <th>Status</th>
          <th>Parent</th>
          <th>Mecenas</th>
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

            <td>{dream.mecenasId?.fullName || "-"}</td>

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

  )

)}

  </div>

)}

      {/* ================= DREAM MODAL ================= */}

      {selectedDream && !confirmAction && (

        <div style={overlayStyle}>

          <div style={modalStyle}>

            <h2>{selectedDream.title}</h2>

            <p><strong>Child:</strong> {selectedDream.childName}</p>
            <p><strong>Age:</strong> {selectedDream.age}</p>
            <p><strong>City:</strong> {selectedDream.city}</p>
            <p><strong>Status:</strong> {renderStatus(selectedDream.status)}</p>

            <p style={{ marginTop: "15px" }}>
              {selectedDream.description}
            </p>

            {selectedDream.document && (

              <iframe
                src={selectedDream.document}
                title="Document"
                style={{
                  width: "100%",
                  height: "300px",
                  border: "1px solid #ddd",
                  marginTop: "20px"
                }}
              />

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

      {/* ================= CONFIRM MODAL ================= */}

      {confirmAction && selectedDream && (

        <div style={overlayStyle}>
          <div style={confirmModalStyle}>

            {confirmAction === "approve" && (
              <>
                <h3>Approve this request?</h3>

                <button
                  style={approveBtn}
                  onClick={() =>
                    updateRequest(selectedDream._id, "approve")
                  }
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

            {confirmAction === "fulfill" && (
              <>
                <h3>Mark this dream as fulfilled?</h3>

                <button
                  style={approveBtn}
                  onClick={() =>
                    updateRequest(selectedDream._id, "fulfill")
                  }
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
                <h3>Deny this request</h3>

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
                  style={denyBtn}
                  onClick={() => {

                    if (!denyComment.trim()) {
                      alert("Comment required");
                      return;
                    }

                    updateRequest(
                      selectedDream._id,
                      "deny",
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

/* ================= COMPONENT ================= */

function StatCard({ title, number, onClick }) {

  return (

    <div style={cardStyle} onClick={onClick}>
      <h3>{title}</h3>
      <p style={{ fontSize: "28px", fontWeight: "bold" }}>
        {number}
      </p>
    </div>

  );

}

/* ================= STYLES ================= */

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
  cursor: "pointer",
  marginRight: "6px"
};

const approveBtn = {
  background: "green",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "6px"
};

const denyBtn = {
  background: "red",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer"
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

const confirmModalStyle = {
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

const dreamCardAdmin = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  marginBottom: "25px"
};

const requestRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #eee"
};

export default AdminMecenasRequests;