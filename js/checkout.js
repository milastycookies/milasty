// ========================================
// MILASTY CHECKOUT CONTROLLER (FINAL FIXED)
// ========================================

let checkoutRunning = false;

// 🌟 STORE LAST ORDER DATA (for WhatsApp after guidelines)
let lastOrderData = null;

// ========================================
// MAIN CHECKOUT FLOW
// ========================================
window.handleOrder = async function () {

  const btn = document.getElementById("orderBtn");

  // 🚫 Prevent double click
  if (btn && btn.disabled) return;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Processing...";
  }

  try {
    await startCheckout();
  } catch (err) {
    console.error(err);
  } finally {
    // ❗ Do NOT re-enable immediately
    // Let flow complete (popup → confirm → WhatsApp/payment)
  }

};



window.confirmGuidelines = function () {

  const confirmBtn = document.getElementById("confirmBtn");

  // 🚫 Prevent double click
  if (confirmBtn && confirmBtn.disabled) return;

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerText = "Please wait...";
  }

  // Close popup
  const el = document.getElementById("guidelinesOverlay");
  if (el) el.style.display = "none";

  // 👉 Choose your flow

  // For Razorpay:
  startCheckout();

  // OR for WhatsApp:
  // confirmOrderAndSendWhatsApp();
};


catch (err) {
  alert("Something went wrong");

  const btn = document.getElementById("orderBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Send Order on WhatsApp";
  }
}

// ========================================
// CHECKOUT FUNCTION
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

  // ✅ VALIDATE USING SLUG (CORRECT)
  for (const item of cart) {
    if (!item.slug || typeof item.slug !== "string") {
      console.error("❌ Invalid product slug:", item);
      alert("Cart error. Please refresh and try again.");
      checkoutRunning = false;
      return;
    }
  }

  // ✅ SEND SLUG AS product_id
  const items = cart.map(item => ({
    product_id: item.slug,
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

    // ✅ STORE DATA FOR WHATSAPP
    lastOrderData = {
      name,
      phone,
      address,
      pincode,
      cart,
      orderNumber: result.orderNumber
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

  // ✅ USE PRODUCT MAP (from cart-ui.js)
  cart.forEach(item => {
    const product = window.PRODUCT_SLUG_MAP?.[item.slug];

    const productName = product ? product.name : item.slug;

    message += `• ${productName} x${item.qty}\n`;
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
