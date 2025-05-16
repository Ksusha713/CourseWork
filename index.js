import express from 'express'
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt'; //for incrypting passwords

const app = express();
const port = 3000;
const __dirname = import.meta.dirname;
app.use(express.urlencoded({ extended: true })); //to read the body of post request
app.use(express.json());

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

app.get("/products", async (req, res) => {
  const [results] = await connection.query("SELECT * FROM Products")
  res.render(`${__dirname}/views/products.ejs`, {products:results})
});

app.get("/products/:id", async (req, res) => {
  const [results] = await connection.query(`SELECT * FROM Products WHERE ProductID = ${req.params.id}`)
  res.render(`${__dirname}/views/item.ejs`, { product:results[0] });
});

app.get("/login", (req, res) =>{
  res.render(`${__dirname}/views/login.ejs`)
});

app.post("/login", (req, res) => {
  console.log(req.body)
  const {
    username, password 
  } = req.body
  const userFound = users.find(user => user.username == username && user.password == password)
  if (userFound) {
    res.send("All good")
  }
  else res.send("All bad")
});

app.get("/signup", (req, res) => {
  res.render(`${__dirname}/views/signup.ejs`)
});

app.post("/signup", async (req, res) => {
  const {username, password, email} = req.body; //geting data from the form
  if (!username || !password || !email) {
    return res.render("signup", { error: "All fields are required" });
  }
  if (password.length < 8) {
    return res.render("signup", { error: "Password too short" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await connection.query(
    `INSERT INTO Users (username, password, email) VALUES (?, ?, ?)`, 
    [username, hashedPassword, email]
  ); //question marks are placeholders to be filled later (sql injection protection), values to replace questions
  const newUserId = result.insertId;
  res.redirect(`/account/${newUserId}`);
});


app.get("/account:id", async (req, res) => {
  const [results] = await connection.query(`SELECT * FROM Users WHERE UserID = ${req.params.id}`)
  res.render(`${__dirname}/views/account.ejs`, { user:results[0] });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
