// ========================================
// MILASTY BACKEND API
// ========================================

const API_BASE =
"https://milasty-backend-production-5de1.up.railway.app";

const API_KEY =
"milasty_secure_by_kulomulo";


/* ---------------------------------------
CREATE PAYMENT ORDER
--------------------------------------- */

async function createPaymentOrder(amount){

  const response = await fetch(

    API_BASE + "/create-payment-order",

    {
      method: "POST",

      headers:{
        "Content-Type":"application/json",
        "x-api-key": API_KEY
      },

      body: JSON.stringify({
        amount: amount
      })
    }

  );

  return response.json();

}


/* ---------------------------------------
VERIFY PAYMENT
--------------------------------------- */

async function verifyPayment(paymentData){

  const response = await fetch(

    API_BASE + "/verify-payment",

    {
      method:"POST",

      headers:{
        "Content-Type":"application/json",
        "x-api-key": API_KEY
      },

      body: JSON.stringify(paymentData)
    }

  );

  return response.json();

}


/* ---------------------------------------
CREATE ORDER
--------------------------------------- */

async function createOrder(orderData){

  const response = await fetch(

    API_BASE + "/create-order",

    {
      method:"POST",

      headers:{
        "Content-Type":"application/json",
        "x-api-key": API_KEY
      },

      body: JSON.stringify(orderData)
    }

  );

  return response.json();

}
