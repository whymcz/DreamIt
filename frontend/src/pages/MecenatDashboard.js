import { useNavigate } from "react-router-dom";

function MecenatDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Mecenas Dashboard</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default MecenatDashboard;