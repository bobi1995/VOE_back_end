import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    require: true,
  },
  position: {
    type: String,
  },
  admin: {
    type: Boolean,
    required: true,
  },
  avatar: {
    type: String,
  },
  regCaseIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Case",
    },
  ],
  categoryId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
});

module.exports = model("User", userSchema);
