// ========================================
// MILASTY PAYMENT HANDLER
// ========================================

function startPayment(order, orderData){

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

        if(verifyResult.status !== "verified"){

          alert("Payment verification failed");

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

        renderCart();
        updateBasket();

        closeCart();

        alert("Payment successful! Your order has been confirmed.");

      }catch(e){

        console.error("Payment flow error", e);

        alert("Order processing failed. Please contact support.");

      }

    }

  };

  const rzp = new Razorpay(options);

  rzp.open();

}
