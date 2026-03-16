import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function Register() {

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "parent"
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/register", form);
      setMessage(res.data.message);
    } catch {
      setMessage("Registration error");
    }
  };

  return (
    <AuthLayout>

      <h2 style={{ marginBottom: "10px" }}>Create Account</h2>
      <p style={{ color: "#777", marginBottom: "30px" }}>
        Join DreamIt and start helping children
      </p>

      <form onSubmit={handleSubmit}>

        {/* FULL NAME */}
        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* PASSWORD */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* CONFIRM */}
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* ROLE SELECT */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <label>
            <input
              type="radio"
              name="role"
              value="parent"
              checked={form.role === "parent"}
              onChange={handleChange}
            /> Parent
          </label>

          <label>
            <input
              type="radio"
              name="role"
              value="mecenas"
              checked={form.role === "mecenas"}
              onChange={handleChange}
            /> Mecenat
          </label>
        </div>

        {/* BUTTON */}
        <button type="submit" style={buttonStyle}>
          Register
        </button>

      </form>

      {message && (
        <p style={{ color: "red", marginTop: "15px" }}>{message}</p>
      )}

      <p style={{ marginTop: "25px", fontSize: "14px" }}>
        Already have an account?{" "}
        <Link to="/login">Sign In</Link>
      </p>

    </AuthLayout>
  );
}

/* STYLES */

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
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

export default Register;
