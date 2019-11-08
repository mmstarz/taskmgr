const jwt = require("jsonwebtoken");
const User = require("../models/user");

const isAuth = async (req, res, next) => {
  try {
    // step1 get token from header
    // .replace(str, str) if second argument is empty simply removes first string
    const token = req.header("Authorization").replace("Bearer ", "");
    // step2 decode token body
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // step3 validate token
    // search for specific user document
    // list the tokens array for a specific token
    const user = await User.findOne({ _id: decoded._id, "tokens.token": token });

    if (!user) {
      throw new Error("not authorized");
    }

    // store token
    req.token = token;
    // store user
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("not auhtenticated");
  }
};

module.exports = isAuth;
