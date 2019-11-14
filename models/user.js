const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;
const Task = require("./task");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: value => {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid.");
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate: value => {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Password can not contain <password>");
      }
    }
  },
  name: { type: String, required: true, trim: true },
  exp: {
    type: Number,
    default: 0,
    validate: value => {
      if (value < 0) {
        throw new Error("Must be a positive number");
      }
    }
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ],
  avatar: {
    // file binary data buffer
    type: Buffer
  }
}, {
  timestamps: true
});

userSchema.virtual("tasks", {
  ref: "Task", // where to look for
  localField: "_id", // this _id
  foreignField: "author" // Task.author
});

// middleware call .pre() fires before mongoose event - save or validation...
// arguments: 1 - name of the event, 2 - function to run(must be standart func. NOT ARROW!)
// this - refers to the document function called for.
// next() - gets called to signal that operation is done.
// if next() is not provided its gonna stack for ever!
userSchema.pre("save", async function(next) {
  const user = this;
  // console.log("just before saving document operation");
  
  // condition for password changeing and creation
  // .isModified() - document method that returns true/false
  //  whether field value was changed or not
  if (user.isModified("password")) {
    // override plain text with hashedLongString
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// delete all users tasks before account will be deleted
userSchema.pre("remove", async function(next) {
  await Task.deleteMany({ author: this._id });

  next();
});
// middleware call .post() fires just after mongoose event
// userSchema.post()

// statics holds manualy written functions that can be then called on model
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error("User not exists");
  }
  // console.log(user);
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Password doesn't match");
  }

  return user;
};

// methdos holds up manualy written functions for mongoose instances
userSchema.methods.generateAuthToken = async function() {
  const token = await jwt.sign(
    { _id: this._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "8h" } // "2 days", "10h", "7d", "120" = 120ms, 60*60 = 1hour
  );

  this.tokens = this.tokens.concat({ token });
  await this.save();

  return token;
};

// HIDING PRIVATE DATA
// manual way
// userSchema.methods.publicProfile = function() {
//   const publicData = this.toObject();

//   delete publicData.password;
//   delete publicData.tokens;

//   return publicData
// }

// automated way
userSchema.methods.toJSON = function() {
  const publicData = this.toObject();

  // remove binary image buffer in order to not waste connection speed 
  delete publicData.avatar;
  // remove private data
  delete publicData.password;
  delete publicData.tokens;  

  return publicData;
};

module.exports = mongoose.model("User", userSchema);
