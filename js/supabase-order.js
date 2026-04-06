const supabase = window.supabase.createClient(
  "https://qpdmonukpclrakkwwimb.supabase.co",
  "sb_publishable_rVbc_Kyb_TZe2n18KsFcLQ_QWKAM63t"
);

async function saveOrderToDB(orderData) {
  try {
    const { name, phone, address, pincode, items, total } = orderData;

    // =========================
    // 1. Find or create customer
    // =========================
    let { data: existing, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let customerId;

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert([{ name, phone, address, pincode }])
        .select();

      if (customerError) throw customerError;

      if (!newCustomer || newCustomer.length === 0) {
        throw new Error("Customer insert failed");
      }

      customerId = newCustomer[0].id;
    }

    // =========================
    // 2. Create order
    // =========================
    const orderNumber = "MIL-" + Date.now();

    const { data: order, error: orderError } = await supabase
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
    // 3. Insert order items
    // =========================
    const itemsData = items.map(item => ({
      order_id: orderId,
      product_name: item.name,
      quantity: item.qty,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsData);

    if (itemsError) throw itemsError;

    return orderNumber;

  } catch (err) {
    console.error("ORDER SAVE ERROR:", err);
    alert("Something went wrong while saving order.");
    throw err;
  }
}



window.saveOrderToDB = saveOrderToDB;
