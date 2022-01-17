require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const coors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileUpload");

const app = express();

app.use(express.json());
app.use(coors());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use("/user", require("./routes/userRouter"));

const URI = process.env.MONGODB_URI;

mongoose.connect(
  URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Conectado a BD");
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Rodando");
});
