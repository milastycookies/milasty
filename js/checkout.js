// ========================================
// MILASTY CHECKOUT CONTROLLER (FINAL CLEAN)
// ========================================

let checkoutRunning = false;
let lastOrderData = null;

let otpToken = null;

// ========================================
// MAIN CHECKOUT FLOW
// ========================================
window.handleOrder = async function () {

  const btn = document.getElementById("orderBtn");

  // 🚫 Prevent double click
  if (btn && btn.disabled) return;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Processing...";
  }

  try {
    await startCheckout();
  } catch (err) {
    console.error(err);
    alert("Something went wrong");

    // 🔁 Re-enable on failure
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Send Order on WhatsApp";
    }
  }

};




// ========================================
// OTP SYSTEM
// ========================================

// 🔒 Reset OTP if phone changes
document.getElementById("phone")?.addEventListener("input", () => {
  otpToken = null;

  // Reset UI
  document.getElementById("otpStatus").innerText = "";
  document.getElementById("otpBox").style.display = "none";

  const btn = document.getElementById("sendOtpBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Verify Number";
    btn.style.opacity = "1";
  }
});

async function checkPhone(phone) {
  const res = await fetch("https://milasty-backend-production-5de1.up.railway.app/otp/check-phone", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ phone })
  });

  return await res.json();
}




// 📲 SEND OTP
document.getElementById("sendOtpBtn")?.addEventListener("click", async () => {

  const phone = document.getElementById("phone")?.value.trim();

  if (!phone || phone.length !== 10) {
    alert("Enter valid 10-digit phone number");
    return;
  }

  const btn = document.getElementById("sendOtpBtn");
  btn.disabled = true;
  btn.innerText = "Sending...";

  try {

    const phoneCheck = await checkPhone(phone);

    // ✅ Already verified → skip OTP
    if (phoneCheck.exists && phoneCheck.verified) {
    
      const res = await fetch("https://milasty-backend-production-5de1.up.railway.app/otp/get-token", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ phone })
      });
    
      const tokenData = await res.json();
    
      otpToken = tokenData.token;
    
      document.getElementById("otpStatus").innerText = "Already verified ✅";
    
      document.getElementById("phone").disabled = true;
    
      // 🔄 FIX: reset button
      btn.disabled = false;
      btn.innerText = "Verified ✓";
      btn.style.opacity = "0.7";
    
      return;
    }

    // ❗ Send OTP
    const res = await fetch("https://milasty-backend-production-5de1.up.railway.app/otp/send-otp", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ phone })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      alert(data.error || "Failed to send OTP");
      btn.disabled = false;
      btn.innerText = "Verify Number";
      return;
    }
    
    document.getElementById("otpBox").style.display = "block";
    document.getElementById("otpStatus").innerText = "OTP sent!";
    
    // ⏱ Start cooldown timer
    btn.disabled = true;
    btn.innerText = "Resend in 30s";
    
    let seconds = 30;
    
    const interval = setInterval(() => {
      seconds--;
      btn.innerText = `Resend in ${seconds}s`;
    
      if (seconds <= 0) {
        clearInterval(interval);
        btn.disabled = false;
        btn.innerText = "Resend OTP";
      }
    }, 1000);

  } catch (err) {
    console.error(err);
    alert("Failed to send OTP");
    btn.disabled = false;
    btn.innerText = "Verify Number";
    btn.style.opacity = "1";
  }

});


// ✅ VERIFY OTP
document.getElementById("verifyOtpBtn")?.addEventListener("click", async () => {

  const phone = document.getElementById("phone")?.value.trim();
  const otp = document.getElementById("otpInput")?.value.trim();

  if (!otp || otp.length !== 6) {
    alert("Enter valid OTP");
    return;
  }

  try {

    const res = await fetch("https://milasty-backend-production-5de1.up.railway.app/otp/verify-otp", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ phone, otp })
    });

    const data = await res.json();

    if (data.verified) {
      otpToken = data.token;

      document.getElementById("otpStatus").innerText = "Verified ✅";
      
      const btn = document.getElementById("sendOtpBtn");
      btn.innerText = "Verified ✓";
      btn.style.opacity = "0.7";
    
      // 🔒 Lock phone field
      document.getElementById("phone").disabled = true;
    } else {
      document.getElementById("otpStatus").innerText = "Invalid OTP ❌";
    }

  } catch (err) {
    console.error(err);
    alert("Verification failed");
  }

});



// ========================================
// CHECKOUT FUNCTION
// ========================================
async function startCheckout(orderToken){

  if (checkoutRunning) return;

  checkoutRunning = true;

  const name = document.getElementById("name")?.value.trim();
  const rawPhone = document.getElementById("phone")?.value.trim();
  const phone = rawPhone.replace(/\D/g, "").slice(-10);
  const address = document.getElementById("address")?.value.trim();
  const pincode = document.getElementById("pincode")?.value.trim();

  if (!name || !phone || !address || !pincode) {
    alert("Please fill all details");
    checkoutRunning = false;

    resetOrderButton();
    return;
  }

  if (phone.length !== 10) {
    alert("Enter valid 10-digit phone number");
    checkoutRunning = false;
    resetOrderButton();
    return;
  }
  
  // 🔒 OTP verification REQUIRED (CORRECT POSITION)
  if (!otpToken) {
    alert("Please verify your phone via OTP");
  
    checkoutRunning = false;
    resetOrderButton();
    return;
  }

  const cart = getCart();

  if (!cart || cart.length === 0) {
    alert("Your cart is empty");
    checkoutRunning = false;

    resetOrderButton();
    return;
  }

  // ✅ VALIDATE SLUG
  for (const item of cart) {
    if (!item.slug || typeof item.slug !== "string") {
      console.error("❌ Invalid product slug:", item);
      alert("Cart error. Please refresh and try again.");
      checkoutRunning = false;

      resetOrderButton();
      return;
    }
  }


  let items;
  
  try {
    items = cart.map(item => {
      const qty = Number(item.qty);
  
      if (!Number.isInteger(qty) || qty < 1) {
        throw new Error("Invalid quantity in cart");
      }
  
      return {
        product_id: item.slug,
        qty
      };
    });
  } catch (err) {
    console.error("CART ERROR:", err);
  
    alert(err.message || "Invalid cart data");
  
    checkoutRunning = false;
    resetOrderButton();
    return;
  }
  

  try {

    const token =
      orderToken ||
      (window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : Date.now().toString());
    
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
          token,
          otp_token: otpToken
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Backend error FULL:", result);
    
      const errorMsg =
        result.details?.map(d => d.message || JSON.stringify(d)).join("\n") ||
        result.error ||
        "Order failed";
    
      alert(errorMsg);
      return;
    }

    console.log("✅ Order created:", result.orderNumber);

    // ✅ Store order for WhatsApp
    lastOrderData = {
      name,
      phone,
      address,
      pincode,
      cart,
      orderNumber: result.orderNumber
    };

    openGuidelines();

  } catch (err) {

    console.error("ORDER ERROR:", err);
    alert("Order failed. Please try again.");

    resetOrderButton();

  } finally {
    checkoutRunning = false;
  }

}


// ========================================
// POPUP CONTROLS
// ========================================
window.openGuidelines = function () {
  const el = document.getElementById("guidelinesOverlay");
  if (el) el.style.display = "flex";
};

window.closeGuidelines = function () {
  const el = document.getElementById("guidelinesOverlay");
  if (el) el.style.display = "none";
};


// ========================================
// FINAL CONFIRM → WHATSAPP
// ========================================
window.confirmOrderAndSendWhatsApp = function () {

  const btn = document.getElementById("confirmBtn");

  // 🚫 Prevent double click
  if (btn && btn.disabled) return;

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Please wait...";
  }

  if (!lastOrderData) {
    alert("Something went wrong. Please try again.");

    resetConfirmButton();
    return;
  }

  const { name, phone, address, pincode, cart, orderNumber } = lastOrderData;

  let message = `Hi MILASTY, I want to confirm my order:\n\n`;

  if (orderNumber) {
    message += `Order ID: ${orderNumber}\n\n`;
  }

  cart.forEach(item => {
    const product = window.PRODUCT_SLUG_MAP?.[item.slug];
    const productName = product ? product.name : item.slug;

    message += `• ${productName} x${item.qty}\n`;
  });

  message += `\nName: ${name}`;
  message += `\nPhone: ${phone}`;
  message += `\nAddress: ${address}`;
  if (pincode) message += ` (${pincode})`;

  const encoded = encodeURIComponent(message);

  window.open(`https://wa.me/918927142056?text=${encoded}`, "_blank");

  // ✅ Cleanup
  clearCart();
  lastOrderData = null;

  closeGuidelines();
};


// ========================================
// HELPERS
// ========================================
function resetOrderButton() {
  const btn = document.getElementById("orderBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Send Order on WhatsApp";
  }
}

function resetConfirmButton() {
  const btn = document.getElementById("confirmBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "I Understand & Continue";
  }
}
