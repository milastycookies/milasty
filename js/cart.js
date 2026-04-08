// ========================================
// MILASTY CART LOGIC (SLUG-BASED FINAL)
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
// Add item (USING SLUG)
// ------------------------------
function addToCart(slug) {

  if (!slug || typeof slug !== "string") {
    console.error("❌ Invalid product slug:", slug);
    return;
  }

  const cart = getCart();

  const existing = cart.find(item => item.slug === slug);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      slug,
      qty: 1
    });
  }

  saveCart(cart);
}

// ------------------------------
// Change quantity
// ------------------------------
function changeQty(slug, delta) {

  const cart = getCart();

  const item = cart.find(i => i.slug === slug);

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(slug);
    return;
  }

  saveCart(cart);
}

// ------------------------------
// Remove item
// ------------------------------
function removeItem(slug) {

  let cart = getCart();

  cart = cart.filter(i => i.slug !== slug);

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


// EXPORTS
window.getCart = getCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.getCartCount = getCartCount;
