import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import API_URL from "../config/api";

function AdminJoyPosts() {

  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/admin/joy-posts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(res.data);

    } catch (error) {

      console.log("Joy posts fetch error", error);

    }

  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const updatePost = async (id, action) => {

    try {

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/admin/joy-post/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchPosts();

    } catch (error) {

      console.log("Update joy post error", error);

    }

  };

  return (

    <AdminLayout>

      <h1 style={{ marginBottom: "30px" }}>
        Joy Post Requests
      </h1>

      {posts.length === 0 ? (

        <p>No pending posts.</p>

      ) : (

        <table style={{ width: "100%", background: "white" }}>

          <thead>
            <tr>
              <th>Media</th>
              <th>Text</th>
              <th>Mecenas</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {posts.map((post) => (

              <tr key={post._id}>

                <td>

                  {post.media && (

                    <img
                      src={post.media}
                      alt="joy"
                      style={{ width: "120px" }}
                    />

                  )}

                </td>

                <td>{post.text}</td>

                <td>{post.mecenasName}</td>

                <td>

                  <button
                    style={{
                      background: "green",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      marginRight: "8px",
                      cursor: "pointer"
                    }}
                    onClick={() => updatePost(post._id, "approve")}
                  >
                    Approve
                  </button>

                  <button
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      cursor: "pointer"
                    }}
                    onClick={() => updatePost(post._id, "deny")}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </AdminLayout>

  );

}

export default AdminJoyPosts;