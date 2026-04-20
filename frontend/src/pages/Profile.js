import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import API_URL from "../config/api";


function Profile() {

  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
});

  const [activeTab, setActiveTab] = useState("profile");

  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || "");
  const [avatar, setAvatar] = useState(user.avatar || "");

  const [socialLinks, setSocialLinks] = useState([]);

useEffect(() => {
  if (user && user.socialLinks) {
    setSocialLinks(
      user.socialLinks.length > 0
        ? user.socialLinks
        : [{ platform: "", url: "" }]
    );
  }
}, [user]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [dreams, setDreams] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);

  const [joyText, setJoyText] = useState("");
  const [joyMedia, setJoyMedia] = useState("");

  const [completedDreams, setCompletedDreams] = useState([]);
  const [selectedDreamId, setSelectedDreamId] = useState("");

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

  if (activeTab === "joypost" && user.role === "mecenas") {
    fetchCompletedDreams();
  }

}, [activeTab]);

  const fetchDreams = async () => {
    try {

      const res = await fetch(
        `${API_URL}/parent/my-dreams/${user._id}`
      );

      const data = await res.json();

      setDreams(data);

    } catch (error) {
      console.log(error);
    }
  };

  const fetchCompletedDreams = async () => {
  try {

    const res = await fetch(
      `${API_URL}/mecenas/completed-dreams/${user._id}`
    );

    const data = await res.json();

    setCompletedDreams(data);

  } catch (error) {
    console.log("Failed to fetch completed dreams", error);
  }
  };

  const fetchMyRequests = async () => {

    try {

      const res = await fetch(
        `${API_URL}/mecenas/my-requests/${user._id}`
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

      const response = await fetch(`${API_URL}/update-profile`, {

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


  const handleSaveSocial = async () => {
  try {

    const response = await fetch(`${API_URL}/update-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        socialLinks
      })
    });

    const updatedUser = await response.json();

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
setSocialLinks(updatedUser.socialLinks && updatedUser.socialLinks.length > 0
  ? updatedUser.socialLinks
  : [{ platform: "", url: "" }]
);

    alert("Social links saved!");

  } catch (error) {
    alert("Failed to save social links");
  }
};


  /* ================= CHANGE PASSWORD ================= */

  const handleChangePassword = async () => {

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {

      const res = await fetch(`${API_URL}/change-password`, {

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

  if (!selectedDreamId) {
    alert("Please select a dream first");
    return;
  }

  try {

    const res = await fetch(`${API_URL}/generate-joy-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dreamId: selectedDreamId // NEW
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


  if (!selectedDreamId) {
    alert("Please select a dream");
    return;
  }

  if (!joyText) {
    alert("Please write the story");
    return;
  }

  try {

    await fetch(`${API_URL}/joy`, {

      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        dreamId: selectedDreamId,
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


const confirmDream = async (dreamId) => {
  try {
    const res = await fetch(
      `${API_URL}/dreams/${dreamId}/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id
        })
      }
    );

    const data = await res.json();

    alert(data.message);

    //  refresh dreams after confirmation
    fetchDreams();

  } catch (error) {
    console.log("Confirm error:", error);
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

        {user.role === "mecenas" && (
  <div
    className={`sidebar-item ${activeTab === "social" ? "active" : ""}`}
    onClick={() => setActiveTab("social")}
  >
    Social Media
  </div>
)}

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


{/* SOCIAL MEDIA TAB */}
{activeTab === "social" && user.role === "mecenas" && (

  <div className="profile-form">

    <h2>Social Media</h2>

    <p style={{ color: "#777", marginBottom: "15px" }}>
      Add your social profiles (min 1 required to request a dream)
    </p>

    {socialLinks.map((link, index) => (

  <div key={index} style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>

    <div style={{ flex: 1 }}>
      <select
        value={link.platform}
        onChange={(e) => {
          const updated = [...socialLinks];
          updated[index].platform = e.target.value;
          setSocialLinks(updated);
        }}
        className="profile-input"
      >
        <option value="">Select platform</option>
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
        <option value="tiktok">TikTok</option>
        <option value="linkedin">LinkedIn</option>
      </select>

      <input
        type="text"
        placeholder="Enter link..."
        value={link.url}
        onChange={(e) => {
          const updated = [...socialLinks];
          updated[index].url = e.target.value;
          setSocialLinks(updated);
        }}
        className="profile-input"
        style={{ marginTop: "5px" }}
      />
    </div>

    {/* DELETE BUTTON */}
    {socialLinks.length > 1 && (
      <button
        onClick={() => {
          const updated = socialLinks.filter((_, i) => i !== index);
          setSocialLinks(updated);
        }}
        style={{
          background: "#ff4d4f",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 10px",
          cursor: "pointer",
          height: "40px",
          alignSelf: "center"
        }}
      >
        ✕
      </button>
    )}

  </div>

))}

    {/* ADD BUTTON */}
    {socialLinks.length < 4 && (
      <button
  onClick={() =>
    setSocialLinks(prev => [...prev, { platform: "", url: "" }].slice(0, 4))
  }
  style={{
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#e0e7ff",
    color: "#3730a3",
    cursor: "pointer",
    marginRight: "10px"
  }}
>
  + Add
</button>
    )}

    {/* SAVE */}
    <button
  onClick={handleSaveSocial}
  style={{
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#5a67ff",
    color: "white",
    cursor: "pointer"
  }}
>
  Save
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

  {/*  NEW BUTTON */}
  {dream.status === "confirmed" && (
    <button
      onClick={() => confirmDream(dream._id)}
      style={{
        background: "green",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        marginLeft: "5px"
      }}
    >
      Confirm
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


  {/* DREAM SELECT */}

<div style={{
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  marginBottom: "20px"
}}>

  <label style={{ fontWeight: "bold" }}>Select Dream</label>

  <select
    value={selectedDreamId}
    onChange={(e) => setSelectedDreamId(e.target.value)}
    style={{
      width: "100%",
      marginTop: "10px",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ddd"
    }}
  >
    <option value="">-- Select fulfilled dream --</option>

    {completedDreams.map((dream) => (
      <option key={dream._id} value={dream._id}>
        {dream.childName} - {dream.title}
      </option>
    ))}

  </select>

</div>





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
  flexDirection: "column"   //  IMPORTANT
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
    boxSizing: "border-box"   //  THIS IS THE FIX
  }}
/>

    {/* AI BUTTON (we'll make it work next) */}
    <button
  onClick={generateWithAI}
  disabled={!selectedDreamId}
  style={{
    marginTop: "10px",
    background: selectedDreamId ? "#5a67ff" : "#ccc",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: selectedDreamId ? "pointer" : "not-allowed"
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