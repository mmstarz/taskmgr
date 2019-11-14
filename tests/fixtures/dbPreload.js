const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/user");
const Task = require("../../models/task");

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: "userOne",
  email: "user@one.com",
  password: "userOnePass",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET, {
        expiresIn: "8h"
      })
    }
  ]
};

const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
  _id: userTwoId,
  name: "userTwo",
  email: "user@two.com",
  password: "usertwoPass",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET, {
        expiresIn: "8h"
      })
    }
  ]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'this is the first task from test',
  completed: false,
  author: userOneId
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'this is the second task from test',
  completed: true,
  author: userOneId
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'this is the third task from test',
  completed: true,
  author: userTwoId
}

const preloadDatabaseSetup = async () => {
  await Task.deleteMany(); // delete all documents in tasks collection
  await User.deleteMany(); // delete all documents in users collection
  await new User(userOne).save(); // create and save new user document
  await new User(userTwo).save(); // create and save new user document
  await new Task(taskOne).save(); // create and save new user document
  await new Task(taskTwo).save(); // create and save new user document
  await new Task(taskThree).save(); // create and save new user document
};

module.exports = {
    preloadDatabaseSetup,
    userOne,
    userOneId,
    taskOne,
    userTwo,
    taskThree
};
