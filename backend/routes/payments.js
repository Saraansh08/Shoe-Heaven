const express = require("express");
const { verifyToken }  = require("../middleware/auth");
const { checkout, verifyPayment } = require("../controllers/payments");
const router = express.Router();

router.route("/create-checkout-session").post(checkout);
router.post("/verify-payment", verifyToken, verifyPayment);

module.exports = router;
