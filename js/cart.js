// ==============================
// MILASTY CART ENGINE
// ==============================

const CART_KEY = "milasty_cart";

// Get cart
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Save cart
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Add item to cart
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

    showToast("Added to Ritual Basket");
    updateBasketCount();
}

// Remove item
function removeItem(name){

    let cart = getCart();

    cart = cart.filter(item => item.name !== name);

    saveCart(cart);

    location.reload();
}

// Change quantity
function changeQty(name, delta){

    let cart = getCart();

    let item = cart.find(i => i.name === name);

    if(!item) return;

    item.qty += delta;

    if(item.qty <= 0){
        cart = cart.filter(i => i.name !== name);
    }

    saveCart(cart);

    location.reload();
}

// Clear cart
function clearCart(){
    localStorage.removeItem(CART_KEY);
}

// Get cart count
function getCartCount(){

    let cart = getCart();

    let count = 0;

    cart.forEach(item=>{
        count += item.qty;
    });

    return count;
}



// Update basket count
function updateBasketCount(){

    const basketCount = document.getElementById("basket-count");
    if(!basketCount) return;

    let cart = getCart();

    let count = 0;

    cart.forEach(item=>{
        count += item.qty;
    });

    basketCount.innerText = count;
}


// Go to cart
function goToCart(){
    window.location.href = "/cart/index.html";
}


// Run when page loads
document.addEventListener("DOMContentLoaded", updateBasketCount);
