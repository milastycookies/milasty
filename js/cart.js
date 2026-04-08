// ========================================
// MILASTY CART LOGIC (ID-BASED, SAFE)
// ========================================

const CART_KEY = "milasty_cart";

// ------------------------------
// Get cart
// ------------------------------
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// ------------------------------
// Save cart
// ------------------------------
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

// ------------------------------
// Add item (SAFE VERSION)
// ------------------------------
function addToCart(id, name, price, type) {

  // 🔴 HARD VALIDATION
  if (!id || typeof id !== "string" || id.length < 10) {
    console.error("❌ Invalid product ID:", id);
    return;
  }

  const cart = getCart();

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: id,                              // ✅ UUID
      name: name || "Product",              // UI only
      price: Number(price) || 0,            // ✅ force number
      type: type || "normal",               // UI only
      qty: 1
    });
  }

  saveCart(cart);
}

// ------------------------------
// Change quantity
// ------------------------------
function changeQty(id, delta) {

  const cart = getCart();

  const item = cart.find(i => i.id === id);

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(id);
    return;
  }

  saveCart(cart);
}

// ------------------------------
// Remove item
// ------------------------------
function removeItem(id) {

  let cart = getCart();

  cart = cart.filter(i => i.id !== id);

  saveCart(cart);
}

// ------------------------------
// Clear cart
// ------------------------------
function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cartUpdated"));
}

// ------------------------------
// Cart count
// ------------------------------
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

// ------------------------------
// Cart total (UI only)
// ------------------------------
function getCartTotal() {
  return getCart().reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.qty,
    0
  );
}


// EXPORTS
window.getCart = getCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.getCartCount = getCartCount;
window.getCartTotal = getCartTotal;
