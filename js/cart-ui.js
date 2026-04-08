// ========================================
// MILASTY CART UI (FINAL STABLE VERSION)
// ========================================

let drawer;
let cartItemsContainer;
let cartSummaryContainer;
let basketCount;
let basket;

let PRODUCT_MAP = {};
let PRODUCTS_LOADED = false;

// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {
  try {
    const res = await fetch(
      "https://milasty-backend-production-5de1.up.railway.app/products"
    );

    const data = await res.json();

    data.forEach(p => {
      PRODUCT_MAP[p.id] = p;
    });

    PRODUCTS_LOADED = true;

    console.log("✅ Products loaded");

  } catch (err) {
    console.error("❌ Failed to load products", err);
    PRODUCTS_LOADED = true; // 🔥 allow UI to render (even empty)
  }
}

// ========================================
// INIT
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

  drawer = document.getElementById("cartDrawer");
  cartItemsContainer = document.getElementById("cart-items");
  cartSummaryContainer = document.getElementById("cart-summary");
  basketCount = document.getElementById("basket-count");
  basket = document.querySelector(".floating-basket"); // ✅ only once

  const overlay = document.getElementById("cartOverlay");

  if (overlay) overlay.onclick = closeCart;
  if (basket) basket.addEventListener("click", openCart);

  await loadProducts();

  renderCart();

  window.addEventListener("cartUpdated", renderCart);

});

// ========================================
// ADD TO CART (DYNAMIC)
// ========================================

function addToCartDynamic(productId) {

  if (!PRODUCTS_LOADED) {
    console.warn("⏳ Products not ready");
    return;
  }

  const product = PRODUCT_MAP[productId];

  if (!product) {
    console.error("❌ Product not found:", productId);
    return;
  }

  addToCart(product.id);
}

window.addToCartDynamic = addToCartDynamic;

// ========================================
// OPEN / CLOSE CART
// ========================================

function openCart() {
  document.getElementById("cartOverlay")?.classList.add("active");
  drawer?.classList.add("active");
  document.body.classList.add("cart-open");
}

function closeCart() {
  document.getElementById("cartOverlay")?.classList.remove("active");
  drawer?.classList.remove("active");
  document.body.classList.remove("cart-open");
  renderCart();
}

// ========================================
// RENDER CART
// ========================================

function renderCart() {

  if (!PRODUCTS_LOADED) {
    console.warn("⏳ Waiting for products...");
    return;
  }

  const cart = getCart();

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

    const product = PRODUCT_MAP[item.id];
    if (!product) {
      console.error("❌ Missing product in PRODUCT_MAP:", item.id);
      return;
    }

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div class="cart-item-name">${product.name}</div>
      <div class="cart-item-controls">
        <div class="cart-item-qty">
          <button class="minus">−</button>
          <span>${item.qty}</span>
          <button class="plus">+</button>
        </div>
        <div class="cart-item-price">
          ₹${product.price * item.qty}
        </div>
        <button class="remove-btn">Remove</button>
      </div>
    `;

    row.querySelector(".minus").onclick = () => changeQty(item.id, -1);
    row.querySelector(".plus").onclick = () => changeQty(item.id, 1);
    row.querySelector(".remove-btn").onclick = () => removeItem(item.id);

    cartItemsContainer.appendChild(row);

  });

  if (basketCount) {
    basketCount.innerText = getCartCount();
  }
  renderSummary();
}

// ========================================
// SUMMARY
// ========================================

function renderSummary() {

  const cart = getCart();

  let subtotal = 0;
  let hasRegular = false;

  cart.forEach(item => {
    const product = PRODUCT_MAP[item.id];
    if (!product) {
      console.error("❌ Missing product in PRODUCT_MAP:", item.id);
      return;
    }

    subtotal += product.price * item.qty;

    if (product.type === "regular") {
      hasRegular = true;
    }
  });

  let delivery = 0;
  if (subtotal < 799 && hasRegular) delivery = 60;

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
// DELIVERY FLOW (RESTORED)
// ========================================

function showDelivery() {
  document.getElementById("cart-items").style.display = "none";
  document.querySelector(".continue-btn").style.display = "none";
  document.getElementById("delivery-section").style.display = "block";
}

function showCartItems() {
  document.getElementById("cart-items").style.display = "block";
  document.querySelector(".continue-btn").style.display = "block";
  document.getElementById("delivery-section").style.display = "none";
}

// ========================================
// SEND ORDER
// ========================================

async function sendOrder() {
  try {

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    const cart = getCart();

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all details");
      return;
    }

    const items = cart.map(item => ({
      product_id: item.id,
      qty: item.qty
    }));

    if (items.length === 0) {
      alert("Cart is empty");
      return;
    }

    const res = await fetch(
      "https://milasty-backend-production-5de1.up.railway.app/create-order",
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name, phone, address, pincode,
          items,
          token: Date.now().toString()
        })
      }
    );

    if (!res.ok) throw new Error("Order failed");

    window.clearCart();

    alert("Order placed successfully!");

  } catch (err) {
    console.error(err);
    alert("Order failed");
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
