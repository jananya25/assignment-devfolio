import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ArrowLeft, Bot } from "lucide-react";
import api from "@/lib/api";
import { Column } from "@/components/Column";
import { TaskCard } from "@/components/TaskCard";
import { AISidebar } from "@/components/AISidebar";

interface Task {
  _id: string;
  title: string;
  description: string;
  columnId: string | { _id: string; name: string; order: number };
  order: number;
}

interface Column {
  _id: string;
  name: string;
  order: number;
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

const ProjectBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [aiSidebarOpen, setAISidebarOpen] = useState(false);

  // Dialog states
  const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [columnName, setColumnName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      console.log("Fetching project data for projectId:", projectId);

      const [columnsRes, tasksRes] = await Promise.all([
        api.get(`/columns/${projectId}`),
        api.get(`/tasks/${projectId}`),
      ]);

      console.log("Columns response:", columnsRes.data);
      console.log("Tasks response:", tasksRes.data);

      setColumns(
        columnsRes.data.sort((a: Column, b: Column) => a.order - b.order)
      );
      setTasks(tasksRes.data);

      // Debug: Log the tasks after setting them
      console.log("Tasks state updated:", tasksRes.data);

      // Fetch project details
      const projectsRes = await api.get("/projects");
      const project = projectsRes.data.find(
        (p: Project) => p._id === projectId
      );
      setProject(project);
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(`/columns/${projectId}`, {
        name: columnName,
      });
      setColumns([...columns, response.data]);
      setColumnName("");
      setCreateColumnDialogOpen(false);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create column");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedColumnId) {
      setError("Please select a column");
      return;
    }

    try {
      console.log("Creating task with data:", {
        title: taskTitle,
        description: taskDescription,
        columnId: selectedColumnId,
        projectId,
      });

      const response = await api.post(`/tasks/${projectId}`, {
        title: taskTitle,
        description: taskDescription,
        columnId: selectedColumnId,
      });

      console.log("Task created successfully:", response.data);
      const updatedTasks = [...tasks, response.data];
      console.log("Updated tasks array:", updatedTasks);
      setTasks(updatedTasks);
      setTaskTitle("");
      setTaskDescription("");
      setSelectedColumnId("");
      setCreateTaskDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setError("");

    try {
      const response = await api.put(`/tasks/${projectId}/${editingTask._id}`, {
        title: taskTitle,
        description: taskDescription,
      });
      setTasks(
        tasks.map((t) => (t._id === editingTask._id ? response.data : t))
      );
      setEditingTask(null);
      setTaskTitle("");
      setTaskDescription("");
      setEditTaskDialogOpen(false);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${projectId}/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this column? All tasks in this column will be deleted."
      )
    )
      return;

    try {
      await api.delete(`/columns/${projectId}/${columnId}`);
      setColumns(columns.filter((c) => c._id !== columnId));
      setTasks(
        tasks.filter((t) => {
          const taskColumnId =
            typeof t.columnId === "string" ? t.columnId : t.columnId._id;
          return taskColumnId !== columnId;
        })
      );
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setEditTaskDialogOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log("Drag started:", active.id);
    const task = tasks.find((t) => t._id === active.id);
    console.log("Found task:", task);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag ended:", { active: active.id, over: over?.id });
    setActiveTask(null);

    if (!over) {
      console.log("No drop target found");
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) {
      console.log("Task not found:", taskId);
      return;
    }

    // Handle both string and populated object cases
    const currentColumnId =
      typeof task.columnId === "string" ? task.columnId : task.columnId._id;

    // Determine target column and order
    let newColumnId = currentColumnId;
    let newOrder = task.order;

    // Check if we're dropping on another task or a column
    const overTask = tasks.find((t) => t._id === overId);
    if (overTask) {
      // Dropping on another task
      newColumnId =
        typeof overTask.columnId === "string"
          ? overTask.columnId
          : overTask.columnId._id;
      newOrder = overTask.order;
    } else {
      // Dropping on a column
      newColumnId = overId;
      // Get the highest order in the target column
      const tasksInTargetColumn = tasks.filter((t) => {
        const tColumnId =
          typeof t.columnId === "string" ? t.columnId : t.columnId._id;
        return tColumnId === newColumnId;
      });
      newOrder = tasksInTargetColumn.length;
    }

    console.log(
      "Moving task:",
      taskId,
      "to column:",
      newColumnId,
      "with order:",
      newOrder
    );

    // Optimistic update
    let updatedTasks;

    if (currentColumnId === newColumnId) {
      // Reordering within the same column
      console.log("Reordering within same column");

      // Get all tasks in the current column
      const tasksInColumn = tasks
        .filter((t) => {
          const tColumnId =
            typeof t.columnId === "string" ? t.columnId : t.columnId._id;
          return tColumnId === currentColumnId;
        })
        .sort((a, b) => a.order - b.order);

      // Remove the dragged task
      const otherTasks = tasksInColumn.filter((t) => t._id !== taskId);

      // Insert at new position
      const reorderedTasks = [
        ...otherTasks.slice(0, newOrder),
        { ...task, order: newOrder },
        ...otherTasks
          .slice(newOrder)
          .map((t, index) => ({ ...t, order: newOrder + index + 1 })),
      ];

      // Update the tasks array
      updatedTasks = tasks.map((t) => {
        const tColumnId =
          typeof t.columnId === "string" ? t.columnId : t.columnId._id;
        if (tColumnId === currentColumnId) {
          const updatedTask = reorderedTasks.find((rt) => rt._id === t._id);
          return updatedTask || t;
        }
        return t;
      });
    } else {
      // Moving to a different column
      console.log("Moving to different column");
      updatedTasks = tasks.map((t) => {
        if (t._id === taskId) {
          return { ...t, columnId: newColumnId, order: newOrder };
        }
        return t;
      });
    }

    setTasks(updatedTasks);

    try {
      await api.patch(`/tasks/${taskId}/move`, {
        columnId: newColumnId,
        order: newOrder,
      });
      console.log("Task moved successfully");
    } catch (error) {
      console.error("Error moving task:", error);
      // Revert on error
      setTasks(tasks);
    }
  };

  const getTasksForColumn = (columnId: string) => {
    const columnTasks = tasks
      .filter((task) => {
        // Handle both string and populated object cases
        const taskColumnId =
          typeof task.columnId === "string" ? task.columnId : task.columnId._id;
        return taskColumnId === columnId;
      })
      .sort((a, b) => a.order - b.order);

    console.log(`Tasks for column ${columnId}:`, columnTasks);
    return columnTasks;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setAISidebarOpen(!aiSidebarOpen)}>
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-x-auto">
          <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}>
            <div className="flex h-full p-6 space-x-6">
              {columns.map((column) => (
                <Column
                  key={column._id}
                  column={column}
                  tasks={getTasksForColumn(column._id)}
                  onEditTask={openEditTaskDialog}
                  onDeleteTask={handleDeleteTask}
                  onDeleteColumn={handleDeleteColumn}
                  onCreateTask={() => {
                    setSelectedColumnId(column._id);
                    setCreateTaskDialogOpen(true);
                  }}
                />
              ))}

              <div className="flex-shrink-0 w-64">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-center">Add Column</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <Dialog
                      open={createColumnDialogOpen}
                      onOpenChange={setCreateColumnDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          New Column
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Column</DialogTitle>
                          <DialogDescription>
                            Add a new column to organize your tasks.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateColumn}>
                          <div className="space-y-4">
                            {error && (
                              <div className="text-red-600 text-sm">
                                {error}
                              </div>
                            )}
                            <div>
                              <Label htmlFor="column-name">Column Name</Label>
                              <Input
                                id="column-name"
                                value={columnName}
                                onChange={(e) => setColumnName(e.target.value)}
                                required
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCreateColumnDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Column</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <AISidebar
          projectId={projectId!}
          open={aiSidebarOpen}
          setOpen={setAISidebarOpen}
        />
      </div>

      {/* Create Task Dialog */}
      <Dialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div>
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="task-column">Column</Label>
                <select
                  id="task-column"
                  value={selectedColumnId}
                  onChange={(e) => setSelectedColumnId(e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select a column</option>
                  {columns.map((column) => (
                    <option key={column._id} value={column._id}>
                      {column.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update your task details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTask}>
            <div className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div>
                <Label htmlFor="edit-task-title">Task Title</Label>
                <Input
                  id="edit-task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectBoard;
