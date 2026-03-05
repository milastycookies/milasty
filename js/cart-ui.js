// ========================================
// MILASTY CART UI SYSTEM
// ========================================


// ----------------------------------------
// INIT
// ----------------------------------------

document.addEventListener("DOMContentLoaded", function(){

renderCart();
updateBasket();

const overlay = document.getElementById("cartOverlay");

if(overlay){
overlay.addEventListener("click", closeCart);
}

/* Close guidelines popup when clicking outside */

const guideOverlay = document.getElementById("guidelinesOverlay");

if(guideOverlay){
guideOverlay.addEventListener("click", function(e){

if(e.target === guideOverlay){
closeGuidelines();
}

});
}

});

// ----------------------------------------
// RENDER CART
// ----------------------------------------

function renderCart(){

let cart = getCart();

let cartContainer = document.getElementById("cart-items");
let summaryContainer = document.getElementById("cart-summary");

if(!cartContainer || !summaryContainer) return;

let cartHTML = "";
let total = 0;
let freeDelivery = false;


// ----------------------------------------
// BUILD CART ITEMS
// ----------------------------------------

cart.forEach(item => {

let subtotal = item.price * item.qty;

total += subtotal;

if(item.type === "gift"){
freeDelivery = true;
}

cartHTML += `
<div class="cart-item new-item">

<div class="cart-item-details">

<div class="cart-item-title">${item.name}</div>

<div class="cart-item-price">
₹${item.price} × ${item.qty} = ₹${subtotal}
</div>

</div>

<div class="qty-controls">

<button onclick="changeQty('${item.name}', -1)">−</button>

<span>${item.qty}</span>

<button onclick="changeQty('${item.name}', 1)">+</button>

<button class="cart-remove" onclick="removeItem('${item.name}')">
Remove
</button>

</div>

</div>
`;

});

cartContainer.innerHTML = cartHTML;


// ----------------------------------------
// DELIVERY LOGIC
// ----------------------------------------

let delivery = 60;

if(total >= 799 || freeDelivery){
delivery = 0;
}

let finalTotal = total + delivery;


// ----------------------------------------
// DELIVERY MESSAGE
// ----------------------------------------

let deliveryMessage = "";

if(freeDelivery){

deliveryMessage = "🎁 Gift Ritual includes FREE delivery";

}
else if(total >= 799){

deliveryMessage = "🚚 Free delivery unlocked!";

}
else{

let remaining = 799 - total;

deliveryMessage = `Add ₹${remaining} more to unlock FREE delivery`;

}


// ----------------------------------------
// SUMMARY
// ----------------------------------------

let deliveryText = delivery === 0 ? "FREE" : "₹60";

summaryContainer.innerHTML = `

<p>Subtotal: ₹${total}</p>

<p>Delivery: ${deliveryText}</p>

<p><strong>Total: ₹${finalTotal}</strong></p>

<p>${deliveryMessage}</p>

`;


// ----------------------------------------
// SMART RITUAL CART ANIMATION
// ----------------------------------------

summaryContainer.classList.remove("free-delivery");

if(total >= 799 || freeDelivery){

summaryContainer.classList.add("free-delivery");

}


// ----------------------------------------
// UPDATE BASKET COUNT
// ----------------------------------------

updateBasket();

}


// ----------------------------------------
// UPDATE BASKET
// ----------------------------------------

function updateBasket(){

const basket = document.querySelector(".floating-basket");
const count = document.getElementById("basket-count");

if(!basket || !count) return;

let cart = getCart();

let totalQty = 0;

cart.forEach(item => {
totalQty += item.qty;
});

count.innerText = totalQty;

const drawer = document.getElementById("cartDrawer");

if(totalQty > 0 && !drawer.classList.contains("active")){
basket.style.display = "flex";
}else{
basket.style.display = "none";
}

}


// ----------------------------------------
// CHANGE QUANTITY
// ----------------------------------------

function changeQty(name, delta){

let cart = getCart();

cart = cart.map(item => {

if(item.name === name){

item.qty += delta;

if(item.qty < 1){
item.qty = 1;
}

}

return item;

});

saveCart(cart);

renderCart();

}


// ----------------------------------------
// REMOVE ITEM
// ----------------------------------------

function removeItem(name){

let cart = getCart();

cart = cart.filter(item => item.name !== name);

saveCart(cart);

renderCart();

}


// ----------------------------------------
// WHATSAPP ORDER
// ----------------------------------------

function sendOrder(){

let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let address = document.getElementById("address").value;

if(!name || !phone || !address){

alert("Please fill all details");

return;

}

document.getElementById("guidelinesOverlay").classList.add("active");

}




function sendWhatsAppOrder(){

let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let address = document.getElementById("address").value;

if(!name || !phone || !address){

alert("Please fill all details");

return;

}

let cart = getCart();

let message = "Hello MILASTY,%0A%0AOrder from website.%0A%0A";

let total = 0;
let freeDelivery = false;

cart.forEach(item => {

let subtotal = item.price * item.qty;

total += subtotal;

if(item.type === "gift"){
freeDelivery = true;
}

message += `${item.name} × ${item.qty} = ₹${subtotal}%0A`;

});

let delivery = 60;

if(total >= 799 || freeDelivery){
delivery = 0;
}

let finalTotal = total + delivery;

message += "%0A";

message += `Subtotal: ₹${total}%0A`;

message += `Delivery: ${delivery === 0 ? "FREE" : "₹60"}%0A`;

message += `Total: ₹${finalTotal}%0A%0A`;

message += `Name: ${name}%0A`;
message += `Phone: ${phone}%0A`;
message += `Address: ${address}`;

window.open("https://wa.me/918927142056?text=" + message);

}



// ----------------------------------------
// GUIDELINES POPUP CONTROLS
// ----------------------------------------

function closeGuidelines(){

document.getElementById("guidelinesOverlay").classList.remove("active");

}


function confirmGuidelines(){

document.getElementById("guidelinesOverlay").classList.remove("active");

sendWhatsAppOrder();

}
