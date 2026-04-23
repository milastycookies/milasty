// ========================================
// MILASTY CART UI
// ========================================

let drawer;
let cartItemsContainer;
let cartSummaryContainer;
let basketCount;
let basket;

let PRODUCT_MAP = {};
let PRODUCT_SLUG_MAP = {};
let PRODUCTS_LOADED = false;

// Expose so checkout.js can build WhatsApp messages
window.PRODUCT_SLUG_MAP = PRODUCT_SLUG_MAP;


// ========================================
// LOAD PRODUCTS FROM BACKEND
// ========================================

async function loadProducts() {

  try {

    const API_BASE = window.MILASTY_CONFIG?.API_BASE ||
      "https://milasty-backend-production-5de1.up.railway.app";

    const res = await fetch(API_BASE + "/products");

    if (!res.ok) throw new Error("Failed to fetch products");

    const data = await res.json();

    data.forEach(p => {
      PRODUCT_MAP[p.id] = p;
      PRODUCT_SLUG_MAP[p.slug] = p;
    });

    // Keep window reference in sync
    window.PRODUCT_SLUG_MAP = PRODUCT_SLUG_MAP;

    PRODUCTS_LOADED = true;

    console.log("Products loaded:", data.length);

  } catch (err) {

    console.error("Failed to load products:", err);

    // Allow UI to render even if products fail to load
    PRODUCTS_LOADED = true;

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
  basket = document.querySelector(".floating-basket");

  const overlay = document.getElementById("cartOverlay");

  if (overlay) overlay.onclick = closeCart;
  if (basket) basket.addEventListener("click", openCart);

  await loadProducts();

  renderCart();

  window.addEventListener("cartUpdated", renderCart);

});


// ========================================
// ADD TO CART (DYNAMIC — slug-aware)
// ========================================

function addToCartDynamic(slug) {

  if (!PRODUCTS_LOADED) {
    console.warn("Products not ready yet");
    return;
  }

  const product = PRODUCT_SLUG_MAP[slug];

  if (!product) {
    console.error("Product not found:", slug);
    return;
  }

  addToCart(slug);

}

window.addToCartDynamic = addToCartDynamic;


// ========================================
// OPEN / CLOSE
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
    console.warn("Waiting for products...");
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
    renderSummary([]);
    return;
  }

  cart.forEach(item => {

    const product = PRODUCT_SLUG_MAP[item.slug];

    if (!product) {
      console.error("Missing product in PRODUCT_SLUG_MAP:", item.slug);
      removeItem(item.slug);
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

    row.querySelector(".minus").onclick = () => changeQty(item.slug, -1);
    row.querySelector(".plus").onclick = () => changeQty(item.slug, 1);
    row.querySelector(".remove-btn").onclick = () => removeItem(item.slug);

    cartItemsContainer.appendChild(row);

  });

  if (basketCount) {
    basketCount.innerText = getCartCount();
  }

  renderSummary(cart);

}


// ========================================
// SUMMARY
// ========================================

function renderSummary(cart) {

  let subtotal = 0;
  let hasRegular = false;

  cart.forEach(item => {

    const product = PRODUCT_SLUG_MAP[item.slug];

    if (!product) return;

    subtotal += product.price * item.qty;

    if (product.type !== "gift") {
      hasRegular = true;
    }

  });

  const delivery = (subtotal < 799 && hasRegular) ? 60 : 0;
  const total = subtotal + delivery;

  if (!cartSummaryContainer) return;

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
// DELIVERY SECTION TOGGLE
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





// GLOBAL STATE
window.otpVerified = false;

// =====================
// SEND OTP
// =====================
document.getElementById("sendOtpBtn").onclick = async function () {

  const rawPhone = document.getElementById("phone").value.trim();
  const phone = rawPhone.replace(/\D/g, "").slice(-10);

  if (phone.length !== 10) {
    alert("Enter valid phone number");
    return;
  }

  const API_BASE = window.MILASTY_CONFIG?.API_BASE ||
  "https://milasty-backend-production-5de1.up.railway.app";
  
  const res = await fetch("/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to send OTP");
    return;
  }

  document.getElementById("otpBox").style.display = "block";
  document.getElementById("otpStatus").innerText = "OTP sent ✅";
};


// =====================
// VERIFY OTP
// =====================
document.getElementById("verifyOtpBtn").onclick = async function () {

  const rawPhone = document.getElementById("phone").value.trim();
  const phone = rawPhone.replace(/\D/g, "").slice(-10);
  const otp = document.getElementById("otp").value.trim();

  if (!otp) {
    alert("Enter OTP");
    return;
  }

  const API_BASE = window.MILASTY_CONFIG?.API_BASE ||
  "https://milasty-backend-production-5de1.up.railway.app";
  
  const res = await fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "OTP failed");
    return;
  }

  // ✅ THIS IS THE KEY LINE
  window.otpVerified = true;

  console.log("OTP VERIFIED:", window.otpVerified);

  document.getElementById("otpStatus").innerText = "Phone verified ✅";
  document.getElementById("otpBox").style.display = "none";
};



// ========================================
// SEND ORDER (WhatsApp flow)
// Sends items using product_id (slug) as
// expected by the /create-order endpoint.
// ========================================

async function sendOrder() {

  try {

    const name = document.getElementById("name")?.value.trim();
    const rawPhone = document.getElementById("phone")?.value.trim();
    const phone = rawPhone.replace(/\D/g, "").slice(-10);
    const address = document.getElementById("address")?.value.trim();
    const pincode = document.getElementById("pincode")?.value.trim();

    const cart = getCart();

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all details");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    
    if (!window.otpVerified) {
      alert("Please verify your phone via OTP");
      return;
    }

    // Map to { product_id, qty } — the shape /create-order expects
    const items = cart.map(item => ({
      product_id: item.slug,
      qty: item.qty
    }));

    const API_BASE = window.MILASTY_CONFIG?.API_BASE ||
      "https://milasty-backend-production-5de1.up.railway.app";

    const res = await fetch(API_BASE + "/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, phone, address, pincode,
        items,
        token: window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : Date.now().toString()
      })
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Order failed");

    clearCart();

    alert("Order placed successfully!");

  } catch (err) {

    console.error("sendOrder error:", err);

    alert("Order failed. Please try again.");

  }

}


// ========================================
// GLOBALS
// ========================================

window.openCart = openCart;
window.closeCart = closeCart;
window.showDelivery = showDelivery;
window.showCartItems = showCartItems;
window.sendOrder = sendOrder;
