import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, GitPullRequest, AlertCircle, GripVertical } from 'lucide-react';
import { Idea } from '@shared/types';
interface Task {
  id: string;
  content: string;
}
interface Column {
  id: string;
  title: string;
  tasks: Task[];
}
const initialTasks: Task[] = [
  { id: 'task-1', content: 'Design initial mockups' },
  { id: 'task-2', content: 'Set up project structure' },
  { id: 'task-3', content: 'Develop core feature A' },
  { id: 'task-4', content: 'Write unit tests for feature A' },
  { id: 'task-5', content: 'Deploy to staging environment' },
];
const TaskCard = ({ task }: { task: Task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-2">
      <Card className="p-3 bg-card/80 hover:bg-muted/80 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-sm">{task.content}</p>
          <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};
const SortableColumn = ({ id, title, tasks }: { id: string; title: string; tasks: Task[] }) => {
  return (
    <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
      <div className="flex-1 p-2 bg-muted/50 rounded-lg">
        <h3 className="font-semibold p-2 mb-2">{title}</h3>
        <div className="min-h-[200px]">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </SortableContext>
  );
};
const ProjectBoard = ({ idea, repoUrl }: { idea: Idea; repoUrl?: string }) => {
  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: { id: 'todo', title: 'To Do', tasks: initialTasks },
    inProgress: { id: 'inProgress', title: 'In Progress', tasks: [] },
    done: { id: 'done', title: 'Done', tasks: [] },
  });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const findColumn = (taskId: string) => {
    for (const columnId in columns) {
      if (columns[columnId].tasks.some(task => task.id === taskId)) {
        return columnId;
      }
    }
    return null;
  };
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const columnId = findColumn(active.id as string);
    if (columnId) {
      const task = columns[columnId].tasks.find(t => t.id === active.id);
      if (task) setActiveTask(task);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    if (active.id === over.id) return;
    const originalColumnId = findColumn(active.id as string);
    let overColumnId = findColumn(over.id as string);
    if (!overColumnId) {
        const overContainer = Object.keys(columns).find(key => key === over.id);
        if (overContainer) {
            overColumnId = overContainer;
        }
    }
    if (!originalColumnId || !overColumnId) return;
    setColumns(prev => {
      const newColumns = { ...prev };
      const originalTasks = [...newColumns[originalColumnId].tasks];
      const overTasks = [...newColumns[overColumnId].tasks];
      const activeIndex = originalTasks.findIndex(t => t.id === active.id);
      const [movedTask] = originalTasks.splice(activeIndex, 1);
      if (originalColumnId === overColumnId) {
        const overIndex = overTasks.findIndex(t => t.id === over.id);
        newColumns[originalColumnId].tasks = arrayMove(originalTasks, activeIndex, overIndex);
      } else {
        let overIndex = overTasks.findIndex(t => t.id === over.id);
        if (overIndex === -1) {
            overIndex = overTasks.length;
        }
        overTasks.splice(overIndex, 0, movedTask);
        newColumns[originalColumnId].tasks = originalTasks;
        newColumns[overColumnId].tasks = overTasks;
      }
      return newColumns;
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Board</CardTitle>
      </CardHeader>
      <CardContent>
        {repoUrl && (
          <Card className="mb-6 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Github className="h-5 w-5" /> Linked Repository
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">{repoUrl}</a>
              <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-green-500" /> 12 Open Issues
                </div>
                <div className="flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4 text-blue-500" /> 4 Open Pull Requests
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4">
            {Object.values(columns).map(col => (
              <SortableColumn key={col.id} id={col.id} title={col.title} tasks={col.tasks} />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
};
export default ProjectBoard;