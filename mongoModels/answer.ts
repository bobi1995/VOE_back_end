import { Schema, model } from "mongoose";

const answerSchema = new Schema({
  date: {
    type: String,
  },
  description: {
    type: String,
  },
  attachments: [
    {
      type: String,
    },
  ],
  caseId: {
    type: Schema.Types.ObjectId,
    ref: "Case",
    require: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  commentId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = model("Answer", answerSchema);
