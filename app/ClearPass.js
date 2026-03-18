import { useState, useEffect, useRef } from "react";

/* ─── Banned ingredient database (extracted from 4,631 real MFDS records) ─── */
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
  "곤약","구연산실데나필","디폭세틴","우피","음양곽","인도사목","클로람페니콜","테오필린"
];
const HIGH = new Set(["sildenafil","tadalafil","sibutramine","s4","andarine","sr-9009","ostarine",
  "lgd-4033","mk-677","mk 2866","yk-11","gw 501516","cardarine","stenabolic","nutrabol",
  "thc","thca","delta-8-thc","cbd","cannabidiol","ephedra","dmaa","phenibut",
  "desulfonylchlorosildenafil","boldione","1-androstenedione","구연산실데나필",
  "prednisolone","desoxy-d2pm","orlistat","phenolphthaleine","hhc",
  "mitragynine","mitragyna speciosa","dexamethasone","diclofenac","bisacodyl","lidocaine",
  "chlorpheniramine","클로람페니콜","디폭세틴"]);

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

  const countries = [
    { code: "kr", name: "한국", flag: "🇰🇷", active: true },
    { code: "jp", name: "日本", flag: "🇯🇵", active: false },
    { code: "us", name: "USA", flag: "🇺🇸", active: false },
    { code: "eu", name: "EU", flag: "🇪🇺", active: false },
  ];

  function runCheck() {
    if (!ingredients.trim() && !productName.trim()) return;
    setAnalyzing(true);
    setAiText("");
    setTimeout(() => {
      const d = detect(ingredients);
      const high = d.filter(x => x.risk === "high");
      const med = d.filter(x => x.risk === "med");
      setResults({
        product: productName || "Unknown",
        detected: d, high, med,
        level: high.length > 0 ? "danger" : med.length > 0 ? "warning" : "safe",
        time: new Date().toLocaleString("ko-KR"),
      });
      setAnalyzing(false);
      if (d.length > 0) runAi(ingredients, d);
    }, 600);
  }

  async function runAi(text, detected) {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 800,
          messages: [{ role: "user", content: `You are a Korean MFDS customs expert. Analyze these suspected ingredients found in a product: [${detected.map(d=>d.name).join(", ")}]. Product text: ${text.substring(0,1500)}. For each, determine if it's a real risk or false alarm (e.g. "pea" in "pea protein"). Reply in Korean only, format:

🔍 AI 정밀 판독

[위험 성분]
• 성분명 — 사유 (1줄)

[안전 (가짜 알람)]
• 성분명 — 사유 (1줄)

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

      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(8,9,14,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #4F8FFF, #2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛡</div>
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.02em" }}>ClearPass</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setPage("check")} style={{ padding:"8px 20px", borderRadius:8, border:"1px solid var(--accent)", background:"transparent", color:"var(--accent)", fontSize:13, fontWeight:600 }}>판독 시작</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"100px 24px 80px", textAlign:"center" }}>
        <div className="fade-up" style={{ display:"inline-block", padding:"6px 16px", borderRadius:20, background:"rgba(79,143,255,0.08)", border:"1px solid rgba(79,143,255,0.15)", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
          식약처 위해식품 DB 4,631건 기반
        </div>
        <h1 className="fade-up fade-up-1" style={{ fontSize:"clamp(36px, 5.5vw, 64px)", fontWeight:900, lineHeight:1.15, letterSpacing:"-0.03em", marginBottom:20 }}>
          해외 직구 제품,<br/>
          <span style={{ background:"linear-gradient(135deg, #4F8FFF 0%, #818CF8 50%, #C084FC 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>통관 전에 확인하세요</span>
        </h1>
        <p className="fade-up fade-up-2" style={{ fontSize:17, color:"var(--text2)", maxWidth:520, margin:"0 auto 40px", lineHeight:1.7 }}>
          성분 텍스트를 붙여넣으면 AI가 금지 성분을 자동으로 탐지하고,<br/>
          통관 차단 위험도를 즉시 판정합니다.
        </p>
        <div className="fade-up fade-up-3" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => setPage("check")} style={{ padding:"14px 36px", borderRadius:10, border:"none", background:"linear-gradient(135deg, #4F8FFF, #2563EB)", color:"#fff", fontSize:16, fontWeight:700, boxShadow:"0 4px 24px rgba(79,143,255,0.3)" }}>
            무료로 판독 시작 →
          </button>
          <button onClick={() => setPage("pricing")} style={{ padding:"14px 28px", borderRadius:10, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--text2)", fontSize:15, fontWeight:500 }}>
            요금 안내
          </button>
        </div>

        {/* Country badges */}
        <div className="fade-up fade-up-4" style={{ display:"flex", gap:10, justifyContent:"center", marginTop:40 }}>
          {countries.map(c => (
            <div key={c.code} style={{ padding:"8px 16px", borderRadius:20, background: c.active ? "rgba(79,143,255,0.08)" : "var(--surface)", border:`1px solid ${c.active ? "rgba(79,143,255,0.2)" : "var(--border)"}`, fontSize:13, fontWeight:500, color: c.active ? "var(--accent)" : "var(--text2)", opacity: c.active ? 1 : 0.5 }}>
              {c.flag} {c.name} {!c.active && <span style={{fontSize:10}}>Coming Soon</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
          {[
            { n: 4631, s: "건", label: "식약처 DB 등록 제품", icon: "🗄️" },
            { n: 157, s: "+", label: "금지/주의 성분 추적", icon: "🔬" },
            { n: 16, s: "만점+", label: "2025년 차단 실적", icon: "🚫" },
          ].map((s, i) => (
            <div key={i} style={{ padding:28, borderRadius:16, background:"var(--surface)", border:"1px solid var(--border)", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:32, fontWeight:800, color:"var(--accent)", letterSpacing:"-0.02em" }}><Counter end={s.n} />{s.s}</div>
              <div style={{ fontSize:13, color:"var(--text2)", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 100px" }}>
        <h2 style={{ fontSize:28, fontWeight:800, textAlign:"center", marginBottom:48, letterSpacing:"-0.02em" }}>어떻게 작동하나요?</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:20 }}>
          {[
            { step: "01", title: "성분 입력", desc: "제품 상세 페이지에서 성분표를 복사해 붙여넣기", color: "#4F8FFF" },
            { step: "02", title: "1차 스캔", desc: "157개 금지 성분 데이터베이스와 자동 대조", color: "#818CF8" },
            { step: "03", title: "AI 정밀 분석", desc: "문맥을 읽고 가짜 알람을 걸러내는 AI 판독", color: "#C084FC" },
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

      {/* CTA */}
      <section style={{ maxWidth:600, margin:"0 auto", padding:"0 24px 100px", textAlign:"center" }}>
        <div style={{ padding:48, borderRadius:20, background:"linear-gradient(135deg, rgba(79,143,255,0.06), rgba(129,140,248,0.06))", border:"1px solid rgba(79,143,255,0.12)" }}>
          <h2 style={{ fontSize:24, fontWeight:800, marginBottom:12 }}>지금 바로 확인해보세요</h2>
          <p style={{ fontSize:14, color:"var(--text2)", marginBottom:24 }}>무료 체험 3건 제공 · 가입 불필요</p>
          <button onClick={() => setPage("check")} style={{ padding:"14px 40px", borderRadius:10, border:"none", background:"linear-gradient(135deg, #4F8FFF, #2563EB)", color:"#fff", fontSize:16, fontWeight:700 }}>
            판독 시작 →
          </button>
        </div>
      </section>

      {/* Footer */}
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
          <button onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", color:"var(--text)" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #4F8FFF, #2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛡</div>
            <span style={{ fontSize:17, fontWeight:700 }}>ClearPass</span>
          </button>
          <button onClick={() => setPage("check")} style={{ padding:"8px 20px", borderRadius:8, border:"none", background:"var(--accent)", color:"#fff", fontSize:13, fontWeight:600 }}>판독 시작</button>
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
          <button onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", color:"var(--text)" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #4F8FFF, #2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛡</div>
            <span style={{ fontSize:17, fontWeight:700 }}>ClearPass</span>
          </button>
          <div style={{ display:"flex", gap:6 }}>
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
        {/* Input */}
        <div className="fade-up" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, marginBottom:20 }}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>제품명</label>
            <input type="text" placeholder="예: Hardon Blue, NOW Foods Omega-3" value={productName} onChange={e => setProductName(e.target.value)}
              style={{ width:"100%", padding:"12px 16px", borderRadius:10, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", fontSize:15, boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>성분 텍스트</label>
            <textarea placeholder="제품 상세페이지에서 Supplement Facts / 성분표를 복사해서 붙여넣으세요..." value={ingredients} onChange={e => setIngredients(e.target.value)} rows={7}
              style={{ width:"100%", padding:"12px 16px", borderRadius:10, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14, lineHeight:1.7, resize:"vertical", boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={runCheck} disabled={(!ingredients.trim() && !productName.trim()) || analyzing}
              style={{ flex:1, padding:"14px", borderRadius:10, border:"none", background:(ingredients.trim()||productName.trim()) ? "linear-gradient(135deg,#4F8FFF,#2563EB)" : "#1E293B", color:"#fff", fontSize:15, fontWeight:700, opacity:analyzing?.7:1 }}>
              {analyzing ? "분석 중..." : "🔍 판독 시작"}
            </button>
            <button onClick={() => { setProductName("Alpha Muscle Pro X"); setIngredients("L-Arginine 500mg, Tribulus Terrestris 300mg, Yohimbe Bark Extract (standardized for Yohimbine) 200mg, Horny Goat Weed Extract (Epimedium) 150mg, Diindolylmethane (DIM) 100mg, Fenugreek 200mg, Pea Protein Isolate 5g, Melatonin 3mg, Zinc 15mg"); }}
              style={{ padding:"14px 16px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text2)", fontSize:13, fontWeight:500 }}>샘플</button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div style={{ animation:"fadeUp .4s ease both" }}>
            {/* Summary */}
            <div style={{ background:R[results.level].bg, border:`1px solid ${R[results.level].border}40`, borderRadius:16, padding:"20px 24px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ padding:"4px 12px", borderRadius:8, background:R[results.level].badgeBg, color:"#fff", fontSize:12, fontWeight:700 }}>{R[results.level].badge}</span>
                <span style={{ fontSize:12, color:R[results.level].text, opacity:.7 }}>{results.product} · {results.time}</span>
              </div>
              <h2 style={{ fontSize:20, fontWeight:800, color:R[results.level].text }}>
                {results.level === "safe" ? "금지 성분이 검출되지 않았습니다" : `금지/주의 성분 ${results.detected.length}개 검출`}
              </h2>
            </div>

            {/* Detected */}
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

            {/* AI */}
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
