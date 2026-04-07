// ========================================
// MILASTY CART LOGIC (ID-BASED)
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
// Add item (UPDATED)
// ------------------------------
function addToCart(id, name, price, type) {

  const cart = getCart();

  const existing = cart.find(
    item => item.id === id   // 🔥 match by ID
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id,        // 🔥 NEW (CRITICAL)
      name,      // for UI
      price,     // for UI
      type,      // for UI
      qty: 1
    });
  }

  saveCart(cart);
}

// ------------------------------
// Change quantity (UPDATED)
// ------------------------------
function changeQty(id, delta) {

  const cart = getCart();

  const item = cart.find(
    i => i.id === id   // 🔥 match by ID
  );

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(id);
    return;
  }

  saveCart(cart);
}

// ------------------------------
// Remove item (UPDATED)
// ------------------------------
function removeItem(id) {

  let cart = getCart();

  cart = cart.filter(
    i => i.id !== id   // 🔥 match by ID
  );

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
    (sum, item) => sum + item.price * item.qty,
    0
  );
}



window.getCart = getCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.getCartCount = getCartCount;
window.getCartTotal = getCartTotal;
