let cart = getCart();

let total = 0;
let html = "";

cart.forEach(item => {

    let subtotal = item.price * item.qty;
    total += subtotal;

    html += `
        <p>
        ${item.name} × ${item.qty}
        - ₹${subtotal}
        </p>
    `;
});

document.getElementById("cart-items").innerHTML = html;


let delivery = 0;

if (total < 799) {
    delivery = 60;
}

let finalTotal = total + delivery;

document.getElementById("cart-summary").innerHTML = `
Subtotal: ₹${total}<br>
Delivery: ₹${delivery}<br>
<b>Total: ₹${finalTotal}</b>
`;





function sendOrder(){

let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let address = document.getElementById("address").value;

let cart = getCart();

let message = "Hello MILASTY,%0A%0AI would like to place an order.%0A%0A";

cart.forEach(item=>{
message += item.name + " x " + item.qty + "%0A";
});

message += "%0AName: " + name;
message += "%0APhone: " + phone;
message += "%0AAddress: " + address;

window.open("https://wa.me/918927142056?text="+message);
}
