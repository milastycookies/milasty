// ========================================
// MILASTY SUPABASE ORDER HANDLER
// ========================================

// جلوگیری duplicate execution
if (window.__SUPABASE_ORDER_LOADED__) {
  console.warn("Supabase order script already loaded");
} else {
  window.__SUPABASE_ORDER_LOADED__ = true;

  // =========================
  // INIT SUPABASE SAFELY
  // =========================
  if (!window.supabaseClient) {

    if (!window.supabase) {
      console.error("Supabase library not loaded");
      alert("System not ready. Please refresh.");
    }

    const { createClient } = window.supabase;

    window.supabaseClient = createClient(
      "https://qpdmonukpclrakkwwimb.supabase.co",
      "sb_publishable_rVbc_Kyb_TZe2n18KsFcLQ_QWKAM63t"
    );
  }

  const sb = window.supabaseClient;

  // =========================
  // SAVE ORDER FUNCTION
  // =========================
  async function saveOrderToDB(orderData) {

    try {
      const { name, phone, address, pincode, items, total } = orderData;

      // -------------------------
      // VALIDATION
      // -------------------------
      if (!name || !phone || !address) {
        throw new Error("Please fill all details");
      }

      if (!items || items.length === 0) {
        throw new Error("Cart is empty");
      }

      // =========================
      // 1. FIND OR CREATE CUSTOMER
      // =========================
      let { data: existing, error: fetchError } = await sb
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let customerId;

      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newCustomer, error: customerError } = await sb
          .from("customers")
          .insert([{
            name,
            phone,
            address,
            pincode: pincode || null
          }])
          .select();

        if (customerError) throw customerError;

        if (!newCustomer || newCustomer.length === 0) {
          throw new Error("Customer insert failed");
        }

        customerId = newCustomer[0].id;
      }

      // =========================
      // 2. CREATE ORDER
      // =========================
      const orderNumber = "MIL-" + Date.now();

      const { data: order, error: orderError } = await sb
        .from("orders")
        .insert([{
          order_number: orderNumber,
          customer_id: customerId,
          total_amount: total,
          payment_status: "pending",
          order_status: "placed"
        }])
        .select();

      if (orderError) throw orderError;

      if (!order || order.length === 0) {
        throw new Error("Order insert failed");
      }

      const orderId = order[0].id;

      // =========================
      // 3. INSERT ORDER ITEMS
      // =========================
      const itemsData = items.map(item => ({
        order_id: orderId,
        product_name: item.name,
        quantity: item.qty,
        price: item.price
      }));

      const { error: itemsError } = await sb
        .from("order_items")
        .insert(itemsData);

      if (itemsError) throw itemsError;

      // =========================
      // SUCCESS
      // =========================
      console.log("✅ Order saved:", orderNumber);

      return orderNumber;

    } catch (err) {
      console.error("ORDER SAVE ERROR:", err);
    
      alert(
        "Order failed. Please try again or contact us on WhatsApp (+91-8927142056) directly."
      );
    
      throw err;
    }
  }

  // =========================
  // EXPORT TO WINDOW
  // =========================
  window.saveOrderToDB = saveOrderToDB;
}
