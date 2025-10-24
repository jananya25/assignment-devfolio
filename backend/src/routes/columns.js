const express = require("express");
const auth = require("../middleware/auth");
const {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
} = require("../controllers/columnController");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/:projectId", getColumns);
router.post("/:projectId", createColumn);
router.put("/:projectId/:columnId", updateColumn);
router.delete("/:projectId/:columnId", deleteColumn);

module.exports = router;
