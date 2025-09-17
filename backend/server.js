require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo connected");
    server.listen(PORT, () => console.log("Server running", PORT));
  })
  .catch((err) => console.error(err));

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("join", (room) => socket.join(room));
  socket.on("leave", (room) => socket.leave(room));
  socket.on("disconnect", () => console.log("socket disconnected", socket.id));
});
