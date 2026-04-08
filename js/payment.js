// ========================================
// MILASTY PAYMENT HANDLER (UPDATED)
// ========================================

const API_BASE = "https://milasty-backend-production-5de1.up.railway.app";

let paymentProcessing = false;


// ========================================
// START CHECKOUT
// ========================================

async function startCheckout() {

  try {

    if (paymentProcessing) return;

    const name =
      document.querySelector('input[placeholder="Name"]')?.value.trim() || "";

    const phone =
      document.querySelector('input[placeholder="Phone"]')?.value.trim() || "";

    const address =
      document.querySelector("textarea")?.value.trim() || "";

    const pincode =
      document.getElementById("pincode")?.value.trim() || "";

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all details.");
      return;
    }

    const cart = getCart();

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // 🔴 VALIDATE IDs
    for (const item of cart) {
      if (!item.id || item.id.length < 10) {
        console.error("❌ Invalid product ID:", item);
        alert("Cart error. Please refresh.");
        return;
      }
    }

    // ========================================
    // CREATE ORDER FIRST (BACKEND CALCULATES TOTAL)
    // ========================================

    const items = cart.map(item => ({
      product_id: item.id,
      qty: item.qty
    }));

    const orderResponse = await fetch(
      API_BASE + "/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          pincode,
          items,
          token: Date.now().toString()
        })
      }
    );

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(orderData.error || "Order creation failed");
    }

    console.log("✅ Order created:", orderData.orderNumber);

    // ========================================
    // NOW CREATE PAYMENT ORDER (OPTIONAL FLOW)
    // ========================================

    const paymentOrder = await fetch(
      API_BASE + "/create-payment-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderNumber: orderData.orderNumber
        })
      }
    );

    const paymentData = await paymentOrder.json();

    if (!paymentOrder.ok) {
      throw new Error("Payment order failed");
    }

    // ========================================
    // RAZORPAY
    // ========================================

    const options = {

      key: "rzp_test_SP8e1esl7ob6bm",

      amount: paymentData.amount,
      currency: "INR",

      name: "MILASTY",
      description: "Millet Cookie Ritual",

      order_id: paymentData.razorpayOrderId,

      handler: async function (response) {

        if (paymentProcessing) return;

        paymentProcessing = true;

        await verifyPayment(response, orderData.orderNumber);

      },

      prefill: {
        name: name,
        contact: phone
      },

      theme: {
        color: "#8b5e34"
      }

    };

    const rzp = new Razorpay(options);
    rzp.open();

  }

  catch (err) {

    console.error("Checkout error:", err);

    alert("Checkout failed:\n" + err.message);

  }

}



// ========================================
// VERIFY PAYMENT
// ========================================

async function verifyPayment(paymentData, orderNumber) {

  try {

    const verifyResponse = await fetch(
      API_BASE + "/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          orderNumber

        })
      }
    );

    const result = await verifyResponse.json();

    if (result.success) {

      alert("Payment successful 🎉");

      clearCart();

      window.location.href = "/thankyou.html";

    } else {

      alert("Payment verification failed");

    }

  }

  catch (err) {

    console.error("Verification error:", err);

    alert("Payment verification failed.");

  }

  finally {

    paymentProcessing = false;

  }

}



// ========================================
// CONNECT BUTTON
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("continueCheckout");

  if (btn) {
    btn.addEventListener("click", startCheckout);
  }

});
