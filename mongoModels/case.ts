import { Schema, model } from "mongoose";

const caseSchema = new Schema({
  description: {
    type: String,
    require: true,
  },
  date: {
    type: String,
  },
  signature: {
    type: String,
  },
  attachments: [
    {
      type: String,
    },
  ],
  priority: {
    type: Number,
  },
  status: {
    type: Number,
  },
  categoryId: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
      require: true,
    },
  ],
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

module.exports = model("Case", caseSchema);