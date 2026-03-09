// ========================================
// MILASTY CART ENGINE (STATE ONLY)
// ========================================

const CART_KEY = "milasty_cart";

/* ---------------------------------------
   INTERNAL HELPERS
--------------------------------------- */

function loadCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  notifyCartUpdate(cart);
}

/* ---------------------------------------
   EVENT SYSTEM
--------------------------------------- */

const cartListeners = [];

function notifyCartUpdate(cart){
  cartListeners.forEach(fn => fn(cart));
}

export function onCartUpdate(fn){
  cartListeners.push(fn);
}

/* ---------------------------------------
   GET CART
--------------------------------------- */

export function getCart(){
  return loadCart();
}

/* ---------------------------------------
   ADD ITEM
--------------------------------------- */

export function addToCart(name, price, type="normal"){

  let cart = loadCart();

  const existing = cart.find(item => item.name === name);

  if(existing){
    existing.qty += 1;
  }else{
    cart.push({
      name,
      price,
      qty:1,
      type
    });
  }

  persistCart(cart);

}

/* ---------------------------------------
   REMOVE ITEM
--------------------------------------- */

export function removeItem(name){

  let cart = loadCart();

  cart = cart.filter(item => item.name !== name);

  persistCart(cart);

}

/* ---------------------------------------
   CHANGE QUANTITY
--------------------------------------- */

export function changeQty(name, delta){

  let cart = loadCart();

  const item = cart.find(i => i.name === name);

  if(!item) return;

  item.qty += delta;

  if(item.qty <= 0){
    cart = cart.filter(i => i.name !== name);
  }

  persistCart(cart);

}

/* ---------------------------------------
   CLEAR CART
--------------------------------------- */

export function clearCart(){

  localStorage.removeItem(CART_KEY);

  notifyCartUpdate([]);

}

/* ---------------------------------------
   TOTAL COUNT
--------------------------------------- */

export function getCartCount(){

  const cart = loadCart();

  return cart.reduce((sum,item)=>sum + item.qty,0);

}

/* ---------------------------------------
   CALCULATE TOTAL
--------------------------------------- */

export function getCartSubtotal(){

  const cart = loadCart();

  return cart.reduce((sum,item)=>{
    return sum + (item.price * item.qty);
  },0);

}
