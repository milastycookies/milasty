// ========================================
// MILASTY CART UI
// ========================================

// import {
//   getCart,
//   changeQty,
//   removeItem,
//   getCartTotal,
//   getCartCount,
//   addToCart
// } from "./cart.js";

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
// OPEN CART
// ========================================

function openCart() {

  const overlay = document.getElementById("cartOverlay");
  const basket = document.querySelector(".floating-basket");

  if (overlay) overlay.classList.add("active");
  if (drawer) drawer.classList.add("active");

  document.body.classList.add("cart-open");

  if (basket) basket.style.display = "none";

}



// ========================================
// CLOSE CART
// ========================================

function closeCart() {

  const overlay = document.getElementById("cartOverlay");
  const basket = document.querySelector(".floating-basket");

  if (overlay) overlay.classList.remove("active");
  if (drawer) drawer.classList.remove("active");

  document.body.classList.remove("cart-open");

  renderCart(); // restores basket visibility

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



// ========================================
// DELIVERY CHARGE LOGIC
// ========================================

function getDeliveryCharge(cartTotal, cart) {

  if (cartTotal >= 799) return 0;

  const hasNormalProduct = cart.some(item => item.type === "normal");

  if (hasNormalProduct) return 60;

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
// MOBILE FLOW → SHOW DELIVERY FORM
// ========================================

function showDelivery() {

  const items = document.getElementById("cart-items");
  const continueBtn = document.querySelector(".continue-btn");
  const deliverySection = document.getElementById("delivery-section");

  if (items) items.style.display = "none";
  if (continueBtn) continueBtn.style.display = "none";

  if (deliverySection) deliverySection.style.display = "block";

  if (drawer) drawer.scrollTop = 0;

}



// ========================================
// MOBILE FLOW → BACK TO CART
// ========================================

function showCartItems() {

  const items = document.getElementById("cart-items");
  const continueBtn = document.querySelector(".continue-btn");
  const deliverySection = document.getElementById("delivery-section");

  if (items) items.style.display = "block";
  if (continueBtn) continueBtn.style.display = "block";

  if (deliverySection) deliverySection.style.display = "none";

  if (drawer) drawer.scrollTop = 0;

}



// ========================================
// WHATSAPP ORDER
// ========================================

async function sendOrder() {

  try {

    const cart = getCart();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const pincode: document.getElementById("pincode")?.value || ""

    // Extract pincode automatically
    // const pincodeMatch = address.match(/\b\d{6}\b/);
    // const pincode = pincodeMatch ? pincodeMatch[0] : "";

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all delivery details");
      return;
    }

    const subtotal = getCartTotal();
    const delivery = getDeliveryCharge(subtotal, cart);
    const total = subtotal + delivery;

    // 🔥 SAVE TO DB
    const orderNumber = await saveOrderToDB({
      name,
      phone,
      address,
      pincode,
      items: cart,
      total
    });

    // WhatsApp message
    let message = `MILASTY Order\n\nOrder ID: ${orderNumber}\n\n`;

    cart.forEach(item => {
      message += `${item.name}\nQty: ${item.qty}\nPrice: ₹${item.price * item.qty}\n\n`;
    });

    message += `Total: ₹${total}\n\n`;
    message += `Name: ${name}\nPhone: ${phone}\nAddress: ${address}\nPin Code: ${pincode}`;

    const encoded = encodeURIComponent(message);

    window.open(`https://wa.me/918927142056?text=${encoded}`, "_blank");

  } catch (err) {
    console.error("ERROR:", err);
    alert("Something went wrong");
  }
}


// ========================================
// MILASTY GUIDELINES POPUP
// ========================================

function openGuidelines() {

  const overlay = document.getElementById("guidelinesOverlay");

  if (overlay) overlay.style.display = "flex";

  // 🔥 hide cart drawer
  const cart = document.querySelector(".cart-drawer");
  if (cart) cart.style.display = "none";

}

function closeGuidelines() {

  const overlay = document.getElementById("guidelinesOverlay");

  if (overlay) overlay.style.display = "none";

  // 🔥 show cart back
  const cart = document.querySelector(".cart-drawer");
  if (cart) cart.style.display = "flex";

}

function confirmGuidelines() {

  const overlay = document.getElementById("guidelinesOverlay");

  if (overlay) overlay.style.display = "none";

  // 🔥 show cart back
  const cart = document.querySelector(".cart-drawer");
  if (cart) cart.style.display = "flex";

  sendOrder();

}



// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.showDelivery = showDelivery;
window.showCartItems = showCartItems;
window.sendOrder = sendOrder;

window.openGuidelines = openGuidelines;
window.closeGuidelines = closeGuidelines;
window.confirmGuidelines = confirmGuidelines;
