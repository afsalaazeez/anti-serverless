'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
}

const LOCAL_API_URL = 'http://localhost:3001';
const PROD_API_URL = 'https://of3sc60687.execute-api.us-east-1.amazonaws.com';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${LOCAL_API_URL}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const taskId = crypto.randomUUID();
      const taskBody = { id: taskId, title: newTitle };

      // Send to both APIs simultaneously
      const [localRes, prodRes] = await Promise.all([
        fetch(`${LOCAL_API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskBody),
        }),
        fetch(`${PROD_API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskBody),
        })
      ]);

      if (localRes.ok && prodRes.ok) {
        setNewTitle('');
        fetchTasks();
        alert('Task added to both Local and AWS!');
      } else if (localRes.ok || prodRes.ok) {
        setNewTitle('');
        fetchTasks();
        alert(`Task added partially: Local (${localRes.ok}), AWS (${prodRes.ok})`);
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Error adding task. Check console.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Project Tasks
          </h1>
          <p className="text-neutral-400">High-performance serverless task management.</p>
        </header>

        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={addTask} className="flex gap-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
            >
              Add Task
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold px-2">Task List</h2>
          {loading ? (
            <p className="text-neutral-500 px-2 animate-pulse">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-neutral-500 px-2">No tasks found. Start by adding one!</p>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl hover:border-neutral-700 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg text-neutral-200">{task.title}</h3>
                      {task.description && <p className="text-neutral-500 text-sm">{task.description}</p>}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-800/50 flex justify-between items-center text-[10px] text-neutral-600">
                    <span>ID: {task.id.slice(0, 8)}...</span>
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
