import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";
import bgImg from "../assets/submit-dream-background.jpg";

/* ===== FULL KAZAKHSTAN CITIES LIST ===== */
const kzCities = [
  "Almaty","Astana","Shymkent",
  "Aktau, Mangystau Region","Aktobe, Aktobe Region","Aksay, West Kazakhstan Region",
  "Alga, Aktobe Region","Aral, Kyzylorda Region","Arkalyk, Kostanay Region",
  "Arys, Turkistan Region","Atbasar, Akmola Region","Atyrau, Atyrau Region",
  "Baikonur, Kyzylorda Region","Balkhash, Karaganda Region",
  "Bulayevo, North Kazakhstan Region","Derzhavinsk, Akmola Region",
  "Ekibastuz, Pavlodar Region","Esik, Almaty Region",
  "Zhanaozen, Mangystau Region","Zhanatas, Zhambyl Region",
  "Zhezkazgan, Ulytau Region","Zhetiqara, Kostanay Region",
  "Kapchagay, Almaty Region","Karaganda, Karaganda Region",
  "Kaskelen, Almaty Region","Kentau, Turkistan Region",
  "Kokshetau, Akmola Region","Kostanay, Kostanay Region",
  "Kulsary, Atyrau Region","Kurchatov, Abai Region",
  "Kyzylorda, Kyzylorda Region","Lisakovsk, Kostanay Region",
  "Makinsk, Akmola Region","Pavlodar, Pavlodar Region",
  "Petropavl, North Kazakhstan Region","Ridder, East Kazakhstan Region",
  "Rudny, Kostanay Region","Saran, Karaganda Region",
  "Sarkand, Zhetysu Region","Satpayev, Ulytau Region",
  "Semey, Abai Region","Sergeyevka, North Kazakhstan Region",
  "Shalqar, Aktobe Region","Shardarа, Turkistan Region",
  "Shu, Zhambyl Region","Stepnogorsk, Akmola Region",
  "Stepnyak, Akmola Region","Taldykorgan, Zhetysu Region",
  "Taraz, Zhambyl Region","Tekeli, Zhetysu Region",
  "Temirtau, Karaganda Region","Tobol, Kostanay Region",
  "Turkistan, Turkistan Region","Ust-Kamenogorsk, East Kazakhstan Region",
  "Uralsk, West Kazakhstan Region","Usharal, Alakol District",
  "Zaisan, East Kazakhstan Region"
];

function DreamSubmissionPage() {

  const location = useLocation();
  const navigate = useNavigate();
  const editDream = location.state?.editDream;

  const [form, setForm] = useState({
    childName: "",
    age: "",
    gender: "",
    city: "",
    title: "",
    description: "",
    document: ""
  });

  const [cityQuery, setCityQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);

  /* ================= PREFILL IF EDITING ================= */

  useEffect(() => {
    if (editDream) {
      setForm({
        childName: editDream.childName,
        age: editDream.age,
        gender: editDream.gender,
        city: editDream.city,
        title: editDream.title,
        description: editDream.description,
        document: editDream.document || ""
      });

      setCityQuery(editDream.city);
    }
  }, [editDream]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= CITY SEARCH ================= */

  const handleCitySearch = (e) => {
    const value = e.target.value;
    setCityQuery(value);

    const filtered = kzCities.filter(city =>
      city.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredCities(filtered);
  };

  /* ================= FILE UPLOAD ================= */

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, document: reader.result });
    };
    reader.readAsDataURL(file);
  };

  /* ================= SUBMIT / RESUBMIT ================= */

  const handleSubmit = async () => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      return;
    }

    if (
      !form.childName ||
      !form.age ||
      !form.gender ||
      !form.city ||
      !form.title ||
      !form.description
    ) {
      alert("Please fill all fields");
      return;
    }

    try {

      const url = editDream
        ? `http://localhost:5000/parent/update-dream/${editDream._id}`
        : "http://localhost:5000/submit-dream";

      const method = editDream ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          parentId: user._id
        })
      });

      const data = await response.json();

      alert(data.message);

      navigate("/profile");

    } catch (error) {
      console.log(error);
      alert("Failed to submit dream");
    }
  };

  return (
    <div className="auth-wrapper">

      <div
        className="auth-image"
        style={{ backgroundImage: `url(${bgImg})` }}
      />

      <div className="auth-form">

        <h2>{editDream ? "Edit & Resubmit Dream" : "Submit a Dream"}</h2>

        <input
          name="childName"
          placeholder="Child Full Name"
          value={form.childName}
          onChange={handleChange}
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
        />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="Boy"
              checked={form.gender === "Boy"}
              onChange={handleChange}
            /> Boy
          </label>

          <label>
            <input
              type="radio"
              name="gender"
              value="Girl"
              checked={form.gender === "Girl"}
              onChange={handleChange}
            /> Girl
          </label>
        </div>

        <div className="city-autocomplete">
          <input
            placeholder="Type city..."
            value={cityQuery}
            onChange={handleCitySearch}
          />

          {filteredCities.length > 0 && (
            <div className="city-dropdown">
              {filteredCities.map((city, index) => (
                <div
                  key={index}
                  className="city-item"
                  onClick={() => {
                    setForm({ ...form, city });
                    setCityQuery(city);
                    setFilteredCities([]);
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          name="title"
          placeholder="Dream Title"
          value={form.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Dream Description (max 200 words)"
          value={form.description}
          onChange={handleChange}
          maxLength={1000}
        />

        <label className="upload-btn">
          Upload Disability Document
          <input type="file" hidden onChange={handleFileUpload} />
        </label>

        <button className="save-btn" onClick={handleSubmit}>
          {editDream ? "Resubmit Dream" : "Submit Dream"}
        </button>

      </div>
    </div>
  );
}

export default DreamSubmissionPage;