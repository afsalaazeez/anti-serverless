import { CreateTask, Task } from '../schema';
import { ITaskRepository } from '../repository/interface';

export class TaskService {
    constructor(private readonly taskRepository: ITaskRepository) { }

    async getAllTasks(): Promise<Task[]> {
        return this.taskRepository.findAll();
    }

    async getTaskById(id: string): Promise<Task | null> {
        return this.taskRepository.findById(id);
    }

    async createTask(task: CreateTask): Promise<Task> {
        return this.taskRepository.create(task);
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
        return this.taskRepository.update(id, updates);
    }

    async deleteTask(id: string): Promise<boolean> {
        return this.taskRepository.delete(id);
    }
}
