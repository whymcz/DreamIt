import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

function Messages() {

  const navigate = useNavigate();
  const socketRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const { dreamId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);


  const messagesEndRef = useRef(null);



  /* ================= INIT SOCKET ================= */

  useEffect(() => {

    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("receive_message", (data) => {

      setMessages(prev => [...prev, data]);
      setTimeout(scrollToBottom, 50);

    });

    return () => {
      socketRef.current.disconnect();
    };

  }, []);



  /* ================= AUTO SCROLL ================= */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const onEmojiClick = (emojiData) => {
     setText(prev => prev + emojiData.emoji);
  };
  

  const handleFileChange = (e) => {
  const selected = e.target.files[0];

  if (!selected) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setFile(reader.result); // base64
  };

  reader.readAsDataURL(selected);
};


  /* ================= LOAD CONVERSATIONS ================= */

  useEffect(() => {

    const fetchConversations = async () => {

      try {

        const res = await fetch(
          `http://localhost:5000/messages/conversations/${user._id}`
        );

        const data = await res.json();

        setConversations(data);

        if (dreamId) {
          const dream = data.find(d => d._id === dreamId);
          if (dream) openChat(dream);
        }

      } catch (error) {
        console.log(error);
      }

    };

    fetchConversations();

  }, []);



  /* ================= LOAD CHAT ================= */

  const openChat = async (dream) => {

    setSelectedDream(dream);

    if (socketRef.current) {
      socketRef.current.emit("join_room", dream._id);
    }

    try {

      const res = await fetch(
        `http://localhost:5000/messages/${dream._id}`
      );

      const data = await res.json();

      setMessages(data);

      setTimeout(scrollToBottom, 100);

    } catch (error) {
      console.log(error);
    }

  };



  /* ================= LIVE CHAT UPDATES (fallback) ================= */

  useEffect(() => {

    if (!selectedDream) return;

    const interval = setInterval(async () => {

      try {

        const res = await fetch(
          `http://localhost:5000/messages/${selectedDream._id}`
        );

        const data = await res.json();

        setMessages(data);

        scrollToBottom();

      } catch (error) {
        console.log(error);
      }

    }, 3000);

    return () => clearInterval(interval);

  }, [selectedDream]);



  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {

    if (!text.trim() || !selectedDream) return;

    const receiverId =
      user._id === selectedDream.parentId._id
        ? selectedDream.mecenasId._id
        : selectedDream.parentId._id;

    try {

      const res = await fetch(
        "http://localhost:5000/messages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
  senderId: user._id,
  receiverId,
  dreamId: selectedDream._id,
  text,
  file
})
        }
      );

      const message = await res.json();

      setMessages(prev => [...prev, message]);

      if (socketRef.current) {
        socketRef.current.emit("send_message", {
          ...message,
          dreamId: selectedDream._id
        });
      }

      setText("");

      scrollToBottom();

    } catch (error) {
      console.log(error);
    }

  };
  



  return (
    <>

      {/* BACK BUTTON */}

      <div style={{ padding: "10px 20px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#555"
          }}
        >
          ← Back
        </button>
      </div>


      <div style={{ display: "flex", height: "90vh" }}>

        {/* ================= LEFT PANEL ================= */}

        <div
          style={{
            width: "30%",
            borderRight: "1px solid #eee",
            overflowY: "auto"
          }}
        >

          <h2 style={{ padding: "20px" }}>
            Conversations
          </h2>

          {conversations.length === 0 ? (

            <p style={{ padding: "20px" }}>
              No active chats yet.
            </p>

          ) : (

            conversations.map((dream) => {

              const otherUser =
                user._id === dream.parentId._id
                  ? dream.mecenasId
                  : dream.parentId;

              return (

                <div
  key={dream._id}
  style={{
    padding: "12px 15px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background:
      selectedDream?._id === dream._id
        ? "#f5f8ff"
        : "white"
  }}
  onClick={() => openChat(dream)}
>
  {/* AVATAR */}
  <div style={{
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#5a67ff"
  }}>
    {otherUser.avatar ? (
      <img
        src={otherUser.avatar}
        alt="avatar"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    ) : (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold"
      }}>
        {otherUser.fullName.charAt(0)}
      </div>
    )}
  </div>

  {/* NAME + DREAM (VERTICAL FIX) */}
<div style={{ display: "flex", flexDirection: "column" }}>
  <div style={{ fontWeight: "bold" }}>
    {otherUser.fullName}
  </div>

  <div style={{ fontSize: "13px", color: "#777" }}>
    {dream.title}
  </div>
</div>
</div>
                

              );

            })

          )}

        </div>



        {/* ================= RIGHT PANEL ================= */}

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {!selectedDream ? (

            <div style={{ padding: "40px" }}>
              Select a conversation
            </div>

          ) : (

            <>

              {/* HEADER */}

<div style={{
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "15px",
  borderBottom: "1px solid #eee"
}}>

  {/* AVATAR */}
  <div style={{
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  overflow: "hidden",
  background: "#5a67ff"
}}>
  {(
    user._id === selectedDream.parentId._id
      ? selectedDream.mecenasId.avatar
      : selectedDream.parentId.avatar
  ) ? (
    <img
      src={
        user._id === selectedDream.parentId._id
          ? selectedDream.mecenasId.avatar
          : selectedDream.parentId.avatar
      }
      alt="avatar"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }}
    />
  ) : (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold"
    }}>
      {(user._id === selectedDream.parentId._id
        ? selectedDream.mecenasId.fullName
        : selectedDream.parentId.fullName
      ).charAt(0)}
    </div>
  )}
</div>

  {/* NAME + DREAM */}
  <div>
    <div
      style={{ fontWeight: "bold", cursor: "pointer" }}
      onClick={() => {
  if (user._id === selectedDream.parentId._id) {
    navigate(`/mecenas/${selectedDream.mecenasId._id}`);
  } else {
    navigate(`/parent/${selectedDream.parentId._id}`);
  }
}}
    >
      {user._id === selectedDream.parentId._id
        ? selectedDream.mecenasId.fullName
        : selectedDream.parentId.fullName}
    </div>

    <div style={{ fontSize: "13px", color: "#777" }}>
      Dream: {selectedDream.title}
    </div>
  </div>

</div>



              {/* ================= MESSAGES ================= */}

              <div
                style={{
                  flex: 1,
                  padding: "20px",
                  overflowY: "auto"
                }}
              >

                {messages.map((msg) => {

                  const senderId =
                    typeof msg.senderId === "object"
                      ? msg.senderId._id
                      : msg.senderId;

                  const isMine = senderId === user._id;

                  return (

                    <div
                      key={msg._id}
                      style={{
                        marginBottom: "12px",
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                        alignItems: "flex-end",
                        gap: "8px"
                      }}
                    >

                      {!isMine && (
  <div style={{
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#ccc"
  }}>
    {(
      senderId === selectedDream.parentId._id
        ? selectedDream.parentId.avatar
        : selectedDream.mecenasId.avatar
    ) ? (
      <img
        src={
          senderId === selectedDream.parentId._id
            ? selectedDream.parentId.avatar
            : selectedDream.mecenasId.avatar
        }
        alt="avatar"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    ) : (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold"
      }}>
        {(senderId === selectedDream.parentId._id
          ? selectedDream.parentId.fullName
          : selectedDream.mecenasId.fullName
        ).charAt(0)}
      </div>
    )}
  </div>
)}

                      <span
                        style={{
                          display: "inline-block",
                          padding: "10px 14px",
                          borderRadius: "12px",
                          background: isMine ? "#206c44" : "#eee",
                          color: isMine ? "white" : "black",
                          maxWidth: "60%"
                        }}
                      >

                        {msg.text}

                        <div
                          style={{
                            fontSize: "10px",
                            opacity: 0.7,
                            marginTop: "4px",
                            textAlign: "right"
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}

                          {isMine && (
                            <div
  style={{
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: "16px",
    background: isMine ? "#206c44" : "#eee",
    color: isMine ? "white" : "black",
    maxWidth: "60%"
  }}
>
                              {msg.isRead ? "✓✓" : "✓"}
                            </div>
                          )}

                        </div>

                      </span>

                      {isMine && (
  <div style={{
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#206c44"
  }}>
    {user.avatar ? (
      <img
        src={user.avatar}
        alt="avatar"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    ) : (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "12px",
        fontWeight: "bold"
      }}>
        {user.fullName.charAt(0)}
      </div>
    )}
  </div>
)}

                    </div>

                  );

                })}

                <div ref={messagesEndRef}></div>

              </div>



              {/* ================= INPUT ================= */}

              {/* ================= INPUT ================= */}

<div style={{
  padding: "12px",
  borderTop: "1px solid #eee",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  position: "relative"
}}>

  {/* EMOJI BUTTON */}
  <button
    onClick={() => setShowEmoji(prev => !prev)}
    style={{
      fontSize: "20px",
      background: "none",
      border: "none",
      cursor: "pointer"
    }}
  >
    😊
  </button>

  {/* EMOJI PICKER */}
  {showEmoji && (
    <div style={{
      position: "absolute",
      bottom: "60px",
      left: "10px",
      zIndex: 10
    }}>
      <EmojiPicker onEmojiClick={onEmojiClick} />
    </div>
  )}

  {/* INPUT */}
  <input
    style={{
      flex: 1,
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "20px",
      outline: "none"
    }}
    placeholder="Type message..."
    value={text}
    onChange={(e) => setText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") sendMessage();
    }}
  />

  {/* SEND BUTTON */}
  <button
    onClick={sendMessage}
    style={{
      padding: "10px 18px",
      background: "#206c44",
      color: "white",
      border: "none",
      borderRadius: "20px",
      cursor: "pointer"
    }}
  >
    Send
  </button>

</div>

            </>

          )}

        </div>

      </div>

    </>
  );

}

export default Messages;