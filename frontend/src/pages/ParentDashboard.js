import { useNavigate } from "react-router-dom";

function ParentDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Parent Dashboard</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default ParentDashboard;