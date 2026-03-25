import { useState, useEffect, useRef } from "react";

/* ─── Banned ingredient database (extracted from MFDS records + 2026 updates) ─── */
const BANNED = [
  "1-androstenedione","3b-hydroxy-androst-1-ene-17-one","5-htp","5-hydroxytryptophan",
  "7-keto-dhea","activated charcoal","agmatine sulfate","arjuna","bacopa",
  "bisacodyl","black cohosh","boldione","bovine gelatin","buchu leaf",
  "candle bush","cannabidiol","cardarine","cascara sagrada","cascaroside",
  "cat's claw","catuaba","cbd","cbda","cbg","cbga","cbn",
  "chlorpheniramine","citrulline malate","clubmoss extract",
  "deanol","delta-8-thc","desoxy-d2pm","desulfonylchlorosildenafil",
  "dexamethasone","dhea","dehydroepiandrosterone","diclofenac","diindolylmethane","dim",
  "dmaa","dmae","echinacea","ephedra","epimedium","fucoxanthin",
  "guggul","gw 501516","gymnema","gymnema sylvestre","hemp","hhc",
  "hoodia","hoodia gordonii","horny goat weed","horse chestnut",
  "icarine","kavain","l-citrulline","l-dopa",
  "levodopa","lgd-4033","lidocaine","lithium","magnolia officinalis",
  "melatonin","mitragyna speciosa","mitragynine","mk 2866","mk-677",
  "mucuna pruriens","muira puama","n-acetyl-cysteine","n-acetyl-l-cysteine",
  "nac","nutrabol","orlistat","ostarine","oxilofrine","paba",
  "para-aminobenzoic acid","phenylethylamine","phellodendron amurense",
  "phenibut","phenolphthaleine","phyllanthus amarus","pomegranate bark",
  "prednisolone","pueraria mirifica","pygeum","rauwolfia","rauwolfia vomitoria",
  "rhaponticum carthamoides","rheum palmatum","s4","andarine","senna","sennoside",
  "sibutramine","sildenafil","silver","sr-9009","stenabolic","synephrine",
  "tadalafil","terminalia arjuna","thc","thca","theobromine",
  "velvet bean","vervain","vinpocetine","white willow","yk-11",
  "yohimbe","yohimbine","β-methylphenylethylamine",
  /* ─── 2026 추가: 항히스타민 성분 (식약처 기획검사 반입차단 대상) ─── */
  "acrivastine","azelastine","brompheniramine","cetirizine","clemastine",
  "cyproheptadine","desloratadine","dexbrompheniramine","dexchlorpheniramine",
  "dimenhydrinate","diphenhydramine","doxylamine","fexofenadine","hydroxyzine",
  "ketotifen","levocetirizine","loratadine","meclizine","promethazine",
  "triprolidine","pheniramine",
  /* ─── 2026 추가: 호흡기 의약품 성분 ─── */
  "theophylline","theobromine","dextromethorphan","guaifenesin","pseudoephedrine",
  "phenylephrine","codeine","benzonatate","bromhexine","ambroxol",
  "carbocisteine","noscapine",
  /* ─── 추가: 체중감량/다이어트 의약품 성분 ─── */
  "lorcaserin","rimonabant","fenfluramine","phentermine","topiramate",
  "dinitrophenol","dnp","2,4-dinitrophenol","laxogenin","usnic acid",
  /* ─── 추가: 성기능 관련 추가 성분 ─── */
  "vardenafil","avanafil","dapoxetine","flibanserin","aminotadalafil",
  "hongdenafil","homosildenafil","hydroxyhomosildenafil","sulfoaildenafil",
  "thiosildenafil","udenafil","mirodenafil",
  /* ─── 추가: SARM/운동 보충제 관련 ─── */
  "rad-140","rad 140","testolone","ibutamoren","ligandrol","enobosarm",
  "ac-262536","s-23","tta","myostatin inhibitor",
  /* ─── 추가: 기타 ─── */
  "picamilon","tianeptine","adrafinil","modafinil","armodafinil",
  "piracetam","aniracetam","noopept","sulbutiamine","kratom",
  "kava","kava kava","akuamma","amanita muscaria",
  /* ─── 한국어 성분 추가 ─── */
  "곤약","구연산실데나필","디폭세틴","우피","음양곽","인도사목","클로람페니콜","테오필린",
  "시부트라민","멜라토닌","에페드라","요힘빈","센노사이드","실데나필","타다라필",
  "페니부트","페놀프탈레인","덱사메타손","프레드니솔론"
];
const HIGH = new Set(["sildenafil","tadalafil","sibutramine","s4","andarine","sr-9009","ostarine",
  "lgd-4033","mk-677","mk 2866","yk-11","gw 501516","cardarine","stenabolic","nutrabol",
  "thc","thca","delta-8-thc","cbd","cannabidiol","ephedra","dmaa","phenibut",
  "desulfonylchlorosildenafil","boldione","1-androstenedione","구연산실데나필",
  "prednisolone","desoxy-d2pm","orlistat","phenolphthaleine","hhc",
  "mitragynine","mitragyna speciosa","dexamethasone","diclofenac","bisacodyl","lidocaine",
  "chlorpheniramine","클로람페니콜","디폭세틴",
  /* 2026 추가 HIGH */
  "vardenafil","avanafil","dapoxetine","aminotadalafil","hongdenafil","homosildenafil",
  "hydroxyhomosildenafil","sulfoaildenafil","thiosildenafil","udenafil","mirodenafil",
  "rad-140","rad 140","testolone","ibutamoren","ligandrol","enobosarm","s-23",
  "lorcaserin","rimonabant","fenfluramine","dinitrophenol","dnp","2,4-dinitrophenol",
  "codeine","modafinil","armodafinil","pseudoephedrine","kratom","시부트라민","실데나필","타다라필",
  "tianeptine","promethazine"]);

function detect(text) {
  if (!text?.trim()) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const b of BANNED) {
    if (b.length < 3) continue;
    if (lower.includes(b)) {
      const idx = lower.indexOf(b);
      found.push({ name: b, risk: HIGH.has(b) ? "high" : "med", ctx: text.substring(Math.max(0,idx-15), Math.min(text.length, idx+b.length+15)) });
    }
  }
  return found.filter((f,i) => !found.some((o,j) => i!==j && o.name.length > f.name.length && o.name.includes(f.name)));
}

/* ─── Animated counter ─── */
function Counter({ end, duration = 2000, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          setVal(Math.floor(p * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        tick();
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Main App ─── */
export default function App() {
  const [page, setPage] = useState("home");
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [country, setCountry] = useState("kr");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  /* ─── Image upload state ─── */
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageExtracting, setImageExtracting] = useState(false);
  const [imageExtracted, setImageExtracted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState("text"); // "text", "image", "url"
  const fileInputRef = useRef(null);
  /* ─── URL input state ─── */
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  /* ─── Browser history for back button ─── */
  function navigateTo(newPage) {
    window.history.pushState({ page: newPage }, "", `#${newPage}`);
    setPage(newPage);
  }
  useEffect(() => {
    const handlePop = (e) => {
      const p = e.state?.page || "home";
      setPage(p);
    };
    window.addEventListener("popstate", handlePop);
    // Set initial state
    window.history.replaceState({ page: "home" }, "", "#home");
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const countries = [
    { code: "kr", name: "한국", flag: "🇰🇷", active: true },
    { code: "jp", name: "日本", flag: "🇯🇵", active: false },
    { code: "us", name: "USA", flag: "🇺🇸", active: false },
    { code: "eu", name: "EU", flag: "🇪🇺", active: false },
  ];

  /* ─── Image handling ─── */
  function handleImageSelect(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImageExtracted(false);
    setIngredients("");
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  }

  /* ─── Clipboard paste (Ctrl+V / PrintScreen) ─── */
  useEffect(() => {
    function handlePaste(e) {
      if (inputMode !== "image") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          handleImageSelect(file);
          break;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [inputMode]);

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageExtracted(false);
    setIngredients("");
  }

  async function extractFromImage() {
    if (!imagePreview) return;
    setImageExtracting(true);
    try {
      const base64Data = imagePreview.split(",")[1];
      const mediaType = imageFile.type || "image/jpeg";
      
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data }
              },
              {
                type: "text",
                text: `This is a supplement/food product label image. Extract ALL ingredient text visible in this image. Include everything: ingredient names, amounts, percentages, "Other Ingredients", warnings about contents.

Rules:
- Output ONLY the extracted text, nothing else
- Keep original language (English, Korean, Japanese, etc.)
- Keep original formatting as much as possible
- If you see "Supplement Facts" or "Nutrition Facts" or similar header, include everything under it
- If no ingredient information is found, respond with: NO_INGREDIENTS_FOUND`
              }
            ],
          }],
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        const errStr = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        if (errStr.includes("rate_limit")) {
          alert("요청이 많아 일시적으로 제한되었습니다. 1분 후 다시 시도해주세요.");
        } else {
          alert("이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
        setImageExtracting(false);
        return;
      }
      
      const text = data.content?.map(c => c.text || "").join("\n") || "";
      
      if (!text || text.includes("NO_INGREDIENTS_FOUND")) {
        setIngredients("");
        alert("이미지에서 성분 정보를 찾을 수 없습니다. 다른 이미지를 시도해주세요.");
      } else {
        setIngredients(text);
        setImageExtracted(true);
      }
    } catch (err) {
      alert("이미지 분석 중 오류: " + err.message);
    }
    setImageExtracting(false);
  }

  /* ─── DB search state ─── */
  const [dbMatches, setDbMatches] = useState([]);
  const [dbSearching, setDbSearching] = useState(false);

  async function runCheck() {
    if (!ingredients.trim() && !productName.trim()) return;
    setAnalyzing(true);
    setAiText("");
    setDbMatches([]);

    // 1차: 성분 키워드 매칭
    const d = detect(ingredients);
    const high = d.filter(x => x.risk === "high");
    const med = d.filter(x => x.risk === "med");

    // 2차: 제품명 DB 검색 (병렬 실행)
    let dbResults = [];
    if (productName.trim()) {
      setDbSearching(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName: productName.trim() }),
        });
        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          dbResults = data.matches;
          setDbMatches(data.matches);
        }
      } catch (err) {
        console.error("DB search error:", err);
      }
      setDbSearching(false);
    }

    // 판정: DB에서 위해식품으로 발견되면 무조건 danger
    const dbDanger = dbResults.length > 0;
    const level = dbDanger ? "danger" : (high.length > 0 ? "danger" : med.length > 0 ? "warning" : "safe");

    setResults({
      product: productName || "Unknown",
      detected: d, high, med,
      level,
      time: new Date().toLocaleString("ko-KR"),
      fromImage: inputMode === "image" && imageExtracted,
      dbMatches: dbResults,
    });
    setAnalyzing(false);
    if (d.length > 0) runAi(ingredients, d);
  }

  async function runAi(text, detected) {
    setAiLoading(true);
    const highList = detected.filter(d => d.risk === "high").map(d => d.name).join(", ");
    const medList = detected.filter(d => d.risk === "med").map(d => d.name).join(", ");
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 800,
          messages: [{ role: "user", content: `당신은 한국 식약처(MFDS) 해외직구 위해식품 통관 전문가입니다.

중요 규칙:
1. 아래 성분들은 한국 식약처 "해외직구 위해식품 차단 목록"에 실제 등재된 금지/주의 성분입니다.
2. 해외에서는 일반 보충제로 판매되더라도, 한국 통관 기준으로는 금지입니다.
3. 1차 매칭에서 검출된 성분을 "안전하다"고 뒤집으려면, 반드시 해당 성분명이 다른 단어의 일부(예: "pea"가 "pea protein"의 일부)인 경우에만 가능합니다.
4. L-Citrulline, Melatonin, 5-HTP, Yohimbine 등은 해외에서 일반적이지만 한국에서는 금지 성분입니다. 이런 성분을 "안전"으로 분류하지 마세요.

[위험 등급 성분 (통관 차단 대상)]: ${highList || "없음"}
[주의 등급 성분 (통관 주의 대상)]: ${medList || "없음"}

[제품 성분 텍스트]:
${text.substring(0,1500)}

아래 양식으로만 한국어로 답변하세요:

🔍 AI 정밀 판독

[위험 성분]
• 성분명 — 한국 식약처 기준 금지/주의 사유 (1줄)

[가짜 알람 (안전)]
• 성분명 — 다른 단어의 일부이므로 안전 (1줄)
(해당 없으면 "없음"으로 표시)

[종합]
통관 위험도: 높음/중간/낮음
근거: (1줄)` }],
        }),
      });
      const data = await res.json();
      setAiText(data.content?.map(c => c.text || "").join("\n") || "분석 실패");
    } catch { setAiText("⚠️ AI 연결 실패 — 1차 매칭 결과를 참고하세요."); }
    setAiLoading(false);
  }

  const R = { danger: { bg: "#1C0A0A", border: "#DC2626", accent: "#EF4444", text: "#FCA5A5", badge: "🚨 위험", badgeBg: "#991B1B" },
    warning: { bg: "#1A1506", border: "#D97706", accent: "#F59E0B", text: "#FDE68A", badge: "⚠️ 주의", badgeBg: "#92400E" },
    safe: { bg: "#061A0E", border: "#059669", accent: "#10B981", text: "#6EE7B7", badge: "✅ 안전", badgeBg: "#065F46" }};

  /* ─── Styles ─── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --bg: #08090E; --surface: #0F1117; --surface2: #161822; --border: rgba(255,255,255,0.06); --text: #E8E9ED; --text2: #8B8D98; --accent: #4F8FFF; --accent2: #2563EB; }
    body { background: var(--bg); color: var(--text); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(79,143,255,0.15)} 50%{box-shadow:0 0 40px rgba(79,143,255,0.3)} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .fade-up { animation: fadeUp .6s ease both }
    .fade-up-1 { animation-delay: .1s }
    .fade-up-2 { animation-delay: .2s }
    .fade-up-3 { animation-delay: .3s }
    .fade-up-4 { animation-delay: .4s }
    input:focus, textarea:focus { outline:none; border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(79,143,255,0.1) }
    button { cursor: pointer; transition: all .15s ease }
    button:hover { filter: brightness(1.1); transform: translateY(-1px) }
    button:active { transform: translateY(0) }
    ::selection { background: rgba(79,143,255,0.3) }
    .grain { position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:.03;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E") }
  `;

  /* ─── LANDING PAGE ─── */
  if (page === "home") return (
    <div style={{ fontFamily: "'Outfit', 'Noto Sans KR', sans-serif", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <style>{css}</style>
      <div className="grain" />
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(8,9,14,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #4F8FFF, #2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛡</div>
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.02em" }}>ClearPass</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => navigateTo("check")} style={{ padding:"8px 20px", borderRadius:8, border:"1px solid var(--accent)", background:"transparent", color:"var(--accent)", fontSize:13, fontWeight:600 }}>판독 시작</button>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth:1080, margin:"0 auto", padding:"100px 24px 80px", textAlign:"center" }}>
        <div className="fade-up" style={{ display:"inline-block", padding:"6px 16px", borderRadius:20, background:"rgba(79,143,255,0.08)", border:"1px solid rgba(79,143,255,0.15)", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
          식약처 해외직구 위해식품 DB 4,631건 기반
        </div>
        <h1 className="fade-up fade-up-1" style={{ fontSize:"clamp(36px, 5.5vw, 64px)", fontWeight:900, lineHeight:1.15, letterSpacing:"-0.03em", marginBottom:20 }}>
          해외직구 식품·영양제,<br/>
          <span style={{ background:"linear-gradient(135deg, #4F8FFF 0%, #818CF8 50%, #C084FC 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>통관 전에 확인하세요</span>
        </h1>
        <p className="fade-up fade-up-2" style={{ fontSize:17, color:"var(--text2)", maxWidth:560, margin:"0 auto 24px", lineHeight:1.7 }}>
          건강기능식품·영양제·보충제의 성분표 사진을 올리거나<br/>
          텍스트를 붙여넣으면 AI가 금지 성분을 즉시 판정합니다.
        </p>
        <p className="fade-up fade-up-2" style={{ fontSize:12, color:"var(--text2)", opacity:0.6, marginBottom:40 }}>
          현재 검사 범위: 식품 · 건강기능식품 · 영양제 · 보충제 | 의약품 · 화장품 · 전자제품은 미지원
        </p>
        <div className="fade-up fade-up-3" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigateTo("check")} style={{ padding:"14px 36px", borderRadius:10, border:"none", background:"linear-gradient(135deg, #4F8FFF, #2563EB)", color:"#fff", fontSize:16, fontWeight:700, boxShadow:"0 4px 24px rgba(79,143,255,0.3)" }}>
            무료로 판독 시작 →
          </button>
          <button onClick={() => navigateTo("pricing")} style={{ padding:"14px 28px", borderRadius:10, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--text2)", fontSize:15, fontWeight:500 }}>
            요금 안내
          </button>
        </div>
        <div className="fade-up fade-up-4" style={{ marginTop:40, textAlign:"center" }}>
          <p style={{ fontSize:12, color:"var(--text2)", marginBottom:10, fontWeight:500 }}>통관 검사 대상국</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          {countries.map(c => (
            <div key={c.code} style={{ padding:"8px 16px", borderRadius:20, background: c.active ? "rgba(79,143,255,0.08)" : "var(--surface)", border:`1px solid ${c.active ? "rgba(79,143,255,0.2)" : "var(--border)"}`, fontSize:13, fontWeight:500, color: c.active ? "var(--accent)" : "var(--text2)", opacity: c.active ? 1 : 0.5 }}>
              {c.flag} {c.name} {!c.active && <span style={{fontSize:10}}>Coming Soon</span>}
            </div>
          ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
          {[
            { n: 4631, s: "건", label: "식약처 DB 등록 위해식품", icon: "🗄️" },
            { n: 157, s: "+", label: "금지/주의 성분 추적 중", icon: "🔬" },
            { n: 2, s: "초", label: "AI 판독 소요 시간", icon: "⚡" },
          ].map((s, i) => (
            <div key={i} style={{ padding:28, borderRadius:16, background:"var(--surface)", border:"1px solid var(--border)", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:32, fontWeight:800, color:"var(--accent)", letterSpacing:"-0.02em" }}><Counter end={s.n} />{s.s}</div>
              <div style={{ fontSize:13, color:"var(--text2)", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 100px" }}>
        <h2 style={{ fontSize:28, fontWeight:800, textAlign:"center", marginBottom:48, letterSpacing:"-0.02em" }}>어떻게 작동하나요?</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:20 }}>
          {[
            { step: "01", title: "성분 입력", desc: "텍스트를 붙여넣거나 성분표 사진을 업로드", color: "#4F8FFF" },
            { step: "02", title: "이미지 판독", desc: "AI가 사진 속 성분표 텍스트를 자동 추출", color: "#818CF8" },
            { step: "03", title: "위험 성분 스캔", desc: "157개 금지 성분 DB와 자동 대조 + AI 분석", color: "#C084FC" },
            { step: "04", title: "판정 리포트", desc: "위험도 등급과 근거가 포함된 즉시 결과 제공", color: "#F472B6" },
          ].map((s, i) => (
            <div key={i} style={{ padding:28, borderRadius:16, background:"var(--surface)", border:"1px solid var(--border)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-8, right:-8, fontSize:72, fontWeight:900, color: s.color, opacity:0.06 }}>{s.step}</div>
              <div style={{ fontSize:12, fontWeight:700, color: s.color, marginBottom:8, fontFamily:"'Outfit'" }}>STEP {s.step}</div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>{s.title}</h3>
              <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth:600, margin:"0 auto", padding:"0 24px 100px", textAlign:"center" }}>
        <div style={{ padding:48, borderRadius:20, background:"linear-gradient(135deg, rgba(79,143,255,0.06), rgba(129,140,248,0.06))", border:"1px solid rgba(79,143,255,0.12)" }}>
          <h2 style={{ fontSize:24, fontWeight:800, marginBottom:12 }}>지금 바로 확인해보세요</h2>
          <p style={{ fontSize:14, color:"var(--text2)", marginBottom:24 }}>무료 체험 3건 제공 · 가입 불필요 · 이미지 판독 지원<br/><span style={{ fontSize:11, opacity:0.6 }}>식품 · 건강기능식품 · 영양제 · 보충제 전용</span></p>
          <button onClick={() => navigateTo("check")} style={{ padding:"14px 40px", borderRadius:10, border:"none", background:"linear-gradient(135deg, #4F8FFF, #2563EB)", color:"#fff", fontSize:16, fontWeight:700 }}>
            판독 시작 →
          </button>
        </div>
      </section>

      <footer style={{ borderTop:"1px solid var(--border)", padding:"24px", textAlign:"center", fontSize:11, color:"var(--text2)" }}>
        <p>© 2026 ClearPass · 식품안전나라 해외직구 위해식품 차단 목록 기반 · 본 결과는 참고용이며 최종 통관 여부는 세관 판단에 따릅니다</p>
      </footer>
    </div>
  );

  /* ─── PRICING PAGE ─── */
  if (page === "pricing") return (
    <div style={{ fontFamily: "'Outfit', 'Noto Sans KR', sans-serif", minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <style>{css}</style>
      <div className="grain" />
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(8,9,14,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 }}>
          <button onClick={() => navigateTo("home")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", color:"var(--text)" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #4F8FFF, #2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛡</div>
            <span style={{ fontSize:17, fontWeight:700 }}>ClearPass</span>
          </button>
          <button onClick={() => navigateTo("check")} style={{ padding:"8px 20px", borderRadius:8, border:"none", background:"var(--accent)", color:"#fff", fontSize:13, fontWeight:600 }}>판독 시작</button>
        </div>
      </nav>
      <section style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800, textAlign:"center", marginBottom:8 }}>요금 안내</h1>
        <p style={{ textAlign:"center", color:"var(--text2)", fontSize:14, marginBottom:48 }}>무료 체험 3건 포함 · 부가세 별도</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16 }}>
          {[
            { name: "Starter", price: "4,900", count: "20건", per: "245원/건", pop: false },
            { name: "Standard", price: "19,000", count: "100건", per: "190원/건", pop: true },
            { name: "Pro", price: "49,000", count: "300건", per: "163원/건", pop: false },
          ].map((p, i) => (
            <div key={i} style={{ padding:32, borderRadius:16, background: p.pop ? "rgba(79,143,255,0.06)" : "var(--surface)", border: `1px solid ${p.pop ? "rgba(79,143,255,0.3)" : "var(--border)"}`, textAlign:"center", position:"relative" }}>
              {p.pop && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", padding:"4px 14px", borderRadius:12, background:"var(--accent)", color:"#fff", fontSize:11, fontWeight:700 }}>추천</div>}
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>{p.name}</h3>
              <div style={{ fontSize:36, fontWeight:900, letterSpacing:"-0.02em" }}>₩{p.price}</div>
              <div style={{ fontSize:13, color:"var(--text2)", margin:"8px 0 20px" }}>{p.count} · {p.per}</div>
              <button style={{ width:"100%", padding:"12px", borderRadius:8, border: p.pop ? "none" : "1px solid var(--border)", background: p.pop ? "var(--accent)" : "transparent", color: p.pop ? "#fff" : "var(--text2)", fontSize:14, fontWeight:600 }}>선택</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  /* ─── CHECK PAGE ─── */
  return (
    <div style={{ fontFamily:"'Outfit','Noto Sans KR',sans-serif", minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <style>{css}</style>
      <div className="grain" />

      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(8,9,14,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 }}>
          <button onClick={() => navigateTo("home")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", color:"var(--text)" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #4F8FFF, #2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛡</div>
            <span style={{ fontSize:17, fontWeight:700 }}>ClearPass</span>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:"var(--text2)", fontWeight:500 }}>수입국:</span>
            {countries.map(c => (
              <button key={c.code} onClick={() => c.active && setCountry(c.code)} style={{
                padding:"6px 12px", borderRadius:6, border:`1px solid ${country === c.code ? "var(--accent)" : "var(--border)"}`,
                background: country === c.code ? "rgba(79,143,255,0.1)" : "transparent",
                color: c.active ? (country === c.code ? "var(--accent)" : "var(--text2)") : "var(--text2)",
                fontSize:12, fontWeight:600, opacity: c.active ? 1 : 0.35,
              }}>{c.flag} {c.name}</button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 16px" }}>
        {/* Scope notice */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", marginBottom:16, borderRadius:10, background:"rgba(79,143,255,0.06)", border:"1px solid rgba(79,143,255,0.12)" }}>
          <span style={{ fontSize:14 }}>💊</span>
          <span style={{ fontSize:12, color:"var(--text2)" }}>
            <strong style={{ color:"var(--accent)" }}>검사 범위:</strong> 식품 · 건강기능식품 · 영양제 · 보충제 &nbsp;|&nbsp; 
            <span style={{ opacity:0.6 }}>의약품 · 화장품 · 전자제품은 현재 미지원</span>
          </span>
        </div>
        {/* Input */}
        <div className="fade-up" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, marginBottom:20 }}>
          {/* Product name */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>제품명</label>
            <input type="text" placeholder="예: Hardon Blue, NOW Foods Omega-3" value={productName} onChange={e => setProductName(e.target.value)}
              style={{ width:"100%", padding:"12px 16px", borderRadius:10, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", fontSize:15, boxSizing:"border-box" }} />
          </div>

          {/* Input mode toggle */}
          <div style={{ display:"flex", gap:4, marginBottom:16, background:"var(--bg)", borderRadius:10, padding:4 }}>
            {[
              { key:"text", label:"📝 텍스트", icon:"" },
              { key:"image", label:"📷 이미지", icon:"" },
              { key:"url", label:"🔗 URL", icon:"" },
            ].map(m => (
              <button key={m.key} onClick={() => setInputMode(m.key)} style={{
                flex:1, padding:"10px", borderRadius:8, border:"none", fontSize:13, fontWeight:600,
                background: inputMode === m.key ? "rgba(79,143,255,0.15)" : "transparent",
                color: inputMode === m.key ? "var(--accent)" : "var(--text2)",
              }}>{m.label}</button>
            ))}
          </div>

          {/* Text input mode */}
          {inputMode === "text" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ position:"relative" }}>
                {!ingredients && (
                  <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:1, padding:20 }}>
                    <div style={{ fontSize:32, marginBottom:8, opacity:0.4 }}>📋</div>
                    <p style={{ fontSize:14, fontWeight:600, color:"var(--text2)", opacity:0.6, textAlign:"center" }}>성분표 텍스트를 여기에 붙여넣으세요</p>
                    <p style={{ fontSize:11, color:"var(--text2)", opacity:0.4, textAlign:"center", marginTop:4 }}>아마존/iHerb 등 상세페이지에서 Supplement Facts를 복사(Ctrl+C)한 뒤 여기에 붙여넣기(Ctrl+V)</p>
                  </div>
                )}
                <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={7}
                  style={{ width:"100%", padding:"12px 16px", borderRadius:10, background:"var(--bg)", border: ingredients ? "1px solid var(--accent)" : "1px solid rgba(79,143,255,0.2)", color:"var(--text)", fontSize:14, lineHeight:1.7, resize:"vertical", boxSizing:"border-box", position:"relative", zIndex:2 }} />
              </div>
            </div>
          )}

          {/* URL input mode */}
          {inputMode === "url" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ padding:20, borderRadius:12, border:"1px solid rgba(79,143,255,0.2)", background:"var(--bg)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:24 }}>🔗</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:600, color:"var(--text)" }}>제품 URL을 입력하세요</p>
                    <p style={{ fontSize:11, color:"var(--text2)" }}>아마존, iHerb 등 해외 쇼핑몰 지원 | 네이버·쿠팡 등 국내몰은 준비 중</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input type="url" placeholder="https://www.amazon.com/..." value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    style={{ flex:1, padding:"12px 16px", borderRadius:10, background:"rgba(0,0,0,0.3)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14, boxSizing:"border-box" }} />
                  <button onClick={async () => {
                    if (!urlInput.trim()) return;
                    setUrlLoading(true);
                    try {
                      const res = await fetch("/api/claude", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          model: "claude-sonnet-4-20250514", max_tokens: 1500,
                          messages: [{ role: "user", content: `You have web search capability. Search for the product at this URL: ${urlInput}

Find and extract:
1. The product name
2. ALL ingredients / Supplement Facts

Rules:
- Output the product name on the first line prefixed with "PRODUCT_NAME: "
- Output all ingredients after a line "INGREDIENTS:"
- Keep original language
- If you cannot find the product or ingredients, respond with: NOT_FOUND` }],
                          tools: [{ type: "web_search_20250305", name: "web_search" }],
                        }),
                      });
                      const data = await res.json();
                      if (data.error) {
                        const errStr = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
                        if (errStr.includes("rate_limit")) {
                          alert("요청이 많아 일시적으로 제한되었습니다. 1분 후 다시 시도해주세요.");
                        } else {
                          alert("URL 분석 오류가 발생했습니다. 다시 시도해주세요.");
                        }
                      } else {
                        const text = data.content?.map(c => c.text || "").join("\n") || "";
                        if (text.includes("NOT_FOUND")) {
                          alert("해당 URL에서 제품 정보를 찾을 수 없습니다.");
                        } else {
                          const nameMatch = text.match(/PRODUCT_NAME:\s*(.+)/);
                          const ingMatch = text.split("INGREDIENTS:");
                          if (nameMatch) setProductName(nameMatch[1].trim());
                          if (ingMatch[1]) setIngredients(ingMatch[1].trim());
                          setInputMode("text");
                        }
                      }
                    } catch (err) { alert("URL 분석 실패: " + err.message); }
                    setUrlLoading(false);
                  }} disabled={!urlInput.trim() || urlLoading}
                    style={{ padding:"12px 20px", borderRadius:10, border:"none", background: urlInput.trim() ? "linear-gradient(135deg, #818CF8, #6366F1)" : "#1E293B", color:"#fff", fontSize:13, fontWeight:700, whiteSpace:"nowrap", opacity: urlLoading ? 0.7 : 1 }}>
                    {urlLoading ? "분석 중..." : "분석"}
                  </button>
                </div>
                <p style={{ fontSize:11, color:"var(--text2)", marginTop:8, opacity:0.6 }}>
                  AI가 해당 페이지에서 제품명과 성분 정보를 자동으로 추출합니다
                </p>
              </div>
            </div>
          )}

          {/* Image input mode */}
          {inputMode === "image" && (
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>성분표 이미지</label>
              
              {!imagePreview ? (
                /* Drop zone */
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding:"40px 20px", borderRadius:12,
                    border: `2px dashed ${dragOver ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
                    background: dragOver ? "rgba(79,143,255,0.05)" : "var(--bg)",
                    textAlign:"center", cursor:"pointer",
                    transition:"all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize:40, marginBottom:12 }}>📸</div>
                  <p style={{ fontSize:14, fontWeight:600, color: dragOver ? "var(--accent)" : "var(--text)", marginBottom:4 }}>
                    성분표 사진을 드래그하거나 클릭해서 업로드
                  </p>
                  <p style={{ fontSize:13, color:"var(--accent)", marginBottom:4, fontWeight:500 }}>
                    💡 Win+Shift+S로 영역 캡처 → 여기서 Ctrl+V로 바로 붙여넣기
                  </p>
                  <p style={{ fontSize:12, color:"var(--text2)" }}>
                    JPG, PNG, WebP 지원 · Supplement Facts / 성분표 / 영양정보
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display:"none" }}
                    onChange={e => handleImageSelect(e.target.files[0])}
                  />
                </div>
              ) : (
                /* Image preview + extract */
                <div style={{ borderRadius:12, border:"1px solid var(--border)", overflow:"hidden", background:"var(--bg)" }}>
                  <div style={{ position:"relative" }}>
                    <img src={imagePreview} alt="Uploaded" style={{ width:"100%", maxHeight:300, objectFit:"contain", display:"block", background:"#000" }} />
                    <button onClick={removeImage} style={{
                      position:"absolute", top:8, right:8, width:28, height:28, borderRadius:14,
                      background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", fontSize:14,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>✕</button>
                  </div>
                  
                  {!imageExtracted && (
                    <div style={{ padding:16, borderTop:"1px solid var(--border)" }}>
                      <button onClick={extractFromImage} disabled={imageExtracting}
                        style={{
                          width:"100%", padding:"12px", borderRadius:8, border:"none",
                          background: imageExtracting ? "#1E293B" : "linear-gradient(135deg, #818CF8, #6366F1)",
                          color:"#fff", fontSize:14, fontWeight:700,
                          opacity: imageExtracting ? 0.7 : 1,
                        }}>
                        {imageExtracting ? (
                          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            <span style={{ display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></span>
                            AI가 성분표를 읽고 있습니다...
                          </span>
                        ) : "🔬 AI 성분 추출 시작"}
                      </button>
                    </div>
                  )}

                  {imageExtracted && (
                    <div style={{ padding:16, borderTop:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                        <span style={{ color:"#6EE7B7", fontSize:14 }}>✓</span>
                        <span style={{ fontSize:12, fontWeight:600, color:"#6EE7B7" }}>성분 추출 완료</span>
                      </div>
                      <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={5}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:8, background:"rgba(0,0,0,0.3)", border:"1px solid var(--border)", color:"var(--text)", fontSize:12, lineHeight:1.6, resize:"vertical", boxSizing:"border-box" }} />
                      <p style={{ fontSize:11, color:"var(--text2)", marginTop:4 }}>추출된 텍스트를 확인하고 필요시 수정한 뒤 판독을 시작하세요.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={runCheck} disabled={(!ingredients.trim() && !productName.trim()) || analyzing}
              style={{ flex:1, padding:"14px", borderRadius:10, border:"none", background:(ingredients.trim()||productName.trim()) ? "linear-gradient(135deg,#4F8FFF,#2563EB)" : "#1E293B", color:"#fff", fontSize:15, fontWeight:700, opacity:analyzing?.7:1 }}>
              {analyzing ? "분석 중..." : "🔍 판독 시작"}
            </button>
            <button onClick={() => { setProductName("Alpha Muscle Pro X"); setInputMode("text"); setIngredients("L-Arginine 500mg, Tribulus Terrestris 300mg, Yohimbe Bark Extract (standardized for Yohimbine) 200mg, Horny Goat Weed Extract (Epimedium) 150mg, Diindolylmethane (DIM) 100mg, Fenugreek 200mg, Pea Protein Isolate 5g, Melatonin 3mg, Zinc 15mg"); }}
              style={{ padding:"14px 16px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text2)", fontSize:13, fontWeight:500 }}>샘플</button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div style={{ animation:"fadeUp .4s ease both" }}>
            <div style={{ background:R[results.level].bg, border:`1px solid ${R[results.level].border}40`, borderRadius:16, padding:"20px 24px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                <span style={{ padding:"4px 12px", borderRadius:8, background:R[results.level].badgeBg, color:"#fff", fontSize:12, fontWeight:700 }}>{R[results.level].badge}</span>
                {results.fromImage && <span style={{ padding:"3px 8px", borderRadius:6, background:"rgba(129,140,248,0.15)", color:"#A5B4FC", fontSize:10, fontWeight:600 }}>📷 이미지 판독</span>}
                {results.dbMatches?.length > 0 && <span style={{ padding:"3px 8px", borderRadius:6, background:"rgba(239,68,68,0.15)", color:"#FCA5A5", fontSize:10, fontWeight:600 }}>🗄️ DB 매칭</span>}
                <span style={{ fontSize:12, color:R[results.level].text, opacity:.7 }}>{results.product} · {results.time}</span>
              </div>
              <h2 style={{ fontSize:20, fontWeight:800, color:R[results.level].text }}>
                {results.dbMatches?.length > 0
                  ? `⚠️ 식약처 위해식품 DB에 등록된 제품입니다 (${results.dbMatches.length}건 매칭)`
                  : results.level === "safe"
                    ? "금지 성분이 검출되지 않았습니다"
                    : `금지/주의 성분 ${results.detected.length}개 검출`}
              </h2>
            </div>

            {/* DB Matches */}
            {results.dbMatches?.length > 0 && (
              <div style={{ background:"#1C0A0A", border:"1px solid rgba(239,68,68,0.2)", borderRadius:16, padding:20, marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:"#FCA5A5", letterSpacing:"0.02em" }}>🗄️ 식약처 위해식품 DB 매칭 결과</h3>
                {results.dbMatches.map((m, i) => (
                  <div key={i} style={{ padding:"12px 14px", marginBottom:8, borderRadius:10, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.12)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:5, background:"#991B1B", color:"#fff" }}>위해식품</span>
                      <span style={{ fontSize:14, fontWeight:700, color:"#FCA5A5" }}>{m.productName}</span>
                    </div>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12, color:"var(--text2)" }}>
                      {m.detectedIngredient && <span>검출성분: <strong style={{ color:"#EF4444" }}>{m.detectedIngredient}</strong>{m.detectedIngredientKr && ` (${m.detectedIngredientKr})`}</span>}
                      {m.manufacturer && <span>제조사: {m.manufacturer}</span>}
                      {m.country && <span>제조국: {m.country}</span>}
                      {m.registeredDate && <span>등록일: {m.registeredDate}</span>}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize:11, color:"#FCA5A5", marginTop:8, opacity:0.7 }}>
                  이 제품은 식약처에 의해 위해식품으로 등록되어 있으며, 통관 시 차단/폐기될 가능성이 매우 높습니다.
                </p>
              </div>
            )}

            {results.detected.length > 0 && (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:20, marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:"var(--text2)", letterSpacing:"0.02em" }}>1차 성분 매칭</h3>
                {results.detected.map((d, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:6, borderRadius:10,
                    background: d.risk === "high" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                    border: `1px solid ${d.risk === "high" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)"}` }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:5, background: d.risk === "high" ? "#991B1B" : "#92400E", color:"#fff" }}>
                      {d.risk === "high" ? "위험" : "주의"}</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>{d.name}</span>
                    <span style={{ fontSize:11, color:"var(--text2)", marginLeft:"auto", maxWidth:"35%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>...{d.ctx}...</span>
                  </div>
                ))}
              </div>
            )}

            {(aiLoading || aiText) && (
              <div style={{ background:"var(--surface)", border:"1px solid rgba(129,140,248,0.15)", borderRadius:16, padding:20, marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:"#A5B4FC" }}>
                  🤖 AI 정밀 판독 {aiLoading && <span style={{ fontSize:11, color:"var(--text2)", fontWeight:400 }}>분석 중...</span>}
                </h3>
                {aiLoading ? (
                  <div style={{ textAlign:"center", padding:24 }}>
                    <div style={{ fontSize:28, animation:"pulse 1.5s infinite" }}>🔬</div>
                    <p style={{ color:"var(--text2)", fontSize:12, marginTop:8 }}>AI가 문맥을 분석하고 있습니다...</p>
                  </div>
                ) : (
                  <pre style={{ margin:0, padding:16, borderRadius:10, background:"var(--bg)", color:"#C4C8D4", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:"'Noto Sans KR','Outfit',sans-serif" }}>{aiText}</pre>
                )}
              </div>
            )}

            {results.level === "safe" && (
              <div style={{ background:"var(--surface)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:16, padding:28, textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
                <p style={{ fontSize:16, fontWeight:700, color:"#6EE7B7", marginBottom:4 }}>1차 판독 통과</p>
                <p style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>성분 텍스트에서 금지 성분이 검출되지 않았습니다.<br/>라벨 미표기 성분이 존재할 수 있으므로 최종 판단은 세관에 위임됩니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
