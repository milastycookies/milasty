// ========================================
// MILASTY CHECKOUT CONTROLLER (SIMPLIFIED)
// ========================================

let checkoutRunning = false;

async function startCheckout(orderToken){

  if(checkoutRunning) return;

  checkoutRunning = true;

  const name = document.getElementById("name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const pincode = document.getElementById("pincode")?.value.trim();

  if(!name || !phone || !address || !pincode){

    alert("Please fill all details");

    checkoutRunning = false;
    return;
  }

  const cart = getCart();

  if(cart.length === 0){

    alert("Your cart is empty");

    checkoutRunning = false;
    return;
  }

  // 🔴 STRICT VALIDATION
  for (const item of cart) {
    if (!item.id || item.id.length < 10) {
      console.error("❌ Invalid product ID:", item);
      alert("Cart error. Please refresh and try again.");
      checkoutRunning = false;
      return;
    }
  }

  // 🔥 ONLY SEND product_id + qty
  const items = cart.map(item => ({
    product_id: item.id,
    qty: item.qty
  }));

  try {

    const response = await fetch(
      "https://milasty-backend-production-5de1.up.railway.app/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          pincode,
          items,
          token: orderToken || Date.now().toString()
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Backend error:", result);
      throw new Error(result.error || "Order failed");
    }

    console.log("✅ Order created:", result.orderNumber);

    // ✅ WhatsApp confirmation
    let message = `Hi MILASTY, I want to confirm my order:\n\n`;

    cart.forEach(item => {
      message += `• ${item.name} x${item.qty}\n`;
    });

    message += `\nName: ${name}`;
    message += `\nPhone: ${phone}`;
    message += `\nAddress: ${address}`;
    if (pincode) message += ` (${pincode})`;

    const encoded = encodeURIComponent(message);

    window.open(`https://wa.me/918927142056?text=${encoded}`, "_blank");

    clearCart();

  } catch (err) {

    console.error("ORDER ERROR:", err);
    alert("Order failed. Please try again.");

  } finally {
    checkoutRunning = false;
  }

}
