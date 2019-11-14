const {
  Types: {
    ObjectId: { isValid }
  }
} = require("mongoose");
// mongoose.Types.ObjectId.isValid - query checkup for failed operations
const User = require("../models/user");
const sharp = require("sharp");
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../utils/emails");

// ####################################################
//                CREATE(POST) HANDLING
// ####################################################

exports.createUser = async (req, res, next) => {
  // console.log(req.body); // {email: "...", password: "...", name: "..."}
  const user = new User(req.body);

  try {
    // await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    // res.status(201).send("New user created successfully");
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.login = async (req, res, next) => {
  try {
    // manually written in the model findByCredentials
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    // send data
    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// for current session
exports.logout = async (req, res, next) => {
  try {
    // remove current token from the tokens array
    req.user.tokens = req.user.tokens.filter(item => item.token !== req.token);
    await req.user.save();
    res.send("successfully logged out");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// for all sessions
exports.logoutAll = async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("successfully logged out");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.setProfileAvatar = async (req, res, next) => {
  // access file via req.file
  // req.user.avatar = req.file.buffer;

  // sharp
  // takes binary buffer convert to png with .png()
  // resize the image with .resize({width, height})
  // return updated buffer with .toBuffer()
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send("Uploaded successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// ####################################################
//                READ(GET) HANDLING
// ####################################################

exports.getProfile = (req, res, next) => {
  res.send(req.user);
};

exports.getUserAvatar = async (req, res, next) => {
  if (!isValid(req.params.id)) {
    return res.status(400).send("Wrong request params");
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error("No avatar found");
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// ####################################################
//                UPDATE(PATCH) HANDLING
// ####################################################

exports.updateUser = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowToUpdate = ["email", "password", "exp", "name"];
  const isValidOption = updates.every(update => allowToUpdate.includes(update));
  // console.log(req.body);
  if (!isValidOption) {
    return res.status(400).send("Invalid option for update");
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    }
    res.status(500).send(err.message);
  }
};

// ####################################################
//             REMOVE(DELETE) HANDLING
// ####################################################

exports.removeAvatar = async (req, res, next) => {
  // access file via req.file
  req.user.avatar = undefined;
  await req.user.save();
  res.send("Removed successfully");
};

exports.removeUser = async (req, res, next) => {
  try {
    sendGoodbyeEmail(req.user.email, req.user.name);
    await req.user.remove();
    res.send("Removed successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
};
