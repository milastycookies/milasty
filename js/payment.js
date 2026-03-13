// ========================================
// MILASTY PAYMENT HANDLER
// ========================================

const API_BASE = "https://milasty.com";

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

    if (!name || !phone || !address) {
      alert("Please fill name, phone and address.");
      return;
    }

    const cart = getCart();

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    let subtotal = 0;

    cart.forEach(item => {

      const price =
        Number(item.price ??
        item.variantPrice ??
        item.priceInr ??
        0);

      const quantity =
        Number(item.quantity ??
        item.qty ??
        1);

      subtotal += price * quantity;

    });

    const delivery = subtotal >= 799 ? 0 : 60;
    const total = subtotal + delivery;

    if (!total || isNaN(total)) {
      alert("Cart total calculation failed.");
      return;
    }

    // ========================================
    // CREATE RAZORPAY ORDER
    // ========================================

    const orderResponse = await fetch(
      API_BASE + "/create-payment-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cart: cart
        })
      }
    );

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {

      throw new Error(
        orderData.error ||
        "Backend rejected order creation"
      );

    }

    if (!orderData.razorpayOrderId) {
      throw new Error("Invalid order response from backend");
    }

    // ========================================
    // OPEN RAZORPAY CHECKOUT
    // ========================================

    const options = {

      key: "rzp_test_SP8e1esl7ob6bm",

      amount: orderData.amount,

      currency: "INR",

      name: "MILASTY",

      description: "Millet Cookie Ritual",

      order_id: orderData.razorpayOrderId,

      handler: async function (response) {

        if (paymentProcessing) return;

        paymentProcessing = true;

        await verifyPayment(response, {
          name,
          phone,
          address,
          cart,
          subtotal,
          delivery,
          total
        });

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

    alert(
      "Checkout error:\n" +
      err.message
    );

  }

}



// ========================================
// VERIFY PAYMENT
// ========================================

async function verifyPayment(paymentData, orderData) {

  try {

    const verifyResponse = await fetch(
      API_BASE + "/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          razorpay_order_id:
            paymentData.razorpay_order_id,

          razorpay_payment_id:
            paymentData.razorpay_payment_id,

          razorpay_signature:
            paymentData.razorpay_signature,

          orderData

        })
      }
    );

    if (!verifyResponse.ok) {

      const text = await verifyResponse.text();

      console.error("Verification error:", text);

      throw new Error("Verification failed on server");

    }

    const verifyResult = await verifyResponse.json();

    if (
      verifyResult.success ||
      verifyResult.status === "success"
    ) {

      alert("Payment successful! 🎉");

      clearCart();

      window.location.href = "/thankyou.html";

    }
    else {

      alert("Payment verification failed.");

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
// CONNECT CONTINUE BUTTON
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("continueCheckout");

  if (btn) {
    btn.addEventListener("click", startCheckout);
  }

});
