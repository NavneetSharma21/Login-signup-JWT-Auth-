
/*
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',
    password: 'your_mysql_password',
    database: 'your_database_name'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

// ... Rest of your code goes here

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// ... Above code ...

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// ... Below code ...

// ... Above code ...

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
        if (err) throw err;
        res.json({ message: 'User registered successfully' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = { username: results[0].username, id: results[0].id };
            const accessToken = jwt.sign(user, 'your-secret-key');
            res.json({ accessToken });
        } else {
            res.json({ message: 'Username or password incorrect' });
        }
    });
});

// ... Above code ...

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Access granted to the dashboard', user: req.user });
});




// ... Below code ...

*/

// index.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

app.set('view engine', 'html');


const secretKey = 'hello' // Change this to a secure key

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'navneet jwt',
});

db.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.get('/',(req,resp)=>{
  resp.sendFile(__dirname+'/jwt.html');
});

app.get('/login',(req,resp)=>{
  resp.sendFile(__dirname+'/login.html');
});

// Middleware to verify the JWT token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route to register a new user
app.post('/', (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'User registered successfully' });
      }
    );
  });
});

// Route to log in and get a JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!result) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
          expiresIn: '1h',
        });

        res.json({ token });
      });
    }
  );
});


// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
