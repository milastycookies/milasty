const supabase = window.supabase.createClient(
  "https://qpdmonukpclrakkwwimb.supabase.co",
  "sb_publishable_rVbc_Kyb_TZe2n18KsFcLQ_QWKAM63t"
);

async function saveOrderToDB(orderData) {
  const { name, phone, address, pincode, items, total } = orderData;

  // 1. Find or create customer
  let { data: existing } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  let customerId;

  if (existing) {
    customerId = existing.id;
  } else {
    const { data: newCustomer } = await supabase
      .from("customers")
      .insert([{ name, phone, address, pincode }])
      .select();

    customerId = newCustomer[0].id;
  }

  // 2. Create order
  const orderNumber = "MIL-" + Date.now();

  const { data: order } = await supabase
    .from("orders")
    .insert([{
      order_number: orderNumber,
      customer_id: customerId,
      total_amount: total,
      payment_status: "pending",
      order_status: "placed"
    }])
    .select();

  const orderId = order[0].id;

  // 3. Insert order items
  const itemsData = items.map(item => ({
    order_id: orderId,
    product_name: item.name,
    quantity: item.qty,
    price: item.price
  }));

  await supabase.from("order_items").insert(itemsData);

  return orderNumber;
}



window.saveOrderToDB = saveOrderToDB;
