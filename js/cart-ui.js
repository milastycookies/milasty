// ==============================
// MILASTY CART UI
// ==============================

let cart = getCart();

let cartHTML = "";
let total = 0;
let freeDelivery = false;

// Build cart list
cart.forEach(item => {

    let subtotal = item.price * item.qty;
    total += subtotal;

    if(item.type === "gift"){
        freeDelivery = true;
    }

    cartHTML += `
        <div class="cart-item">
            <strong>${item.name}</strong><br>
            ₹${item.price} × ${item.qty} = ₹${subtotal}

            <div class="qty-controls">
                <button onclick="changeQty('${item.name}', -1)">−</button>
                <button onclick="changeQty('${item.name}', 1)">+</button>
                <button onclick="removeItem('${item.name}')">Remove</button>
            </div>
        </div>
        <hr>
    `;
});

document.getElementById("cart-items").innerHTML = cartHTML;


// ==============================
// DELIVERY LOGIC
// ==============================

let delivery = 60;

if(total >= 399 || freeDelivery){
    delivery = 0;
}

let finalTotal = total + delivery;


// Delivery message
let deliveryMessage = "";

if(freeDelivery){
    deliveryMessage = "🎁 Gift Ritual includes FREE delivery";
}
else if(total >= 399){
    deliveryMessage = "🚚 Free delivery unlocked!";
}
else{
    let remaining = 399 - total;
    deliveryMessage = `Add ₹${remaining} more to unlock FREE delivery`;
}


// ==============================
// SUMMARY DISPLAY
// ==============================

let deliveryText = delivery === 0 ? "FREE" : "₹60";

document.getElementById("cart-summary").innerHTML = `
<p>Subtotal: ₹${total}</p>
<p>Delivery: ${deliveryText}</p>
<p><strong>Total: ₹${finalTotal}</strong></p>
<p>${deliveryMessage}</p>
`;


// ==============================
// WHATSAPP ORDER
// ==============================

function sendOrder(){

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

    if(total >= 399 || freeDelivery){
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

    window.open("https://wa.me/91YOURNUMBER?text=" + message);

}
