// ========================================
// MILASTY CART ENGINE
// ========================================

const CART_KEY = "milasty_cart";


// ----------------------------------------
// GET CART
// ----------------------------------------

function getCart() {

return JSON.parse(localStorage.getItem(CART_KEY)) || [];

}


// ----------------------------------------
// SAVE CART
// ----------------------------------------

function saveCart(cart) {

localStorage.setItem(CART_KEY, JSON.stringify(cart));

}


// ----------------------------------------
// ADD TO CART
// ----------------------------------------

function addToCart(name, price, type = "normal") {

let cart = getCart();

let existing = cart.find(item => item.name === name);

if (existing) {

existing.qty += 1;

} else {

cart.push({
name: name,
price: price,
qty: 1,
type: type
});

}

saveCart(cart);

// Open cart automatically for better UX
if(typeof openCart === "function"){
openCart();
}


// Toast notification
if(typeof showToast === "function"){
showToast("✔ " + name + " added to Ritual Basket");
}


// Update UI safely
if(typeof updateBasket === "function"){
updateBasket();
}

if(typeof renderCart === "function"){
renderCart();
}

}


// ----------------------------------------
// REMOVE ITEM
// ----------------------------------------

function removeItem(name){

let cart = getCart();

cart = cart.filter(item => item.name !== name);

saveCart(cart);


// Refresh UI
if(typeof renderCart === "function"){
renderCart();
}

if(typeof updateBasket === "function"){
updateBasket();
}

}


// ----------------------------------------
// CHANGE QUANTITY
// ----------------------------------------

function changeQty(name, delta){

let cart = getCart();

let item = cart.find(i => i.name === name);

if(!item) return;

item.qty += delta;

if(item.qty <= 0){

cart = cart.filter(i => i.name !== name);

}

saveCart(cart);


// Refresh UI
if(typeof renderCart === "function"){
renderCart();
}

if(typeof updateBasket === "function"){
updateBasket();
}

}


// ----------------------------------------
// CLEAR CART
// ----------------------------------------

function clearCart(){

localStorage.removeItem(CART_KEY);

if(typeof renderCart === "function"){
renderCart();
}

if(typeof updateBasket === "function"){
updateBasket();
}

}


// ----------------------------------------
// GET CART COUNT
// ----------------------------------------

function getCartCount(){

let cart = getCart();

let count = 0;

cart.forEach(item => {
count += item.qty;
});

return count;

}


// ----------------------------------------
// UPDATE BASKET COUNT
// (legacy compatibility)
// ----------------------------------------

function updateBasketCount(){

if(typeof updateBasket === "function"){
updateBasket();
}

}


// ----------------------------------------
// OPEN CART DRAWER
// ----------------------------------------

function openCart(){

const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("cartOverlay");

if(drawer) drawer.classList.add("active");
if(overlay) overlay.classList.add("active");

if(typeof renderCart === "function" && drawer){
renderCart();
}

}


// ----------------------------------------
// CLOSE CART DRAWER
// ----------------------------------------

function closeCart(){

const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("cartOverlay");

if(drawer) drawer.classList.remove("active");
if(overlay) overlay.classList.remove("active");

}


// ----------------------------------------
// INIT
// ----------------------------------------

document.addEventListener("DOMContentLoaded", function(){

if(typeof updateBasket === "function"){
updateBasket();
}

});
