const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = process.env.MONGODB_URI;

mongoose.connect(
  uri,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true,
    useFindAndModify: true,
  },
  () => {
    console.log("DB connected successfully");
  }
);

app.get("/", (req, res) => {
  res.send("Hello just checking");
});

const Auth = require("./Routes/auth");
const Details = require("./Routes/details");

app.use("/api/auth", Auth);
app.use("/api/details", Details);

app.listen(port, () => {
  console.log(`Server listening on port : ${port}`);
});
