const express = require("express");

const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const tasksController = require('../controllers/tasksController');

router.post("/tasks", isAuth, tasksController.createTask);

router.get("/tasks", isAuth, tasksController.getTasks);

router.get("/tasks/:id", isAuth, tasksController.getTask);

router.patch("/tasks/:id", isAuth, tasksController.updateTask);

router.delete("/tasks/:id", isAuth, tasksController.removeTask);

module.exports = router;
