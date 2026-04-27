import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import API_URL from "../config/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [message, setMessage] = useState("");

  /*  LOAD REMEMBERED CREDENTIALS ON PAGE OPEN */
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedEmail && savedPassword) {
      setForm({
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/login`, form);

      /* ================= SUCCESS LOGIN (USER OR ADMIN) ================= */

      if (
        res.data.message === "Login successful" ||
        res.data.message === "Admin login successful"
      ) {
        // Save auth data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Remember Me logic
        if (form.rememberMe) {
          localStorage.setItem("savedEmail", form.email);
          localStorage.setItem("savedPassword", form.password);
        } else {
          localStorage.removeItem("savedEmail");
          localStorage.removeItem("savedPassword");
        }

        //  ROLE BASED REDIRECT
        if (res.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (res.data.user.role === "parent") {
          navigate("/");
        } else if (res.data.user.role === "mecenas") {
          navigate("/");
        }

      } else {
        setMessage(res.data.message);
      }

    } catch {
      setMessage("Login error");
    }
  };

  return (
    <AuthLayout>

      <h2 style={{ marginBottom: "10px" }}>Welcome Back</h2>
      <p style={{ color: "#777", marginBottom: "30px" }}>
        Please login to your account
      </p>

      <form onSubmit={handleSubmit}>

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
  <input
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={form.password}
    onChange={handleChange}
    style={{ ...inputStyle, paddingRight: "40px" }}
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "18px",
      color: "#666"
    }}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

        {/* REMEMBER + FORGOT */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}>
          <label style={{ fontSize: "14px" }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
            />
            {" "}Remember me
          </label>

          <Link to="/forgot-password" style={{ fontSize: "14px" }}>
            Forgot password?
          </Link>
        </div>

        {/* BUTTON */}
        <button type="submit" style={buttonStyle}>
          Sign In
        </button>

      </form>

      {message && (
        <p style={{ color: "red", marginTop: "15px" }}>{message}</p>
      )}

      <p style={{ marginTop: "25px", fontSize: "14px" }}>
        Don't have an account?{" "}
        <Link to="/register">Sign Up</Link>
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

export default Login;