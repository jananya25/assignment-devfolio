import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useDndMonitor } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { TaskCard } from "./TaskCard";

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

interface ColumnProps {
  column: Column;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCreateTask: () => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onCreateTask,
}) => {
  console.log(`Column ${column.name} received tasks:`, tasks);

  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  // Debug: Log when column is being hovered over
  React.useEffect(() => {
    if (isOver) {
      console.log(`Column ${column.name} is being hovered over`);
    }
  }, [isOver, column.name]);

  return (
    <div
      className={`flex-shrink-0 w-64 p-2 transition-all duration-200 min-h-[200px] ${
        isOver
          ? "bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg"
          : ""
      }`}
      ref={setNodeRef}>
      <Card className="h-full min-h-[200px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-900">
              {column.name}
            </CardTitle>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {tasks.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteColumn(column._id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <SortableContext
            items={tasks.map((task) => task._id)}
            strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </SortableContext>

          <Button
            variant="ghost"
            className="w-full mt-4 text-gray-500 hover:text-gray-700"
            onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add a task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
