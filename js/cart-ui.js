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
let cartSummaryContainer;
let basketCount;

// ------------------------------
// Initialize
// ------------------------------
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


// ------------------------------
// Open Cart
// ------------------------------
function openCart() {

  const overlay = document.getElementById("cartOverlay");

  if (overlay) overlay.classList.add("active");
  if (drawer) drawer.classList.add("active");

  document.body.classList.add("cart-open");
}


// ------------------------------
// Close Cart
// ------------------------------
function closeCart() {

  const overlay = document.getElementById("cartOverlay");

  if (overlay) overlay.classList.remove("active");
  if (drawer) drawer.classList.remove("active");

  document.body.classList.remove("cart-open");
}


// ------------------------------
// Render Cart
// ------------------------------
function renderCart() {

  const cart = getCart();

  const basket = document.querySelector(".floating-basket");

  if (basket) {
    basket.style.display = cart.length > 0 ? "flex" : "none";
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
    <div class="cart-item-name">
      ${item.name}
    </div>
  
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
      changeQty(item.name, item.type, -1);
    };

    row.querySelector(".plus").onclick = () => {
      changeQty(item.name, item.type, 1);
    };

    row.querySelector(".remove-btn").onclick = () => {
      removeItem(item.name, item.type);
    };

    cartItemsContainer.appendChild(row);
  });

  if (basketCount) {
    basketCount.innerText = getCartCount();
  }

  renderSummary();
}


// ------------------------------
// Delivery Charge Logic
// ------------------------------
function getDeliveryCharge(cartTotal, cart) {

  if (cartTotal >= 799) return 0;

  const hasNormalProduct = cart.some(item => item.type === "normal");

  if (hasNormalProduct) return 60;

  return 0;
}


// ------------------------------
// Render Summary
// ------------------------------
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


// ------------------------------
// Delivery Form View
// ------------------------------
function showDelivery() {

  document.getElementById("cart-items").style.display = "none";
  document.getElementById("cart-summary").style.display = "none";

  document.querySelector(".continue-btn").style.display = "none";

  document.getElementById("delivery-section").style.display = "block";
}


// ------------------------------
// Back to Cart
// ------------------------------
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

  const cart = getCart();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if (!name || !phone || !address) {
    alert("Please fill all delivery details");
    return;
  }

  let message = `MILASTY Order\n\n`;

  cart.forEach(item => {

    message += `${item.name}\n`;
    message += `Qty: ${item.qty}\n`;
    message += `Price: ₹${item.price * item.qty}\n\n`;

  });

  const subtotal = getCartTotal();
  const delivery = getDeliveryCharge(subtotal, cart);
  const total = subtotal + delivery;

  message += `Subtotal: ₹${subtotal}\n`;
  message += `Delivery: ${delivery === 0 ? "Free" : "₹" + delivery}\n`;
  message += `Total: ₹${total}\n\n`;

  message += `Name: ${name}\n`;
  message += `Phone: ${phone}\n`;
  message += `Address: ${address}`;

  const encoded = encodeURIComponent(message);

  window.open(`https://wa.me/918927142056?text=${encoded}`, "_blank");
}



// ------------------------------
// MILASTY Guidelines Popup
// ------------------------------
function openGuidelines() {

  const overlay = document.getElementById("guidelinesOverlay");

  if (overlay) overlay.style.display = "flex";

}

function closeGuidelines() {

  const overlay = document.getElementById("guidelinesOverlay");

  if (overlay) overlay.style.display = "none";

}

function confirmGuidelines() {

  const overlay = document.getElementById("guidelinesOverlay");

  if (overlay) overlay.style.display = "none";

  sendOrder();

}




// ------------------------------
// Make functions available globally
// ------------------------------
window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.showDelivery = showDelivery;
window.showCartItems = showCartItems;
window.sendOrder = sendOrder;
