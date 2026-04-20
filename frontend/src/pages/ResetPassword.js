import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/reset-password/${token}`,
        { password }
      );

      setMessage(res.data.message);

      if (res.data.message.includes("successful")) {
        setSuccess(true);
      }

    } catch {
      setMessage("Error resetting password.");
    }
  };

  return (
    <AuthLayout>

      <h2 style={{ marginBottom: "10px" }}>Create New Password</h2>

      <p style={{ color: "#777", marginBottom: "30px" }}>
        Enter a new secure password for your account
      </p>

      {!success && (
        <form onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            Reset Password
          </button>

        </form>
      )}

      {message && (
        <p style={{ marginTop: "20px", color: success ? "green" : "#ff4d4d" }}>
          {message}
        </p>
      )}

      {success && (
        <div style={{ marginTop: "25px" }}>
          <button
            onClick={() => navigate("/login")}
            style={buttonStyle}
          >
            Go to Login
          </button>
        </div>
      )}

      {!success && (
        <p style={{ marginTop: "25px", fontSize: "14px" }}>
          Remember your password?{" "}
          <Link to="/login">Sign In</Link>
        </p>
      )}

    </AuthLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "14px"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#5a67ff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  cursor: "pointer"
};

export default ResetPassword;
