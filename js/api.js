// ========================================
// MILASTY CONFIG
// Shared constants used by checkout.js
// and payment.js.
// Load this script before any other JS.
// ========================================

window.MILASTY_CONFIG = {

  API_BASE: "https://milasty-backend-production-5de1.up.railway.app",

  // Razorpay public key is fetched from the backend at payment time
  // (returned by /create-payment-order) so it never needs to be
  // hard-coded here.

  WHATSAPP_NUMBER: "918927142056"

};
