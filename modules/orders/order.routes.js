const router = require("express").Router();

const controller = require("./order.controller");
const secureAPI = require("../../utils/secure");
const FRONTEND_URL = process.env.FRONTEND_URL;
const stripe = require("stripe")(process.env.SECRET_KEY);

router.post("/", async (req, res, next) => {
  try {
    const result = await controller.create(req.body);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.get("/", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const { size, page  } = req.query;
  
    const result = await controller.list(size, page);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});

router.patch("/status/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
    
    req.body.updated_by = req.currentUser;
    req.body.updated_at = new Date();
    const result = await controller.approve(req.params.id, req.body);
    res.json({ data: result, msg: "success" });
  } catch (e) {
    next(e);
  }
});


router.get("/:id", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await controller.getById(req.params.id);
    res.json({ data: result, mssg: "Success" });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
  //
    req.body.updated_at = new Date();
    req.body.updated_by = req.currentUser;
    const result = await controller.updateById(req.params.id, req.body);
    res.json({ data: result, mssg: "Success" });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
    const payload = {  updated_by: req.currentUser };

    const result = await controller.deleteById(req.params.id, payload);
    res.json({ data: result, mssg: "succes" });
  } catch (e) {
    next(e);
  }
});

router.post("/create-checkout-session", async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: req.body,
      mode: "payment",
      success_url: `${FRONTEND_URL}/checkout/success`,
      cancel_url: `${FRONTEND_URL}/checkout/failed`,
    });

    res.json({ data: { id: session.id, url: session.url }, mssg: "success" });
  } catch (e) {
    next(e);
  }
});



module.exports = router;
