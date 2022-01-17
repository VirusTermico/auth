const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CLIENT_URL } = process.env;
const sendEmail = require("../services/send_mail");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password)
        return res.status(400).json({ msg: "Preencha os campos" });

      if (!validateEmail(email))
        return res.status(400).json({ msg: "Email Inválido" });

      const user = await Users.findOne({ email });
      if (user) return res.status(400).json({ msg: "Email Já existe " });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password precisa no mínimo 6 caracteres " });

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = {
        name,
        email,
        password: hashPassword,
      };

      const activation_token = createActivationToken(newUser);

      const url = `${CLIENT_URL}/user/activate/${activation_token}`;
      sendEmail(email, url, "ACtive a sua Conta");
      res.json({ msg: "Registo feito com sucesso.Active a sua conta" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  activateAccount: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );

      const { name, email, password } = user;
      const check = await Users.findOne({ email });
      if (check) return res.status(400).json({ msg: "Email já existe" });

      const newUser = new Users({
        name,
        email,
        password,
      });

      await newUser.save();
      res.json({ msg: "Conta foi Activada com sucesso" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });

      if (!email || !password)
        return res.status(400).json({ msg: "Preencha todos campos" });
      if (!user) return res.status(400).json({ msg: "Usuário Não Existe" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Senha Errada" });

      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ msg: "Login Feito com Sucesso" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  getAccessToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(500).json({ msg: "Faça Login para usar o App" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(500).json({ msg: "Faça Login" });

        const acces_token = createAccessToken({ id: user.id });
        return res.json({ acces_token });
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  forgoPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ msg: "Preencha todos campos" });

      const user = await Users.findOne({ email });

      if (!user) return res.status(400).json({ msg: "Usuário Não Existe" });

      const access_token = createAccessToken({ id: user.id });
      const url = `${CLIENT_URL}/user/reset/${access_token}`;

      sendEmail(email, url,"Preste atenção");
      res.json({
        msg: "Verique o seu email, foi enviado um link para alterar a senha",
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const passwordHash = await bcrypt.hash(password, 10);
      console.log(req.user);

      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: passwordHash,
        }
      );

      res.json({ msg: "Password Alterada" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  userInfo: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  allUsersInfo: async (req, res) => {
    try {
      
    } catch (error) {}
  },
};

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function createActivationToken(payload) {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
}
function createAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}
function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

module.exports = userCtrl;
