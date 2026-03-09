// ========================================
// MILASTY BACKEND API
// ========================================

const API_BASE =
"https://milasty-backend-production-5de1.up.railway.app";

const API_KEY =
"milasty_secure_by_kulomulo";

/* ---------------------------------------
GENERIC REQUEST HELPER
--------------------------------------- */

async function apiRequest(endpoint, payload){

  try{

    const response = await fetch(

      API_BASE + endpoint,

      {
        method: "POST",

        headers:{
          "Content-Type":"application/json",
          "x-api-key": API_KEY
        },

        body: JSON.stringify(payload)

      }

    );

    if(!response.ok){

      throw new Error(
        "API error: " + response.status
      );

    }

    return await response.json();

  }catch(error){

    console.error("API request failed:", error);

    throw error;

  }

}

/* ---------------------------------------
CREATE PAYMENT ORDER
--------------------------------------- */

async function createPaymentOrder(amount){

  return apiRequest(
    "/create-payment-order",
    { amount: amount }
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
