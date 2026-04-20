if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const config = require("./config");
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const User = require("./models/User");
const Dream = require("./models/Dream");
const JoyPost = require("./models/JoyPost");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("./mailer");
const sendResetEmail = require("./resetMailer");

const JWT_SECRET = "dreamit_secret_key";

const app = express();


const Notification = require("./models/Notification");
const Message = require("./models/Message");

const Request = require("./models/Request");

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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const PORT = process.env.PORT || 5000;

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
  avatar: user.avatar,
  socialLinks: user.socialLinks || []
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
    const { userId, fullName, phone, avatar, socialLinks } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  update only if provided
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (socialLinks !== undefined) {
  user.socialLinks = socialLinks; // keep array as is
}

    await user.save();

    //  return FULL user (IMPORTANT)
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      socialLinks: user.socialLinks || []
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

/* ================= PARENT: CONFIRM DREAM ================= */

app.post("/dreams/:id/confirm", async (req, res) => {
  try {
    const { userId } = req.body;

    const dream = await Dream.findById(req.params.id);

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    //  Check ownership
    if (dream.parentId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //  Only allow if already fulfilled
    if (dream.status !== "confirmed") {
      return res.status(400).json({
        message: "Dream is not ready for confirmation"
      });
    }

    //  FINAL STEP
    dream.status = "fulfilled";
    await dream.save();

    res.json({
      message: "Dream confirmed successfully",
      dream
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to confirm dream"
    });
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

    const { city, gender, minAge, maxAge, mecenasId } = req.query;

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

    // attach request info to each dream
    const dreamsWithRequests = await Promise.all(
      dreams.map(async (dream) => {

        const requestCount = await Request.countDocuments({
          dreamId: dream._id
        });

        let userRequested = false;

        if (mecenasId) {
          const existing = await Request.findOne({
            dreamId: dream._id,
            mecenasId
          });

          if (existing) {
            userRequested = true;
          }
        }

        return {
          ...dream.toObject(),
          requestCount,
          userRequested
        };

      })
    );

    res.json(dreamsWithRequests);

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

    //  CHECK SOCIAL LINKS
const mecenas = await User.findById(mecenasId);

if (!mecenas || !mecenas.socialLinks || mecenas.socialLinks.length === 0) {
  return res.status(400).json({
    message: "You must add at least 1 social media link on a Profile page before requesting a dream."
  });
}

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

    // prevent duplicate requests
    const existingRequest = await Request.findOne({
      dreamId,
      mecenasId
    });

    if (existingRequest) {
      return res.json({
        message: "You already requested this dream."
      });
    }

    // create request
    await Request.create({
      dreamId,
      mecenasId
    });

    await createNotification(
      dream.parentId,
      `A mecenas requested to fulfill "${dream.title}".`,
      "/profile?tab=submissions"
    );

    res.json({
      message: "Request sent successfully!"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to send request"
    });

  }

});


/* ================= MECENAS: GET COMPLETED DREAMS ================= */

app.get("/mecenas/completed-dreams/:mecenasId", async (req, res) => {
  try {

    const dreams = await Dream.find({
      mecenasId: req.params.mecenasId,
      status: "fulfilled"
    }).sort({ createdAt: -1 });

    res.json(dreams);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch completed dreams"
    });
  }
});



/* ================= ADMIN: MECENAS REQUEST ACTION ================= */

app.patch("/admin/mecenas-request/:id", verifyAdmin, async (req, res) => {

  try {

    const { action, comment } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const dream = await Dream.findById(request.dreamId);

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    /* APPROVE REQUEST */

    if (action === "approve") {

      request.status = "approved";
      await request.save();

      /* deny all other requests for this dream */

      await Request.updateMany(
        {
          dreamId: request.dreamId,
          _id: { $ne: request._id }
        },
        { status: "denied" }
      );

      /* update dream */

      dream.status = "confirmed";
      dream.mecenasId = request.mecenasId;

      await dream.save();

      await createNotification(
        request.mecenasId,
        `Admin approved your request to fulfill "${dream.title}".`,
        `/messages/${dream._id}`
      );

      await createNotification(
        dream.parentId,
        `Admin approved a mecenas request for "${dream.title}".`,
        `/messages/${dream._id}`
      );

    }

    /* DENY REQUEST */

    if (action === "deny") {

      if (!comment || comment.trim() === "") {
        return res.status(400).json({
          message: "Comment required when denying request"
        });
      }

      request.status = "denied";
      await request.save();

      await createNotification(
        request.mecenasId,
        `Admin denied your request to fulfill "${dream.title}".`,
        "/profile?tab=requests"
      );

    }

    

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

    const pending = await Request.countDocuments({ status: "pending" });
    const approved = await Request.countDocuments({ status: "approved" });
    const denied = await Request.countDocuments({ status: "denied" });

    const confirmed = await Dream.countDocuments({ status: "confirmed" });
    const fulfilled = await Dream.countDocuments({ status: "fulfilled" });

    const total = await Dream.countDocuments({
  status: { $in: ["confirmed", "fulfilled", "request_denied"] }
});

    res.json({
      total,
      chosen: pending,
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

    if (status === "chosen") {
      filter.status = "chosen";
    }

    if (status === "confirmed") {
      filter.status = "confirmed";
    }

    if (status === "fulfilled") {
      filter.status = "fulfilled";
    }

    if (status === "request_denied") {
      filter.status = "request_denied";
    }

    if (status === "all") {
      filter.status = { 
        $in: ["chosen", "confirmed", "fulfilled", "request_denied"] 
      };
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

/* ================= ADMIN: GET PENDING DREAMS WITH REQUESTS ================= */

app.get("/admin/pending-dreams-with-requests", verifyAdmin, async (req, res) => {

  try {

    // get all pending requests
    const requests = await Request.find({ status: "pending" })
  .populate("mecenasId", "fullName avatar socialLinks")
      .populate({
        path: "dreamId",
        populate: { path: "parentId", select: "fullName" }
      });

    const dreamMap = {};

    for (const reqItem of requests) {

  const dream = reqItem.dreamId;

  //  COUNT FULFILLED DREAMS
  const fulfilledCount = await Dream.countDocuments({
  mecenasId: reqItem.mecenasId._id,
  status: "fulfilled"
});

  if (!dreamMap[dream._id]) {

    dreamMap[dream._id] = {
      dream: dream,
      requests: []
    };

  }

  dreamMap[dream._id].requests.push({
    ...reqItem.toObject(),
    fulfilledCount
  });

}

    const result = Object.values(dreamMap);

    res.json(result);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch pending dreams"
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

    const { senderId, receiverId, dreamId, text, file } = req.body;

   if ((!text || text.trim() === "") && !file) {
  return res.status(400).json({ message: "Message must have text or file" });
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
  text,
  file
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
    .populate("parentId", "fullName avatar")
    .populate("mecenasId", "fullName avatar")
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


/* ================= JOY WALL ================= */

/* CREATE JOY POST */

app.post("/joy", async (req, res) => {

  try {

    const { dreamId, mecenasId, mecenasName, media, text, avatar } = req.body;

    const post = new JoyPost({
  dreamId,
  mecenasId,
  mecenasName,
  media,
  text,
  avatar,
  status: "pending"
});

    await post.save();

    res.json({
      message: "Post submitted for approval"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to submit joy post"
    });

  }

});


/* GET PUBLIC JOY WALL */

app.get("/joy", async (req, res) => {

  try {

    const posts = await JoyPost.find({ status: "approved" })
      .populate("mecenasId", "fullName avatar") // IMPORTANT LINE
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch joy posts"
    });

  }

});


/* ADMIN: GET PENDING JOY POSTS */

app.get("/admin/joy-posts", verifyAdmin, async (req, res) => {

  try {

    const posts = await JoyPost.find({ status: "pending" })
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch joy posts"
    });

  }

});


/* ADMIN: APPROVE / DELETE JOY POST */

app.patch("/admin/joy-post/:id", verifyAdmin, async (req, res) => {

  try {

    const { action } = req.body;

    const post = await JoyPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (action === "approve") {
      post.status = "approved";
      await post.save();
    }

    if (action === "deny") {
      await JoyPost.findByIdAndDelete(req.params.id);
    }

    res.json({ message: "Post updated" });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to update joy post"
    });

  }

});


/*=================== likes =================*/

app.post("/joy/:id/like", async (req, res) => {

  try {

    const { userId } = req.body;

    const post = await JoyPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {

      post.likes = post.likes.filter(
        id => id.toString() !== userId
      );

    } else {

      post.likes.push(userId);

    }

    await post.save();

    res.json({
      likes: post.likes.length
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Like error"
    });

  }

});

/* ================= comments ================= */

app.post("/joy/:id/comment", async (req, res) => {

  try {

    const { userId, userName, text } = req.body;

    const post = await JoyPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId,
      userName,
      text
    });

    await post.save();

    res.json(post);

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: "Comment error" });

  }

});

/* ================= AI text generator for joyposts ================= */

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: config.openaiKey
});

app.post("/generate-joy-text", async (req, res) => {

  try {

    const { dreamId } = req.body;

    const dream = await Dream.findById(dreamId);

    if (!dream) {
      return res.status(404).json({ error: "Dream not found" });
    }

    // Build smart prompt from dream data
    const prompt = `
I am a mecenas who fulfilled a child's dream.

Child: ${dream.childName}
City: ${dream.city}
Dream: ${dream.title}
Details: ${dream.description}

Write a short emotional story (2–3 sentences) FROM MY PERSPECTIVE (first person, using "I").

Make it sound natural, warm, and personal, as if I am sharing my experience after fulfilling the dream.
Do not use third person. Do not say "the mecenas". Speak as "I". Use simple human language, not poetic or overly dramatic.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You write short emotional stories about fulfilled children's dreams."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100
    });

    const text = response.choices[0].message.content;

    res.json({ text });

  } catch (error) {
    console.log("AI error:", error);
    res.status(500).json({ error: "AI failed" });
  }

});


/* ================= AI DREAM FULFILLMENT ASSISTANT ================= */

app.post("/dreams/:id/ai-help", async (req, res) => {
  try {

    const dream = await Dream.findById(req.params.id);

    if (!dream) {
      return res.status(404).json({ message: "Dream not found" });
    }

    //  if already generated → return saved
    if (dream.aiSuggestion && dream.aiSuggestion.trim() !== "") {
      return res.json({ text: dream.aiSuggestion });
    }

    //  SMART UNIVERSAL PROMPT
    const prompt = `
You are an AI assistant helping a sponsor (mecenas) fulfill a child's dream in real life.

Dream details:
- Title: ${dream.title}
- Description: ${dream.description}
- Child age: ${dream.age}
- City: ${dream.city}

Your task:
Create a clear, practical step-by-step plan to fulfill this dream.

Requirements:
- Be VERY practical and realistic
- Suggest specific places (shops, services, events)
- Use the city when possible
- Include approximate prices if relevant
- Include alternatives if the main idea is difficult
- If it's an experience (concert, meeting someone, etc.), suggest how to find events
- If it's an object (toy, guitar, etc.), suggest where to buy it

Structure:
1. What to do (steps)
2. Where to go (shops / places / ideas)
3. Estimated cost (if possible)
4. Alternative options

Keep it simple, helpful, and actionable.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You help people fulfill children's dreams in real life."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400
    });

    const text = response.choices[0].message.content;

    //  SAVE RESULT
    dream.aiSuggestion = text;
    await dream.save();

    res.json({ text });

  } catch (error) {
    console.log("AI Dream error:", error);
    res.status(500).json({ message: "AI failed" });
  }
});


/* ================= MECENAS PROFILE ================= */

app.get("/joy/mecenas/:id", async (req, res) => {
  try {

    const posts = await JoyPost.find({
  mecenasId: req.params.id,
  status: "approved"
}).sort({ createdAt: -1 });

const mecenas = await User.findById(req.params.id);

//  COUNT REAL FULFILLED DREAMS
const fulfilledCount = await Dream.countDocuments({
  mecenasId: req.params.id,
  status: "fulfilled"
});

res.json({
  posts,
  mecenas,
  fulfilledCount
});

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch profile" });
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