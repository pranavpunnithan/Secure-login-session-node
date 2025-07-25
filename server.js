const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Set HBS as the view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// SESSION setup
app.use(session({
  secret: "secretKey",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// ❌ Disable browser cache for all routes
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Hardcoded credentials
const USER = { username: "admin", password: "1234" };

// GET: Login Page
app.get("/", (req, res) => {
  if (req.session.isAuth) {
    return res.redirect("/home");
  }
  res.render("login");
});

// POST: Login handler
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    req.session.isAuth = true;
    req.session.username = username;
    return res.redirect("/home");
  }

  res.render("login", { error: "Invalid credentials" });
});

// GET: Home Page (requires session)
app.get("/home", (req, res) => {
  if (!req.session.isAuth) {
    return res.redirect("/");
  }

  res.render("home", {
    user: {
      username: req.session.username
    }
  });
});

// GET: Logout handler
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/"); // Go back to login
  });
});

// Optional: Final page route
app.get("/final", (req, res) => {
  res.render("final", {
    username: req.session?.username || "Guest"
  });
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
//