const {
  Types: {
    ObjectId: { isValid }
  }
} = require("mongoose");
// mongoose.Types.ObjectId.isValid - query checkup for failed operations
const Task = require("../models/task");
const User = require("../models/user");

// ####################################################
//                CREATE(POST) HANDLING
// ####################################################

exports.createTask = async (req, res, next) => {
  // console.log(req.body); // {"description": "..."}
  const task = new Task({ ...req.body, author: req.user._id });
  try {
    await task.save();
    res.status(201).send("New task created successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// ####################################################
//                READ(GET) HANDLING
// ####################################################

exports.getTasks = async (req, res, next) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    // don't forget to convert query string to boolean
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const params = req.query.sortBy.split(":");
    sort[params[0]] = params[1] === "asc" ? 1 : -1;
  }

  try {
    // for virtual data
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit), // convert string to number
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();

    if (!req.user.tasks.length) {
      return res.status(200).send("There are no active tasks");
    }

    res.send(req.user.tasks);

    // for real data way1
    // const tasks = await Task.find({ author: req.user._id })
    //   .populate("author")
    //   .exec();
    // for real data way 2
    // const tasks = await Task.find({ author: req.user._id });

    // if (!tasks.length) {
    //   return res.status(200).send("There are no active tasks");
    // }
    // res.send(tasks);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    if (!isValid(req.params.id)) {
      // throw 400;
      return res.status(400).send("Wrong query params");
    }

    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!task) {
      // throw 404;
      return res.status(404).send("Task do not exists");
    }
    res.send(task);
  } catch (err) {
    // errorHandler(err, res);
    res.status(500).send(err.message);
  }
};

// ####################################################
//                UPDATE(PATCH) HANDLING
// ####################################################

exports.updateTask = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowToUpdate = ["description", "completed"];
  const isValidOption = updates.every(update => allowToUpdate.includes(update));
  if (!isValidOption) {
    return res.status(400).send("Wrong option for update");
  }
  // console.log(req.body);
  try {
    if (!isValid(req.params.id)) {
      return res.status(400).send("Wrong query params");
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { $set: req.body },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).send("Task not exists");
    }

    res.send(task);
  } catch (err) {
    // if (err.name === "ValidationError") {
    //   return res.status(400).send(err.message);
    // }
    res.status(400).send(err.message);
  }
};

// ####################################################
//             REMOVE(DELETE) HANDLING
// ####################################################

exports.removeTask = async (req, res, next) => {
  try {
    if (!isValid(req.params.id)) {
      return res.status(400).send("Wrong query params");
    }
    const removed = await Task.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!removed) {
      return res.status(404).send("Task do not exists");
    }

    const count = await Task.countDocuments({ completed: false });
    if (count === 0) {
      return res.send("No tasks left");
    }

    res.send(`${count} tasks left`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
