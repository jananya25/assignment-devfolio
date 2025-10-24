const Project = require("../models/Project");
const Column = require("../models/Column");
const Task = require("../models/Task");

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = new Project({
      name,
      description,
      userId: req.user.id,
    });

    await project.save();

    // Create default columns
    const defaultColumns = [
      { name: "To Do", order: 0, projectId: project._id },
      { name: "In Progress", order: 1, projectId: project._id },
      { name: "Done", order: 2, projectId: project._id },
    ];

    await Column.insertMany(defaultColumns);

    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { name, description },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete all tasks and columns first
    await Task.deleteMany({ projectId: id });
    await Column.deleteMany({ projectId: id });

    const project = await Project.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
