const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;
const { commonSchema } = require("../../utils/commonSchema");

const productSchema = new Schema({
  name: { type: String, required: true },
  alias: [{ type: String  }],
  description: { type: String },
  quantity: { type: Number, required: true },
  brand:{type: String},
  price: { type: Number, required: true },
  category: { type: ObjectId, ref: "Category", required: true },
  images: [{ type: String }],
  ...commonSchema,
});

module.exports = model("Product", productSchema);