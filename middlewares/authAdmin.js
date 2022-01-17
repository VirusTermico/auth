const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

const authAdmin = async (req, res, next) => {
  try {
    const user = await Users.findOne({ _id: req.user.id });
    if (user.role !== 1)
      return res
        .status(500)
        .json({ msg: "Requer previlégios de Administrador" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = authAdmin;
