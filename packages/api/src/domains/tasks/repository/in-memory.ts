import { Task, CreateTask } from '../schema';
import { ITaskRepository } from './interface';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryTaskRepository implements ITaskRepository {
    private tasks: Task[] = [];

    async findAll(): Promise<Task[]> {
        return this.tasks;
    }

    async findById(id: string): Promise<Task | null> {
        return this.tasks.find((t) => t.id === id) || null;
    }

    async create(task: CreateTask): Promise<Task> {
        const newTask: Task = {
            ...task,
            id: task.id || uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as Task;
        this.tasks.push(newTask);
        return newTask;
    }

    async update(id: string, updates: Partial<Task>): Promise<Task | null> {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index === -1) return null;

        this.tasks[index] = {
            ...this.tasks[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return this.tasks[index];
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter((t) => t.id !== id);
        return this.tasks.length < initialLength;
    }
}
