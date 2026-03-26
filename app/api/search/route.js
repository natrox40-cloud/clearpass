export async function POST(request) {
  try {
    const { productName, targetCountry } = await request.json();
 
    if (!productName || !productName.trim()) {
      return new Response(JSON.stringify({ matches: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
 
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
 
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ error: "Supabase not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
 
    const searchTerm = productName.trim().toLowerCase();
    const countryMap = { kr: "한국", jp: "일본", us: "미국", eu: "EU" };
    const selectedCountry = countryMap[targetCountry] || "한국";
 
    // Search ALL countries (cross-search)
    const url = `${SUPABASE_URL}/rest/v1/hazardous_products?product_name=ilike.*${encodeURIComponent(searchTerm)}*&select=id,product_name,detected_ingredient,detected_ingredient_kr,manufacturer,origin_country,status,source,target_country&limit=20`;
 
    const res = await fetch(url, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    });
 
    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }
 
    const data = await res.json();
 
    const matches = (data || []).map((r) => ({
      id: r.id,
      productName: r.product_name || "",
      manufacturer: r.manufacturer || "",
      country: r.origin_country || "",
      detectedIngredient: r.detected_ingredient || "",
      detectedIngredientKr: r.detected_ingredient_kr || "",
      source: r.source || "",
      targetCountry: r.target_country || "",
      isSelectedCountry: r.target_country === selectedCountry,
    }));
 
    return new Response(JSON.stringify({ 
      matches, 
      count: matches.length,
      selectedCountry,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
