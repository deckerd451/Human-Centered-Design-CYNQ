import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Github, GitPullRequest, AlertCircle, GripVertical, Plus, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { Idea, BoardColumn, Task } from '@shared/types';
import { useAuthStore } from '@/stores/authStore';
import { updateIdea } from '@/lib/apiClient';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const taskSchema = z.object({ content: z.string().min(1, "Task content cannot be empty.").max(100, "Task is too long.") });
type TaskFormData = z.infer<typeof taskSchema>;
const TaskCard = ({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void; }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const currentUser = useAuthStore(s => s.user);
  const isAuthor = true; // Simplified for this component context
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-2">
      <Card className="p-3 bg-card/80 hover:bg-muted/80 transition-colors group">
        <div className="flex items-center justify-between">
          <p className="text-sm flex-1">{task.content}</p>
          {isAuthor && (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={onEdit}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={onDelete} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
const SortableColumn = ({ id, title, tasks, onAddTask, onEditTask, onDeleteTask }: { id: string; title: string; tasks: Task[]; onAddTask: () => void; onEditTask: (task: Task) => void; onDeleteTask: (task: Task) => void; }) => {
  return (
    <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
      <div className="flex-1 p-2 bg-muted/50 rounded-lg min-w-[250px]">
        <div className="flex justify-between items-center p-2 mb-2">
          <h3 className="font-semibold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onAddTask}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="min-h-[200px]">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task)} />
          ))}
        </div>
      </div>
    </SortableContext>
  );
};
const ProjectBoard = ({ idea, onBoardUpdate }: { idea: Idea; onBoardUpdate: () => void }) => {
  const [columns, setColumns] = useState<BoardColumn[]>(idea.projectBoard?.columns || []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>({ resolver: zodResolver(taskSchema) });
  useEffect(() => {
    setColumns(idea.projectBoard?.columns || []);
  }, [idea.projectBoard]);
  const persistBoardState = async (updatedColumns: BoardColumn[]) => {
    try {
      await updateIdea(idea.id, { projectBoard: { columns: updatedColumns } });
      onBoardUpdate();
    } catch (error) {
      toast.error("Failed to save board changes.");
    }
  };
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const findColumn = (taskId: string) => columns.find(col => col.tasks.some(task => task.id === taskId));
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const column = findColumn(active.id as string);
    if (column) {
      const task = column.tasks.find(t => t.id === active.id);
      if (task) setActiveTask(task);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const originalColumn = findColumn(active.id as string);
    let overColumn = findColumn(over.id as string);
    if (!overColumn) {
      overColumn = columns.find(c => c.id === over.id);
    }
    if (!originalColumn || !overColumn || originalColumn.id === over.id) return;
    if (originalColumn.id !== overColumn.id) {
      const activeIndex = originalColumn.tasks.findIndex(t => t.id === active.id);
      const [movedTask] = originalColumn.tasks.splice(activeIndex, 1);
      let overIndex = overColumn.tasks.findIndex(t => t.id === over.id);
      if (overIndex === -1) overIndex = overColumn.tasks.length;
      overColumn.tasks.splice(overIndex, 0, movedTask);
      const newColumns = columns.map(c => {
        if (c.id === originalColumn.id) return { ...c, tasks: originalColumn.tasks };
        if (c.id === overColumn.id) return { ...c, tasks: overColumn.tasks };
        return c;
      });
      setColumns(newColumns);
      persistBoardState(newColumns);
    } else {
      const activeIndex = originalColumn.tasks.findIndex(t => t.id === active.id);
      const overIndex = overColumn.tasks.findIndex(t => t.id === over.id);
      if (activeIndex !== overIndex) {
        const newTasks = arrayMove(originalColumn.tasks, activeIndex, overIndex);
        const newColumns = columns.map(c => c.id === originalColumn.id ? { ...c, tasks: newTasks } : c);
        setColumns(newColumns);
        persistBoardState(newColumns);
      }
    }
  };
  const handleOpenTaskModal = (columnId: string, task: Task | null = null) => {
    setCurrentColumnId(columnId);
    setEditingTask(task);
    reset(task ? { content: task.content } : { content: '' });
    setIsTaskModalOpen(true);
  };
  const handleTaskSubmit: SubmitHandler<TaskFormData> = (data) => {
    let newColumns: BoardColumn[];
    if (editingTask) { // Editing
      newColumns = columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t => t.id === editingTask.id ? { ...t, content: data.content } : t)
      }));
    } else { // Adding
      const newTask = { id: uuidv4(), content: data.content };
      newColumns = columns.map(col => col.id === currentColumnId ? { ...col, tasks: [...col.tasks, newTask] } : col);
    }
    setColumns(newColumns);
    persistBoardState(newColumns);
    setIsTaskModalOpen(false);
  };
  const handleDeleteTask = () => {
    if (!editingTask) return;
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== editingTask.id)
    }));
    setColumns(newColumns);
    persistBoardState(newColumns);
    setIsDeleteConfirmOpen(false);
    setEditingTask(null);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Board</CardTitle>
      </CardHeader>
      <CardContent>
        {idea.repoUrl && (
          <Card className="mb-6 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Github className="h-5 w-5" /> Linked Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={idea.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">{idea.repoUrl}</a>
              <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-green-500" /> 12 Open Issues</div>
                <div className="flex items-center gap-2"><GitPullRequest className="h-4 w-4 text-blue-500" /> 4 Open Pull Requests</div>
              </div>
            </CardContent>
          </Card>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
              <SortableColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={col.tasks}
                onAddTask={() => handleOpenTaskModal(col.id)}
                onEditTask={(task) => handleOpenTaskModal(col.id, task)}
                onDeleteTask={(task) => { setEditingTask(task); setIsDeleteConfirmOpen(true); }}
              />
            ))}
          </div>
          <DragOverlay>{activeTask ? <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} /> : null}</DragOverlay>
        </DndContext>
      </CardContent>
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleTaskSubmit)} className="py-4 space-y-4">
            <div>
              <Label htmlFor="task-content">Content</Label>
              <Textarea id="task-content" {...register('content')} />
              {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the task.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingTask(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
export default ProjectBoard;