// ========================================
// MILASTY CART UI SYSTEM
// ========================================

let orderSubmitting = false;
let orderToken = null;

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

let totalQty = cart.reduce((sum,item)=>sum+item.qty,0);

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

orderToken =
"MIL-" + Date.now() + "-" + Math.random().toString(36).substring(2,10);

  
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

if(cart.length === 0){
alert("Your cart is empty");
return;
}

/* ----------------------------------------
GENERATE ORDER ID
---------------------------------------- */

if(!orderToken){
orderToken =
"MIL-" + Date.now() + "-" + Math.random().toString(36).substring(2,10);
}

let orderId = orderToken;


/* ----------------------------------------
START MESSAGE
---------------------------------------- */

let message =
`Hello MILASTY \n\n` +
`I'd like to place the following order from your website.\n\n` +
`Order ID: ${orderId}\n\n` +
`Order Details\n` +
`────────────\n`;


/* ----------------------------------------
BUILD ORDER ITEMS
---------------------------------------- */

let total = 0;
let freeDelivery = false;

cart.forEach(item => {

let subtotal = item.price * item.qty;

total += subtotal;

if(item.type === "gift"){
freeDelivery = true;
}

message += `${item.name} × ${item.qty} = ₹${subtotal}\n`;

});


/* ----------------------------------------
DELIVERY LOGIC
---------------------------------------- */

let delivery = 60;

if(total >= 799 || freeDelivery){
delivery = 0;
}

let finalTotal = total + delivery;


/* ----------------------------------------
ORDER SUMMARY
---------------------------------------- */

message += `\n` +
`Subtotal: ₹${total}\n` +
`Delivery: ${delivery === 0 ? "FREE" : "₹60"}\n` +
`Total: ₹${finalTotal}\n\n`;


/* ----------------------------------------
DELIVERY DETAILS
---------------------------------------- */

message +=
`Delivery Details\n` +
`────────────\n` +
`Name: ${name}\n` +
`Phone: ${phone}\n` +
`Address: ${address}\n\n` +
`[Please press SEND in WhatsApp to confirm this order.\n` + 
`We will then share the payment QR to proceed]`;


/* ----------------------------------------
OPEN WHATSAPP
---------------------------------------- */

window.location.href =
"https://wa.me/918927142056?text=" + encodeURIComponent(message);

}

// ----------------------------------------
// GUIDELINES POPUP CONTROLS
// ----------------------------------------

function closeGuidelines(){

document.getElementById("guidelinesOverlay").classList.remove("active");

}


async function sendOrderToBackendSilent(){

  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;

  let cart = getCart();

  let total = 0;
  let freeDelivery = false;

  cart.forEach(item => {

    let subtotal = item.price * item.qty;

    total += subtotal;

    if(item.type === "gift"){
      freeDelivery = true;
    }

  });

  let delivery = 60;

  if(total >= 799 || freeDelivery){
    delivery = 0;
  }

  let finalTotal = total + delivery;

  if(!orderToken){
    orderToken = "MIL-" + Date.now() + "-" + Math.random().toString(36).substring(2,10);
  }

  let now = new Date();

  let orderDate = now.toISOString().split("T")[0];

  let orderTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  
  
  const orderData = {
    token: orderToken,
    date: orderDate,
    time:orderTime,
    timestamp: Date.now(),
    name: name,
    phone: phone,
    address: address,
    items: cart,
    subtotal: total,
    delivery: delivery,
    total: finalTotal,
    source: "milasty_website"
  };

  try{

    const response = await fetch("https://milasty-backend-production-5de1.up.railway.app/create-order",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-api-key":"milasty_secure_by_kulomulo"
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    console.log("Backend response:", data);

  }catch(e){

    console.log("Backend logging failed");

  }

}

function confirmGuidelines(){

if(orderSubmitting) return;

orderSubmitting = true;

document.getElementById("guidelinesOverlay").classList.remove("active");

const btn = document.querySelector(".confirm-btn");
if(btn) btn.disabled = true;

sendOrderToBackendSilent();
sendWhatsAppOrder();
  
localStorage.removeItem("cart");

const nameField = document.getElementById("name");
const phoneField = document.getElementById("phone");
const addressField = document.getElementById("address");

if(nameField) nameField.value = "";
if(phoneField) phoneField.value = "";
if(addressField) addressField.value = "";

renderCart();
updateBasket();

closeCart(); 
  
}



function showDelivery(){

const delivery = document.getElementById("delivery-section");
const items = document.getElementById("cart-items");
const summary = document.getElementById("cart-summary");
const continueBtn = document.querySelector(".continue-btn");

if(delivery) delivery.style.display = "block";
if(items) items.style.display = "none";
if(summary) summary.style.display = "none";
if(continueBtn) continueBtn.style.display = "none";

}



function showCartItems(){

const delivery = document.getElementById("delivery-section");
const items = document.getElementById("cart-items");
const summary = document.getElementById("cart-summary");
const continueBtn = document.querySelector(".continue-btn");

if(delivery) delivery.style.display = "none";
if(items) items.style.display = "block";
if(summary) summary.style.display = "block";
if(continueBtn) continueBtn.style.display = "block";

}
