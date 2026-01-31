import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { handle } from 'hono/aws-lambda';
import { createTaskController } from './domains/tasks/controller';
import { TaskService } from './domains/tasks/service/task-service';
import { InMemoryTaskRepository } from './domains/tasks/repository/in-memory';
import { DynamoDBTaskRepository } from './domains/tasks/repository/dynamodb';

const app = new Hono();

// Middlewares
app.use('*', logger());
app.use('*', cors());

// Dependency Injection
const isProduction = process.env.NODE_ENV === 'production';
const taskRepository = isProduction
    ? new DynamoDBTaskRepository()
    : new InMemoryTaskRepository();

const taskService = new TaskService(taskRepository);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV }));

// Mount routes
app.route('/tasks', createTaskController(taskService));

// Export handler for AWS Lambda
export const handler = handle(app);

// Local server
if (!isProduction) {
    const port = 3001;
    console.log(`Server is running on port ${port}`);
    serve({
        fetch: app.fetch,
        port,
    });
}

export default app;
