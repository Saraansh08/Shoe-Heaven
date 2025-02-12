// require("dotenv").config();
// const asyncErrorHandler = require("../middleware/asyncErrorHandler");
// const Stripe = require("stripe");
// const order = require("../models/order");
// const user = require("../models/user");
// const product = require("../models/product");

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// const checkout = asyncErrorHandler(async (req, res) => {
//   const id = req.tokenId;
//   const email = req.tokenEmail;
//   const { coupon } = req.body;

//   const cartObj = await user
//     .findById(id)
//     .populate({
//       path: "cart.items.productId",
//       select: "name price image brand sizeQuantity",
//     })
//     .select("cart name");

//   const formattedCart = cartObj.cart.items.map((item) => {
//     const sizeQty = item.productId.sizeQuantity.filter(
//       (size) => size.size === item.size
//     )[0].quantity;
//     return {
//       productId: item.productId._id,
//       name: `${item.productId.brand} ${item.productId.name}`,
//       image: item.productId.image,
//       qty: item.qty > sizeQty ? sizeQty : item.qty,
//       size: item.size,
//       price: item.productId.price,
//     };
//   });
//   let customer;

//   const existingCustomer = await stripe.customers.list({ email: email });
//   if (existingCustomer.data.length > 0) {
//     customer = existingCustomer.data[0];
//   } else {
//     customer = await stripe.customers.create({
//       name: cartObj.name,
//       email: email,
//       metadata: { userId: id },
//     });
//   }

//   const line_items = formattedCart.map((item) => {
//     return {
//       price_data: {
//         currency: "inr",
//         product_data: {
//           name: item.name,
//           images: [item.image],
//           description: `size: ${item.size}`,
//           metadata: {
//             productId: item.productId.toString(),
//             size: item.size.toString(),
//           },
//         },
//         unit_amount: item.price * 100,
//       },
//       quantity: item.qty,
//     };
//   });

//   const session = await stripe.checkout.sessions.create({
//     line_items,
//     phone_number_collection: { enabled: true },
//     billing_address_collection: "required",
//     shipping_address_collection: {},
//     shipping_options: [
//       {
//         shipping_rate_data: {
//           type: "fixed_amount",
//           fixed_amount: { amount: 0, currency: "inr" },
//           display_name: "Free shipping",
//           delivery_estimate: {
//             minimum: { unit: "business_day", value: 5 },
//             maximum: { unit: "business_day", value: 7 },
//           },
//         },
//       },
//       {
//         shipping_rate_data: {
//           type: "fixed_amount",
//           fixed_amount: { amount: 30000, currency: "inr" },
//           display_name: "Next day air",
//           delivery_estimate: {
//             minimum: { unit: "business_day", value: 1 },
//             maximum: { unit: "business_day", value: 1 },
//           },
//         },
//       },
//     ],
//     mode: "payment",
//     metadata: {
//       cart: JSON.stringify(
//         formattedCart.map((item) => {
//           return {
//             productId: item.productId,
//             qty: item.qty,
//             size: item.size,
//           };
//         })
//       ),
//     },
//     customer: customer.id,
//     discounts: coupon !== "" ? [{ coupon }] : [],
//     success_url: `${process.env.CLIENT_URL}/checkout-success`,
//     cancel_url: `${process.env.CLIENT_URL}/cart`,
//   });
//   res.json({ url: session.url });
// });

// const createOrder = async (customer, data) => {
//   try {
//     const products = JSON.parse(data.metadata.cart);

//     await order.create({
//       userId: customer.metadata.userId,
//       paymentIntentId: data.payment_intent,
//       products,
//       subtotal: data.amount_subtotal / 100,
//       total: data.amount_total / 100,
//       shipping: data.customer_details,
//       payment_status: data.payment_status,
//     });

//     const userObj = await user.findById(customer.metadata.userId);
//     userObj.cart.items = [];
//     userObj.cart.totalPrice = 0;
//     await userObj.save();

//     for (const item of products) {
//       const productObj = await product.findById(item.productId);
//       productObj.sizeQuantity = productObj.sizeQuantity.filter((size) => {
//         if (size.size === item.size) {
//           size.quantity -= item.quantity;
//         }
//         return size.quantity > 0;
//       });
//       await productObj.save();
//     }
//     console.log("Order created successfully");
//   } catch (err) {
//     console.log(err);
//   }
// };

// const webhook = asyncErrorHandler((request, response) => {
//   let data;
//   let eventType;
//   let endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   if (endpointSecret) {
//     // Retrieve the event by verifying the signature using the raw body and secret.
//     let event;
//     const sig = request.headers["stripe-signature"];
//     try {
//       event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     } catch (err) {
//       console.log(`⚠️  Webhook signature verification failed.`, err);
//       return response.sendStatus(400);
//     }
//     data = event.data.object;
//     eventType = event.type;
//   } else {
//     // Webhook signing is recommended, but if the secret is not configured in `config.js`,
//     // retrieve the event data directly from the request body.
//     data = request.body.data.object;
//     eventType = request.body.type;
//   }
//   switch (eventType) {
//     case "checkout.session.completed":
//       stripe.customers
//         .retrieve(data.customer)
//         .then(async (customer) => {
//           createOrder(customer, data);
//         })
//         .catch((error) => {
//           console.log("Error: ", error);
//         });
//       break;
//     default:
//       // console.log(`Unhandled event type ${eventType}`);
//       break;
//   }
//   response.status(200).send();
// });
// module.exports = { checkout, webhook };


require("dotenv").config();
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const order = require("../models/order");
const user = require("../models/user");
const product = require("../models/product");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// const checkout = asyncErrorHandler(async (req, res) => {
//   const id = req.tokenId;
//   const email = req.tokenEmail;
//   const { coupon } = req.body;

//   const cartObj = await user
//     .findById(id)
//     .populate({
//       path: "cart.items.productId",
//       select: "name price image brand sizeQuantity",
//     })
//     .select("cart name");

//   const formattedCart = cartObj.cart.items.map((item) => {
//     const sizeQty = item.productId.sizeQuantity.filter(
//       (size) => size.size === item.size
//     )[0].quantity;
//     return {
//       productId: item.productId._id,
//       name: `${item.productId.brand} ${item.productId.name}`,
//       image: item.productId.image,
//       qty: item.qty > sizeQty ? sizeQty : item.qty,
//       size: item.size,
//       price: item.productId.price,
//     };
//   });

//   const totalAmount = formattedCart.reduce(
//     (acc, item) => acc + item.price * item.qty,
//     0
//   );

//   const options = {
//     amount: totalAmount * 100, 
//     currency: "INR",
//     receipt: `rcpt_${id.slice(-6)}_${Date.now().toString().slice(-6)}`, 
//     notes: {
//       userId: id,
//       cart: JSON.stringify(
//         formattedCart.map((item) => ({
//           productId: item.productId,
//           qty: item.qty,
//           size: item.size,
//         }))
//       ),
//     },
//   };
  

//   const order = await razorpay.orders.create(options);

//   res.json({ orderId: order.id, amount: totalAmount, currency: "INR" });
// });

// const createOrder = async (notes, paymentDetails) => {
//   try {
//     const products = JSON.parse(notes.cart);

//     await order.create({
//       userId: notes.userId,
//       paymentId: paymentDetails.id,
//       products,
//       subtotal: paymentDetails.amount / 100,
//       total: paymentDetails.amount / 100,
//       payment_status: paymentDetails.status,
//     });

//     const userObj = await user.findById(notes.userId);
//     userObj.cart.items = [];
//     userObj.cart.totalPrice = 0;
//     await userObj.save();

//     for (const item of products) {
//       const productObj = await product.findById(item.productId);
//       productObj.sizeQuantity = productObj.sizeQuantity.filter((size) => {
//         if (size.size === item.size) {
//           size.quantity -= item.qty;
//         }
//         return size.quantity > 0;
//       });
//       await productObj.save();
//     }

//     console.log("Order created successfully");
//   } catch (err) {
//     console.log(err);
//   }
// };

// const verifyPayment = asyncErrorHandler(async (req, res) => {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(body)
//     .digest("hex");

//   if (expectedSignature === razorpay_signature) {
//     // Payment verified, create order
//     const orderData = await razorpay.orders.fetch(razorpay_order_id);
//     const notes = JSON.parse(orderData.notes.cart);
//     console.log(notes)
//     await createOrder(notes, {
//       id: razorpay_payment_id,
//       amount: orderData.amount,
//       status: "success",
//     });

//     return res.json({ success: true, message: "Payment verified and order created.", notes : notes });
//   } else {
//     return res.status(400).json({ success: false, message: "Invalid payment signature." });
//   }
// });

// const createOrder = async (notes, paymentDetails) => {
//   try {
//     console.log("Starting order creation...");
//     console.log("Notes received in createOrder:", JSON.stringify(notes)); // Log the received notes for debugging
//     console.log("Payment details received:", JSON.stringify(paymentDetails)); // Log the received payment details for debugging

//     // Extract and parse the cart JSON string
//     const products = JSON.parse(notes.cart.cart); // Use notes.cart.cart
//     console.log("Parsed products from cart:", JSON.stringify(products)); // Log the parsed products

//     // Create order in the database
//     await order.create({
//       userId: notes.userId,
//       paymentId: paymentDetails.id,
//       products,
//       subtotal: paymentDetails.amount / 100,
//       total: paymentDetails.amount / 100,
//       payment_status: paymentDetails.status,
//     });

//     console.log("Order created in the database");

//     const userObj = await user.findById(notes.userId);
//     console.log("Fetched user object:", userObj);

//     userObj.cart.items = [];
//     userObj.cart.totalPrice = 0;
//     await userObj.save();
//     console.log("User cart reset successfully");

//     // Loop through the products and update the stock
//     for (const item of products) {
//       const productObj = await product.findById(item.productId);
//       console.log("Fetched product object:", productObj);

//       productObj.sizeQuantity = productObj.sizeQuantity.filter((size) => {
//         if (size.size === item.size) {
//           size.quantity -= item.qty;
//           console.log(`Updated product size quantity for size ${item.size}:`, size.quantity);
//         }
//         return size.quantity > 0;
//       });

//       await productObj.save();
//       console.log("Product stock updated in the database");
//     }

//     console.log("Order created successfully");
//   } catch (err) {
//     console.error("Error in createOrder:", err); // Log the error for better identification
//   }
// };

const checkout = asyncErrorHandler(async (req, res) => {
  const id = req.tokenId;
  const email = req.tokenEmail;
  const { coupon, exchangeRate = 90 } = req.body; // Receive exchange rate

  const cartObj = await user
    .findById(id)
    .populate({
      path: "cart.items.productId",
      select: "name price image brand sizeQuantity",
    })
    .select("cart name");

  const formattedCart = cartObj.cart.items.map((item) => {
    const sizeQty = item.productId.sizeQuantity.filter(
      (size) => size.size === item.size
    )[0].quantity;
    return {
      productId: item.productId._id,
      name: `${item.productId.brand} ${item.productId.name}`,
      image: item.productId.image,
      qty: item.qty > sizeQty ? sizeQty : item.qty,
      size: item.size,
      price: item.productId.price,
    };
  });

  // Calculate the total amount in EUR first
  const totalAmountInEuro = formattedCart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  // Convert the total amount to INR using the exchange rate
  const totalAmountInINR = totalAmountInEuro * exchangeRate;

  const options = {
    amount: totalAmountInINR * 100,  // Convert to paise (smallest unit)
    currency: "INR",
    receipt: `rcpt_${id.slice(-6)}_${Date.now().toString().slice(-6)}`, 
    notes: {
      userId: id,
      cart: JSON.stringify(
        formattedCart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          size: item.size,
        }))
      ),
    },
  };

  const order = await razorpay.orders.create(options);

  res.json({ orderId: order.id, amount: totalAmountInINR, currency: "INR" });
});

const createOrder = async (paymentDetails) => {
  try {
    console.log("Starting order creation...");
    console.log("Payment details received:", JSON.stringify(paymentDetails)); // Log the received payment details for debugging
    await order.create({
      userId: paymentDetails.userId,
      products: paymentDetails.products,
      subtotal: paymentDetails.subtotal,
      total: paymentDetails.total,
      payment_status: paymentDetails.payment_status,
      shipping: paymentDetails.shipping, 
      paymentIntentId: paymentDetails.paymentIntentId,
    });

    console.log("Order created in the database");

    const userObj = await user.findById(notes.userId);
    console.log("Fetched user object:", userObj);

    userObj.cart.items = [];
    userObj.cart.totalPrice = 0;
    await userObj.save();
    console.log("User cart reset successfully");

    // Loop through the products and update the stock
    for (const item of products) {
      const productObj = await product.findById(item.productId);
      console.log("Fetched product object:", productObj);

      productObj.sizeQuantity = productObj.sizeQuantity.filter((size) => {
        if (size.size === item.size) {
          size.quantity -= item.qty;
          console.log(`Updated product size quantity for size ${item.size}:`, size.quantity);
        }
        return size.quantity > 0;
      });

      await productObj.save();
      console.log("Product stock updated in the database");
    }

    console.log("Order created successfully");
  } catch (err) {
    console.error("Error in createOrder:", err); // Log the error for better identification
  }
};


// const verifyPayment = asyncErrorHandler(async (req, res) => {
//   console.log("Starting payment verification...");

//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shipping } = req.body;
//   console.log("Received payment details:", {
//     razorpay_payment_id,
//     razorpay_order_id,
//     razorpay_signature,
//     shipping
//   }); // Log received payment details for debugging

//   // Validate Razorpay signature
//   const body = razorpay_order_id + "|" + razorpay_payment_id;
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(body)
//     .digest("hex");

//   console.log("Expected Razorpay signature:", expectedSignature); // Log expected signature for verification

//   if (expectedSignature === razorpay_signature) {
//     console.log("Signature is valid");

//     // Fetch Razorpay order details
//     const orderData = await razorpay.orders.fetch(razorpay_order_id);
//     console.log("Fetched Razorpay order details:", JSON.stringify(orderData)); // Log Razorpay order details for debugging

//     // Retrieve userId from the token (via middleware)
//     const userId = req.tokenId; // Populated by verifyToken middleware
//     console.log("User ID from token:", userId); // Log userId for debugging

//     if (!userId) {
//       console.log("User ID not found in the token");
//       return res.status(400).json({
//         success: false,
//         message: "User ID not found in the token. Please authenticate.",
//       });
//     }

//     // Construct notes with userId and cart details
//     const notes = {
//       userId,
//       cart: orderData.notes, // Assuming Razorpay's notes is an array of products
//     };

//     console.log("This is the notes here from verifyPayment function:", JSON.stringify(notes)); // Log notes from verifyPayment

//     // Call createOrder with the required details
//     await createOrder({
//       userId : orderData.notes.userId,
//       paymentIntentId : orderData.id,
//       products : orderData.notes.cart,
//       subtotal: orderData.amount / 100,
//       total : orderData.amount_paid / 100,
//       payment_status : orderData.status,
//       shipping : shipping,
//   });
//     return res.json({
//       success: true,
//       message: "Payment verified and order created.",
//       notes: notes,
//     });
//   } else {
//     console.log("Invalid payment signature");
//     return res.status(400).json({
//       success: false,
//       message: "Invalid payment signature.",
//     });
//   }
// });

const verifyPayment = asyncErrorHandler(async (req, res) => {
  console.log("Starting payment verification...");

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shipping, rate } = req.body;
  console.log("Received payment details:", {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    shipping,
    rate
  });

  // Validate Razorpay signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  console.log("Expected Razorpay signature:", expectedSignature);

  if (expectedSignature === razorpay_signature) {
    console.log("Signature is valid");

    try {
      // Fetch Razorpay order details
      const orderData = await razorpay.orders.fetch(razorpay_order_id);
      console.log("Fetched Razorpay order details:", JSON.stringify(orderData));

      // Retrieve userId from the token (via middleware)
      const userId = req.tokenId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID not found in the token. Please authenticate.",
        });
      }

      // Construct notes with userId and cart details
      const notes = {
        userId,
        cart: JSON.parse(orderData.notes.cart), // Ensure this is parsed from JSON string
      };

      console.log("Notes from verifyPayment:", JSON.stringify(notes));
      const orderAmmount = orderData.amount / rate;
      const ammountPaid = orderData.amount_paid / rate;
      const orderPayload = {
        userId: notes.userId,
        paymentIntentId: orderData.id,
        products: notes.cart,
        subtotal: orderAmmount / 100, // Convert from paise to INR
        total: ammountPaid / 100, // Convert from paise to INR
        payment_status: orderData.status,
        shipping: shipping,
      };
      
      console.log("Order Payload: ", JSON.stringify(orderPayload, null, 2));
      
      await createOrder(orderPayload);
      return res.json({
        success: true,
        message: "Payment verified and order created.",
        notes: notes,
      });
    } catch (error) {
      console.error("Error in verifying payment or creating order:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error while verifying payment.",
        error: error.message,
      });
    }
  } else {
    console.log("Invalid payment signature");
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature.",
    });
  }
});

const webhook = asyncErrorHandler((req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  if (signature === expectedSignature) {
    const event = body.event;
    const payload = body.payload;

    if (event === "order.paid") {
      const paymentDetails = payload.payment.entity;
      const notes = paymentDetails.notes;

      createOrder(notes, paymentDetails);
    }

    res.status(200).send("Webhook handled successfully");
  } else {
    res.status(400).send("Invalid signature");
  }
});

module.exports = { checkout, webhook, verifyPayment };
