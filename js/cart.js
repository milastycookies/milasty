const CART_KEY = "milasty_cart";

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(name, price) {

    let cart = getCart();

    let existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            qty: 1
        });
    }

    saveCart(cart);
    alert("Added to Ritual Basket");
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
}
