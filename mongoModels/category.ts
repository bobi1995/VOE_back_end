import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  expertUserIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  caseIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Case",
    },
  ],
});

module.exports = model("Category", categorySchema);
