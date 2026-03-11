// ========================================
// MILASTY CHECKOUT CONTROLLER
// ========================================

let checkoutRunning = false;

async function startCheckout(orderToken){

  if(checkoutRunning) return;

  checkoutRunning = true;

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if(!name || !phone || !address){

    alert("Please fill all details");

    checkoutRunning = false;

    return;

  }

  const cart = getCart();

  if(cart.length === 0){

    alert("Your cart is empty");

    checkoutRunning = false;

    return;

  }

  /* -----------------------------
     CALCULATE TOTAL
  ----------------------------- */

  let subtotal = 0;
  let freeDelivery = false;

  cart.forEach(item => {

    subtotal += item.price * item.qty;

    if(item.type === "gift"){
      freeDelivery = true;
    }

  });

  let delivery = 60;

  if(subtotal >= 799 || freeDelivery){
    delivery = 0;
  }

  const finalTotal = subtotal + delivery;

  /* -----------------------------
     DATE & TIME
  ----------------------------- */

  const now = new Date();

  const orderDate =
  now.toISOString().split("T")[0];

  const orderTime =
  now.toLocaleTimeString("en-IN",{
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hour12:false
  });

  /* -----------------------------
     ORDER OBJECT
  ----------------------------- */

  const orderData = {

    token: orderToken,

    date: orderDate,
    time: orderTime,
    timestamp: Date.now(),

    name,
    phone,
    address,

    items: cart,

    subtotal,
    delivery,
    total: finalTotal,

    source: "milasty_website"

  };

  /* -----------------------------
     CREATE PAYMENT ORDER
  ----------------------------- */

  const paymentOrder =
  await createPaymentOrder(finalTotal);

  /* -----------------------------
     START PAYMENT
  ----------------------------- */

  startPayment(paymentOrder, orderData);

}
