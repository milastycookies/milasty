// ========================================
// MILASTY PAYMENT HANDLER
// ========================================

const API_BASE = "http://localhost:5000";



// ========================================
// START CHECKOUT
// ========================================

async function startCheckout() {

  try {

    const name = document.querySelector('input[placeholder="Name"]')?.value || "";
    const phone = document.querySelector('input[placeholder="Phone"]')?.value || "";
    const address = document.querySelector("textarea")?.value || "";

    if (!name || !phone || !address) {
      alert("Please fill name, phone and address.");
      return;
    }

    // ========================================
    // GET CART FROM CART SYSTEM
    // ========================================

    const cart = getCart();

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // ========================================
    // CALCULATE TOTAL
    // ========================================

    let subtotal = 0;

    cart.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const delivery = subtotal >= 799 ? 0 : 60;
    const total = subtotal + delivery;

    // ========================================
    // CREATE ORDER ON BACKEND
    // ========================================

    const orderResponse = await fetch(
      API_BASE + "/create-payment-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: total
        })
      }
    );

    const orderData = await orderResponse.json();

    if (!orderData.id) {
      throw new Error("Failed to create Razorpay order");
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

      order_id: orderData.orderId,

      handler: async function (response) {

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

          razorpay_order_id: paymentData.razorpay_order_id,

          razorpay_payment_id: paymentData.razorpay_payment_id,

          razorpay_signature: paymentData.razorpay_signature,

          orderData

        })
      }
    );

    const verifyResult = await verifyResponse.json();

    if (verifyResult.success) {

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
