import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { translations } from "../i18n/translations";

import logo from "../assets/logo.png";
import usFlag from "../assets/us.png";
import ruFlag from "../assets/ru.png";
import kzFlag from "../assets/kz.png";

import heroImg from "../assets/hero-children.jpg";
import aboutImg from "../assets/about-kids.jpg";
import telegramIcon from "../assets/telegram-icon.png";
import whatsappIcon from "../assets/whatsapp-icon.png";

import bellIcon from "../assets/icons/bell.png";
import chatIcon from "../assets/icons/chat.png";

function Home() {

  const fetchUnreadMessages = async () => {

  if (!user) return;

  try {

    const res = await fetch(
      `http://localhost:5000/messages/unread/${user._id}`
    );

    const data = await res.json();

    setUnreadMessages(data.count);

  } catch (error) {

    console.log("Unread message fetch error", error);

  }

};

  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  /* ================= FETCH NOTIFICATIONS ================= */

  useEffect(() => {

    if (!user) return;

    const fetchNotifications = async () => {

      try {

        const res = await fetch(
          `http://localhost:5000/notifications/${user._id}`
        );

        const data = await res.json();

        setNotifications(data);

      } catch (error) {

        console.log("Notification fetch error", error);

      }

    };

    fetchNotifications();

  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* ================= CLICK NOTIFICATION ================= */

  const handleNotificationClick = async (notification) => {

    try {

      await fetch(
        `http://localhost:5000/notifications/${notification._id}/read`,
        { method: "PATCH" }
      );

      window.location.href = notification.link;

    } catch (error) {

      console.log("Notification update error", error);

    }

  };

  return (

    <div>

      {/* ===== NAVBAR ===== */}

      <nav
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 60px",
          borderBottom: "1px solid #eee",
          zIndex: 1000
        }}
      >

        {/* LEFT — LOGO */}

        <div style={{ flex: 1 }}>
          <img src={logo} alt="logo" style={{ height: "60px" }} />
        </div>


        {/* CENTER — MENU */}

        <div
          style={{
            flex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "50px",
            whiteSpace: "nowrap"
          }}
        >

          {user && (

            user.role === "parent" ? (

              <Link to="/submit-dream">
                <button className="register-btn auth-btn">
                  SUBMIT DREAM
                </button>
              </Link>

            ) : (

              <Link to="/dreams">
                <button className="register-btn auth-btn">
                  DREAM LIST
                </button>
              </Link>

            )

          )}

          <span className="nav-link" onClick={() => scrollToSection("about")}>
            ABOUT US
          </span>

          <span className="nav-link" onClick={() => scrollToSection("steps")}>
            HOW IT WORKS
          </span>

          <span className="nav-link" onClick={() => scrollToSection("contact")}>
            CONTACT
          </span>

        </div>


        {/* RIGHT — FLAGS + ICONS + AUTH */}

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            gap: "20px",
            alignItems: "center"
          }}
        >

          {/* FLAGS */}

          <img src={usFlag} className={`flag ${lang==="en"?"active":""}`} onClick={()=>setLang("en")} />
          <img src={ruFlag} className={`flag ${lang==="ru"?"active":""}`} onClick={()=>setLang("ru")} />
          <img src={kzFlag} className={`flag ${lang==="kz"?"active":""}`} onClick={()=>setLang("kz")} />

          {/* NOTIFICATIONS */}

          {user && (

            <div style={{ position: "relative" }}>

              <img
                src={bellIcon}
                alt="notifications"
                style={{ width: "26px", cursor: "pointer" }}
                onClick={() => setShowNotifications(!showNotifications)}
              />

              {unreadCount > 0 && (

                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px"
                  }}
                >
                  {unreadCount}
                </span>

              )}

            </div>

          )}

          {/* MESSAGE ICON */}

{user && (

  <div style={{ position: "relative" }}>

    <Link to="/messages">

      <img
        src={chatIcon}
        alt="messages"
        style={{ width: "26px", cursor: "pointer" }}
      />

    </Link>

    {unreadMessages > 0 && (

      <span
        style={{
          position: "absolute",
          top: "-6px",
          right: "-6px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          padding: "2px 6px",
          fontSize: "12px"
        }}
      >
        {unreadMessages}
      </span>

    )}

  </div>

)}

          {/* AUTH BUTTONS */}

          {!user ? (

            <>
              <Link to="/login"><button className="login-btn auth-btn">LOGIN</button></Link>
              <Link to="/register"><button className="register-btn auth-btn">REGISTER</button></Link>
            </>

          ) : (

            <Link to="/profile">
              <div className="avatar">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </Link>

          )}

        </div>

      </nav>


      {/* ===== NOTIFICATION DROPDOWN ===== */}

      {showNotifications && (

        <div
          style={{
            position: "absolute",
            right: "120px",
            top: "85px",
            width: "320px",
            background: "white",
            border: "1px solid #eee",
            borderRadius: "8px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            maxHeight: "420px",
            overflowY: "auto",
            zIndex: 1000
          }}
        >

          <div style={{ padding: "15px", fontWeight: "bold" }}>
            Notifications
          </div>

          {notifications.length === 0 ? (

            <div style={{ padding: "15px" }}>
              No notifications
            </div>

          ) : (

            notifications.map((n) => (

              <div
                key={n._id}
                style={{
                  padding: "12px 15px",
                  borderTop: "1px solid #eee",
                  cursor: "pointer",
                  background: n.isRead ? "white" : "#f5f8ff"
                }}
                onClick={() => handleNotificationClick(n)}
              >

                <div>{n.message}</div>

                <div style={{ fontSize: "12px", color: "#888" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>

              </div>

            ))

          )}

        </div>

      )}


      {/* ===== HERO ===== */}

      <section className="hero">

        <div className="hero-text">

          <h1>Every Child Deserves Their Dream</h1>

          <p>
            DreamIt connects families of children with disabilities
            to kind people who want to make their dreams come true.
          </p>

          {!user && (

            <div className="hero-buttons">

              <Link to="/register">
                <button className="register-btn auth-btn">
                  I Have a Dream
                </button>
              </Link>

              <Link to="/register">
                <button className="login-btn auth-btn">
                  Make Dreams Come True
                </button>
              </Link>

            </div>

          )}

        </div>

        <div className="hero-image">
          <img src={heroImg} alt="children" />
        </div>

      </section>


      {/* ===== ABOUT ===== */}

      <section id="about" className="about">

        <div className="about-text">

          <h2>What is DreamIt?</h2>

          <p>
            DreamIt is a digital platform where parents of children
            with disabilities can share their dreams, and caring
            people can help fulfill them.
          </p>

        </div>

        <div className="about-image">
          <img src={aboutImg} alt="kids" />
        </div>

      </section>


      {/* ===== HOW IT WORKS ===== */}

      <section id="steps" className="steps">

        <h2>How It Works</h2>

        <div className="steps-grid">

          <div className="step-card">
            <h3>1. Submit a Dream</h3>
            <p>Parents share their child’s dream.</p>
          </div>

          <div className="step-card">
            <h3>2. Mecenas Chooses</h3>
            <p>Supporters choose a dream to fulfill.</p>
          </div>

          <div className="step-card">
            <h3>3. Dream Comes True</h3>
            <p>The dream becomes reality.</p>
          </div>

        </div>

      </section>


      {/* ===== CONTACT ===== */}

      <section id="contact" className="contact">

        <h2>Contact Us</h2>

        <p>dreamit.confirm@gmail.com</p>
        <p>Kazakhstan, Almaty</p>

        <div className="contact-icons">

          <a href="https://t.me/b1koshym" target="_blank">
            <img src={telegramIcon} alt="telegram" />
          </a>

          <a href="https://wa.me/7763364425" target="_blank">
            <img src={whatsappIcon} alt="whatsapp" />
          </a>

        </div>

      </section>

    </div>

  );

}

export default Home;