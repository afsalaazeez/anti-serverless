import { Task, CreateTask } from '../schema';
import { ITaskRepository } from './interface';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export class DynamoDBTaskRepository implements ITaskRepository {
    private readonly docClient: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor() {
        const client = new DynamoDBClient({});
        this.docClient = DynamoDBDocumentClient.from(client);
        this.tableName = process.env.TABLE_NAME || 'Tasks';
    }

    async findAll(): Promise<Task[]> {
        const command = new ScanCommand({
            TableName: this.tableName,
        });
        const response = await this.docClient.send(command);
        return (response.Items as Task[]) || [];
    }

    async findById(id: string): Promise<Task | null> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: { PK: `TASK`, SK: `ID#${id}` },
        });
        const response = await this.docClient.send(command);
        return (response.Item as Task) || null;
    }

    async create(task: CreateTask): Promise<Task> {
        const id = task.id || uuidv4();
        const newTask: Task = {
            ...task,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as Task;
        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                ...newTask,
                PK: `TASK`,
                SK: `ID#${id}`,
            },
        });
        await this.docClient.send(command);
        return newTask;
    }

    async update(id: string, updates: Partial<Task>): Promise<Task | null> {
        const current = await this.findById(id);
        if (!current) return null;

        const updatedTask = {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                ...updatedTask,
                PK: `TASK`,
                SK: `ID#${id}`,
            },
        });
        await this.docClient.send(command);
        return updatedTask;
    }

    async delete(id: string): Promise<boolean> {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: { PK: `TASK`, SK: `ID#${id}` },
        });
        await this.docClient.send(command);
        return true;
    }
}
