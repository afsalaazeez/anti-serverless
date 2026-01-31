import { Task, CreateTask } from '../schema';

export interface ITaskRepository {
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(task: CreateTask): Promise<Task>;
    update(id: string, task: Partial<Task>): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
}
