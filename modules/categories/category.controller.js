const slugify = require("slugify");
const Model = require("./category.model");
const productModel = require("../products/product.model");

const slugGenerator = (payload) => {
  return slugify(payload, {lower:true, strict:false});
};

const create = async (payload) => {
  payload.slug = await slugGenerator(payload.name);
  return Model.create(payload);
};

const list = async ( limit,page, search) => {
  const pageNum = parseInt(page) || 1;
  const size = parseInt(limit) || 20;
  const { name, role } = search;
  const query = {};
  if (name) {
    query.name = new RegExp(name, "gi");
  }
  const response = await Model.aggregate([
    {
      $match: query,
    },
    {
      $sort: {
        created_at: 1,
      },
    },
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (pageNum - 1) * size,
          },
          {
            $limit: size,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        data: 1,
        total: 1,
      },
    },
    {
      $project: {
        "data.password": 0,
      },
    },
  ]).allowDiskUse(true);
  const newData = response[0];
  let { data, total } = newData;
  total = total || 0;
  return { data, total, limit: size, page: pageNum };
};

const getById = (id) => {
  return Model.findOne({ _id: id });
};

const updateById = async (id, payload) => {
  if (payload.name) {
    payload.slug = await slugGenerator(payload.name);
  }
  return Model.findOneAndUpdate({ _id: id }, payload, { new: true });
};

const deleteById = async (id, payload) => {
  const isUsed = await productModel.findOne({ category: id });
  if (isUsed)
    throw new Error(
      `Category is in use. Please remove from product name ${isUsed.name} before deleting`
    );
  return Model.deleteOne({ _id: id });
};

module.exports = { create, list, getById, updateById, deleteById };