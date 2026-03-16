import authImage from "../assets/auth-photo.jpg";

function AuthLayout({ children }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      fontFamily: "Poppins"
    }}>

      {/* LEFT IMAGE SIDE */}
      <div style={{
        flex: 1,
        background: `url(${authImage}) center/cover no-repeat`
      }} />

      {/* RIGHT FORM SIDE */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff"
      }}>
        <div style={{ width: "350px" }}>
          {children}
        </div>
      </div>

    </div>
  );
}

export default AuthLayout;
