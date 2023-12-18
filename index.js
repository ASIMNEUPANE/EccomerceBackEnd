require("dotenv").config();
const cors = require("cors");
const express = require("express");

const mongoose = require("mongoose");
const controller = require("./modules/orders/order.controller");

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

const endpointSecret = process.env.ENDPOINT_SECRET;
const stripe = require("stripe")(process.env.SECRET_KEY);

const indexRouter = require("./routes");
mongoose.connect(DB_URL).then(() => {
  console.log("DataBase connected...");
});

const app = express();
app.use(cors());

app.use(express.static("public"));

app.post(
  "api/v1/orders/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
      switch (event.type) {
        case "checkout.session.async_payment_failed":
          const payment_failed = event.data.object;
          await controller.updateBasedonPayment(payment_failed);
          break;
        case "checkout.session.async_payment_succeeded":
          const payment_succeeded = event.data.object;
          await controller.updateBasedonPayment(payment_succeeded);

          break;
        case "checkout.session.async_payment_completed":
          const payment_completed = event.data.object;
          await controller.updateBasedonPayment(payment_completed);
          break;
        case "checkout.session.async_payment_expired":
          const payment_expired = event.data.object;
          await controller.updateBasedonPayment(payment_expired);

          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    res.send();
  }
);

app.use(express.json());

app.use("/", indexRouter);

app.use((err, req, res, next) => {
  const errMsg = err ? err.toString() : "something went wrong";
  res.status(500).json({ data: "", msg: errMsg });
});

app.listen(PORT, () => {
  console.log(`app is running on ${PORT}`);
});
