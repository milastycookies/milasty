// ========================================
// MILASTY PAYMENT SYSTEM
// ========================================

let paymentRunning = false;


/* ---------------------------------------
START PAYMENT
--------------------------------------- */

async function startPayment(orderData){

  if(paymentRunning) return;

  paymentRunning = true;

  try{

    const amount = orderData.total;

    if(!amount || amount <= 0){

      alert("Invalid payment amount");
      paymentRunning = false;
      return;

    }

    /* ---------------------------------------
    CREATE RAZORPAY ORDER
    --------------------------------------- */

    const paymentOrder =
    await createPaymentOrder(amount);

    if(!paymentOrder || !paymentOrder.id){

      throw new Error("Failed to create payment order");

    }

    /* ---------------------------------------
    RAZORPAY CHECKOUT OPTIONS
    --------------------------------------- */

    const options = {

      key: "rzp_test_S4Y2x0gLxkyVYq",   // Replace with LIVE key before launch

      amount: paymentOrder.amount,

      currency: paymentOrder.currency,

      name: "MILASTY",

      description: "Millet Cookie Order",

      order_id: paymentOrder.id,

      prefill: {

        name: orderData.name || "",

        contact: orderData.phone || ""

      },

      theme: {
        color: "#6B4F2B"
      },


      /* ---------------------------------------
      PAYMENT SUCCESS HANDLER
      --------------------------------------- */

      handler: async function(response){

        try{

          /* ---------------------------------------
          VERIFY PAYMENT
          --------------------------------------- */

          const verifyResult =
          await verifyPayment({

            razorpay_payment_id:
            response.razorpay_payment_id,

            razorpay_order_id:
            response.razorpay_order_id,

            razorpay_signature:
            response.razorpay_signature

          });


          if(!verifyResult || verifyResult.status !== "success"){

            alert("Payment verification failed");

            paymentRunning = false;
            return;

          }


          /* ---------------------------------------
          PAYMENT VERIFIED
          CREATE ORDER
          --------------------------------------- */

          await createOrder(orderData);

          clearCart();

          alert(
            "Payment successful! Your MILASTY order has been confirmed."
          );

          paymentRunning = false;


        }catch(err){

          console.error(
            "Payment verification error",
            err
          );

          alert(
            "Payment succeeded but order processing failed. Please contact support."
          );

          paymentRunning = false;

        }

      }


    };


    /* ---------------------------------------
    OPEN RAZORPAY
    --------------------------------------- */

    const rzp = new Razorpay(options);


    rzp.on("payment.failed", function(response){

      console.error("Payment failed:", response);

      alert(
        "Payment failed. Please try again."
      );

      paymentRunning = false;

    });


    rzp.open();


  }catch(err){

    console.error("Payment error:", err);

    alert(
      "Unable to start payment. Please try again."
    );

    paymentRunning = false;

  }

}
