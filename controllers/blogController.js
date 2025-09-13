const Blog = require("../models/blog");

const blog_index = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { blogs: result, title: "All blogs" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const blog_details = (req, res) => {
  const { id } = req.params;
  Blog.findById(id)
    .then((result) => {
      if (!result) {
        return res.status(404).render("404", { title: "Blog not found" });
      }
      // Recupera il cookie "user" e passalo alla vista (se non esiste, user sarà null)
      res.render("details", {
        blog: result,
        title: result.title,
        user: req.cookies.user || null,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Errore interno del server");
    });
};

const blog_create_get = (req, res) => {
  res.render("create", { title: "Create a new blog" });
};

const blog_create_post = (req, res) => {
  console.log("Form Data:", req.body);
  const blog = new Blog(req.body);
  blog
    .save()
    .then((result) => {
      console.log("Blog saved:", result);
      res.redirect("/blogs");
    })
    .catch((err) => {
      console.log(err);
    });
};

const blog_add_comment = (req, res) => {
  const { id } = req.params; // Ottieni l'ID del blog
  const { comment } = req.body; // Ottieni il commento inviato dal form
  const username = req.cookies.user;

  // Trova il blog in base all'ID
  Blog.findById(id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).send("Blog not found");
      }

      // Aggiungi il commento all'array dei commenti
      blog.comments.push({ comment, createdAt: new Date(), username });

      // Salva il blog con il nuovo commento
      return blog.save();
    })
    .then(() => {
      // Dopo aver salvato, redirigi alla pagina del dettaglio con il blog aggiornato
      res.redirect(`/blogs/${id}`);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error while adding comment");
    });
};

const blog_add_vote = (req, res) => {
  console.log("Cookies ricevuti:", req.cookies);
  console.log("Utente loggato:", req.cookies.user);

  // Se l'utente non è loggato (cookie "user" mancante), reindirizza al login
  if (!req.cookies.user) {
    return res.redirect("/login");
  }

  const { id } = req.params;
  const { vote } = req.body;
  const username = req.cookies.user; // Ottieni il nome utente dal cookie

  Blog.findById(id)
    .then((blog) => {
      if (!blog) {
        console.log("Blog not found");
        return res.status(404).send("Blog not found");
      }
      // Controlla se l'utente ha già votato
      if (blog.voters && blog.voters.includes(username)) {
        // Se ha già votato, reindirizza alla pagina dei dettagli senza aggiungere un nuovo voto
        return res.redirect(`/single-blog/${id}`);
      }
      // Aggiorna il rating:
      // Se non c'è un voto precedente, imposta il rating al voto appena ricevuto,
      // altrimenti aggiorna la media dei voti
      if (!blog.rating) {
        blog.rating = parseFloat(vote);
      } else {
        const totalVotes = blog.votes ? blog.votes.length + 1 : 1;
        const totalRating = blog.rating * (totalVotes - 1) + parseFloat(vote);
        blog.rating = totalRating / totalVotes;
      }
      // Aggiungi il voto all'array dei voti
      blog.votes.push(vote);
      // Registra l'utente nei votanti
      if (!blog.voters) {
        blog.voters = [];
      }
      blog.voters.push(username);
      return blog.save();
    })
    .then(() => {
      res.redirect(`/single-blog/${id}`);
    })
    .catch((err) => {
      console.error("Error while adding vote:", err);
      res.status(500).send("Error while adding vote");
    });
};

const blog_delete = (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/blogs" });
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
  blog_add_comment,
  blog_add_vote,
};
