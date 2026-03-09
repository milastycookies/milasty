// ========================================
// MILASTY BACKEND API
// ========================================

const API_BASE =
"https://milasty-backend-production-5de1.up.railway.app";

/* ---------------------------------------
GENERIC REQUEST
--------------------------------------- */

async function apiRequest(endpoint, payload){

  const response = await fetch(

    API_BASE + endpoint,

    {
      method: "POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify(payload)

    }

  );

  if(!response.ok){
    throw new Error("API error");
  }

  return response.json();

}

/* ---------------------------------------
CREATE PAYMENT ORDER
--------------------------------------- */

async function createPaymentOrder(amount){

  return apiRequest(
    "/create-payment-order",
    { amount }
  );

}

/* ---------------------------------------
VERIFY PAYMENT
--------------------------------------- */

async function verifyPayment(paymentData){

  return apiRequest(
    "/verify-payment",
    paymentData
  );

}

/* ---------------------------------------
CREATE ORDER
--------------------------------------- */

async function createOrder(orderData){

  return apiRequest(
    "/create-order",
    orderData
  );

}
