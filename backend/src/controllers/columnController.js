const Column = require("../models/Column");
const Project = require("../models/Project");
const Task = require("../models/Task");

const getColumns = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const columns = await Column.find({ projectId }).sort({ order: 1 });

    res.json(columns);
  } catch (error) {
    console.error("Get columns error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createColumn = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get the highest order number
    const lastColumn = await Column.findOne({ projectId }).sort({ order: -1 });

    const order = lastColumn ? lastColumn.order + 1 : 0;

    const column = new Column({
      name,
      order,
      projectId,
    });

    await column.save();
    res.status(201).json(column);
  } catch (error) {
    console.error("Create column error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateColumn = async (req, res) => {
  try {
    const { projectId, columnId } = req.params;
    const { name } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const column = await Column.findOneAndUpdate(
      { _id: columnId, projectId },
      { name },
      { new: true }
    );

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    res.json(column);
  } catch (error) {
    console.error("Update column error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteColumn = async (req, res) => {
  try {
    const { projectId, columnId } = req.params;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete all tasks in this column
    await Task.deleteMany({ columnId });

    const column = await Column.findOneAndDelete({
      _id: columnId,
      projectId,
    });

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    res.json({ message: "Column deleted successfully" });
  } catch (error) {
    console.error("Delete column error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getColumns, createColumn, updateColumn, deleteColumn };
