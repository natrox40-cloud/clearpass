export async function POST(request) {
  try {
    const { productName } = await request.json();
 
    if (!productName || !productName.trim()) {
      return new Response(JSON.stringify({ matches: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
 
    const AIRTABLE_TOKEN = process.env.AIRTABLE_API_KEY;
    if (!AIRTABLE_TOKEN) {
      return new Response(JSON.stringify({ error: "Airtable API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
 
    const BASE_ID = "appc3ZNsNDKExnVaM";
    const TABLE_ID = "tblQIu9lwrbhbHmxX";
    
    // Search by product name using Airtable's filterByFormula
    const searchTerm = productName.trim().replace(/'/g, "\\'");
    const formula = encodeURIComponent(`SEARCH(LOWER("${searchTerm}"), LOWER({제품명}))`);
    
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=${formula}&maxRecords=10&fields%5B%5D=제품명&fields%5B%5D=제조사명&fields%5B%5D=제조국가&fields%5B%5D=검출성분&fields%5B%5D=검출성분(국문)&fields%5B%5D=등록일`;
 
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
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
    
    const matches = (data.records || []).map((r) => ({
      id: r.id,
      productName: r.fields["제품명"] || "",
      manufacturer: r.fields["제조사명"]?.name || r.fields["제조사명"] || "",
      country: r.fields["제조국가"]?.name || r.fields["제조국가"] || "",
      detectedIngredient: r.fields["검출성분"]?.name || r.fields["검출성분"] || "",
      detectedIngredientKr: r.fields["검출성분(국문)"] || "",
      registeredDate: r.fields["등록일"] || "",
    }));
 
    return new Response(JSON.stringify({ matches, count: matches.length }), {
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
