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
    
    showToast("✔ Item added to Ritual Basket");
    
    updateBasketCount();
    
    renderCart();
    
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



function openCart(){

document.getElementById("cartDrawer").classList.add("active");
document.getElementById("cartOverlay").classList.add("active");

renderCart();
}

function closeCart(){

document.getElementById("cartDrawer").classList.remove("active");
document.getElementById("cartOverlay").classList.remove("active");

}

document.getElementById("cartOverlay").onclick = closeCart;






function renderCart(){

let cart = getCart();

let html = "";
let total = 0;
let freeDelivery = false;

cart.forEach(item =>{

let subtotal = item.price * item.qty;
total += subtotal;

if(item.type === "gift"){
freeDelivery = true;
}

html += `
<div class="cart-item">

<strong>${item.name}</strong><br>

₹${item.price} × ${item.qty}

<div>

<button onclick="changeQty('${item.name}',-1)">−</button>
<button onclick="changeQty('${item.name}',1)">+</button>
<button onclick="removeItem('${item.name}')">Remove</button>

</div>

</div>
`;
});

document.getElementById("cart-items").innerHTML = html;


/* Delivery */

let delivery = 60;

if(total >= 399 || freeDelivery){
delivery = 0;
}

let finalTotal = total + delivery;

document.getElementById("cart-summary").innerHTML = `
<p>Subtotal: ₹${total}</p>
<p>Delivery: ${delivery===0?"FREE":"₹60"}</p>
<p><strong>Total: ₹${finalTotal}</strong></p>
`;

updateBasketCount();

}
