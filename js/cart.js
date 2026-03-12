// ========================================
// MILASTY CART LOGIC
// ========================================

const CART_KEY = "milasty_cart";

// ------------------------------
// Get cart
// ------------------------------
export function getCart() {
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
// Add item
// ------------------------------
export function addToCart(name, price, type) {

  const cart = getCart();

  const existing = cart.find(
    item => item.name === name && item.type === type
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name,
      price,
      type,
      qty: 1
    });
  }

  saveCart(cart);
}

// ------------------------------
// Change quantity
// ------------------------------
export function changeQty(name, type, delta) {

  const cart = getCart();

  const item = cart.find(
    i => i.name === name && i.type === type
  );

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(name, type);
    return;
  }

  saveCart(cart);
}

// ------------------------------
// Remove item
// ------------------------------
export function removeItem(name, type) {

  let cart = getCart();

  cart = cart.filter(
    i => !(i.name === name && i.type === type)
  );

  saveCart(cart);
}

// ------------------------------
// Clear cart
// ------------------------------
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cartUpdated"));
}

// ------------------------------
// Cart count
// ------------------------------
export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

// ------------------------------
// Cart total
// ------------------------------
export function getCartTotal() {
  return getCart().reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
}
