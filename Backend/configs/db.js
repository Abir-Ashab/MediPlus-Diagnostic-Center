require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const connection = mongoose.connect(process.env.dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = { connection };
