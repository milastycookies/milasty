// ========================================
// MILASTY CHECKOUT CONTROLLER (SIMPLIFIED)
// ========================================

let checkoutRunning = false;

// 🌟 STORE LAST ORDER DATA (for WhatsApp after guidelines)
let lastOrderData = null;

// ========================================
// MAIN CHECKOUT FLOW
// ========================================
window.handleOrder = async function () {

  const btn = document.getElementById("orderBtn");
  if (btn) btn.disabled = true;

  try {
    await startCheckout();
  } finally {
    if (btn) btn.disabled = false;
  }

};

// ========================================
// CHECKOUT FUNCTION (MODIFIED)
// ========================================
async function startCheckout(orderToken){

  if(checkoutRunning) return;

  checkoutRunning = true;

  const name = document.getElementById("name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const pincode = document.getElementById("pincode")?.value.trim();

  if(!name || !phone || !address || !pincode){

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

  // 🔴 STRICT VALIDATION
  for (const item of cart) {
    if (!item.id || item.id.length < 10) {
      console.error("❌ Invalid product ID:", item);
      alert("Cart error. Please refresh and try again.");
      checkoutRunning = false;
      return;
    }
  }

  // 🔥 ONLY SEND product_id + qty
  const items = cart.map(item => ({
    product_id: item.id,
    qty: item.qty
  }));

  try {

    const response = await fetch(
      "https://milasty-backend-production-5de1.up.railway.app/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          pincode,
          items,
          token: orderToken || Date.now().toString()
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Backend error:", result);
      throw new Error(result.error || "Order failed");
    }

    console.log("✅ Order created:", result.orderNumber);

    // ✅ STORE DATA FOR WHATSAPP (instead of sending immediately)
    lastOrderData = {
      name,
      phone,
      address,
      pincode,
      cart
    };

    // ✅ SHOW GUIDELINES POPUP
    openGuidelines();

  } catch (err) {

    console.error("ORDER ERROR:", err);
    alert("Order failed. Please try again.");

  } finally {
    checkoutRunning = false;
  }

}

// ========================================
// GUIDELINES POPUP CONTROLS
// ========================================
window.openGuidelines = function () {
  const el = document.getElementById("guidelinesOverlay");
  if (el) el.style.display = "flex";
};

window.closeGuidelines = function () {
  const el = document.getElementById("guidelinesOverlay");
  if (el) el.style.display = "none";
};

// ========================================
// FINAL CONFIRM → WHATSAPP
// ========================================
window.confirmOrderAndSendWhatsApp = function () {

  if (!lastOrderData) {
    alert("Something went wrong. Please try again.");
    return;
  }

  const { name, phone, address, pincode, cart, orderNumber } = lastOrderData;

  let message = `Hi MILASTY, I want to confirm my order:\n\n`;

  if (orderNumber) {
    message += `Order ID: ${orderNumber}\n\n`;
  }

  cart.forEach(item => {
    message += `• ${item.name} x${item.qty}\n`;
  });

  message += `\nName: ${name}`;
  message += `\nPhone: ${phone}`;
  message += `\nAddress: ${address}`;
  if (pincode) message += ` (${pincode})`;

  const encoded = encodeURIComponent(message);

  window.open(`https://wa.me/918927142056?text=${encoded}`, "_blank");

  // ✅ CLEANUP
  clearCart();
  lastOrderData = null;

  closeGuidelines();
};
