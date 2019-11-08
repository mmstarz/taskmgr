// global libs
const express = require("express");
const mongoose = require("mongoose");
// local imports
const usersRouter = require("../routes/usersRouter");
const tasksRouter = require("../routes/tasksRouter");

const app = express();
// define and setup upload
// setup body data parser
app.use(express.json());
// // mws
// app.use((req, res, next) => {
//   console.log(req.method, req.path);

//   next();
// });
// set routes
app.use(usersRouter);
app.use(tasksRouter);

// PORT
const PORT = process.env.PORT;
// mongoose
// url consists of address/dbname exmpl: mongodb://127.0.0.1:27017/app-05
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(res => {
    if (res) {
      console.log("db connected");
      return app.listen(PORT);
    }
  })
  .then(() => {
    console.log(`Server successfully strarted at http://localhost:${PORT}`);
  })
  .catch(err => {
    console.log(err);
  });
