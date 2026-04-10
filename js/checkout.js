// ========================================
// MILASTY CHECKOUT — WHATSAPP FLOW
// Handles: create-order → guidelines
// popup → WhatsApp redirect.
//
// This file owns the WhatsApp checkout.
// payment.js owns the Razorpay checkout.
// The two flows bind to different buttons
// and use different function names.
// ========================================

let checkoutRunning = false;
let lastOrderData = null;


// ========================================
// ENTRY POINT — bound to #orderBtn
// ========================================

window.handleOrder = async function () {

  const btn = document.getElementById("orderBtn");

  if (btn && btn.disabled) return;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Processing...";
  }

  try {

    await runWhatsAppCheckout();

  } catch (err) {

    console.error("Checkout error:", err);

    alert("Something went wrong. Please try again.");

    resetOrderButton();

  }

};


// ========================================
// WHATSAPP CHECKOUT FLOW
// ========================================

async function runWhatsAppCheckout() {

  if (checkoutRunning) return;

  checkoutRunning = true;

  try {

    const name    = document.getElementById("name")?.value.trim();
    const phone   = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const pincode = document.getElementById("pincode")?.value.trim();

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all details");
      resetOrderButton();
      return;
    }

    const cart = getCart();

    if (!cart || cart.length === 0) {
      alert("Your cart is empty");
      resetOrderButton();
      return;
    }

    // Validate slugs
    for (const item of cart) {
      if (!item.slug || typeof item.slug !== "string") {
        console.error("Invalid product slug:", item);
        alert("Cart error. Please refresh and try again.");
        resetOrderButton();
        return;
      }
    }

    // Map to { product_id, qty } as /create-order expects
    const items = cart.map(item => ({
      product_id: item.slug,
      qty: item.qty
    }));

    const API_BASE = window.MILASTY_CONFIG?.API_BASE ||
      "https://milasty-backend-production-5de1.up.railway.app";

    const response = await fetch(API_BASE + "/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, phone, address, pincode,
        items,
        token: Date.now().toString()
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Backend error:", result);
      throw new Error(result.error || "Order failed");
    }

    console.log("Order created:", result.orderNumber);

    // Store for WhatsApp message construction
    lastOrderData = { name, phone, address, pincode, cart, orderNumber: result.orderNumber };

    openGuidelines();

  } finally {

    checkoutRunning = false;

  }

}


// ========================================
// POPUP CONTROLS
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
// CONFIRM → WHATSAPP REDIRECT
// ========================================

window.confirmOrderAndSendWhatsApp = function () {

  const btn = document.getElementById("confirmBtn");

  if (btn && btn.disabled) return;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Please wait...";
  }

  if (!lastOrderData) {
    alert("Something went wrong. Please try again.");
    resetConfirmButton();
    return;
  }

  const { name, phone, address, pincode, cart, orderNumber } = lastOrderData;

  let message = `Hi MILASTY, I want to confirm my order:\n\n`;

  if (orderNumber) {
    message += `Order ID: ${orderNumber}\n\n`;
  }

  cart.forEach(item => {
    const product = window.PRODUCT_SLUG_MAP?.[item.slug];
    const productName = product ? product.name : item.slug;
    message += `• ${productName} x${item.qty}\n`;
  });

  message += `\nName: ${name}`;
  message += `\nPhone: ${phone}`;
  message += `\nAddress: ${address}`;
  if (pincode) message += ` (${pincode})`;

  const whatsappNumber = window.MILASTY_CONFIG?.WHATSAPP_NUMBER || "918927142056";
  const encoded = encodeURIComponent(message);

  window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, "_blank");

  // Cleanup
  clearCart();
  lastOrderData = null;

  closeGuidelines();

};


// ========================================
// HELPERS
// ========================================

function resetOrderButton() {
  const btn = document.getElementById("orderBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Send Order on WhatsApp";
  }
}

function resetConfirmButton() {
  const btn = document.getElementById("confirmBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "I Understand & Continue";
  }
}
