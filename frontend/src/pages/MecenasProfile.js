import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaStar, FaInstagram, FaFacebook, FaTiktok, FaLinkedin } from "react-icons/fa";
import API_URL from "../config/api";

function MecenasProfile() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [mecenas, setMecenas] = useState(null);
  const [fulfilledCount, setFulfilledCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH DATA ================= */

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/joy/mecenas/${id}`);
      const data = await res.json();

      setPosts(data.posts);
      setMecenas(data.mecenas);
      setFulfilledCount(data.fulfilledCount);

    } catch (error) {
      console.log("Profile fetch error", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  /* ================= LIKE ================= */

  const handleLike = async (postId) => {
    try {
      await fetch(`${API_URL}/joy/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user?._id
        })
      });

      fetchProfile();

    } catch (error) {
      console.log("Like error", error);
    }
  };

  /* ================= COMMENT ================= */

  const submitComment = async (postId, text) => {
    if (!text.trim()) return;

    try {
      await fetch(`${API_URL}/joy/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user?._id,
          userName: user?.fullName,
          text
        })
      });

      fetchProfile();

    } catch (error) {
      console.log("Comment error", error);
    }
  };

  /* ================= UI ================= */

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh", padding: "40px 0" }}>

      <div style={{ maxWidth: "800px", margin: "auto" }}>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "20px",
            background: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          ← Back
        </button>

        {/* PROFILE HEADER */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          textAlign: "center",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}>

          {/* AVATAR */}
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            overflow: "hidden",
            background: "#5a67ff",
            margin: "auto"
          }}>
            {mecenas?.avatar ? (
              <img
                src={mecenas.avatar}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "white",
                fontSize: "28px",
                fontWeight: "bold"
              }}>
                {mecenas?.fullName?.charAt(0)}
              </div>
            )}
          </div>

          <h2 style={{ marginTop: "15px" }}>
            {mecenas?.fullName || "Mecenas"}
          </h2>

          <div style={{ textAlign: "center", marginTop: "10px" }}>

  <p style={{ color: "#777", marginBottom: "5px" }}>
    Dreams fulfilled: {fulfilledCount}
  </p>

  <div style={{
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "wrap",
    maxWidth: "300px",
    margin: "0 auto"
  }}>
    {Array.from({ length: fulfilledCount }).map((_, i) => (
      <FaStar key={i} style={{ color: "#facc15", fontSize: "22px" }} />
    ))}

    


  </div>


{/* SOCIAL MEDIA ICONS */}
<div style={{
  marginTop: "15px",
  display: "flex",
  justifyContent: "center",
  gap: "10px"
}}>

  {mecenas?.socialLinks?.map((link, i) => {

    const cleanUrl = link.url.startsWith("http")
      ? link.url
      : `https://${link.url}`;

    let icon = null;

    if (link.platform === "instagram") icon = <FaInstagram size={20} />;
    if (link.platform === "facebook") icon = <FaFacebook size={20} />;
    if (link.platform === "tiktok") icon = <FaTiktok size={20} />;
    if (link.platform === "linkedin") icon = <FaLinkedin size={20} />;

    return (
      <a
        key={i}
        href={cleanUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          padding: "10px",
          background: "#eee",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {icon}
      </a>
    );

  })}

</div>
  

</div>

        </div>

        {/* POSTS */}
        <div>

          {posts.length === 0 && (
            <p style={{ textAlign: "center" }}>
              No posts yet.
            </p>
          )}

          {posts.map((post) => {

            const isLiked = post.likes?.includes(user?._id);

            return (
              <div
                key={post._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
              >

                {/* DATE */}
                <div style={{ fontSize: "12px", color: "#777", marginBottom: "5px" }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>

                {/* TEXT */}
                <p style={{ marginBottom: "10px" }}>
                  {post.text}
                </p>

                {/* IMAGE */}
                {post.media && (
                  <img
                    src={post.media}
                    alt="post"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      maxHeight: "400px",
                      objectFit: "cover"
                    }}
                  />
                )}

                {/* LIKE */}
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <FaHeart
                      style={{
                        color: isLiked ? "red" : "#aaa",
                        fontSize: "18px"
                      }}
                    />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                </div>

                {/* COMMENTS */}
                <div style={{ marginTop: "10px" }}>
                  {post.comments?.map((comment, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#f9fafb",
                        padding: "8px",
                        borderRadius: "8px",
                        marginTop: "5px"
                      }}
                    >
                      <strong>{comment.userName}</strong>
                      <div>{comment.text}</div>
                    </div>
                  ))}
                </div>

                {/* INPUT */}
                <input
                  type="text"
                  placeholder="Write a comment..."
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "8px",
                    borderRadius: "20px",
                    border: "1px solid #ddd"
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitComment(post._id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                />

              </div>
            );

          })}

        </div>

      </div>

    </div>
  );
}

export default MecenasProfile;