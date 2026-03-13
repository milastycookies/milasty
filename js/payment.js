const express = require("express");
const router = express.Router();

const limiter = require("../middleware/rateLimiter");

const {
  createPaymentOrder,
  verifyPaymentSignature
} = require("../services/razorpayService");

const supabase = require("../services/supabaseService");


/* ======================================
   DUPLICATE PAYMENT PROTECTION
====================================== */

const processedPayments = new Set();


/* ======================================
   CREATE PAYMENT ORDER
====================================== */

router.post("/create-payment-order", limiter, async (req,res)=>{

  console.log("Incoming create-payment-order request");

  try{

    const { cart } = req.body;

    if(!cart || !Array.isArray(cart) || cart.length === 0){

      return res.status(400).json({
        error:"Invalid cart"
      });

    }

    /* ------------------------------------
       CALCULATE TOTAL ON BACKEND
    ------------------------------------ */

    let subtotal = 0;

    cart.forEach(item => {

      const price =
        Number(item.price ??
        item.variantPrice ??
        item.priceInr ??
        0);

      const quantity =
        Number(item.quantity ??
        item.qty ??
        1);

      if(!price || quantity <= 0){
        throw new Error("Invalid cart item");
      }

      subtotal += price * quantity;

    });

    const delivery = subtotal >= 799 ? 0 : 60;
    const total = subtotal + delivery;

    console.log("Calculated subtotal:", subtotal);
    console.log("Delivery:", delivery);
    console.log("Final total:", total);

    /* ------------------------------------
       CREATE ORDER ID
    ------------------------------------ */

    const orderId = "MIL-" + Date.now();

    /* ------------------------------------
       INSERT ORDER
    ------------------------------------ */

    const { error: insertError } = await supabase
      .from("orders")
      .insert({
        order_id: orderId,
        subtotal: subtotal,
        delivery: delivery,
        total: total,
        status: "PENDING",
        payment_status: "UNPAID",
        payment_provider: "razorpay",
        cart_snapshot: cart
      });

    if(insertError){
      console.error("Supabase order insert error:", insertError);
      throw insertError;
    }

    /* ------------------------------------
       INSERT ORDER ITEMS
    ------------------------------------ */

    const itemRows = cart.map(item => {

      const price =
        Number(item.price ??
        item.variantPrice ??
        item.priceInr ??
        0);

      const quantity =
        Number(item.quantity ??
        item.qty ??
        1);

      return {

        order_id: orderId,

        product_id: item.id || null,
        product_name: item.name || item.productName || "Unknown",
        variant_name: item.variant || item.pack || null,
        sku: item.sku || null,

        qty: quantity,
        price: price,

        cost_price: null,
        weight: null

      };

    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemRows);

    if(itemsError){
      console.error("Order items insert error:", itemsError);
    }

    /* ------------------------------------
       CREATE RAZORPAY ORDER
    ------------------------------------ */

    const order = await createPaymentOrder(total);

    console.log("Razorpay order created:", order.id);

    /* ------------------------------------
       SAVE RAZORPAY ORDER ID
    ------------------------------------ */

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_order_id: order.id
      })
      .eq("order_id", orderId);

    if(updateError){
      console.error("Supabase update error:", updateError);
    }

    res.json({
      razorpayOrderId: order.id,
      internalOrderId: orderId,
      amount: order.amount,
      currency: order.currency
    });

  }catch(err){

    console.error("Create payment order error:",err);

    res.status(500).json({
      error: err.message
    });

  }

});


/* ======================================
   VERIFY PAYMENT
====================================== */

router.post("/verify-payment", async (req,res)=>{

  try{

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    /* ------------------------------------
       VERIFY SIGNATURE
    ------------------------------------ */

    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if(!isValid){

      return res.status(400).json({
        status:"failed",
        message:"Invalid payment signature"
      });

    }

    /* ------------------------------------
       DATABASE IDEMPOTENCY CHECK
    ------------------------------------ */

    const { data: existingPayment } = await supabase
      .from("orders")
      .select("payment_id")
      .eq("payment_id", razorpay_payment_id)
      .single();

    if(existingPayment){

      console.log("Duplicate payment ignored:", razorpay_payment_id);

      return res.json({
        status:"success",
        message:"Payment already processed"
      });

    }

    /* ------------------------------------
       MEMORY DUPLICATE CHECK
    ------------------------------------ */

    if(processedPayments.has(razorpay_payment_id)){

      return res.json({
        status:"success",
        message:"Payment already processed"
      });

    }

    processedPayments.add(razorpay_payment_id);

    /* ------------------------------------
       UPDATE ORDER STATUS
    ------------------------------------ */

    const updatePayload = {
      payment_status: "PAID",
      status: "PAID",
      payment_id: razorpay_payment_id,
      paid_at: new Date()
    };

    if(orderData){

      updatePayload.name = orderData.name;
      updatePayload.phone = orderData.phone;
      updatePayload.address_line1 = orderData.address;

    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("payment_order_id", razorpay_order_id);

    if(updateError){
      console.error("Supabase payment update error:", updateError);
    }

    console.log("Payment verified:", razorpay_payment_id);

    return res.json({
      status:"success",
      message:"Payment verified"
    });

  }catch(err){

    console.error("Payment verification error:",err);

    res.status(500).json({
      status:"error",
      message:"Verification failed"
    });

  }

});


module.exports = router;
