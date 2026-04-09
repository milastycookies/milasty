// ========================================
// MILASTY CHECKOUT CONTROLLER (FINAL CLEAN)
// ========================================

let checkoutRunning = false;
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
    alert("Something went wrong");

    // 🔁 Re-enable on failure
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Send Order on WhatsApp";
    }
  }

};


// ========================================
// CHECKOUT FUNCTION
// ========================================
async function startCheckout(orderToken){

  if (checkoutRunning) return;

  checkoutRunning = true;

  const name = document.getElementById("name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const pincode = document.getElementById("pincode")?.value.trim();

  if (!name || !phone || !address || !pincode) {
    alert("Please fill all details");
    checkoutRunning = false;

    resetOrderButton();
    return;
  }

  const cart = getCart();

  if (!cart || cart.length === 0) {
    alert("Your cart is empty");
    checkoutRunning = false;

    resetOrderButton();
    return;
  }

  // ✅ VALIDATE SLUG
  for (const item of cart) {
    if (!item.slug || typeof item.slug !== "string") {
      console.error("❌ Invalid product slug:", item);
      alert("Cart error. Please refresh and try again.");
      checkoutRunning = false;

      resetOrderButton();
      return;
    }
  }

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

    // ✅ Store order for WhatsApp
    lastOrderData = {
      name,
      phone,
      address,
      pincode,
      cart,
      orderNumber: result.orderNumber
    };

    openGuidelines();

  } catch (err) {

    console.error("ORDER ERROR:", err);
    alert("Order failed. Please try again.");

    resetOrderButton();

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
// FINAL CONFIRM → WHATSAPP
// ========================================
window.confirmOrderAndSendWhatsApp = function () {

  const btn = document.getElementById("confirmBtn");

  // 🚫 Prevent double click
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

  const encoded = encodeURIComponent(message);

  window.open(`https://wa.me/918927142056?text=${encoded}`, "_blank");

  // ✅ Cleanup
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
