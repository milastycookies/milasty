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
