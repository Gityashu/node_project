const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000; // The port your Express app will listen on

// Use body-parser to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory array to store todo items (not persistent)
let todos = [
    { id: 1, task: 'Learn Docker', completed: false },
    { id: 2, task: 'Understand Minikube', completed: false },
    { id: 3, task: 'Deploy Todo App', completed: false }
];
let nextId = 4; // Simple ID generator

// Home route - display todo list
app.get('/', (req, res) => {
    res.render('index', { todos: todos });
});

// Add new todo
app.post('/add', (req, res) => {
    const newTask = req.body.task.trim();
    if (newTask) {
        todos.push({ id: nextId++, task: newTask, completed: false });
    }
    res.redirect('/');
});

// Delete a todo
app.post('/delete', (req, res) => {
    const todoIdToDelete = parseInt(req.body.id);
    todos = todos.filter(todo => todo.id !== todoIdToDelete);
    res.redirect('/');
});

// Mark todo as complete/incomplete
app.post('/complete', (req, res) => {
    const todoIdToToggle = parseInt(req.body.id);
    todos = todos.map(todo => {
        if (todo.id === todoIdToToggle) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Todo app listening at http://localhost:${port}`);
});
