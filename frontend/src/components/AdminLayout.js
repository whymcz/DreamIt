import { Link, useNavigate, useLocation } from "react-router-dom";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={wrapperStyle}>

      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <h2 style={titleStyle}>DreamIt Admin</h2>

        <div style={navContainerStyle}>

          <Link
            style={isActive("/admin/parent-submissions") ? activeLinkStyle : linkStyle}
            to="/admin/parent-submissions"
          >
            Parent Submissions
          </Link>

          <Link
            style={isActive("/admin/mecenas-requests") ? activeLinkStyle : linkStyle}
            to="/admin/mecenas-requests"
          >
            Mecenas Requests
          </Link>

          <Link
            style={isActive("/admin/users") ? activeLinkStyle : linkStyle}
            to="/admin/users"
          >
            Users
          </Link>

          <button onClick={handleLogout} style={logoutStyle}>
            Logout
          </button>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={contentStyle}>
        {children}
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const wrapperStyle = {
  display: "flex",
  minHeight: "100vh"
};

const sidebarStyle = {
  width: "250px",
  background: "#1f2937",
  color: "white",
  padding: "30px 20px"
};

const titleStyle = {
  marginBottom: "40px"
};

const navContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const contentStyle = {
  flex: 1,
  background: "#f3f4f6",
  padding: "40px"
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "15px"
};

const activeLinkStyle = {
  color: "#60a5fa",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: "bold"
};

const logoutStyle = {
  background: "transparent",
  border: "1px solid #fff",
  color: "white",
  padding: "8px",
  cursor: "pointer",
  borderRadius: "4px",
  marginTop: "20px"
};

export default AdminLayout;