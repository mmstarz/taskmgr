const mongoose = require("mongoose");

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(res => {
      if (res) {
        console.log("db connected");
      }
    })
    .catch(err => {
      console.log(err.message);
    });
};

module.exports = async () => await connectDB();
