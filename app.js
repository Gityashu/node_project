const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { clientIPMiddleware, getClientIP } = require('./middleware/ipExtractor');

const app = express();
const port = 3000; // The port your Express app will listen on

// Use IP extraction middleware (MUST be before other routes)
app.use(clientIPMiddleware);

// Use body-parser to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Debug endpoint to test IP extraction
app.get('/debug/client-ip', (req, res) => {
    const xForwardedFor = req.headers['x-forwarded-for'] || '';
    const xffChain = xForwardedFor ? xForwardedFor.split(',').map(ip => ip.trim()) : [];

    res.json({
        '1_RESULT_REAL_CLIENT_IP': req.clientIP,
        '2_SOURCE_CONNECTION_IP': req.ip || req.connection.remoteAddress,
        '3_HEADERS': {
            'x_forwarded_for_chain': xffChain,
            'cf_connecting_ip': req.headers['cf-connecting-ip'] || null,
            'x_real_ip': req.headers['x-real-ip'] || null
        },
        '4_ENVIRONMENT_INFO': {
            'node_env': process.env.NODE_ENV || 'development',
            'port': port
        }
    });
});

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
