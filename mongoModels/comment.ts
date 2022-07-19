import { Schema, model } from "mongoose";

const commentSchema = new Schema({
  date: {
    type: String,
  },
  description: {
    type: String,
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: "Case",
    require: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  asnwerId: {
    type: Schema.Types.ObjectId,
    ref: "Answer",
  },
});

module.exports = model("Comment", commentSchema);
