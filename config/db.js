const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, push, remove, update, query, orderByChild, equalTo } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyDIqA_wbzb5g4_XOnNCJ6eg49dh7TUtMAw",
  authDomain: "loginpage-bb888.firebaseapp.com",
  databaseURL: "https://loginpage-bb888-default-rtdb.asia-southeast1.firebasedatabase.app", 
  projectId: "loginpage-bb888",
  storageBucket: "loginpage-bb888.firebasestorage.app",
  messagingSenderId: "1028579866216",
  appId: "1:1028579866216:web:177e957080a09cb637eddd"
};

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase connected successfully');
} catch (error) {
  console.error('Firebase connection error:', error);
}

// Helper function untuk handle error
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  throw new Error(`Database error: ${error.message}`);
};

// --- USER OPERATIONS ---
exports.findUserByEmail = async (email) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) return null;
    
    const users = snapshot.val();
    const userEntry = Object.entries(users).find(([key, user]) => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
    
    return userEntry ? { id: userEntry[0], ...userEntry[1] } : null;
  } catch (error) {
    handleError(error, 'findUserByEmail');
  }
};

exports.findUserById = async (id) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const userRef = ref(database, `users/${id}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) return null;
    
    return { id, ...snapshot.val() };
  } catch (error) {
    handleError(error, 'findUserById');
  }
};

exports.saveUser = async (user) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const usersRef = ref(database, 'users');
    const newUserRef = push(usersRef);
    const userId = newUserRef.key;
    
    const newUser = {
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password,
      createdAt: new Date().toISOString()
    };
    
    await set(newUserRef, newUser);
    return { id: userId, ...newUser };
  } catch (error) {
    handleError(error, 'saveUser');
  }
};

// --- TASK OPERATIONS ---
exports.getTasks = async (userId) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const tasksRef = ref(database, 'tasks');
    const snapshot = await get(tasksRef);
    
    if (!snapshot.exists()) return [];
    
    const tasks = snapshot.val();
    const userTasks = Object.entries(tasks)
      .filter(([key, task]) => task.userId === userId)
      .map(([key, task]) => ({ id: key, ...task }));
    
    return userTasks;
  } catch (error) {
    handleError(error, 'getTasks');
  }
};

exports.addTask = async (userId, taskData) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const tasksRef = ref(database, 'tasks');
    const newTaskRef = push(tasksRef);
    
    const newTask = {
      userId,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      createdAt: new Date().toISOString()
    };
    
    await set(newTaskRef, newTask);
    return { id: newTaskRef.key, ...newTask };
  } catch (error) {
    handleError(error, 'addTask');
  }
};

exports.updateTask = async (userId, taskId, updatedFields) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const taskRef = ref(database, `tasks/${taskId}`);
    const snapshot = await get(taskRef);
    
    if (!snapshot.exists()) return null;
    
    const task = snapshot.val();
    if (task.userId !== userId) return null;
    
    const updatedTask = {
      ...task,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    
    await set(taskRef, updatedTask);
    return { id: taskId, ...updatedTask };
  } catch (error) {
    handleError(error, 'updateTask');
  }
};

exports.deleteTask = async (userId, taskId) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const taskRef = ref(database, `tasks/${taskId}`);
    const snapshot = await get(taskRef);
    
    if (!snapshot.exists()) return false;
    
    const task = snapshot.val();
    if (task.userId !== userId) return false;
    
    await remove(taskRef);
    return true;
  } catch (error) {
    handleError(error, 'deleteTask');
  }
};

// --- NOTE OPERATIONS ---
exports.getNotes = async (userId) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const notesRef = ref(database, 'notes');
    const snapshot = await get(notesRef);
    
    if (!snapshot.exists()) return [];
    
    const notes = snapshot.val();
    const userNotes = Object.entries(notes)
      .filter(([key, note]) => note.userId === userId)
      .map(([key, note]) => ({ id: key, ...note }));
    
    return userNotes;
  } catch (error) {
    handleError(error, 'getNotes');
  }
};

exports.addNote = async (userId, noteData) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const notesRef = ref(database, 'notes');
    const newNoteRef = push(notesRef);
    
    const newNote = {
      userId,
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      color: noteData.color || 'pastel-blue',
      createdAt: new Date().toISOString()
    };
    
    await set(newNoteRef, newNote);
    return { id: newNoteRef.key, ...newNote };
  } catch (error) {
    handleError(error, 'addNote');
  }
};

exports.updateNote = async (userId, noteId, updatedFields) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const noteRef = ref(database, `notes/${noteId}`);
    const snapshot = await get(noteRef);
    
    if (!snapshot.exists()) return null;
    
    const note = snapshot.val();
    if (note.userId !== userId) return null;
    
    const updatedNote = {
      ...note,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    
    await set(noteRef, updatedNote);
    return { id: noteId, ...updatedNote };
  } catch (error) {
    handleError(error, 'updateNote');
  }
};

exports.deleteNote = async (userId, noteId) => {
  try {
    if (!database) throw new Error('Database not initialized');
    
    const noteRef = ref(database, `notes/${noteId}`);
    const snapshot = await get(noteRef);
    
    if (!snapshot.exists()) return false;
    
    const note = snapshot.val();
    if (note.userId !== userId) return false;
    
    await remove(noteRef);
    return true;
  } catch (error) {
    handleError(error, 'deleteNote');
  }
};