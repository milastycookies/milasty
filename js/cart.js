// ========================================
// MILASTY CART LOGIC (SLUG-BASED)
// ========================================

const CART_KEY = "milasty_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

function addToCart(slug) {

  if (!slug || typeof slug !== "string") {
    console.error("Invalid product slug:", slug);
    return;
  }

  const cart = getCart();
  const existing = cart.find(item => item.slug === slug);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ slug, qty: 1 });
  }

  saveCart(cart);
}

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

function removeItem(slug) {
  let cart = getCart();
  cart = cart.filter(i => i.slug !== slug);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cartUpdated"));
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

window.getCart = getCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.getCartCount = getCartCount;
