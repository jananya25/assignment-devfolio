const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Column = require("../models/Column");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
You are a helpful assistant that can help with task management and project management.
you have access to the following tools:
- create a new task
- update a task
- delete a task
- get all tasks
- get a task by id
- get all projects
- get a project by id
- get all columns
`;

// AI Tools Implementation
const aiTools = {
  // Task Management Tools
  createTask: async (userId, { title, description, columnId, projectId }) => {
    try {
      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: userId,
      });
      if (!project) {
        throw new Error("Project not found");
      }

      // Verify column belongs to project
      const column = await Column.findOne({ _id: columnId, projectId });
      if (!column) {
        throw new Error("Column not found");
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

      return {
        success: true,
        data: task,
        message: "Task created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  updateTask: async (userId, { taskId, title, description, projectId }) => {
    try {
      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: userId,
      });
      if (!project) {
        throw new Error("Project not found");
      }

      const task = await Task.findOneAndUpdate(
        { _id: taskId, projectId },
        { title, description },
        { new: true }
      ).populate("columnId", "name order");

      if (!task) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        data: task,
        message: "Task updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  deleteTask: async (userId, { taskId, projectId }) => {
    try {
      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: userId,
      });
      if (!project) {
        throw new Error("Project not found");
      }

      const task = await Task.findOneAndDelete({
        _id: taskId,
        projectId,
      });

      if (!task) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        message: "Task deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getAllTasks: async (userId, { projectId }) => {
    try {
      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: userId,
      });
      if (!project) {
        throw new Error("Project not found");
      }

      const tasks = await Task.find({ projectId })
        .populate("columnId", "name order")
        .sort({ order: 1 });

      return {
        success: true,
        data: tasks,
        message: `Found ${tasks.length} tasks`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getTaskById: async (userId, { taskId, projectId }) => {
    try {
      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: userId,
      });
      if (!project) {
        throw new Error("Project not found");
      }

      const task = await Task.findOne({ _id: taskId, projectId }).populate(
        "columnId",
        "name order"
      );

      if (!task) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        data: task,
        message: "Task found",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Project Management Tools
  getAllProjects: async (userId) => {
    try {
      const projects = await Project.find({ userId }).sort({ createdAt: -1 });

      return {
        success: true,
        data: projects,
        message: `Found ${projects.length} projects`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getProjectById: async (userId, { projectId }) => {
    try {
      const project = await Project.findOne({
        _id: projectId,
        userId: userId,
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return {
        success: true,
        data: project,
        message: "Project found",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Column Management Tools
  getAllColumns: async (userId, { projectId }) => {
    try {
      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: userId,
      });
      if (!project) {
        throw new Error("Project not found");
      }

      const columns = await Column.find({ projectId }).sort({ order: 1 });

      return {
        success: true,
        data: columns,
        message: `Found ${columns.length} columns`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    tools: [
      {
        functionDeclarations: [
          {
            name: "createTask",
            description: "Create a new task in a project",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Task title" },
                description: {
                  type: "string",
                  description: "Task description",
                },
                columnId: {
                  type: "string",
                  description: "Column ID where task will be created",
                },
                projectId: { type: "string", description: "Project ID" },
              },
              required: ["title", "columnId", "projectId"],
            },
          },
          {
            name: "updateTask",
            description: "Update an existing task",
            parameters: {
              type: "object",
              properties: {
                taskId: { type: "string", description: "Task ID to update" },
                title: { type: "string", description: "New task title" },
                description: {
                  type: "string",
                  description: "New task description",
                },
                projectId: { type: "string", description: "Project ID" },
              },
              required: ["taskId", "projectId"],
            },
          },
          {
            name: "deleteTask",
            description: "Delete a task",
            parameters: {
              type: "object",
              properties: {
                taskId: { type: "string", description: "Task ID to delete" },
                projectId: { type: "string", description: "Project ID" },
              },
              required: ["taskId", "projectId"],
            },
          },
          {
            name: "getAllTasks",
            description: "Get all tasks in a project",
            parameters: {
              type: "object",
              properties: {
                projectId: { type: "string", description: "Project ID" },
              },
              required: ["projectId"],
            },
          },
          {
            name: "getTaskById",
            description: "Get a specific task by ID",
            parameters: {
              type: "object",
              properties: {
                taskId: { type: "string", description: "Task ID" },
                projectId: { type: "string", description: "Project ID" },
              },
              required: ["taskId", "projectId"],
            },
          },
          {
            name: "getAllProjects",
            description: "Get all projects for the user",
            parameters: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "getProjectById",
            description: "Get a specific project by ID",
            parameters: {
              type: "object",
              properties: {
                projectId: { type: "string", description: "Project ID" },
              },
              required: ["projectId"],
            },
          },
          {
            name: "getAllColumns",
            description: "Get all columns in a project",
            parameters: {
              type: "object",
              properties: {
                projectId: { type: "string", description: "Project ID" },
              },
              required: ["projectId"],
            },
          },
        ],
      },
    ],
  });
};

module.exports = { getGeminiModel, aiTools };
