// ========================================
// MILASTY CART UI
// ========================================

import {
  getCart,
  changeQty,
  removeItem,
  getCartTotal,
  getCartCount,
  addToCart
} from "./cart.js";

let drawer;
let cartItemsContainer;
let cartTotal;
let cartCount;

// ------------------------------
// Initialize
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  drawer = document.getElementById("cartDrawer");
  cartItemsContainer = document.getElementById("cart-items");
  cartTotal = document.getElementById("cart-summary");
  cartCount = document.getElementById("basket-count");

  renderCart();

  window.addEventListener("cartUpdated", renderCart);
});

// ------------------------------
// Render cart
// ------------------------------
function renderCart() {

  if (!cartItemsContainer) return;

  const cart = getCart();

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      "<p style='text-align:center'>Your ritual basket is empty</p>";
  }

  cart.forEach(item => {

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div class="cart-item-name">
        ${item.name}
        <small>${item.weight}</small>
      </div>

      <div class="cart-item-qty">
        <button class="qty-btn minus">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn plus">+</button>
      </div>

      <div class="cart-item-price">
        ₹${item.price * item.qty}
      </div>

      <button class="remove-btn">×</button>
    `;

    row.querySelector(".minus").onclick = () => {
      changeQty(item.name, item.weight, -1);
    };

    row.querySelector(".plus").onclick = () => {
      changeQty(item.name, item.weight, 1);
    };

    row.querySelector(".remove-btn").onclick = () => {
      removeItem(item.name, item.weight);
    };

    cartItemsContainer.appendChild(row);
  });

  if (cartTotal) {
    cartTotal.innerHTML = `<strong>Total: ₹${getCartTotal()}</strong>`;
  }

  if (cartCount) {
    cartCount.innerText = getCartCount();
  }
}

// ------------------------------
// Cart Drawer Controls
// ------------------------------
function openCart() {
  if (drawer) drawer.classList.add("open");
}

function closeCart() {
  if (drawer) drawer.classList.remove("open");
}

// ------------------------------
// Delivery Form
// ------------------------------
function showDelivery() {
  document.getElementById("cart-items").style.display = "none";
  document.getElementById("cart-summary").style.display = "none";
  document.querySelector(".continue-btn").style.display = "none";

  document.getElementById("delivery-section").style.display = "block";
}

function showCartItems() {
  document.getElementById("cart-items").style.display = "block";
  document.getElementById("cart-summary").style.display = "block";
  document.querySelector(".continue-btn").style.display = "block";

  document.getElementById("delivery-section").style.display = "none";
}

// ------------------------------
// WhatsApp Order
// ------------------------------
function sendOrder() {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  const cart = getCart();

  if (!name || !phone || !address) {
    alert("Please fill all details");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  let message = "Hello MILASTY,%0A%0AI would like to order:%0A";

  cart.forEach(item => {
    message += `• ${item.name} (${item.weight}) x ${item.qty}%0A`;
  });

  message += `%0ATotal: ₹${getCartTotal()}%0A%0A`;
  message += `Name: ${name}%0A`;
  message += `Phone: ${phone}%0A`;
  message += `Address: ${address}`;

  const url =
    "https://wa.me/918927142056?text=" + message;

  window.open(url, "_blank");
}

// ------------------------------
// Expose functions to HTML
// ------------------------------
window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.showDelivery = showDelivery;
window.showCartItems = showCartItems;
window.sendOrder = sendOrder;
