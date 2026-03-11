// ========================================
// MILASTY CART UI
// ========================================

import { getCart, changeQty, removeItem, addToCart } from "./cart.js";
import { startCheckout } from "./checkout.js";

/* expose functions to HTML buttons */

window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;

let orderToken = null;

/* ----------------------------------------
INIT
---------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  renderCart();
  updateBasket();

  const overlay = document.getElementById("cartOverlay");
  if(overlay){
    overlay.addEventListener("click", closeCart);
  }

  const guideOverlay = document.getElementById("guidelinesOverlay");

  if(guideOverlay){
    guideOverlay.addEventListener("click",(e)=>{
      if(e.target === guideOverlay){
        closeGuidelines();
      }
    });
  }

});

/* ----------------------------------------
RENDER CART
---------------------------------------- */

function renderCart(){

  const cart = getCart();

  const cartContainer = document.getElementById("cart-items");
  const summaryContainer = document.getElementById("cart-summary");

  if(!cartContainer || !summaryContainer) return;

  let html = "";
  let subtotal = 0;
  let freeDelivery = false;

  cart.forEach(item => {

    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    if(item.type === "gift"){
      freeDelivery = true;
    }

    html += `
    <div class="cart-item">

      <div class="cart-item-details">

        <div class="cart-item-title">${item.name}</div>

        <div class="cart-item-price">
          ₹${item.price} × ${item.qty} = ₹${itemTotal}
        </div>

      </div>

      <div class="qty-controls">

        <button onclick="changeQty('${item.name}',-1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty('${item.name}',1)">+</button>

        <button class="cart-remove"
        onclick="removeItem('${item.name}')">
        Remove
        </button>

      </div>

    </div>
    `;

  });

  cartContainer.innerHTML = html;

  renderSummary(subtotal, freeDelivery);

  updateBasket();

}

/* ----------------------------------------
SUMMARY
---------------------------------------- */

function renderSummary(subtotal, freeDelivery){

  const summary = document.getElementById("cart-summary");

  let delivery = 60;

  if(subtotal >= 799 || freeDelivery){
    delivery = 0;
  }

  const total = subtotal + delivery;

  let message = "";

  if(freeDelivery){
    message = "🎁 Gift Ritual includes FREE delivery";
  }
  else if(subtotal >= 799){
    message = "🚚 Free delivery unlocked!";
  }
  else{
    message = `Add ₹${799 - subtotal} more to unlock FREE delivery`;
  }

  summary.innerHTML = `
    <p>Subtotal: ₹${subtotal}</p>
    <p>Delivery: ${delivery === 0 ? "FREE" : "₹60"}</p>
    <p><strong>Total: ₹${total}</strong></p>
    <p>${message}</p>
  `;

}

/* ----------------------------------------
BASKET
---------------------------------------- */

function updateBasket(){

  const basket = document.querySelector(".floating-basket");
  const count = document.getElementById("basket-count");

  if(!basket || !count) return;

  const cart = getCart();

  const totalQty =
  cart.reduce((sum,item)=>sum+item.qty,0);

  count.innerText = totalQty;

  const drawer = document.getElementById("cartDrawer");

  if(totalQty > 0 && !drawer.classList.contains("active")){
    basket.style.display = "flex";
  }else{
    basket.style.display = "none";
  }

}

/* ----------------------------------------
DRAWER
---------------------------------------- */

window.openCart = function(){

  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");

  if(drawer) drawer.classList.add("active");
  if(overlay) overlay.classList.add("active");

  document.body.classList.add("cart-open");

}

window.closeCart = function(){

  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");

  if(drawer) drawer.classList.remove("active");
  if(overlay) overlay.classList.remove("active");

  document.body.classList.remove("cart-open");

}

/* ----------------------------------------
CHECKOUT BUTTON
---------------------------------------- */

window.sendOrder = function(){

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if(!name || !phone || !address){
    alert("Please fill all details");
    return;
  }

  orderToken =
  "MIL-" + Date.now() + "-" +
  Math.random().toString(36).substring(2,10);

  document
  .getElementById("guidelinesOverlay")
  .classList.add("active");

}

/* ----------------------------------------
GUIDELINES CONFIRM
---------------------------------------- */

window.confirmGuidelines = function(){

  document
  .getElementById("guidelinesOverlay")
  .classList.remove("active");

  startCheckout(orderToken);

}

/* ----------------------------------------
CLOSE GUIDELINES
---------------------------------------- */

function closeGuidelines(){

  document
  .getElementById("guidelinesOverlay")
  .classList.remove("active");

}

/* expose render functions */

window.renderCart = renderCart;
window.updateBasket = updateBasket;
