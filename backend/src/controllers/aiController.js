const { getGeminiModel } = require("../config/gemini");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Column = require("../models/Column");

const summarizeTasks = async (req, res) => {
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

    // Get all tasks with their columns
    const tasks = await Task.find({ projectId })
      .populate("columnId", "name")
      .sort({ order: 1 });

    if (tasks.length === 0) {
      return res.json({ summary: "No tasks found in this project." });
    }

    // Format tasks for AI
    const tasksByColumn = {};
    tasks.forEach((task) => {
      const columnName = task.columnId.name;
      if (!tasksByColumn[columnName]) {
        tasksByColumn[columnName] = [];
      }
      tasksByColumn[columnName].push({
        title: task.title,
        description: task.description,
      });
    });

    const prompt = `Please provide a concise summary of the following project tasks organized by columns:

Project: ${project.name}
Description: ${project.description || "No description"}

Tasks by Column:
${Object.entries(tasksByColumn)
  .map(
    ([column, tasks]) =>
      `${column}:\n${tasks
        .map(
          (task) =>
            `- ${task.title}${task.description ? ": " + task.description : ""}`
        )
        .join("\n")}`
  )
  .join("\n\n")}

Please provide a brief summary highlighting key tasks, progress, and any notable patterns or insights.`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });
  } catch (error) {
    console.error("Summarize tasks error:", error);
    res.status(500).json({ message: "Server error during AI summarization" });
  }
};

const askQuestion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { question, taskId } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    let context = `Project: ${project.name}\nDescription: ${
      project.description || "No description"
    }\n\n`;

    if (taskId) {
      // Get specific task context
      const task = await Task.findById(taskId).populate("columnId", "name");
      if (task) {
        context += `Specific Task Context:\nTitle: ${
          task.title
        }\nDescription: ${task.description || "No description"}\nColumn: ${
          task.columnId.name
        }\n\n`;
      }
    } else {
      // Get all tasks for general context
      const tasks = await Task.find({ projectId })
        .populate("columnId", "name")
        .sort({ order: 1 });

      if (tasks.length > 0) {
        context += `All Tasks in Project:\n`;
        tasks.forEach((task) => {
          context += `- ${task.title} (${task.columnId.name})${
            task.description ? ": " + task.description : ""
          }\n`;
        });
        context += "\n";
      }
    }

    const prompt = `${context}Question: ${question}

Please provide a helpful and accurate answer based on the project context above. If the question is about specific tasks or project management, use the provided information to give relevant insights.`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({ answer });
  } catch (error) {
    console.error("Ask question error:", error);
    res
      .status(500)
      .json({ message: "Server error during AI question answering" });
  }
};

module.exports = { summarizeTasks, askQuestion };
