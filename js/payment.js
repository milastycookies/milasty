// ========================================
// MILASTY PAYMENT — RAZORPAY FLOW
// Handles: create-order → create-payment-order
// → Razorpay modal → verify-payment.
//
// NOT yet connected to a button in
// production. When ready, add a button
// with id="continueCheckout" to your
// checkout page and this file wires it up.
//
// Does NOT define startCheckout globally —
// uses an internal name to avoid colliding
// with checkout.js.
// ========================================

let paymentProcessing = false;


// ========================================
// RAZORPAY CHECKOUT FLOW
// Internal name — not on window.
// ========================================

async function startPaymentFlow() {

  if (paymentProcessing) return;

  const btn = document.getElementById("continueCheckout");

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Processing...";
  }

  try {

    const name    = document.querySelector('input[placeholder="Name"]')?.value.trim()
                 || document.getElementById("name")?.value.trim()
                 || "";

    const phone   = document.querySelector('input[placeholder="Phone"]')?.value.trim()
                 || document.getElementById("phone")?.value.trim()
                 || "";

    const address = document.querySelector("textarea")?.value.trim()
                 || document.getElementById("address")?.value.trim()
                 || "";

    const pincode = document.getElementById("pincode")?.value.trim() || "";

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all details.");
      return;
    }

    const cart = getCart();

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    for (const item of cart) {
      if (!item.slug || typeof item.slug !== "string") {
        console.error("Invalid product slug:", item);
        alert("Cart error. Please refresh.");
        return;
      }
    }

    const API_BASE = window.MILASTY_CONFIG?.API_BASE ||
      "https://milasty-backend-production-5de1.up.railway.app";

    // ── Step 1: Create the order in our DB ──────────────────────────

    const items = cart.map(item => ({
      product_id: item.slug,
      qty: item.qty
    }));

    const orderResponse = await fetch(API_BASE + "/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, phone, address, pincode,
        items,
        token: Date.now().toString()
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(orderData.error || "Order creation failed");
    }

    console.log("Order created:", orderData.orderNumber);

    // ── Step 2: Create Razorpay order (backend fetches total from DB) ─

    const paymentResponse = await fetch(API_BASE + "/create-payment-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: orderData.orderNumber })
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      throw new Error(paymentData.error || "Payment order creation failed");
    }

    // ── Step 3: Open Razorpay modal ──────────────────────────────────
    // Key is returned by the backend (never hard-coded here)

    const options = {

      key: paymentData.razorpayKeyId,

      amount: paymentData.amount,
      currency: paymentData.currency || "INR",

      name: "MILASTY",
      description: "Millet Cookie Ritual",

      order_id: paymentData.razorpayOrderId,

      handler: async function (response) {

        if (paymentProcessing) return;

        paymentProcessing = true;

        await verifyRazorpayPayment(response, {
          orderNumber: orderData.orderNumber,
          name,
          phone,
          address
        });

      },

      prefill: {
        name: name,
        contact: phone
      },

      theme: {
        color: "#8b5e34"
      },

      modal: {
        ondismiss: function () {
          // Re-enable button if user closes the modal without paying
          resetPaymentButton();
        }
      }

    };

    const rzp = new Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.error("Payment failed:", response.error);
      alert("Payment failed: " + response.error.description);
      paymentProcessing = false;
      resetPaymentButton();
    });

    rzp.open();

  } catch (err) {

    console.error("Payment checkout error:", err);

    alert("Checkout failed: " + err.message);

    resetPaymentButton();

  }

}


// ========================================
// VERIFY PAYMENT
// ========================================

async function verifyRazorpayPayment(paymentResponse, orderInfo) {

  try {

    const API_BASE = window.MILASTY_CONFIG?.API_BASE ||
      "https://milasty-backend-production-5de1.up.railway.app";

    const verifyResponse = await fetch(API_BASE + "/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id:   paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature:  paymentResponse.razorpay_signature,
        orderData: {
          name:    orderInfo.name,
          phone:   orderInfo.phone,
          address: orderInfo.address
        }
      })
    });

    const result = await verifyResponse.json();

    // Backend returns { status: "success" } — check status field not result.success
    if (result.status === "success") {

      alert("Payment successful 🎉");

      clearCart();

      window.location.href = "/thankyou.html";

    } else {

      console.error("Verification returned non-success:", result);

      alert("Payment verification failed. Please contact support with Order ID: " +
        orderInfo.orderNumber);

    }

  } catch (err) {

    console.error("Verification error:", err);

    alert("Payment verification failed. Please contact support.");

  } finally {

    paymentProcessing = false;

  }

}


// ========================================
// HELPERS
// ========================================

function resetPaymentButton() {
  const btn = document.getElementById("continueCheckout");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Pay Now";
  }
}


// ========================================
// BIND TO BUTTON ON PAGE LOAD
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("continueCheckout");

  if (btn) {
    btn.addEventListener("click", startPaymentFlow);
  }

});
