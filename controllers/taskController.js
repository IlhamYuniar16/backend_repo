const db = require('../config/db');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await db.getTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Judul task wajib diisi.' });
  }

  try {
    const newTask = await db.addTask(req.user.id, {
      title,
      description,
      priority
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;

  try {
    const updatedTask = await db.updateTask(req.user.id, id, {
      title,
      description,
      status,
      priority
    });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task tidak ditemukan.' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.deleteTask(req.user.id, id);

    if (!deleted) {
      return res.status(404).json({ message: 'Task tidak ditemukan.' });
    }

    res.json({ message: 'Task berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};