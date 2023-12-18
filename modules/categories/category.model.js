const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;
const { commonSchema } = require("../../utils/commonSchema");

const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  ...commonSchema,
});

module.exports = model("Category", categorySchema);