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
  cartItemsContainer = document.getElementById("cartItems");
  cartTotal = document.getElementById("cartTotal");
  cartCount = document.getElementById("cartCount");

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
      "<p style='text-align:center'>Cart is empty</p>";
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
    cartTotal.innerText = "₹" + getCartTotal();
  }

  if (cartCount) {
    cartCount.innerText = getCartCount();
  }
}
