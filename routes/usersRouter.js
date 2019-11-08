const express = require("express");

const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const uploader = require("../utils/multer");
const usersController = require("../controllers/usersController");

router.post("/users", usersController.createUser);

router.post("/users/login", usersController.login);

router.get("/users/:id/avatar", usersController.getUserAvatar);

router.post("/users/logout", isAuth, usersController.logout);

router.post("/users/logoutAll", isAuth, usersController.logoutAll);

router.get("/users/profile", isAuth, usersController.getProfile);

router.post(
  "/users/profile/avatar",
  isAuth,
  uploader.single("avatar"),
  usersController.setProfileAvatar,
  (error, req, res, next) => {
    res.status(400).send(error.message);
  }
);

router.delete("/users/profile/avatar", isAuth, usersController.removeAvatar);

router.patch("/users/profile", isAuth, usersController.updateUser);

router.delete("/users/profile", isAuth, usersController.removeUser);

module.exports = router;
