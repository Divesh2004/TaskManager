const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// Attach Socket.IO to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/profile"));
app.use("/api/tasks", require("./routes/task"));
app.use("/api/shared", require("./routes/sharedTask"));

// Start app after DB connects
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log("✅ Server + Socket.IO running on", process.env.PORT);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
