// global libs
const express = require("express");
require('./db')();
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

module.exports = app;
