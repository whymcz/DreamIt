import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";


function Profile() {

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(storedUser);
  const [activeTab, setActiveTab] = useState("profile");

  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || "");
  const [avatar, setAvatar] = useState(user.avatar || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [dreams, setDreams] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);

  const [joyText, setJoyText] = useState("");
  const [joyMedia, setJoyMedia] = useState("");

  const navigate = useNavigate();

  /* ================= FETCH DREAMS ================= */

  useEffect(() => {

    if (activeTab === "requests") {

      if (user.role === "parent") {
        fetchDreams();
      }

      if (user.role === "mecenas") {
        fetchMyRequests();
      }

    }

  }, [activeTab]);

  const fetchDreams = async () => {
    try {

      const res = await fetch(
        `http://localhost:5000/parent/my-dreams/${user._id}`
      );

      const data = await res.json();

      setDreams(data);

    } catch (error) {
      console.log(error);
    }
  };

  const fetchMyRequests = async () => {

    try {

      const res = await fetch(
        `http://localhost:5000/mecenas/my-requests/${user._id}`
      );

      const data = await res.json();

      setDreams(data);

    } catch (error) {

      console.log("Failed to fetch requests", error);

    }

  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {

    localStorage.clear();
    navigate("/");

  };

  /* ================= IMAGE UPLOAD ================= */

  const handleImageUpload = (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatar(reader.result);
    };

    reader.readAsDataURL(file);

  };

  /* ================= SAVE PROFILE ================= */

  const handleSaveProfile = async () => {

    try {

      const response = await fetch("http://localhost:5000/update-profile", {

        method: "PUT",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          userId: user._id,
          fullName,
          phone,
          avatar
        })

      });

      const updatedUser = await response.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      alert("Profile updated successfully!");

    } catch (error) {

      alert("Failed to update profile");

    }

  };

  /* ================= CHANGE PASSWORD ================= */

  const handleChangePassword = async () => {

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {

      const res = await fetch("http://localhost:5000/change-password", {

        method: "PUT",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          userId: user._id,
          oldPassword,
          newPassword
        })

      });

      const data = await res.json();

      alert(data.message);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {

      alert("Failed to change password");

    }

  };

  const generateWithAI = async () => {

  try {

    const res = await fetch("http://localhost:5000/generate-joy-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: joyText   // optional input
      })
    });

    const data = await res.json();

    setJoyText(data.text);

  } catch (error) {
    console.log("AI error:", error);
  }

};

  /* ================= SUBMIT JOY POST ================= */

const submitJoyPost = async () => {

  if (!joyText) {
    alert("Please write the story");
    return;
  }

  try {

    await fetch("http://localhost:5000/joy", {

      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
  mecenasId: user._id,
  mecenasName: user.fullName,
  avatar: user.avatar,
  text: joyText,
  media: joyMedia
})

    });

    alert("Post sent to admin for approval");

    setJoyText("");
    setJoyMedia("");

  } catch (error) {

    console.log("Joy submit error", error);

  }

};



  /* ================= STATUS BADGE ================= */

  const renderStatus = (status) => {

    const style = {

      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      color: "white"

    };

    if (status === "pending") style.background = "#f0ad4e";
    if (status === "approved") style.background = "green";
    if (status === "denied") style.background = "red";

    if (status === "chosen") style.background = "#f0ad4e";
    if (status === "confirmed") style.background = "#5a67ff";
    if (status === "fulfilled") style.background = "green";
    if (status === "request_denied") style.background = "red";

    return <span style={style}>{status.toUpperCase()}</span>;

  };

  return (

    <div className="profile-wrapper">

      <div className="profile-sidebar">

        <div className="profile-email">
          {user.email}
        </div>

        <div
          className={`sidebar-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          My Profile
        </div>

        <div
          className={`sidebar-item ${activeTab === "email" ? "active" : ""}`}
          onClick={() => setActiveTab("email")}
        >
          Email Address
        </div>

        <div
          className={`sidebar-item ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Password
        </div>

        <div
          className={`sidebar-item ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          {user.role === "parent" ? "My Submissions" : "My Requests"}
        </div>

        {user.role === "mecenas" && (

  <div
    className={`sidebar-item ${activeTab === "joypost" ? "active" : ""}`}
    onClick={() => setActiveTab("joypost")}
  >
    Submit Joy Post
  </div>

)}

        <div className="logout" onClick={handleLogout}>
          Logout
        </div>

      </div>

      <div className="profile-content">

        

        

        {/* PROFILE TAB */}

        {activeTab === "profile" && (

          <div className="profile-form">
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

            <h2>Profile</h2>

            <div className="avatar-section">

              <img
                src={avatar || "https://i.pravatar.cc/100"}
                alt="avatar"
                className="avatar-img"
              />

              <label className="upload-btn">

                Upload Image

                <input
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                />

              </label>

            </div>

            <label>Full Name</label>

            <input
              className="profile-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <label>Phone</label>

            <input
              className="profile-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button className="save-btn" onClick={handleSaveProfile}>
              Save Profile
            </button>

          </div>

        )}

        {/* EMAIL TAB */}

        {activeTab === "email" && (

          <div className="profile-form">

            <h2>Email Address</h2>

            <label>Email</label>

            <input
              className="profile-input"
              value={user.email}
              readOnly
              style={{ background: "#f5f5f5", cursor: "not-allowed" }}
            />

            <p style={{ marginTop: "10px", color: "#888" }}>
              Email cannot be changed.
            </p>

          </div>

        )}

        {/* PASSWORD TAB */}

        {activeTab === "password" && (

          <div className="profile-form">

            <h2>Change Password</h2>

            <label>Old Password</label>

            <input
              type="password"
              className="profile-input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <label>New Password</label>

            <input
              type="password"
              className="profile-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label>Confirm New Password</label>

            <input
              type="password"
              className="profile-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="save-btn" onClick={handleChangePassword}>
              Save Password
            </button>

          </div>

        )}

        {/* PARENT SUBMISSIONS */}

        {activeTab === "requests" && user.role === "parent" && (

          <>
            <h2>My Submissions</h2>

            {dreams.length === 0 ? (
              <p>No submissions yet.</p>
            ) : (

              <table style={{ width: "100%", marginTop: "20px" }}>

                <thead>

                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {dreams.map((dream) => (

                    <tr key={dream._id}>

                      <td>{dream.title}</td>

                      <td>
                        {new Date(dream.createdAt).toLocaleDateString()}
                      </td>

                      <td>{renderStatus(dream.status)}</td>

                      <td>

                        <button
                          onClick={() => setSelectedDream(dream)}
                          style={viewBtn}
                        >
                          View
                        </button>

                        {dream.status === "denied" && (

                          <button
                            onClick={() =>
                              navigate("/submit-dream", {
                                state: { editDream: dream }
                              })
                            }
                            style={editBtn}
                          >
                            Edit
                          </button>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </>

        )}

        {/* MECENAS REQUESTS */}

        {activeTab === "requests" && user.role === "mecenas" && (

          <>

            <h2>My Requests</h2>

            {dreams.length === 0 ? (
              <p>No requests yet.</p>
            ) : (

              <table style={{ width: "100%", marginTop: "20px" }}>

                <thead>

                  <tr>
                    <th>Dream</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {dreams.map((dream) => (

                    <tr key={dream._id}>

                      <td>{dream.title}</td>

                      <td>
                        {new Date(dream.createdAt).toLocaleDateString()}
                      </td>

                      <td>{renderStatus(dream.status)}</td>

                      <td>

                        <button
                          onClick={() => setSelectedDream(dream)}
                          style={viewBtn}
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </>

        )}

        {/* JOY POST TAB */}

{activeTab === "joypost" && user.role === "mecenas" && (

  <div className="profile-form">

  <h2 style={{ marginBottom: "10px" }}>
    Submit Joy Post
  </h2>

  <p style={{ marginBottom: "20px", color: "#777" }}>
    Share a fulfilled dream moment with the community.
  </p>

  {/* IMAGE CARD */}
  <div style={{
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "20px"
  }}>
    <label style={{ fontWeight: "bold" }}>Upload Image</label>

    <input
      type="file"
      accept="image/*"
      style={{ marginTop: "10px" }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
          setJoyMedia(reader.result);
        };

        reader.readAsDataURL(file);
      }}
    />

    {joyMedia && (
      <img
        src={joyMedia}
        alt="preview"
        style={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "10px",
          maxHeight: "300px",
          objectFit: "cover"
        }}
      />
    )}
  </div>

  {/* STORY CARD */}
  <div style={{
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column"   // ⭐ IMPORTANT
}}>
    <label style={{ fontWeight: "bold" }}>Story</label>

    <textarea
  value={joyText}
  onChange={(e) => setJoyText(e.target.value)}
  placeholder="Tell how the dream came true..."
  style={{
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    resize: "none",
    minHeight: "120px",
    outline: "none",
    lineHeight: "1.5",
    boxSizing: "border-box"   // ⭐ THIS IS THE FIX
  }}
/>

    {/* AI BUTTON (we'll make it work next) */}
    <button
  onClick={generateWithAI}
  style={{
    marginTop: "10px",
    background: "#5a67ff",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Generate with AI
</button>
  </div>

  {/* SUBMIT */}
  <button
    className="save-btn"
    onClick={submitJoyPost}
    style={{
      width: "100%",
      padding: "12px",
      fontSize: "16px"
    }}
  >
    Send
  </button>

</div>

)}

      </div>

      {/* SUBMIT JOY POST */}



      

      {/* MODAL */}

      {selectedDream && (

        <div style={overlayStyle}>

          <div style={modalStyle}>

            <h2>{selectedDream.title}</h2>

            <p>
              <strong>Status:</strong>{" "}
              {renderStatus(selectedDream.status)}
            </p>

            {selectedDream.adminComment && (

              <div
                style={{
                  background: "#ffe6e6",
                  padding: "10px",
                  marginTop: "10px",
                  borderRadius: "6px"
                }}
              >
                <strong>Admin Comment:</strong>
                <p>{selectedDream.adminComment}</p>
              </div>

            )}

            <p style={{ marginTop: "15px" }}>
              {selectedDream.description}
            </p>

            <button
              onClick={() => setSelectedDream(null)}
              style={closeBtn}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

}

const viewBtn = {
  background: "#5a67ff",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "5px"
};

const editBtn = {
  background: "#f0ad4e",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "4px",
  cursor: "pointer"
};

const closeBtn = {
  marginTop: "20px",
  padding: "8px 15px",
  borderRadius: "4px",
  border: "none",
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
  width: "500px",
  borderRadius: "8px"
};

export default Profile;