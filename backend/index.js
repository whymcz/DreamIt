const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const User = require("./models/User");
const Dream = require("./models/Dream");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("./mailer");
const sendResetEmail = require("./resetMailer");

const JWT_SECRET = "dreamit_secret_key";

const app = express();


const Notification = require("./models/Notification");
const Message = require("./models/Message");

const createNotification = async (userId, message, link = "") => {

  await Notification.create({
    userId,
    message,
    link
  });

};

/* ================= EMAIL VALIDATION ================= */

const isValidEmailFormat = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/* ================= DB CONNECTION ================= */

mongoose.connect("mongodb://localhost:27017/dreamitDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("DreamIt backend is running!");
});

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {
  const { fullName, email, password, confirmPassword, role } = req.body;

  try {
    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res.json({ message: "Please fill all fields" });
    }

    if (!["parent", "mecenas"].includes(role)) {
      return res.json({ message: "Invalid role selected" });
    }

    if (password !== confirmPassword) {
      return res.json({ message: "Passwords do not match" });
    }

    if (!isValidEmailFormat(email)) {
      return res.json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      verificationToken: token,
      isVerified: false
    });

    await newUser.save();

    try {
      await sendVerificationEmail(email, token);
    } catch (mailError) {
      console.log("Email send error:", mailError);
    }

    res.json({
      message: "Registration successful! Check your email to verify account."
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= VERIFY EMAIL ================= */

app.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token
    });

    if (!user) {
      return res.send("Invalid or expired verification link.");
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    res.send("Email verified successfully! You can now login.");

  } catch (error) {
    console.log(error);
    res.send("Verification failed.");
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    if (!email || !password) {
      return res.json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE PROFILE ================= */

app.put("/update-profile", async (req, res) => {
  try {
    const { userId, fullName, phone, avatar } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName;
    user.phone = phone;
    user.avatar = avatar;

    await user.save();

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Profile update failed" });
  }
});

/* ================= CHANGE PASSWORD ================= */

app.put("/change-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Password update failed" });
  }
});

/* ================= FORGOT PASSWORD ================= */

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;

    await user.save();
    await sendResetEmail(user.email, token);

    res.json({
      message: "Password reset link sent to your email."
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */

app.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({ message: "Invalid or expired reset link." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ message: "Password reset successful." });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SUBMIT DREAM ================= */

app.post("/submit-dream", async (req, res) => {
  try {
    const {
      childName,
      age,
      gender,
      city,
      title,
      description,
      document,
      parentId
    } = req.body;

    const newDream = new Dream({
      childName,
      age,
      gender,
      city,
      title,
      description,
      document,
      parentId
    });

    await newDream.save();

    res.json({ message: "Dream submitted successfully!" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to submit dream" });
  }
});

/* ================= ADMIN MIDDLEWARE ================= */

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Remove "Bearer "
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= ADMIN ROUTES ================= */

app.get("/admin/pending-dreams", verifyAdmin, async (req, res) => {
  try {
    const dreams = await Dream.find({ status: "pending" })
      .populate("parentId", "fullName email");

    res.json(dreams);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch pending dreams" });
  }
});

/* ================= ADMIN: UPDATE DREAM STATUS ================= */

app.patch("/admin/update-dream-status/:id", verifyAdmin, async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!["approved", "denied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const dream = await Dream.findById(req.params.id);

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    if (status === "denied") {
      if (!comment || comment.trim() === "") {
        return res.status(400).json({
          message: "Comment is required when denying a dream"
        });
      }

      dream.status = "denied";
      await createNotification(
  dream.parentId,
  `Your dream "${dream.title}" was denied by admin.`,
  "/profile?tab=submissions"
);
      dream.adminComment = comment.trim();
    }

    if (status === "approved") {
      dream.status = "approved";
      await createNotification(
  dream.parentId,
  `Your dream "${dream.title}" has been approved!`,
  "/profile?tab=submissions"
);
      dream.adminComment = ""; // clear old comment if any
    }

    await dream.save();

    res.json({ message: "Dream status updated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update dream status" });
  }
});

app.get("/admin/dashboard-stats", verifyAdmin, async (req, res) => {
  try {

    const total = await Dream.countDocuments();
    const pending = await Dream.countDocuments({ status: "pending" });
    const approved = await Dream.countDocuments({ status: "approved" });
    const denied = await Dream.countDocuments({ status: "denied" });

    res.json({
      total,
      pending,
      approved,
      denied
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ================= PARENT: GET MY DREAMS ================= */

app.get("/parent/my-dreams/:parentId", async (req, res) => {
  try {
    const dreams = await Dream.find({
      parentId: req.params.parentId
    }).sort({ createdAt: -1 });

    res.json(dreams);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch dreams" });
  }
});

/* ================= PARENT: UPDATE & RESUBMIT DREAM ================= */

app.put("/parent/update-dream/:id", async (req, res) => {
  try {
    const {
      childName,
      age,
      gender,
      city,
      title,
      description,
      document
    } = req.body;

    const dream = await Dream.findById(req.params.id);

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    // Only allow editing if denied
    if (dream.status !== "denied") {
      return res.status(400).json({
        message: "Only denied dreams can be edited"
      });
    }

    dream.childName = childName;
    dream.age = age;
    dream.gender = gender;
    dream.city = city;
    dream.title = title;
    dream.description = description;

    if (document) {
      dream.document = document;
    }

    dream.status = "pending";
    dream.adminComment = "";

    await dream.save();

    res.json({ message: "Dream resubmitted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update dream" });
  }
});

/* ================= ADMIN: GET DREAMS BY STATUS ================= */

app.get("/admin/dreams", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const dreams = await Dream.find(filter)
      .populate("parentId", "fullName email")
      .sort({ createdAt: -1 });

    res.json(dreams);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch dreams" });
  }
});

/* ================= ADMIN: GET ALL USERS ================= */

app.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("fullName email role createdAt")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ================= MECENAS: GET APPROVED DREAMS ================= */

app.get("/dreams/approved", async (req, res) => {
  try {

    const { city, gender, minAge, maxAge } = req.query;

    let filter = {
      status: "approved"
    };

    if (city) {
      filter.city = city;
    }

    if (gender) {
      filter.gender = gender;
    }

    if (minAge || maxAge) {
      filter.age = {};

      if (minAge) {
        filter.age.$gte = Number(minAge);
      }

      if (maxAge) {
        filter.age.$lte = Number(maxAge);
      }
    }

    const dreams = await Dream.find(filter)
      .populate("parentId", "fullName")
      .sort({ createdAt: -1 });

    res.json(dreams);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch approved dreams"
    });
  }
});

/* ================= MECENAS: REQUEST TO FULFILL DREAM ================= */

app.post("/dreams/request", async (req, res) => {
  try {

    const { dreamId, mecenasId } = req.body;

    if (!dreamId || !mecenasId) {
      return res.status(400).json({
        message: "Dream ID and Mecenas ID are required"
      });
    }

    const dream = await Dream.findById(dreamId);

    if (!dream) {
      return res.status(404).json({
        message: "Dream not found"
      });
    }

    if (dream.status !== "approved") {
      return res.status(400).json({
        message: "Dream is not available anymore"
      });
    }

    dream.status = "chosen";
    dream.mecenasId = mecenasId;
    await createNotification(
  dream.parentId,
  `A mecenas wants to fulfill your dream "${dream.title}".`,
  "/profile?tab=submissions"
);

    await dream.save();

    res.json({
      message: "Request sent! Admin will review it."
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to send request"
    });
  }
});

/* ================= ADMIN: MECENAS REQUEST ACTION ================= */

app.patch("/admin/mecenas-request/:id", verifyAdmin, async (req, res) => {
  try {

    const { action, comment } = req.body;

    const dream = await Dream.findById(req.params.id);

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    if (action === "approve") {
      dream.status = "confirmed";
      await createNotification(
  dream.mecenasId,
  `Admin approved your request to fulfill "${dream.title}".`,
  `/messages/${dream._id}`
);

await createNotification(
  dream.parentId,
  `Admin approved a mecenas request for "${dream.title}". You can now communicate.`,
  `/messages/${dream._id}`
);
    }

    if (action === "deny") {

  if (!comment || comment.trim() === "") {
    return res.status(400).json({
      message: "Comment required when denying request"
    });
  }

  dream.status = "request_denied";
await createNotification(
  dream.mecenasId,
  `Admin denied your request to fulfill "${dream.title}".`,
  "/profile?tab=requests"
);

  dream.adminComment = comment.trim();

  // keep mecenasId so the user can still see the denied request
}

    if (action === "fulfill") {
      dream.status = "fulfilled";
      await createNotification(
  dream.parentId,
  `Your dream "${dream.title}" has been fulfilled!`,
  `/messages/${dream._id}`
);

await createNotification(
  dream.mecenasId,
  `You successfully fulfilled the dream "${dream.title}".`,
  `/messages/${dream._id}`
);
    }

    await dream.save();

    res.json({ message: "Request updated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to update request"
    });
  }
});

/* ================= ADMIN: MECENAS REQUEST STATS ================= */

app.get("/admin/mecenas-requests-stats", verifyAdmin, async (req, res) => {

  try {

    const total = await Dream.countDocuments({
  status: { $in: ["chosen", "confirmed", "fulfilled", "request_denied"] }
});

    const chosen = await Dream.countDocuments({ status: "chosen" });

    const confirmed = await Dream.countDocuments({ status: "confirmed" });

    const fulfilled = await Dream.countDocuments({ status: "fulfilled" });

    const denied = await Dream.countDocuments({ status: "request_denied" });

    res.json({
      total,
      chosen,
      confirmed,
      fulfilled,
      denied
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch mecenas request stats"
    });

  }

});

/* ================= ADMIN: GET MECENAS REQUESTS ================= */
app.get("/admin/mecenas-requests", verifyAdmin, async (req, res) => {

  try {

    const { status } = req.query;

    let filter = {};

    // show all mecenas requests
    if (!status || status === "all") {
      filter.status = { $in: ["chosen", "confirmed", "fulfilled", "request_denied"] };
    }

    // filter by specific status
    else if (["chosen", "confirmed", "fulfilled", "request_denied"].includes(status)) {
      filter.status = status;
    }

    const dreams = await Dream.find(filter)
      .populate("parentId", "fullName")
      .populate("mecenasId", "fullName")
      .sort({ createdAt: -1 });

    res.json(dreams);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch mecenas requests"
    });

  }

});

/* ================= MECENAS: GET MY REQUESTS ================= */

app.get("/mecenas/my-requests/:mecenasId", async (req, res) => {

  try {

    const dreams = await Dream.find({
      mecenasId: req.params.mecenasId,
      status: { $in: ["chosen", "confirmed", "fulfilled", "request_denied"] }
    })
    .populate("parentId", "fullName")
    .sort({ createdAt: -1 });

    res.json(dreams);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch mecenas requests"
    });

  }

});

/* ================= NOTIFICATIONS ================= */

/* GET latest 30 notifications for user */

app.get("/notifications/:userId", async (req, res) => {

  try {

    const notifications = await Notification.find({
      userId: req.params.userId
    })
    .sort({ createdAt: -1 })
    .limit(30);

    res.json(notifications);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch notifications"
    });

  }

});


/* MARK notification as read */

app.patch("/notifications/:id/read", async (req, res) => {

  try {

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;

    await notification.save();

    res.json({ message: "Notification marked as read" });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to update notification"
    });

  }

});


/* CLEAR ALL notifications for user (optional) */

app.delete("/notifications/:userId", async (req, res) => {

  try {

    await Notification.deleteMany({
      userId: req.params.userId
    });

    res.json({ message: "Notifications cleared" });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to clear notifications"
    });

  }

});



/* ================= MESSAGES ================= */


/* SEND MESSAGE */

app.post("/messages", async (req, res) => {

  try {

    const { senderId, receiverId, dreamId, text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text required" });
    }

    const dream = await Dream.findById(dreamId);

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    /* messaging allowed only after admin confirmation */

    if (dream.status !== "confirmed") {
      return res.status(403).json({
        message: "Messaging allowed only after admin approval"
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      dreamId,
      text
    });

    /* create message notification */

    await createNotification(
      receiverId,
      "You received a new message",
      `/messages/${dreamId}`
    );

    res.json(message);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to send message"
    });

  }

});



/* GET CHAT MESSAGES */

app.get("/messages/:dreamId", async (req, res) => {

  try {

    const messages = await Message.find({
      dreamId: req.params.dreamId
    })
    .populate("senderId", "fullName")
    .sort({ createdAt: 1 });

    /* mark messages as read */

    await Message.updateMany(
      { dreamId: req.params.dreamId, isRead: false },
      { isRead: true }
    );

    res.json(messages);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch messages"
    });

  }

});



/* GET USER CONVERSATIONS */

app.get("/messages/conversations/:userId", async (req, res) => {

  try {

    const userId = req.params.userId;

    const dreams = await Dream.find({
      status: "confirmed",
      $or: [
        { parentId: userId },
        { mecenasId: userId }
      ]
    })
    .populate("parentId", "fullName")
    .populate("mecenasId", "fullName")
    .sort({ createdAt: -1 });

    res.json(dreams);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch conversations"
    });

  }

});

/* ================= UNREAD MESSAGE COUNT ================= */

app.get("/messages/unread/:userId", async (req, res) => {

  try {

    const count = await Message.countDocuments({
      receiverId: req.params.userId,
      isRead: false
    });

    res.json({ count });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch unread messages"
    });

  }

});

/* ================= SERVER ================= */

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* ================= SOCKET CONNECTION ================= */

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join_room", (dreamId) => {
    socket.join(dreamId);
  });

  socket.on("send_message", (data) => {

    io.to(data.dreamId).emit("receive_message", data);

  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});


server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});