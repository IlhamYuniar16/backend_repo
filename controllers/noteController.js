const db = require('../config/db');

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await db.getNotes(req.user.id);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.createNote = async (req, res) => {
  const { title, content, color } = req.body;

  try {
    const newNote = await db.addNote(req.user.id, {
      title,
      content,
      color
    });
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, color } = req.body;

  try {
    const updatedNote = await db.updateNote(req.user.id, id, {
      title,
      content,
      color
    });

    if (!updatedNote) {
      return res.status(404).json({ message: 'Catatan tidak ditemukan.' });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

exports.deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db.deleteNote(req.user.id, id);

    if (!deleted) {
      return res.status(404).json({ message: 'Catatan tidak ditemukan.' });
    }

    res.json({ message: 'Catatan berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};