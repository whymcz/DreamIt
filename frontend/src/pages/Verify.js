import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";

function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        await axios.get(`${API_URL}/verify/${token}`);
        alert("Email verified successfully!");
        navigate("/login");
      } catch (error) {
        alert("Verification failed");
      }
    };

    verifyUser();
  }, [token, navigate]);

  return <h2 style={{ textAlign: "center" }}>Verifying...</h2>;
}

export default Verify;