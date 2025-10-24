require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const columnRoutes = require("./routes/columns");
const taskRoutes = require("./routes/tasks");
const aiRoutes = require("./routes/ai");

const app = express();


app.use(cors({
  origin: ["https://assignment-devvoid.vercel.app", "http://localhost:5175"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));


app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => res.json({ message: "Server is running!" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});


module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}
