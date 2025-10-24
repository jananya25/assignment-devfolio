const express = require("express");
const auth = require("../middleware/auth");
const { summarizeTasks, askQuestion } = require("../controllers/aiController");

const router = express.Router();

router.use(auth); // All routes require authentication

router.post("/:projectId/summarize", summarizeTasks);
router.post("/:projectId/ask", askQuestion);

module.exports = router;
