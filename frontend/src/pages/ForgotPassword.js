import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/forgot-password", {
        email
      });

      setMessage(res.data.message);

    } catch {
      setMessage("Error sending reset email.");
    }
  };

  return (
    <AuthLayout>

      <h2 style={{ marginBottom: "10px" }}>Reset Password</h2>

      <p style={{ color: "#777", marginBottom: "30px" }}>
        Enter your email and we will send you a reset link
      </p>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Send Reset Link
        </button>

      </form>

      {message && (
        <p style={{ marginTop: "20px", color: "#5a67ff" }}>
          {message}
        </p>
      )}

      <p style={{ marginTop: "25px", fontSize: "14px" }}>
        Remember your password?{" "}
        <Link to="/login">Sign In</Link>
      </p>

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

export default ForgotPassword;
