const express = require("express");
const auth = require("../middleware/auth");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} = require("../controllers/taskController");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/:projectId", getTasks);
router.post("/:projectId", createTask);
router.put("/:projectId/:taskId", updateTask);
router.delete("/:projectId/:taskId", deleteTask);
router.patch("/:taskId/move", moveTask);

module.exports = router;
