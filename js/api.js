// ========================================
// MILASTY BACKEND API
// ========================================

const API_BASE =
"https://milasty-backend-production-5de1.up.railway.app";


/* ---------------------------------------
GENERIC REQUEST HELPER
--------------------------------------- */

async function apiRequest(endpoint, payload, extraHeaders = {}){

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000); // 10s timeout

  try{

    const response = await fetch(

      API_BASE + endpoint,

      {
        method: "POST",

        headers:{
          "Content-Type":"application/json",
          ...extraHeaders
        },

        credentials: "include",

        signal: controller.signal,

        body: JSON.stringify(payload)

      }

    );

    clearTimeout(timeout);

    if(!response.ok){

      const text = await response.text();

      throw new Error(
        "API error: " + text
      );

    }

    return await response.json();

  }catch(err){

    console.error("API request failed:", err);

    throw err;

  }

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
    orderData,
    {
      "Idempotency-Key": orderData.token
    }
  );

}
