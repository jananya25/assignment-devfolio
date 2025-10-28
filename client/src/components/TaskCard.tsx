import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description: string;
  columnId: string | { _id: string; name: string; order: number };
  order: number;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  isDragging = false,
}) => {
  console.log("TaskCard rendering task:", task);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-default transition-shadow hover:shadow-md ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...attributes}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-medium text-gray-900">
              {task.title}
            </h4>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                {task.description}
              </p>
            )}
          </div>
          <div className="ml-2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Deleting task:", task._id);
                onDelete(task._id);
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <div
              ref={setActivatorNodeRef}
              className="cursor-grab touch-none"
              {...listeners}
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
