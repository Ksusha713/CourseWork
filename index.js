import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from 'express'
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt'; //for incrypting passwords
import cartroutes from './routes/cartroutes.js'

const app = express();
const port = 3000;
const __dirname = import.meta.dirname;
const jsonParser = bodyParser.json()

app.use(express.urlencoded({ extended: true })); //to read the body of post request
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'))
app.use(jsonParser);

let connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kseniia-2006",
  database: "webshop",
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

//PRODUCTS
app.get("/products", async (req, res) => {
  const [results] = await connection.query("SELECT * FROM Products")
  res.render(`${__dirname}/views/products.ejs`, {products:results})
});
//ITEM
app.get("/products/:id", async (req, res) => {
  const [results] = await connection.query(`SELECT * FROM Products WHERE ProductID = ${req.params.id}`)
  res.render(`${__dirname}/views/item.ejs`, { product:results[0] });
});


//LOGIN
app.get("/login", (req, res) =>{
  res.render(`${__dirname}/views/login.ejs`)
});

app.post("/login", async (req, res) => {
  const {email, password} = req.body; 
  if (!email || !password) {
    return res.render("login", { error: "All fields are required" });
  }

  const [results] = await connection.query(
    `SELECT * FROM Users WHERE email = ? LIMIT 1`,
    [email],
  );
  if (results.length === 0) {
    return res.render("login", { error: "No account found with this email" });
  }
  const user = results[0];

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
  res.cookie('authToken', user.UserID, {
    httpOnly: true,      // Prevent XSS attacks
    maxAge: 86400000,    // 24 hours expiration
    sameSite: 'strict'   // Prevent CSRF attacks
  })
  res.redirect(`/account/${user.UserID}`);
  } else {
    return res.render("login", { error: "Incorrect password" });
  }
});



//SIGN UP
app.get("/signup", (req, res) => {
  res.render(`${__dirname}/views/signup.ejs`)
});

app.post("/signup", async (req, res) => {
  const {username, password, confirmpassword, email} = req.body; 
  if (!username || !password || !confirmpassword || !email) {
    return res.render("signup", { error: "All fields are required" });
  }
  if (password.length < 8) {
    return res.render("signup", { error: "Password too short" });
  }
  if (password !== confirmpassword) {
    return res.render("signup", { error: "Passwords don't match"})
  }

  const [usersName] = await connection.query(
    `SELECT * FROM Users WHERE username = ?`,
    [username]
  );
  if (usersName.length > 0) {
    return res.render("signup", {
      error: "Username is taken"
    })
  }

  const [usersEmail] = await connection.query(
    `SELECT * FROM Users WHERE email = ?`,
    [email]
  );
  if (usersEmail.length > 0) {
    return res.redirect(`/login?error=email exists&email=${encodeURIComponent(email)}`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await connection.query(
    `INSERT INTO Users (username, password, email) VALUES (?, ?, ?)`, 
    [username, hashedPassword, email]
  );
  const newUserId = result.insertId;
  res.redirect(`/account/${newUserId}`);
});

//ACCOUNT
app.get('/account', (req, res) => {
  res.render('account', { user: req.user });
});

app.get("/account/:id", async (req, res) => {
  const [results] = await connection.query(
    `SELECT * FROM Users WHERE UserID = ?`, 
    [req.params.id]
  )
  res.render("account", { user: results[0] });
});


app.use("/cart", cartroutes);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});