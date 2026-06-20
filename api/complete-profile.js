module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customer_id, business_name, phone_number } = req.body;

  if (!customer_id || !business_name || !phone_number) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const shopify_store = process.env.SHOPIFY_STORE;
    const shopify_token = process.env.SHOPIFY_TOKEN;
    const base_url = `https://${shopify_store}/admin/api/2024-04`;

    const headers = {
      "X-Shopify-Access-Token": shopify_token,
      "Content-Type": "application/json",
    };

    // Business Name save karo
    await fetch(`${base_url}/customers/${customer_id}/metafields.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        metafield: {
          namespace: "custom",
          key: "business_name",
          value: business_name,
          type: "single_line_text_field",
        },
      }),
    });

    // Phone Number save karo
    await fetch(`${base_url}/customers/${customer_id}/metafields.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        metafield: {
          namespace: "custom",
          key: "phone_number",
          value: phone_number,
          type: "single_line_text_field",
        },
      }),
    });

    // Profile Completed = true karo
    await fetch(`${base_url}/customers/${customer_id}/metafields.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        metafield: {
          namespace: "custom",
          key: "profile_completed",
          value: "true",
          type: "boolean",
        },
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
