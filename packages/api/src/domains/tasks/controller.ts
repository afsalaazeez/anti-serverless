import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreateTaskSchema, TaskSchema } from './schema';
import { TaskService } from './service/task-service';

export const createTaskController = (taskService: TaskService) => {
    const app = new Hono();

    app.get('/', async (c) => {
        const tasks = await taskService.getAllTasks();
        return c.json(tasks);
    });

    app.get('/:id', async (c) => {
        const id = c.req.param('id');
        const task = await taskService.getTaskById(id);
        if (!task) return c.json({ message: 'Task not found' }, 404);
        return c.json(task);
    });

    app.post('/', zValidator('json', CreateTaskSchema), async (c) => {
        const body = c.req.valid('json');
        const task = await taskService.createTask(body);
        return c.json(task, 201);
    });

    app.patch('/:id', zValidator('json', TaskSchema.partial()), async (c) => {
        const id = c.req.param('id');
        const body = c.req.valid('json');
        const task = await taskService.updateTask(id, body);
        if (!task) return c.json({ message: 'Task not found' }, 404);
        return c.json(task);
    });

    app.delete('/:id', async (c) => {
        const id = c.req.param('id');
        const deleted = await taskService.deleteTask(id);
        if (!deleted) return c.json({ message: 'Task not found' }, 404);
        return c.json({ message: 'Task deleted' });
    });

    return app;
};
