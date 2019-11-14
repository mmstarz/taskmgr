// global libs
// const mongoose = require("mongoose");
const app = require("./preloadSetup");
// PORT
const PORT = process.env.PORT;
// mongoose
// url consists of address/dbname exmpl: mongodb://127.0.0.1:27017/app-05
// mongoose
//   .connect(process.env.MONGO_DB_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false
//   })
//   .then(res => {
//     if (res) {
//       console.log("db connected");
//       return app.listen(PORT);
//     }
//   })
//   .then(() => {
//     console.log(`Server successfully strarted at http://localhost:${PORT}`);
//   })
//   .catch(err => {
//     console.log(err);
//   });

app.listen(PORT, () => {
  console.log(`Server successfully strarted at http://localhost:${PORT}`);
});
