import "../styles/cartlayout.css";
import CartItems from "../components/CartItems";
import { useCallback, useEffect, useState } from "react";
import Axios from "../Axios";
import useAuth from "../../hooks/useAuth";
import TriangleLoader from "../components/TriangleLoader";
import { toast } from "react-toastify";
import EmptyImage from "../Images/empty-cart.png";

const CartLayout = () => {
  const { auth, setAuth } = useAuth();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const token = localStorage.getItem("jwt");

  const updateData = useCallback(async (e) => {
    setData(e);
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAddress = () => {
    const { street, city, state, pincode, phone } = shippingAddress;
    if (!street || !city || !state || !pincode || !phone) {
      toast.error("Please fill all shipping address fields");
      return false;
    }
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const deleteItem = async (id, qty) => {
    try {
      const response = await Axios.delete(`/cart/delete/${id}`, {
        headers: {
          Authorization: token,
        },
      });
      if (response.data.success === true) {
        toast.success("Product removed from cart successfully");
        setData(response.data.cart);
        setAuth({ ...auth, cartSize: auth.cartSize - qty });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const fetchData = async () => {
    try {
      const response = await Axios.get("/cart", {
        headers: {
          Authorization: token,
        },
      });
      console.log(response.data);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const getExchangeRate = async () => {
    try {
      const response = await Axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
      if (response.data && response.data.rates && response.data.rates.INR) {
        let exchangeRate = response.data.rates.INR;
        // Round to nearest integer
        exchangeRate = Math.round(exchangeRate);
        return exchangeRate;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      // Return default value if API fails
      return 90;
    }
  };

  // const handleCheckout = async () => {
  //   if (!validateAddress()) {
  //     return;
  //   }
  
  //   try {
  //     console.log("this is the token being passed", localStorage.getItem("jwt"));
  //     const response = await Axios.post(
  //       "/payment/create-checkout-session",
  //       { 
  //         coupon: appliedCoupon ? couponCode.toUpperCase() : "",
  //         shipping: shippingAddress // Make sure the shipping address is being passed
  //       },
  //       { headers: { Authorization: localStorage.getItem("jwt") } }
  //     );
  
  //     if (response.data) {
  //       const { orderId, amount, currency } = response.data;
  
  //       const loadRazorpayScript = () =>
  //         new Promise((resolve) => {
  //           const script = document.createElement("script");
  //           script.src = "https://checkout.razorpay.com/v1/checkout.js";
  //           script.onload = resolve;
  //           document.body.appendChild(script);
  //         });
  
  //       await loadRazorpayScript();
        
  //       const euroToInrRate = await getExchangeRate();
  //       const euroToInrAmmount = amount * euroToInrRate;
  //       console.log("Calculated EUR to INR amount:", euroToInrAmmount);

  //       const options = {
  //         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //         amount: euroToInrAmmount * 100,
  //         currency: "EUR",
  //         name: "ShoeHeaven",
  //         description: "Order Payment",
  //         order_id: orderId,
  //         handler: async function (response) {
  //           try {
  //             const verificationResponse = await Axios.post(
  //               "/payment/verify-payment",
  //               {
  //                 razorpay_payment_id: response.razorpay_payment_id,
  //                 razorpay_order_id: response.razorpay_order_id,
  //                 razorpay_signature: response.razorpay_signature,
  //                 shipping: shippingAddress // Make sure the shipping info is passed
  //               },
  //               {
  //                 headers: {
  //                   Authorization: localStorage.getItem("jwt").startsWith("Bearer")
  //                     ? localStorage.getItem("jwt")
  //                     : `Bearer ${localStorage.getItem("jwt")}`
  //                 }
  //               }
  //             );
  
  //             if (verificationResponse.data.success) {
  //               toast.success("Payment successful! Order created.");
  //               window.location.href = "/checkout-success";
  //             } else {
  //               toast.error("Payment verification failed. Please contact support.");
  //             }
  //           } catch (err) {
  //             console.error("Error in verifying payment:", err);
  //             toast.error("Error in verifying payment. Please try again.");
  //           }
  //         },
  //         prefill: {
  //           name: auth?.name || "Customer Name",
  //           email: auth?.email || "customer@example.com",
  //           contact: shippingAddress.phone,
  //         },
  //         theme: {
  //           color: "#3399cc",
  //         },
  //       };
  
  //       const rzp = new window.Razorpay(options);
  //       rzp.open();
  //     }
  //   } catch (error) {
  //     console.error("Error in Razorpay Checkout:", error);
  //     toast.error("Payment initialization failed! Please try again.");
  //   }
  // };

  // const handleCheckout = async () => {
  //   if (!validateAddress()) {
  //     return;
  //   }
  
  //   try {
  //     console.log("this is the token being passed", localStorage.getItem("jwt"));
  //     const response = await Axios.post(
  //       "/payment/create-checkout-session",
  //       { 
  //         coupon: appliedCoupon ? couponCode.toUpperCase() : "",
  //         shipping: shippingAddress // Make sure the shipping address is being passed
  //       },
  //       { headers: { Authorization: localStorage.getItem("jwt") } }
  //     );
  
  //     if (response.data) {
  //       const { orderId, amount, currency } = response.data;
  //       console.log("Amount from API response:", amount);
  
  //       const loadRazorpayScript = () =>
  //         new Promise((resolve) => {
  //           const script = document.createElement("script");
  //           script.src = "https://checkout.razorpay.com/v1/checkout.js";
  //           script.onload = resolve;
  //           document.body.appendChild(script);
  //         });
  
  //       await loadRazorpayScript();
  
  //       const euroToInrRate = await getExchangeRate();
  //       console.log("EUR to INR exchange rate:", euroToInrRate);
  
  //       const euroToInrAmmount = amount * euroToInrRate;
  //       console.log("Calculated EUR to INR amount:", euroToInrAmmount);
  
  //       const options = {
  //         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //         amount: euroToInrAmmount * 100, // Convert to paise (smallest unit)
  //         currency: "EUR",
  //         name: "ShoeHeaven",
  //         description: "Order Payment",
  //         order_id: orderId,
  //         handler: async function (response) {
  //           try {
  //             const verificationResponse = await Axios.post(
  //               "/payment/verify-payment",
  //               {
  //                 razorpay_payment_id: response.razorpay_payment_id,
  //                 razorpay_order_id: response.razorpay_order_id,
  //                 razorpay_signature: response.razorpay_signature,
  //                 shipping: shippingAddress // Make sure the shipping info is passed
  //               },
  //               {
  //                 headers: {
  //                   Authorization: localStorage.getItem("jwt").startsWith("Bearer")
  //                     ? localStorage.getItem("jwt")
  //                     : `Bearer ${localStorage.getItem("jwt")}`
  //                 }
  //               }
  //             );
  
  //             if (verificationResponse.data.success) {
  //               toast.success("Payment successful! Order created.");
  //               window.location.href = "/checkout-success";
  //             } else {
  //               toast.error("Payment verification failed. Please contact support.");
  //             }
  //           } catch (err) {
  //             console.error("Error in verifying payment:", err);
  //             toast.error("Error in verifying payment. Please try again.");
  //           }
  //         },
  //         prefill: {
  //           name: auth?.name || "Customer Name",
  //           email: auth?.email || "customer@example.com",
  //           contact: shippingAddress.phone,
  //         },
  //         theme: {
  //           color: "#3399cc",
  //         },
  //       };
  
  //       const rzp = new window.Razorpay(options);
  //       rzp.open();
  //     }
  //   } catch (error) {
  //     console.error("Error in Razorpay Checkout:", error);
  //     toast.error("Payment initialization failed! Please try again.");
  //   }
  // };

  const handleCheckout = async () => {
    if (!validateAddress()) {
      return;
    }
  
    try {
      console.log("this is the token being passed", localStorage.getItem("jwt"));
      const rate = await  getExchangeRate();
      const response = await Axios.post(
        "/payment/create-checkout-session",
        { 
          coupon: appliedCoupon ? couponCode.toUpperCase() : "",
          shipping: shippingAddress, // Make sure the shipping address is being passed
          exchangeRate: rate, // Send exchange rate for EUR to INR conversion
        },
        { headers: { Authorization: localStorage.getItem("jwt") } }
      );
  
      if (response.data) {
        const { orderId, amount, currency } = response.data;
        console.log("Amount from API response:", amount);
  
        const loadRazorpayScript = () =>
          new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = resolve;
            document.body.appendChild(script);
          });
  
        await loadRazorpayScript();
  
        // Now that the amount is fetched correctly, proceed with Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: amount * 100,  // Razorpay expects amount in paise
          currency: "INR",  // Currency is INR now
          name: "ShoeHeaven",
          description: "Order Payment",
          order_id: orderId,
          handler: async function (response) {
            try {
              const verificationResponse = await Axios.post(
                "/payment/verify-payment",
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  shipping: shippingAddress,
                  rate : rate
                },
                {
                  headers: {
                    Authorization: localStorage.getItem("jwt").startsWith("Bearer")
                      ? localStorage.getItem("jwt")
                      : `Bearer ${localStorage.getItem("jwt")}`
                  }
                }
              );
  
              if (verificationResponse.data.success) {
                toast.success("Payment successful! Order created.");
                window.location.href = "/checkout-success";
              } else {
                toast.error("Payment verification failed. Please contact support.");
              }
            } catch (err) {
              console.error("Error in verifying payment:", err);
              toast.error("Error in verifying payment. Please try again.");
            }
          },
          prefill: {
            name: auth?.name || "Customer Name",
            email: auth?.email || "customer@example.com",
            contact: shippingAddress.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };
  
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Error in Razorpay Checkout:", error);
      toast.error("Payment initialization failed! Please try again.");
    }
  };
  

    
  const applyCoupon = (coupon) => {
    if (!data || data.length <= 0) return toast.error("Cart is empty.");
    console.log(coupon.toUpperCase());
    const listOfCoupons = ["ADITYA20", "NIKE2024"];
    if (listOfCoupons.includes(coupon.toUpperCase())) {
      setCouponCode(coupon);
      setAppliedCoupon(true);
      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code.");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("jwt") === null) {
      setLoading(false);
      return;
    }
    console.log("cart layout");
    fetchData();
  }, []);

  if (loading) return <TriangleLoader height="500px" />;

  return (
    <div className="cartMainContainer">
      <h1 className="cHeader">Shopping Cart</h1>
      <div className="cartContainer">
        <div className="cart-container-1">
          <table className="cart-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Product</th>
                <th className="cart-subheader">Size</th>
                <th className="cart-subheader">Quantity</th>
                <th className="cart-subheader">Total Price</th>
              </tr>
            </thead>
            <tbody className="cart-table-tbody">
              {data &&
                data.items.map((item) => {
                  return (
                    <CartItems
                      key={item._id}
                      cartId={item._id}
                      data={item.productId}
                      qty={item.qty}
                      size={item.size}
                      updateData={updateData}
                      deleteItem={() => deleteItem(item._id, item.qty)}
                    />
                  );
                })}
            </tbody>
          </table>
          {(!data || data.items.length <= 0) && (
            <div className="empty-cart">
              <img src={EmptyImage} alt="empty-cart" />
              <p>Looks like you haven't added any items to the cart yet.</p>
            </div>
          )}
        </div>
        <div className="cart-container-2">
          <div className="cartSummary">
            <h3 className="summaryHeader">Order Summary</h3>
            <div className="summaryInfo">
              <p>
                <span>Sub Total</span>
                <span>
                  €{" "}
                  {(data?.totalPrice - data?.totalPrice * 0.12 || 0).toFixed(2)}
                </span>
              </p>
              <p>
                <span>Tax</span>
                <span>€ {(data?.totalPrice * 0.12 || 0).toFixed(2)}</span>
              </p>
              <p>
                <span>Shipping Charge</span>
                <span>Free</span>
              </p>
              <p>
                <span>Giftcard/Discount code</span>
              </p>
              <div className="couponInput">
                <input
                  type="text"
                  name="couponCode"
                  id="couponCode"
                  value={couponCode}
                  disabled={appliedCoupon}
                  className={appliedCoupon ? "disabled" : ""}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                />
                <button
                  type="button"
                  disabled={appliedCoupon}
                  className={appliedCoupon ? "disabledBtn" : ""}
                  onClick={() => applyCoupon(couponCode)}
                >
                  Apply
                </button>
              </div>
              <p className="cart-total">
                <span>Total</span>
                <span>€ {(data?.totalPrice || 0).toFixed(2)}</span>
              </p>

              {/* Shipping Address Form */}
              <div className="shipping-address-section">
                <h4>Shipping Address</h4>
                <div className="address-form">
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    placeholder="Street Address"
                    className="address-input"
                  />
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="address-input"
                  />
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    className="address-input"
                  />
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="Pincode"
                    className="address-input"
                    maxLength="6"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    placeholder="Phone Number"
                    className="address-input"
                    maxLength="10"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              type="submit"
              className={
                !data || data?.items.length <= 0 || !auth
                  ? "checkout-btn disabled"
                  : "checkout-btn"
              }
              disabled={!data || data?.items.length <= 0 || !auth}
            >
              checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartLayout;