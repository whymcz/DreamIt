import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function JoyWall() {

  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  /* ================= FETCH POSTS ================= */

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/joy");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.log("Joy wall fetch error", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ================= LIKE POST ================= */

  const handleLike = async (postId) => {

    if (!user) {
      window.location.href = "/register";
      return;
    }

    try {
      await fetch(`http://localhost:5000/joy/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user._id
        })
      });

      fetchPosts();

    } catch (error) {
      console.log("Like error", error);
    }
  };

  /* ================= COMMENT POST ================= */

  const submitComment = async (postId, text) => {

    if (!text.trim()) return;

    if (!user) {
      window.location.href = "/register";
      return;
    }

    try {

      await fetch(`http://localhost:5000/joy/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user._id,
          userName: user.fullName,
          text
        })
    });

      fetchPosts();

    } catch (error) {
      console.log("Comment error", error);
    }
  };

  return (

    <div style={{
      minHeight: "100vh",
      background: "#f5f6fa",
      padding: "40px 0"
    }}>
      <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>

        {/* BACK BUTTON */}
        <button
  onClick={() => navigate("/")}
  style={{
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    transition: "0.2s"
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
>
  <FaArrowLeft size={16} />
</button>

        <h1 style={{ marginBottom: "30px", textAlign: "center" }}>
          Wall of Joy
        </h1>

        {posts.length === 0 ? (

          <p style={{ textAlign: "center" }}>
            No fulfilled dreams published yet.
          </p>

        ) : (

          posts.map((post) => {

            const isLiked = post.likes?.includes(user?._id);

            return (

              <div
                key={post._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "25px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
              >

                {/* HEADER */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>

                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#5a67ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    marginRight: "10px"
                  }}>
                    {post.mecenasId?.avatar ? (
                      <img
                        src={post.mecenasId?.avatar}
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                     post.mecenasId?.fullName?.charAt(0)
                    )}
                  </div>

                  <div>
                    <div
  style={{
    fontWeight: "bold",
    cursor: "pointer",
    color: "#21265f"
  }}
  onClick={() => navigate(`/mecenas/${post.mecenasId?._id}`)}
>
  {post.mecenasId?.fullName}
</div>
                    <div style={{ fontSize: "12px", color: "#777" }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                </div>

                {/* TEXT */}
                <p style={{ fontSize: "15px", marginBottom: "10px" }}>
                  {post.text}
                </p>

                {/* IMAGE */}
                {post.media && (
                  <div style={{ overflow: "hidden", borderRadius: "12px" }}>
                    <img
                      src={post.media}
                      alt="dream"
                      onClick={() => setSelectedImage(post.media)}
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "cover",
                        cursor: "pointer"
                      }}
                    />
                  </div>
                )}

                {/* ACTIONS */}
                <div style={{ marginTop: "10px", marginBottom: "10px" }}>
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
                        fontSize: "18px",
                        transition: "0.2s"
                      }}
                    />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                </div>

                {/* COMMENTS */}
                <div style={{ marginTop: "10px" }}>

                  <h4 style={{ marginBottom: "5px" }}>Comments</h4>

                  {post.comments?.length === 0 && (
                    <p style={{ color: "#777" }}>
                      No comments yet.
                    </p>
                  )}

                  {post.comments?.map((comment, index) => (

                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        background: "#f9fafb",
                        padding: "10px",
                        borderRadius: "10px",
                        marginTop: "8px"
                      }}
                    >
                      <span style={{
                        fontWeight: "bold",
                        fontSize: "13px",
                        marginBottom: "3px"
                      }}>
                        {comment.userName}
                      </span>

                      <span style={{
                        fontSize: "14px",
                        color: "#333"
                      }}>
                        {comment.text}
                      </span>
                    </div>

                  ))}

                </div>

                {/* COMMENT INPUT */}
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "20px",
                      border: "1px solid #ddd",
                      outline: "none"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submitComment(post._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>

              </div>

            );

          })

        )}

        {/* FULLSCREEN IMAGE */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              cursor: "pointer"
            }}
          >
            <img
              src={selectedImage}
              alt="full"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "12px"
              }}
            />
          </div>
        )}

      </div>
    </div>

  );

}

export default JoyWall;