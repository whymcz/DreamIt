import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import API_URL from "../config/api";

function AdminUsers() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUsers(res.data);

    } catch (error) {
      console.log("Failed to fetch users", error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const renderRole = (role) => {
    const style = {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      color: "white"
    };

    if (role === "parent") style.background = "#5a67ff";
    if (role === "mecenas") style.background = "green";
    if (role === "admin") style.background = "black";

    return <span style={style}>{role.toUpperCase()}</span>;
  };

  return (
    <AdminLayout>

      <h1 style={{ marginBottom: "30px" }}>Users</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{renderRole(user.role)}</td>
                <td>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </AdminLayout>
  );
}

const tableStyle = {
  width: "100%",
  background: "white",
  borderCollapse: "collapse"
};

export default AdminUsers;