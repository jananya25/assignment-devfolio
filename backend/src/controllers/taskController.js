const Task = require("../models/Task");
const Project = require("../models/Project");
const Column = require("../models/Column");

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log(
      "Getting tasks for projectId:",
      projectId,
      "userId:",
      req.user.id
    );

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      console.log("Project not found for user:", req.user.id);
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await Task.find({ projectId })
      .populate("columnId", "name order")
      .sort({ order: 1 });

    console.log("Found tasks:", tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, columnId } = req.body;

    console.log("Creating task with data:", {
      projectId,
      title,
      description,
      columnId,
      userId: req.user.id,
    });

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      console.log("Project not found for user:", req.user.id);
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify column belongs to project
    const column = await Column.findOne({ _id: columnId, projectId });
    if (!column) {
      console.log("Column not found:", columnId, "for project:", projectId);
      return res.status(404).json({ message: "Column not found" });
    }

    // Get the highest order number in this column
    const lastTask = await Task.findOne({ columnId }).sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = new Task({
      title,
      description,
      columnId,
      projectId,
      order,
    });

    await task.save();
    await task.populate("columnId", "name order");

    console.log("Task created successfully:", task);
    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      { title, description },
      { new: true }
    ).populate("columnId", "name order");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.findOneAndDelete({
      _id: taskId,
      projectId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { columnId, order } = req.body;

    console.log("Moving task:", {
      taskId,
      columnId,
      order,
      userId: req.user.id,
    });

    const task = await Task.findById(taskId);
    if (!task) {
      console.log("Task not found:", taskId);
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: task.projectId,
      userId: req.user.id,
    });
    if (!project) {
      console.log("Project not found for user:", req.user.id);
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify new column belongs to project
    const column = await Column.findOne({
      _id: columnId,
      projectId: task.projectId,
    });
    if (!column) {
      console.log(
        "Column not found:",
        columnId,
        "for project:",
        task.projectId
      );
      return res.status(404).json({ message: "Column not found" });
    }

    // Update task position
    task.columnId = columnId;
    task.order = order;
    await task.save();

    // If moving within the same column, reorder other tasks
    if (task.columnId.toString() === columnId) {
      console.log("Reordering tasks in same column");

      // Get all tasks in the same column, sorted by order
      const tasksInColumn = await Task.find({
        columnId: columnId,
        _id: { $ne: taskId },
      }).sort({ order: 1 });

      // Update order for tasks that come after the new position
      for (let i = 0; i < tasksInColumn.length; i++) {
        const otherTask = tasksInColumn[i];
        if (otherTask.order >= order) {
          otherTask.order = i + order + 1;
          await otherTask.save();
        }
      }
    }

    await task.populate("columnId", "name order");
    console.log("Task moved successfully:", task);
    res.json(task);
  } catch (error) {
    console.error("Move task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, moveTask };
