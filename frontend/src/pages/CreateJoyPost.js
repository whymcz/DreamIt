import { useState } from "react";
import API_URL from "../config/api";

function CreateJoyPost() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [text, setText] = useState("");
  const [media, setMedia] = useState("");

  const handleSubmit = async () => {

    try {

      const res = await fetch(`${API_URL}/joy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mecenasId: user._id,
          mecenasName: user.fullName,
          text,
          media
        })
      });

      const data = await res.json();

      alert(data.message);

      setText("");
      setMedia("");

    } catch (error) {

      console.log("Joy post submit error", error);

    }

  };

  return (

    <div style={{ maxWidth: "600px", margin: "60px auto" }}>

      <h2>Create Joy Post</h2>

      <div style={{ marginTop: "20px" }}>

        <textarea
          placeholder="Write about the fulfilled dream..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            height: "120px",
            padding: "10px",
            marginBottom: "15px"
          }}
        />

        <input
          type="text"
          placeholder="Image URL (for now)"
          value={media}
          onChange={(e) => setMedia(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px"
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            background: "#5a67ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Submit Post
        </button>

      </div>

    </div>

  );

}

export default CreateJoyPost;