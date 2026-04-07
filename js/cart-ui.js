// ========================================
// MILASTY CART UI (ID-BASED)
// ========================================

let drawer;
let cartItemsContainer;
let cartSummaryContainer;
let basketCount;

// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  drawer = document.getElementById("cartDrawer");
  cartItemsContainer = document.getElementById("cart-items");
  cartSummaryContainer = document.getElementById("cart-summary");
  basketCount = document.getElementById("basket-count");

  const overlay = document.getElementById("cartOverlay");
  const basket = document.querySelector(".floating-basket");

  if (overlay) overlay.onclick = closeCart;
  if (basket) basket.addEventListener("click", openCart);

  renderCart();

  window.addEventListener("cartUpdated", renderCart);

});

// ========================================
// OPEN / CLOSE CART
// ========================================

function openCart() {
  const overlay = document.getElementById("cartOverlay");
  const basket = document.querySelector(".floating-basket");

  if (overlay) overlay.classList.add("active");
  if (drawer) drawer.classList.add("active");

  document.body.classList.add("cart-open");

  if (basket) basket.style.display = "none";
}

function closeCart() {
  const overlay = document.getElementById("cartOverlay");
  const basket = document.querySelector(".floating-basket");

  if (overlay) overlay.classList.remove("active");
  if (drawer) drawer.classList.remove("active");

  document.body.classList.remove("cart-open");

  renderCart();
}

// ========================================
// RENDER CART
// ========================================

function renderCart() {

  const cart = getCart();
  const basket = document.querySelector(".floating-basket");

  if (basket) {
    if (document.body.classList.contains("cart-open")) {
      basket.style.display = "none";
    } else {
      basket.style.display = cart.length > 0 ? "flex" : "none";
    }
  }

  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {

    cartItemsContainer.innerHTML =
      "<p style='text-align:center'>Your basket is empty</p>";

    if (basketCount) basketCount.innerText = "0";

    renderSummary();
    return;
  }

  cart.forEach(item => {

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div class="cart-item-name">${item.name}</div>

      <div class="cart-item-controls">

        <div class="cart-item-qty">
          <button class="qty-btn minus">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn plus">+</button>
        </div>

        <div class="cart-item-price">
          ₹${item.price * item.qty}
        </div>

        <button class="remove-btn">Remove</button>

      </div>
    `;

    row.querySelector(".minus").onclick = () => {
      changeQty(item.id, -1);   // 🔥 FIXED
    };

    row.querySelector(".plus").onclick = () => {
      changeQty(item.id, 1);    // 🔥 FIXED
    };

    row.querySelector(".remove-btn").onclick = () => {
      removeItem(item.id);      // 🔥 FIXED
    };

    cartItemsContainer.appendChild(row);

  });

  if (basketCount) {
    basketCount.innerText = getCartCount();
  }

  renderSummary();
}

// ========================================
// DELIVERY LOGIC (UI ONLY)
// ========================================

function getDeliveryCharge(cartTotal, cart) {

  if (cartTotal >= 799) return 0;

  const hasRegular = cart.some(item => item.type === "regular");

  if (hasRegular) return 60;

  return 0;
}

// ========================================
// RENDER SUMMARY
// ========================================

function renderSummary() {

  if (!cartSummaryContainer) return;

  const cart = getCart();

  const subtotal = getCartTotal();
  const delivery = getDeliveryCharge(subtotal, cart);
  const total = subtotal + delivery;

  cartSummaryContainer.innerHTML = `
    <div class="cart-summary-row">
      <span>Subtotal</span>
      <span>₹${subtotal}</span>
    </div>

    <div class="cart-summary-row">
      <span>Delivery</span>
      <span>${delivery === 0 ? "Free" : "₹" + delivery}</span>
    </div>

    <div class="cart-summary-total">
      <span>Total</span>
      <span>₹${total}</span>
    </div>
  `;
}

// ========================================
// SEND ORDER (CRITICAL FIX)
// ========================================

async function sendOrder() {
  try {
    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const pincode = document.getElementById("pincode")?.value.trim();

    const cart = window.getCart();

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all details");
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    // 🔥 ONLY SEND ID + QTY
    const items = cart.map(item => ({
      id: item.id,
      qty: item.qty
    }));

    const response = await fetch("https://milasty-backend-production-5de1.up.railway.app/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        phone,
        address,
        pincode,
        items,    // 🔥 FIXED
        token: Date.now().toString()
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Order failed");
    }

    console.log("Order stored:", result.orderNumber);

    // WhatsApp message (UI only)
    let message = `Hi MILASTY, I want to confirm my order:\n\n`;

    cart.forEach(item => {
      message += `• ${item.name} x${item.qty}\n`;
    });

    message += `\nName: ${name}`;
    message += `\nPhone: ${phone}`;
    message += `\nAddress: ${address}`;
    if (pincode) message += ` (${pincode})`;

    const encoded = encodeURIComponent(message);

    window.open(`https://wa.me/918927142056?text=${encoded}`, "_blank");

    window.clearCart();

  } catch (err) {
    console.error(err);
    alert("Order failed. Please try again.");
  }
}

// ========================================
// GLOBAL
// ========================================

window.openCart = openCart;
window.closeCart = closeCart;
window.showDelivery = showDelivery;
window.showCartItems = showCartItems;
window.sendOrder = sendOrder;
