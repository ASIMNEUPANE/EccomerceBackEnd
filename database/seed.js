require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Controller = require("../modules/users/user.controller");
const categoryController = require("../modules/categories/category.controller");
const productController = require("../modules/products/product.controller");

mongoose.connect(process.env.DB_URL);
var setup = {
  initialize: async () => {
    await mongoose.connection.dropDatabase();
    console.log("DB reset");
    console.log("Creating Admin user");
    const payload = {
      name: "Raktim Admin",
      email: "rakimsth@gmail.com",
      password: await bcrypt.hash("12345", +process.env.SALT_ROUND),
      isEmailVerified: true,
      roles: ["admin"],
    };
    await Controller.create(payload);
    console.log("Creating Normal user");
    const userPayload = {
      name: "Raktim User",
      email: "raktim@rumsan.com",
      password: await bcrypt.hash("12345", +process.env.SALT_ROUND),
      isEmailVerified: true,
    };
    await Controller.create(userPayload);
    console.log("---------DONE----------");
    console.log("Creating categories");
    const cat1 = await categoryController.create({ name: "Tshirt" });
    const cat2 = await categoryController.create({ name: "Jeans" });
    const cat3 = await categoryController.create({
      name: "Bags",
    });
    console.log("Done");
    console.log("-----Creating Products-----");
    await productController.create({
      name: "Black Tshirt",
      alias: ["black tees", "black tshirt"],
      description: "Best Tshirt in the market",
      quantity: 5,
      price: 1500,
      category: cat1?._id,
      images: [
        "https://thehouseofrare.com/cdn/shop/products/IMG_0053_5c650849-9d9d-4cc3-8863-6a23778cd9a0.jpg?v=1675170808",
        "https://media.istockphoto.com/id/1151955708/photo/mens-white-blank-t-shirt-template-from-two-sides-natural-shape-on-invisible-mannequin-for.jpg?s=612x612&w=0&k=20&c=pvKDT3HqNVhQ_Td7WeV_g_D1MreByuY-y-4Z7E6UMrk=",
      ],
    });

    await productController.create({
      name: "Black Jeans",
      alias: ["black jeans", "jeans pant", "jeans"],
      description: "Best Jeans in the market",
      quantity: 3,
      price: 2500,
      category: cat2?._id,
      images: [
        "https://freakins.com/cdn/shop/files/DSC06803-Edit.jpg?v=1692190880",
        "https://cdn.pixelbin.io/v2/black-bread-289bfa/iix9pB/wrkr/t.resize(h:600,w:510)/data/gas/21072022/410316769_A222_1.jpg",
      ],
    });
    await productController.create({
      name: "Laptop Bag",
      alias: ["laptop", "laptop bag", "bag"],
      description: "Best Laptop Bag in the market",
      quantity: 0,
      price: 4500,
      category: cat3?._id,
      images: [
        "https://static-01.daraz.com.np/p/a3970f781c7c4c006c0da925609d83b7.jpg",
        "https://static-01.daraz.com.np/original/3c7e0f8ac1d0885a656e0572a683fc09.jpg",
      ],
    });
    console.log("-----Creating Products-----");
  },
};
setup.initialize();