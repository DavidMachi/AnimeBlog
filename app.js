const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Blog = require("./models/blog");
const User = require("./models/user");
const userController = require("./controllers/userController");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const cookieParser = require("cookie-parser");
require("dotenv").config();


const app = express();

const cors = require("cors");

app.use(cors({
  origin: "https://mio-portfolio-ruddy.vercel.app/", // il dominio del tuo portfolio
  credentials: true, // consente l'invio di cookie
}));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan("dev"));

// Middleware per rendere disponibile l'utente nelle viste EJS
app.use((req, res, next) => {
  // Se c'è un cookie 'user', salvalo come variabile in `res.locals` per l'accesso nelle EJS
  res.locals.user = req.cookies.user || null;
  next();
});

app.use("/blogs", blogRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "Home", blogs: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/blogs/:id/comment", async (req, res) => {
  console.log("Body ricevuto:", req.body);
  console.log("Cookies ricevuti:", req.cookies);

  const { id } = req.params; // ID del blog
  const { comment, rating } = req.body; // Commento e voto dal form
  const username = req.cookies.user; // Nome utente dal cookie

  console.log("ID Blog:", id);
  console.log("Dati ricevuti:", { comment, rating, username });

  if (!username) {
    console.log("Utente non loggato, reindirizzamento...");
    return res.redirect("/login");
  }

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      console.log("Blog non trovato");
      return res.status(404).send("Anime non trovato");
    }

    console.log("Blog trovato, aggiornamento dati...");

    // Aggiungi il commento con l'utente
    blog.comments.push({ username, comment });

    // Se c'è un voto, aggiorna la media solo se l'utente non ha già votato
    if (rating) {
      if (!blog.voters) blog.voters = [];
      if (!blog.voters.includes(username)) {
        blog.rating =
          (blog.rating * blog.ratingsCount + parseFloat(rating)) /
          (blog.ratingsCount + 1);
        blog.ratingsCount += 1;
        blog.voters.push(username);
      } else {
        console.log("L'utente ha già votato.");
      }
    }

    await blog.save();
    console.log("Salvato con successo, reindirizzamento...");
    res.redirect(`/single-blog/${id}`);
  } catch (error) {
    console.error("Errore durante l'aggiunta del commento:", error);
    res.status(500).send("Errore del server");
  }
});

// app.get("/all-blogs", (req, res) => {
//   Blog.find()
//     .then((result) => {
//       res.render("index", { title: "All Blogs", blogs: result });
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Internal Server Error");
//     });
// });

app.get("/single-blog/:id", (req, res) => {
  const { id } = req.params;
  Blog.findById(id)
    .then((result) => {
      if (!result) {
        return res.status(404).send("Blog non trovato");
      }
      // Passa 'title' alla vista, oltre al 'blog'
      res.render("details", {
        blog: result,
        title: result.title, // Imposta il titolo della pagina come il titolo del blog
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Errore interno del server");
    });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// Pagina di errore 404
app.use((req, res) => {
  res.status(404).render("404", { title: "404 Page Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
