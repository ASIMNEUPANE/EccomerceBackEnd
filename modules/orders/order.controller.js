const { v4: uuidv4 } = require("uuid");
const model = require("./order.model");
const productModel = require("../products/product.model");

const create = (payload) => {
  // create unique ID
  payload.id = uuidv4();
  // decrease the product stock after order made

  const products = payload?.products;
  products.map(async (product) => {
    
    const { product: id, quantity } = product;
    // find the product
    const productInfo = await productModel.findOne({ _id: id });
    if (!productInfo) throw new Error("product not found");
    // update the stock
    // write the new Quantity to product stock
    await productModel.findOneAndUpdate(
      { _id: id },
      { quantity: productInfo?.quantity - quantity },
      { new: true }
    );
  });
  // create the order

  return model.create(payload);
};

const list =async (size,page,search)=>{
 
  const pageNum = parseInt(page)|| 1
  const limit = parseInt(size) || 20
const query = {};

if (search) {
  query['fieldName'] = { $regex: new RegExp(search, 'i') };
}


const response = await model.aggregate(
    [
      {
        '$match': query
        
      }, {
        '$sort': {
          'created_at': -1
        }
      }, {
        '$facet': {
          'metadata': [
            {
              '$count': 'total'
            }
          ], 
          'data': [
            {
              '$skip': (pageNum -1 )* limit
            }, {
              '$limit': limit
            }
          ]
        }
      }, {
        '$addFields': {
          'total': {
            '$arrayElemAt': [
              '$metadata.total', 0
            ]
          }
        }
      }, {
        '$project': {
          'data': 1, 
          'total': 1
        }
      }
    ]
  ).allowDiskUse(true);
  const newData= response[0]
  const {data,total}= newData;
  return{data,total,limit,pageNum}

  }

const getById = (id) => {
  return model.findOne({ _id:id });

};
const updateById = async(id, payload) => {
  // Ignoring the quantity update
 
  const { products, ...rest } = payload;

  return await model.findOneAndUpdate({ _id:id }, rest, { new: true });
};

const deleteById = async(id, payload) => {
  
  // find the product
  
  const order = await model.findOne({id});
  if (!order) throw new Error("order not found");
  //   increase the stock of product
  
  const products = order.products;
  products.map(async (product) => {
    const { product: id, quantity } = product;
    // update the stock
   

    const productInfo = await productModel.findOne({ _id: id });
    if (!productInfo) throw new Error("product is not valid");

    // write the new quantity to product stocks
    await productModel.findOneAndUpdate(
      { _id: id },
      {
        quantity:productInfo?.quantity + quantity,
        updated_by: payload.updated_by,
        updated_at: new Date(),
      },
      { new: true }
    );
  });

  return model.deleteOne({ id });
};

const approve = (id, payload) => {
  return model.findOneAndUpdate({ _id:id }, payload, { new: true });
};

const updateBasedonPayment = async (stripePayload) => {
  const { id, status } = stripePayload;
  const checkOrder = await model.findOne({ orderId: id });
  if (!checkOrder) throw new Error("Order is not available");
  if (status === "complete") {
    await model.findOneAndUpdate(
      { orderId: id },
      { status: "Completed" },
      { new: true }
    );
  }

  if (status === "expired") {
    const order = await model.findOneAndUpdate(
      { orderId: id },
      { status: "Failed" },
      { new: true }
      // update the product quantity accordingly
    );
    order.products.map(async (product) => {
      const { product: id, quantity } = product;
      // find the product
      const productInfo = await productModel.findOne({ _id: id });
      if (!productInfo) throw new Error("product not found");
      // update the stock
      // write the new Quantity to product stock
      await productModel.findOneAndUpdate(
        { _id: id },
        { quantity: productInfo?.quantity + quantity },
        { new: true }
      );
    });
  }
  if (status === "failed") {
    const order = await model.findOneAndUpdate(
      { orderId: id },
      { status: "Failed" },
      { new: true }
    );
    order.products.map(async (product) => {
      const { product: id, quantity } = product;
      // find the product
      const productInfo = await productModel.findOne({ _id: id });
      if (!productInfo) throw new Error("product not found");
      // update the stock
      // write the new Quantity to product stock
      await productModel.findOneAndUpdate(
        { _id: id },
        { quantity: productInfo?.quantity + quantity },
        { new: true }
      );
    });
  }
};

module.exports = {
  approve,
  create,
  list,
  getById,
  updateById,
  deleteById,
  updateBasedonPayment,
};
