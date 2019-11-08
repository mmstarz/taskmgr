const mongoose = require("mongoose");
const { Schema } = mongoose;
// https://mongoosejs.com/docs/populate.html
// ref - tells where to look for value. Reference to the model
// ref: '<model name>'
// after using .populate() author will contain full user document
// of a certain ObjectId
const taskSchema = new Schema(
  {
    description: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User" }
  },
  { timestamps: true }
);

// middleware call .pre() fires before mongoose event - save or validation...
// arguments: 1 - name of the event, 2 - function to run(must be standart func. NOT ARROW!)
// this - refers to the document function called for.
// next() - gets called to signal that operation is done.
// if next() is not provided its gonna stack for ever!
taskSchema.pre("save", async function(next) {
  const task = this;
  // console.log("just before saving document operation");
  // condition for password changeing and creation
  // .isModified() - document method that returns true/false
  //  whether field value was changed or not
  if (task.isModified("description")) {
    console.log("new description: ", task.description);
  }

  if (task.isModified("completed")) {
    console.log("completed: ", task.completed);
  }

  next();
});

module.exports = mongoose.model("Task", taskSchema);
