// ========================================
// MILASTY CART ENGINE
// ========================================

const CART_KEY = "milasty_cart";

/* ---------------------------------------
GET CART
--------------------------------------- */

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

/* ---------------------------------------
SAVE CART
--------------------------------------- */

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ---------------------------------------
ADD TO CART
--------------------------------------- */

function addToCart(name, price, type="normal"){

  let cart = getCart();

  let existing = cart.find(i => i.name === name);

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

  saveCart(cart);

  if(typeof renderCart === "function"){
    renderCart();
  }

  if(typeof updateBasket === "function"){
    updateBasket();
  }

}

/* ---------------------------------------
REMOVE ITEM
--------------------------------------- */

function removeItem(name){

  let cart = getCart();

  cart = cart.filter(i => i.name !== name);

  saveCart(cart);

  if(typeof renderCart === "function"){
    renderCart();
  }

  if(typeof updateBasket === "function"){
    updateBasket();
  }

}

/* ---------------------------------------
CHANGE QUANTITY
--------------------------------------- */

function changeQty(name, delta){

  let cart = getCart();

  let item = cart.find(i => i.name === name);

  if(!item) return;

  item.qty += delta;

  if(item.qty <= 0){
    cart = cart.filter(i => i.name !== name);
  }

  saveCart(cart);

  if(typeof renderCart === "function"){
    renderCart();
  }

  if(typeof updateBasket === "function"){
    updateBasket();
  }

}

/* ---------------------------------------
CLEAR CART
--------------------------------------- */

function clearCart(){

  localStorage.removeItem(CART_KEY);

  if(typeof renderCart === "function"){
    renderCart();
  }

  if(typeof updateBasket === "function"){
    updateBasket();
  }

}

/* ---------------------------------------
GET CART COUNT
--------------------------------------- */

function getCartCount(){

  let cart = getCart();

  return cart.reduce((sum,item)=>sum+item.qty,0);

}
