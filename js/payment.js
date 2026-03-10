// ========================================
// MILASTY PAYMENT HANDLER
// ========================================

let paymentRunning = false;

function startPayment(order, orderData){

  if(paymentRunning) return;

  paymentRunning = true;

  const options = {

    key: "rzp_test_S4Y2x0gLxkyVYq",

    amount: order.amount,
    currency: order.currency,

    order_id: order.id,

    name: "MILASTY",
    description: "Millet Cookie Ritual",

    handler: async function(response){

      try{

        /* ------------------------
           VERIFY PAYMENT
        ------------------------ */

        const verifyResult =
        await verifyPayment(response);

        if(verifyResult.status !== "success"){

          alert("Payment verification failed");

          paymentRunning = false;

          return;

        }

        /* ------------------------
           STORE ORDER
        ------------------------ */

        await createOrder(orderData);

        /* ------------------------
           CLEANUP
        ------------------------ */

        clearCart();

        const nameField = document.getElementById("name");
        const phoneField = document.getElementById("phone");
        const addressField = document.getElementById("address");

        if(nameField) nameField.value = "";
        if(phoneField) phoneField.value = "";
        if(addressField) addressField.value = "";

        if(typeof renderCart === "function"){
          renderCart();
        }

        if(typeof updateBasket === "function"){
          updateBasket();
        }

        if(typeof closeCart === "function"){
          closeCart();
        }

        alert("Payment successful! Your order has been confirmed.");

        paymentRunning = false;

      }catch(e){

        console.error("Payment flow error", e);

        alert("Order processing failed. Please contact support.");

        paymentRunning = false;

      }

    }

  };

  const rzp = new Razorpay(options);

  /* ------------------------
     HANDLE PAYMENT FAILURE
  ------------------------ */

  rzp.on("payment.failed", function (response){

    console.error("Payment failed", response.error);

    alert("Payment failed. Please try again.");

    paymentRunning = false;

  });

  rzp.open();

}
