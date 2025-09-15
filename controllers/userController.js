const User = require("../models/user");

// Funzione per il login (GET)
const login_get = (req, res) => {
  res.render("login", { title: "Login" });
};

// Funzione per il login (POST)
const login_post = async (req, res) => {
  const { username, password } = req.body;
  console.log("Ricevuto login:", username, password);

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.render("login", {
        title: "Login",
        error: "Credenziali errate",
      });
    }

    // Imposta un cookie con il valore dell'email (o un identificatore univoco)
    res.cookie("user", user.username, {
      httpOnly: true,
      secure: true, 
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 giorno
    });
    res.redirect("/"); // Reindirizza alla homepage dopo il login
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del server");
  }
};

const logout_get = (req, res) => {
  res.clearCookie("user", {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  });
  res.redirect("/login"); // Dopo il logout, torna alla pagina di login
};

module.exports = {
  login_get,
  login_post,
  logout_get,
};
