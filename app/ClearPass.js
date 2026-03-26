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
  "acrivastine","azelastine","brompheniramine","cetirizine","clemastine",
  "cyproheptadine","desloratadine","dexbrompheniramine","dexchlorpheniramine",
  "dimenhydrinate","diphenhydramine","doxylamine","fexofenadine","hydroxyzine",
  "ketotifen","levocetirizine","loratadine","meclizine","promethazine",
  "triprolidine","pheniramine",
  "theophylline","theobromine","dextromethorphan","guaifenesin","pseudoephedrine",
  "phenylephrine","codeine","benzonatate","bromhexine","ambroxol",
  "carbocisteine","noscapine",
  "lorcaserin","rimonabant","fenfluramine","phentermine","topiramate",
  "dinitrophenol","dnp","2,4-dinitrophenol","laxogenin","usnic acid",
  "vardenafil","avanafil","dapoxetine","flibanserin","aminotadalafil",
  "hongdenafil","homosildenafil","hydroxyhomosildenafil","sulfoaildenafil",
  "thiosildenafil","udenafil","mirodenafil",
  "rad-140","rad 140","testolone","ibutamoren","ligandrol","enobosarm",
  "ac-262536","s-23","tta","myostatin inhibitor",
  "picamilon","tianeptine","adrafinil","modafinil","armodafinil",
  "piracetam","aniracetam","noopept","sulbutiamine","kratom",
  "kava","kava kava","akuamma","amanita muscaria",
  "곤약","구연산실데나필","디폭세틴","우피","음양곽","인도사목","클로람페니콜","테오필린",
  "시부트라민","멜라토닌","에페드라","요힘빈","센노사이드","실데나필","타다라필",
  "페니부트","페놀프탈레인","덱사메타손","프레드니솔론",
  "펜플루라민","리모나반트","로카세린","오를리스타트","디니트로페놀",
  "바르데나필","아바나필","플리반세린","호모실데나필",
  "라드140","테스토론","리간드롤","오스타린","카다린",
  "크라톰","카바","모다피닐","티아넵틴","피라세탐",
  "에페드린","슈도에페드린","코데인","덱스트로메토르판",
  "디클로페낙","리도카인","세티리진","로라타딘","디펜히드라민",
  "프로메타진","독시라민","펙소페나딘","구아이페네신"
];
const HIGH = new Set(["sildenafil","tadalafil","sibutramine","s4","andarine","sr-9009","ostarine",
  "lgd-4033","mk-677","mk 2866","yk-11","gw 501516","cardarine","stenabolic","nutrabol",
  "thc","thca","delta-8-thc","cbd","cannabidiol","ephedra","dmaa","phenibut",
  "desulfonylchlorosildenafil","boldione","1-androstenedione","구연산실데나필",
  "prednisolone","desoxy-d2pm","orlistat","phenolphthaleine","hhc",
  "mitragynine","mitragyna speciosa","dexamethasone","diclofenac","bisacodyl","lidocaine",
  "chlorpheniramine","클로람페니콜","디폭세틴",
  "vardenafil","avanafil","dapoxetine","aminotadalafil","hongdenafil","homosildenafil",
  "hydroxyhomosildenafil","sulfoaildenafil","thiosildenafil","udenafil","mirodenafil",
  "rad-140","rad 140","testolone","ibutamoren","ligandrol","enobosarm","s-23",
  "lorcaserin","rimonabant","fenfluramine","dinitrophenol","dnp","2,4-dinitrophenol",
  "codeine","modafinil","armodafinil","pseudoephedrine","kratom","시부트라민","실데나필","타다라필",
  "tianeptine","promethazine","펜플루라민","리모나반트","오를리스타트","디니트로페놀",
  "바르데나필","호모실데나필","크라톰","모다피닐","티아넵틴","코데인","슈도에페드린","프로메타진"]);
 
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
 
/* ─── i18n (minimal) ─── */
const LANG = {
  ko: {
    check: "판독 시작", pricing_btn: "요금 안내", hero_badge: "4개국 위해식품 DB 5,482건 기반",
    hero1: "해외직구 식품·영양제,", hero2: "통관 전에 확인하세요",
    hero_p: "건강기능식품·영양제·보충제의 성분표 사진을 올리거나\n텍스트를 붙여넣으면 AI가 금지 성분을 즉시 판정합니다.",
    hero_scope: "현재 검사 범위: 식품 · 건강기능식품 · 영양제 · 보충제 | 의약품 · 화장품 · 전자제품은 미지원",
    free_cta: "무료로 판독 시작 →", countries_title: "통관 검사 대상국",
    how: "어떻게 작동하나요?", cta_h: "지금 바로 확인해보세요",
    cta_p: "무료 체험 3건 제공 · 가입 불필요 · 이미지 판독 지원",
    cta_scope: "식품 · 건강기능식품 · 영양제 · 보충제 전용",
    cta_btn: "판독 시작 →",
    footer: "© 2026 ClearPass · 식품안전나라 해외직구 위해식품 차단 목록 기반 · 본 결과는 참고용이며 최종 통관 여부는 세관 판단에 따릅니다",
    scope_label: "검사 범위:", scope_yes: "식품 · 건강기능식품 · 영양제 · 보충제", scope_no: "의약품 · 화장품 · 전자제품은 현재 미지원",
    product: "제품명", product_ph: "예: Hardon Blue, NOW Foods Omega-3",
    tab_text: "📝 텍스트", tab_image: "📷 이미지", tab_url: "🔗 URL",
    text_ph: "성분표 텍스트를 여기에 붙여넣으세요", text_sub: "아마존/iHerb 등 상세페이지에서 Supplement Facts를 복사(Ctrl+C)한 뒤 여기에 붙여넣기(Ctrl+V)",
    img_drop: "성분표 사진을 드래그하거나 클릭해서 업로드", img_paste: "💡 Win+Shift+S로 영역 캡처 → 여기서 Ctrl+V로 바로 붙여넣기",
    img_fmt: "JPG, PNG, WebP 지원 · 여러 장 업로드 가능 (최대 5장)", img_extract: "🔬 AI 성분 추출 시작",
    img_extracting: "AI가 성분표를 읽고 있습니다...", img_done: "성분 추출 완료",
    img_hint: "추출된 텍스트를 확인하고 필요시 수정한 뒤 판독을 시작하세요.",
    url_title: "제품 URL을 입력하세요", url_sub: "아마존, iHerb 등 해외 쇼핑몰 지원 | 네이버·쿠팡 등 국내몰은 준비 중",
    url_btn: "분석", url_loading: "분석 중...", url_hint: "AI가 해당 페이지에서 제품명과 성분 정보를 자동으로 추출합니다",
    btn_check: "🔍 판독 시작", btn_checking: "분석 중...", btn_sample: "샘플", btn_reset: "초기화",
    import_label: "수입국:",
    safe_badge: "✅ 안전", warn_badge: "⚠️ 주의", danger_badge: "🚨 위험",
    db_title: "🗄️ 식약처 위해식품 DB 매칭 결과", db_label: "위해식품",
    db_warn: "이 제품은 식약처에 의해 위해식품으로 등록되어 있으며, 통관 시 차단/폐기될 가능성이 매우 높습니다.",
    match_title: "1차 성분 매칭", high_label: "위험", med_label: "주의",
    ai_title: "🤖 AI 정밀 판독", ai_loading: "AI가 문맥을 분석하고 있습니다...",
    safe_h: "1차 판독 통과", safe_p1: "성분 텍스트에서 금지 성분이 검출되지 않았습니다.",
    safe_p2: "라벨 미표기 성분이 존재할 수 있으므로 최종 판단은 세관에 위임됩니다.",
    no_detect: "금지 성분이 검출되지 않았습니다",
    db_found: "위해식품 DB에 등록된 제품입니다",
    detect_n: "금지/주의 성분 {n}개 검출",
    pricing_h: "요금 안내", pricing_sub: "무료 체험 3건 포함 · 부가세 별도", pricing_rec: "추천", pricing_select: "선택",
    s1: "식약처 DB 등록 위해식품", s2: "금지/주의 성분 추적 중", s3: "AI 판독 소요 시간",
    step1: "성분 입력", step1d: "텍스트를 붙여넣거나 성분표 사진을 업로드",
    step2: "이미지 판독", step2d: "AI가 사진 속 성분표 텍스트를 자동 추출",
    step3: "위험 성분 스캔", step3d: "157개 금지 성분 DB와 자동 대조 + AI 분석",
    step4: "판정 리포트", step4d: "위험도 등급과 근거가 포함된 즉시 결과 제공",
  },
  en: {
    check: "Start Scan", pricing_btn: "Pricing", hero_badge: "Based on 5,482 hazardous product records from 4 countries",
    hero1: "Cross-border Supplements,", hero2: "Check Before Customs",
    hero_p: "Upload a supplement label photo or paste ingredient text.\nAI instantly screens for banned substances.",
    hero_scope: "Scope: Food · Supplements · Vitamins · Health Products | Pharmaceuticals · Cosmetics · Electronics not supported",
    free_cta: "Free Scan →", countries_title: "Supported Countries",
    how: "How It Works", cta_h: "Try it now",
    cta_p: "3 free scans · No signup required · Image scan supported",
    cta_scope: "Food · Supplements · Vitamins · Health Products only",
    cta_btn: "Start Scan →",
    footer: "© 2026 ClearPass · Based on hazardous food databases · Results are for reference only",
    scope_label: "Scope:", scope_yes: "Food · Supplements · Vitamins · Health Products", scope_no: "Pharmaceuticals · Cosmetics · Electronics not supported",
    product: "Product Name", product_ph: "e.g., Hardon Blue, NOW Foods Omega-3",
    tab_text: "📝 Text", tab_image: "📷 Image", tab_url: "🔗 URL",
    text_ph: "Paste supplement facts text here", text_sub: "Copy Supplement Facts from Amazon/iHerb and paste here (Ctrl+V)",
    img_drop: "Drag & drop or click to upload label image", img_paste: "💡 Screen capture (Win+Shift+S) → Paste here (Ctrl+V)",
    img_fmt: "JPG, PNG, WebP · Up to 5 images", img_extract: "🔬 Extract with AI",
    img_extracting: "AI is reading the label...", img_done: "Extraction complete",
    img_hint: "Review extracted text and edit if needed before scanning.",
    url_title: "Enter Product URL", url_sub: "Amazon, iHerb supported | Domestic sites coming soon",
    url_btn: "Analyze", url_loading: "Analyzing...", url_hint: "AI will extract product name and ingredients from the page",
    btn_check: "🔍 Start Scan", btn_checking: "Analyzing...", btn_sample: "Sample", btn_reset: "Reset",
    import_label: "Import to:",
    safe_badge: "✅ SAFE", warn_badge: "⚠️ CAUTION", danger_badge: "🚨 DANGER",
    db_title: "🗄️ Hazardous Product DB Match", db_label: "HAZARDOUS",
    db_warn: "This product is registered as hazardous and is highly likely to be blocked at customs.",
    match_title: "Ingredient Match Results", high_label: "DANGER", med_label: "CAUTION",
    ai_title: "🤖 AI Detailed Analysis", ai_loading: "AI is analyzing context...",
    safe_h: "Passed Screening", safe_p1: "No banned ingredients detected in the text.",
    safe_p2: "Unlisted ingredients may exist. Final decision rests with customs authorities.",
    no_detect: "No banned ingredients detected",
    db_found: "Product found in hazardous product DB",
    detect_n: "{n} banned/caution ingredients detected",
    pricing_h: "Pricing", pricing_sub: "3 free scans included · Tax excluded", pricing_rec: "Best Value", pricing_select: "Select",
    s1: "Hazardous Products in DB", s2: "Banned Ingredients Tracked", s3: "AI Scan Time",
    step1: "Input", step1d: "Paste text or upload label image",
    step2: "Image Scan", step2d: "AI extracts ingredient text from photos",
    step3: "Risk Scan", step3d: "Auto-match against banned ingredient database + AI",
    step4: "Report", step4d: "Instant results with risk level and evidence",
  },
  ja: {
    check: "判定開始", pricing_btn: "料金", hero_badge: "4カ国の有害食品DB 5,482件に基づく",
    hero1: "海外直購サプリメント、", hero2: "通関前に確認しましょう",
    hero_p: "成分表の写真をアップロードまたはテキストを貼り付けると、\nAIが禁止成分を即時判定します。",
    hero_scope: "検査範囲: 食品・健康食品・サプリメント | 医薬品・化粧品・電子製品は未対応",
    free_cta: "無料判定開始 →", countries_title: "対応国",
    how: "仕組み", cta_h: "今すぐ確認", cta_p: "無料3件・登録不要・画像判定対応",
    cta_scope: "食品・健康食品・サプリメント専用", cta_btn: "判定開始 →",
    footer: "© 2026 ClearPass · 結果は参考用です · 最終判断は税関に委ねます",
    scope_label: "検査範囲:", scope_yes: "食品・健康食品・サプリメント", scope_no: "医薬品・化粧品は未対応",
    product: "製品名", product_ph: "例: Hardon Blue, NOW Foods Omega-3",
    tab_text: "📝 テキスト", tab_image: "📷 画像", tab_url: "🔗 URL",
    text_ph: "成分表テキストを貼り付け", text_sub: "Amazon/iHerbからSupplement Factsをコピーして貼り付け",
    img_drop: "画像をドラッグまたはクリックでアップロード", img_paste: "💡 Win+Shift+Sでキャプチャ → Ctrl+Vで貼り付け",
    img_fmt: "JPG, PNG, WebP対応 · 最大5枚", img_extract: "🔬 AI成分抽出",
    img_extracting: "AIが読み取り中...", img_done: "抽出完了",
    img_hint: "テキストを確認し必要に応じて修正してから判定してください。",
    url_title: "製品URLを入力", url_sub: "Amazon, iHerb対応 | 国内モールは準備中",
    url_btn: "分析", url_loading: "分析中...", url_hint: "AIがページから成分情報を自動抽出します",
    btn_check: "🔍 判定開始", btn_checking: "分析中...", btn_sample: "サンプル", btn_reset: "リセット",
    import_label: "輸入国:",
    safe_badge: "✅ 安全", warn_badge: "⚠️ 注意", danger_badge: "🚨 危険",
    db_title: "🗄️ 有害食品DBマッチ結果", db_label: "有害食品",
    db_warn: "この製品は有害食品として登録されており、通関時にブロックされる可能性が非常に高いです。",
    match_title: "1次成分マッチ", high_label: "危険", med_label: "注意",
    ai_title: "🤖 AI精密判定", ai_loading: "AIが分析中...",
    safe_h: "1次判定通過", safe_p1: "禁止成分は検出されませんでした。",
    safe_p2: "ラベル未表記の成分が存在する可能性があります。",
    no_detect: "禁止成分は検出されませんでした",
    db_found: "有害食品DBに登録された製品です",
    detect_n: "禁止/注意成分 {n}件検出",
    pricing_h: "料金案内", pricing_sub: "無料3件含む・税別", pricing_rec: "おすすめ", pricing_select: "選択",
    s1: "有害食品DB", s2: "禁止成分追跡中", s3: "AI判定時間",
    step1: "成分入力", step1d: "テキスト貼り付けまたは画像アップロード",
    step2: "画像判定", step2d: "AIが写真から成分表テキストを自動抽出",
    step3: "リスクスキャン", step3d: "禁止成分DBと自動照合 + AI分析",
    step4: "判定結果", step4d: "リスクレベルと根拠を含む即時結果",
  },
};
 
/* ─── Main App ─── */
export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ko");
  const t = LANG[lang] || LANG.ko;
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [country, setCountry] = useState("kr");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  /* ─── Multi-image upload state ─── */
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageExtracting, setImageExtracting] = useState(false);
  const [imageExtracted, setImageExtracted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState("text");
  const fileInputRef = useRef(null);
  /* ─── URL input state ─── */
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  /* ─── DB search state ─── */
  const [dbMatches, setDbMatches] = useState([]);
  const [dbSearching, setDbSearching] = useState(false);
 
  /* ─── Browser history ─── */
  function navigateTo(newPage) {
    window.history.pushState({ page: newPage }, "", `#${newPage}`);
    setPage(newPage);
  }
  useEffect(() => {
    const handlePop = (e) => setPage(e.state?.page || "home");
    window.addEventListener("popstate", handlePop);
    window.history.replaceState({ page: "home" }, "", "#home");
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
 
  /* ── All countries now active ── */
  const countries = [
    { code: "kr", name: "한국", flag: "🇰🇷", label: "KR", active: true },
    { code: "jp", name: "日本", flag: "🇯🇵", label: "JP", active: true },
    { code: "us", name: "USA", flag: "🇺🇸", label: "US", active: true },
    { code: "eu", name: "EU", flag: "🇪🇺", label: "EU", active: true },
  ];
 
  /* ─── Multi-image handling ─── */
  function handleImageSelect(files) {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!arr.length) return;
    setImageExtracted(false);
    setIngredients("");
    const combined = [...imageFiles, ...arr].slice(0, 5);
    setImageFiles(combined);
    const newPreviews = [...imagePreviews];
    combined.forEach((file, i) => {
      if (!newPreviews[i]) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreviews(prev => { const n = [...prev]; n[i] = e.target.result; return n; });
        reader.readAsDataURL(file);
      }
    });
  }
 
  function handleDrop(e) { e.preventDefault(); setDragOver(false); handleImageSelect(e.dataTransfer.files); }
 
  useEffect(() => {
    function handlePaste(e) {
      if (inputMode !== "image") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) { e.preventDefault(); files.push(items[i].getAsFile()); }
      }
      if (files.length) handleImageSelect(files);
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [inputMode, imageFiles]);
 
  function removeImage(idx) {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    if (imageFiles.length <= 1) { setImageExtracted(false); setIngredients(""); }
  }
 
  async function extractFromImages() {
    if (!imagePreviews.length) return;
    setImageExtracting(true);
    let allText = "";
    try {
      for (let i = 0; i < imagePreviews.length; i++) {
        if (!imagePreviews[i]) continue;
        const base64Data = imagePreviews[i].split(",")[1];
        const mediaType = imageFiles[i]?.type || "image/jpeg";
        const res = await fetch("/api/claude", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514", max_tokens: 1500,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: `This is a supplement/food product label image. Extract ALL ingredient text visible in this image. Include everything: ingredient names, amounts, percentages, "Other Ingredients", warnings about contents.\n\nRules:\n- Output ONLY the extracted text, nothing else\n- Keep original language (English, Korean, Japanese, etc.)\n- Keep original formatting as much as possible\n- If no ingredient information is found, respond with: NO_INGREDIENTS_FOUND` }
            ] }],
          }),
        });
        const data = await res.json();
        if (data.error) {
          const errStr = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
          if (errStr.includes("rate_limit")) { alert("요청이 많아 일시적으로 제한되었습니다. 1분 후 다시 시도해주세요."); break; }
          else { alert("이미지 분석 중 오류가 발생했습니다."); }
        } else {
          const text = data.content?.map(c => c.text || "").join("\n") || "";
          if (!text.includes("NO_INGREDIENTS_FOUND")) allText += (allText ? "\n\n---\n\n" : "") + text;
        }
      }
      if (allText) { setIngredients(allText); setImageExtracted(true); }
      else alert("이미지에서 성분 정보를 찾을 수 없습니다. 다른 이미지를 시도해주세요.");
    } catch (err) { alert("이미지 분석 중 오류: " + err.message); }
    setImageExtracting(false);
  }
 
  /* ─── Reset all ─── */
  function resetAll() {
    setProductName(""); setIngredients(""); setResults(null); setAiText(""); setAiLoading(false);
    setImageFiles([]); setImagePreviews([]); setImageExtracted(false); setImageExtracting(false);
    setUrlInput(""); setDbMatches([]); setInputMode("text"); setDragOver(false);
  }
 
  /* ─── DB search + check ─── */
  async function runCheck() {
    if (!ingredients.trim() && !productName.trim()) return;
    setAnalyzing(true); setAiText(""); setDbMatches([]);
    const d = detect(ingredients);
    const high = d.filter(x => x.risk === "high");
    const med = d.filter(x => x.risk === "med");
    let dbResults = [];
    if (productName.trim()) {
      setDbSearching(true);
      try {
        const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productName: productName.trim() }) });
        const data = await res.json();
        if (data.matches?.length > 0) { dbResults = data.matches; setDbMatches(data.matches); }
      } catch (err) { console.error("DB search error:", err); }
      setDbSearching(false);
    }
    const dbDanger = dbResults.length > 0;
    const level = dbDanger ? "danger" : (high.length > 0 ? "danger" : med.length > 0 ? "warning" : "safe");
    setResults({ product: productName || "Unknown", detected: d, high, med, level, time: new Date().toLocaleString("ko-KR"), fromImage: inputMode === "image" && imageExtracted, dbMatches: dbResults });
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
          messages: [{ role: "user", content: `당신은 한국 식약처(MFDS) 해외직구 위해식품 통관 전문가입니다.\n\n중요 규칙:\n1. 아래 성분들은 한국 식약처 "해외직구 위해식품 차단 목록"에 실제 등재된 금지/주의 성분입니다.\n2. 해외에서는 일반 보충제로 판매되더라도, 한국 통관 기준으로는 금지입니다.\n3. 1차 매칭에서 검출된 성분을 "안전하다"고 뒤집으려면, 반드시 해당 성분명이 다른 단어의 일부(예: "pea"가 "pea protein"의 일부)인 경우에만 가능합니다.\n4. L-Citrulline, Melatonin, 5-HTP, Yohimbine 등은 해외에서 일반적이지만 한국에서는 금지 성분입니다. 이런 성분을 "안전"으로 분류하지 마세요.\n\n[위험 등급 성분 (통관 차단 대상)]: ${highList || "없음"}\n[주의 등급 성분 (통관 주의 대상)]: ${medList || "없음"}\n\n[제품 성분 텍스트]:\n${text.substring(0,1500)}\n\n아래 양식으로만 한국어로 답변하세요:\n\n🔍 AI 정밀 판독\n\n[위험 성분]\n• 성분명 — 한국 식약처 기준 금지/주의 사유 (1줄)\n\n[가짜 알람 (안전)]\n• 성분명 — 다른 단어의 일부이므로 안전 (1줄)\n(해당 없으면 "없음"으로 표시)\n\n[종합]\n통관 위험도: 높음/중간/낮음\n근거: (1줄)` }],
        }),
      });
      const data = await res.json();
      setAiText(data.content?.map(c => c.text || "").join("\n") || "분석 실패");
    } catch { setAiText("⚠️ AI 연결 실패 — 1차 매칭 결과를 참고하세요."); }
    setAiLoading(false);
  }
 
  const R = { danger: { bg: "#1C0A0A", border: "#DC2626", accent: "#EF4444", text: "#FCA5A5", badge: t.danger_badge, badgeBg: "#991B1B" },
    warning: { bg: "#1A1506", border: "#D97706", accent: "#F59E0B", text: "#FDE68A", badge: t.warn_badge, badgeBg: "#92400E" },
    safe: { bg: "#061A0E", border: "#059669", accent: "#10B981", text: "#6EE7B7", badge: t.safe_badge, badgeBg: "#065F46" }};
 
  /* ─── Styles (ORIGINAL) ─── */
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
 
  /* ─── Language selector component ─── */
  const LangSel = () => (
    <div style={{ display:"flex", gap:2, background:"var(--surface2)", borderRadius:6, padding:2, marginLeft:8 }}>
      {[{c:"ko",l:"한"},{c:"en",l:"EN"},{c:"ja",l:"JP"}].map(x => (
        <button key={x.c} onClick={() => setLang(x.c)} style={{
          padding:"4px 9px", borderRadius:5, border:"none", fontSize:11, fontWeight:700,
          background:lang===x.c?"var(--accent)":"transparent", color:lang===x.c?"#fff":"var(--text2)",
        }}>{x.l}</button>
      ))}
    </div>
  );
 
  /* ═══════════════════ LANDING PAGE (ORIGINAL DESIGN) ═══════════════════ */
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
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => navigateTo("check")} style={{ padding:"8px 20px", borderRadius:8, border:"1px solid var(--accent)", background:"transparent", color:"var(--accent)", fontSize:13, fontWeight:600 }}>{t.check}</button>
            <LangSel />
          </div>
        </div>
      </nav>
 
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"100px 24px 80px", textAlign:"center" }}>
        <div className="fade-up" style={{ display:"inline-block", padding:"6px 16px", borderRadius:20, background:"rgba(79,143,255,0.08)", border:"1px solid rgba(79,143,255,0.15)", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
          {t.hero_badge}
        </div>
        <h1 className="fade-up fade-up-1" style={{ fontSize:"clamp(36px, 5.5vw, 64px)", fontWeight:900, lineHeight:1.15, letterSpacing:"-0.03em", marginBottom:20 }}>
          {t.hero1}<br/>
          <span style={{ background:"linear-gradient(135deg, #4F8FFF 0%, #818CF8 50%, #C084FC 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{t.hero2}</span>
        </h1>
        <p className="fade-up fade-up-2" style={{ fontSize:17, color:"var(--text2)", maxWidth:560, margin:"0 auto 24px", lineHeight:1.7, whiteSpace:"pre-line" }}>{t.hero_p}</p>
        <p className="fade-up fade-up-2" style={{ fontSize:12, color:"var(--text2)", opacity:0.6, marginBottom:40 }}>{t.hero_scope}</p>
        <div className="fade-up fade-up-3" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigateTo("check")} style={{ padding:"14px 36px", borderRadius:10, border:"none", background:"linear-gradient(135deg, #4F8FFF, #2563EB)", color:"#fff", fontSize:16, fontWeight:700, boxShadow:"0 4px 24px rgba(79,143,255,0.3)" }}>{t.free_cta}</button>
          <button onClick={() => navigateTo("pricing")} style={{ padding:"14px 28px", borderRadius:10, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--text2)", fontSize:15, fontWeight:500 }}>{t.pricing_btn}</button>
        </div>
        <div className="fade-up fade-up-4" style={{ marginTop:40, textAlign:"center" }}>
          <p style={{ fontSize:12, color:"var(--text2)", marginBottom:10, fontWeight:500 }}>{t.countries_title}</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          {countries.map(c => (
            <div key={c.code} style={{ padding:"8px 16px", borderRadius:20, background:"rgba(79,143,255,0.08)", border:"1px solid rgba(79,143,255,0.2)", fontSize:13, fontWeight:500, color:"var(--accent)" }}>
              {c.flag} {c.name}
            </div>
          ))}
          </div>
        </div>
      </section>
 
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
          {[
            { n: 5482, s: "건", label: t.s1, icon: "🗄️" },
            { n: 250, s: "+", label: t.s2, icon: "🔬" },
            { n: 2, s: "초", label: t.s3, icon: "⚡" },
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
        <h2 style={{ fontSize:28, fontWeight:800, textAlign:"center", marginBottom:48, letterSpacing:"-0.02em" }}>{t.how}</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:20 }}>
          {[
            { step:"01", title:t.step1, desc:t.step1d, color:"#4F8FFF" },
            { step:"02", title:t.step2, desc:t.step2d, color:"#818CF8" },
            { step:"03", title:t.step3, desc:t.step3d, color:"#C084FC" },
            { step:"04", title:t.step4, desc:t.step4d, color:"#F472B6" },
          ].map((s, i) => (
            <div key={i} style={{ padding:28, borderRadius:16, background:"var(--surface)", border:"1px solid var(--border)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-8, right:-8, fontSize:72, fontWeight:900, color:s.color, opacity:0.06 }}>{s.step}</div>
              <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:8, fontFamily:"'Outfit'" }}>STEP {s.step}</div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>{s.title}</h3>
              <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      <section style={{ maxWidth:600, margin:"0 auto", padding:"0 24px 100px", textAlign:"center" }}>
        <div style={{ padding:48, borderRadius:20, background:"linear-gradient(135deg, rgba(79,143,255,0.06), rgba(129,140,248,0.06))", border:"1px solid rgba(79,143,255,0.12)" }}>
          <h2 style={{ fontSize:24, fontWeight:800, marginBottom:12 }}>{t.cta_h}</h2>
          <p style={{ fontSize:14, color:"var(--text2)", marginBottom:24 }}>{t.cta_p}<br/><span style={{ fontSize:11, opacity:0.6 }}>{t.cta_scope}</span></p>
          <button onClick={() => navigateTo("check")} style={{ padding:"14px 40px", borderRadius:10, border:"none", background:"linear-gradient(135deg, #4F8FFF, #2563EB)", color:"#fff", fontSize:16, fontWeight:700 }}>{t.cta_btn}</button>
        </div>
      </section>
 
      <footer style={{ borderTop:"1px solid var(--border)", padding:"24px", textAlign:"center", fontSize:11, color:"var(--text2)" }}><p>{t.footer}</p></footer>
    </div>
  );
 
  /* ═══════════════════ PRICING PAGE (ORIGINAL) ═══════════════════ */
  if (page === "pricing") return (
    <div style={{ fontFamily:"'Outfit','Noto Sans KR',sans-serif", minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <style>{css}</style>
      <div className="grain" />
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(8,9,14,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 }}>
          <button onClick={() => navigateTo("home")} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", color:"var(--text)" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #4F8FFF, #2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛡</div>
            <span style={{ fontSize:17, fontWeight:700 }}>ClearPass</span>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => navigateTo("check")} style={{ padding:"8px 20px", borderRadius:8, border:"none", background:"var(--accent)", color:"#fff", fontSize:13, fontWeight:600 }}>{t.check}</button>
            <LangSel />
          </div>
        </div>
      </nav>
      <section style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800, textAlign:"center", marginBottom:8 }}>{t.pricing_h}</h1>
        <p style={{ textAlign:"center", color:"var(--text2)", fontSize:14, marginBottom:48 }}>{t.pricing_sub}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16 }}>
          {[
            { name:"Starter", price:"4,900", count:"20건", per:"245원/건", pop:false },
            { name:"Standard", price:"19,000", count:"100건", per:"190원/건", pop:true },
            { name:"Pro", price:"49,000", count:"300건", per:"163원/건", pop:false },
          ].map((p, i) => (
            <div key={i} style={{ padding:32, borderRadius:16, background:p.pop?"rgba(79,143,255,0.06)":"var(--surface)", border:`1px solid ${p.pop?"rgba(79,143,255,0.3)":"var(--border)"}`, textAlign:"center", position:"relative" }}>
              {p.pop && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", padding:"4px 14px", borderRadius:12, background:"var(--accent)", color:"#fff", fontSize:11, fontWeight:700 }}>{t.pricing_rec}</div>}
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>{p.name}</h3>
              <div style={{ fontSize:36, fontWeight:900, letterSpacing:"-0.02em" }}>₩{p.price}</div>
              <div style={{ fontSize:13, color:"var(--text2)", margin:"8px 0 20px" }}>{p.count} · {p.per}</div>
              <button style={{ width:"100%", padding:"12px", borderRadius:8, border:p.pop?"none":"1px solid var(--border)", background:p.pop?"var(--accent)":"transparent", color:p.pop?"#fff":"var(--text2)", fontSize:14, fontWeight:600 }}>{t.pricing_select}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
 
  /* ═══════════════════ CHECK PAGE (ORIGINAL DESIGN + improvements) ═══════════════════ */
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
            <span style={{ fontSize:11, color:"var(--text2)", fontWeight:500 }}>{t.import_label}</span>
            {countries.map(c => (
              <button key={c.code} onClick={() => setCountry(c.code)} style={{
                padding:"6px 12px", borderRadius:6, border:`1px solid ${country === c.code ? "var(--accent)" : "var(--border)"}`,
                background: country === c.code ? "rgba(79,143,255,0.1)" : "transparent",
                color: country === c.code ? "var(--accent)" : "var(--text2)",
                fontSize:12, fontWeight:600,
              }}>{c.label} {c.name}</button>
            ))}
            <LangSel />
          </div>
        </div>
      </nav>
 
      <div style={{ maxWidth:760, margin:"0 auto", padding:"32px 16px" }}>
        {/* Scope notice */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", marginBottom:16, borderRadius:10, background:"rgba(79,143,255,0.06)", border:"1px solid rgba(79,143,255,0.12)" }}>
          <span style={{ fontSize:14 }}>💊</span>
          <span style={{ fontSize:12, color:"var(--text2)" }}>
            <strong style={{ color:"var(--accent)" }}>{t.scope_label}</strong> {t.scope_yes} &nbsp;|&nbsp; <span style={{ opacity:0.6 }}>{t.scope_no}</span>
          </span>
        </div>
 
        {/* Input */}
        <div className="fade-up" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, marginBottom:20 }}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>{t.product}</label>
            <input type="text" placeholder={t.product_ph} value={productName} onChange={e => setProductName(e.target.value)}
              style={{ width:"100%", padding:"12px 16px", borderRadius:10, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", fontSize:15, boxSizing:"border-box" }} />
          </div>
 
          {/* Input mode toggle */}
          <div style={{ display:"flex", gap:4, marginBottom:16, background:"var(--bg)", borderRadius:10, padding:4 }}>
            {[{key:"text",label:t.tab_text},{key:"image",label:t.tab_image},{key:"url",label:t.tab_url}].map(m => (
              <button key={m.key} onClick={() => setInputMode(m.key)} style={{
                flex:1, padding:"10px", borderRadius:8, border:"none", fontSize:13, fontWeight:600,
                background: inputMode === m.key ? "rgba(79,143,255,0.15)" : "transparent",
                color: inputMode === m.key ? "var(--accent)" : "var(--text2)",
              }}>{m.label}</button>
            ))}
          </div>
 
          {/* Text mode */}
          {inputMode === "text" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ position:"relative" }}>
                {!ingredients && (
                  <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:1, padding:20 }}>
                    <div style={{ fontSize:32, marginBottom:8, opacity:0.4 }}>📋</div>
                    <p style={{ fontSize:14, fontWeight:600, color:"var(--text2)", opacity:0.6, textAlign:"center" }}>{t.text_ph}</p>
                    <p style={{ fontSize:11, color:"var(--text2)", opacity:0.4, textAlign:"center", marginTop:4 }}>{t.text_sub}</p>
                  </div>
                )}
                <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={7}
                  style={{ width:"100%", padding:"12px 16px", borderRadius:10, background:"var(--bg)", border: ingredients ? "1px solid var(--accent)" : "1px solid rgba(79,143,255,0.2)", color:"var(--text)", fontSize:14, lineHeight:1.7, resize:"vertical", boxSizing:"border-box", position:"relative", zIndex:2 }} />
              </div>
            </div>
          )}
 
          {/* URL mode */}
          {inputMode === "url" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ padding:20, borderRadius:12, border:"1px solid rgba(79,143,255,0.2)", background:"var(--bg)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:24 }}>🔗</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:600, color:"var(--text)" }}>{t.url_title}</p>
                    <p style={{ fontSize:11, color:"var(--text2)" }}>{t.url_sub}</p>
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
                          messages: [{ role: "user", content: `You have web search capability. Search for the product at this URL: ${urlInput}\n\nFind and extract:\n1. The product name\n2. ALL ingredients / Supplement Facts\n\nRules:\n- Output the product name on the first line prefixed with "PRODUCT_NAME: "\n- Output all ingredients after a line "INGREDIENTS:"\n- Keep original language\n- If you cannot find the product or ingredients, respond with: NOT_FOUND` }],
                          tools: [{ type: "web_search_20250305", name: "web_search" }],
                        }),
                      });
                      const data = await res.json();
                      if (data.error) {
                        const errStr = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
                        alert(errStr.includes("rate_limit") ? "요청이 많아 일시적으로 제한되었습니다. 1분 후 다시 시도해주세요." : "URL 분석 오류가 발생했습니다.");
                      } else {
                        const text = data.content?.map(c => c.text || "").join("\n") || "";
                        if (text.includes("NOT_FOUND")) alert("해당 URL에서 제품 정보를 찾을 수 없습니다.");
                        else {
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
                    {urlLoading ? t.url_loading : t.url_btn}
                  </button>
                </div>
                <p style={{ fontSize:11, color:"var(--text2)", marginTop:8, opacity:0.6 }}>{t.url_hint}</p>
              </div>
            </div>
          )}
 
          {/* Image mode - MULTI IMAGE */}
          {inputMode === "image" && (
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:6, letterSpacing:"0.04em", textTransform:"uppercase" }}>{t.tab_image}</label>
              
              {imagePreviews.length === 0 ? (
                <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding:"40px 20px", borderRadius:12, border:`2px dashed ${dragOver ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
                    background: dragOver ? "rgba(79,143,255,0.05)" : "var(--bg)", textAlign:"center", cursor:"pointer", transition:"all 0.2s ease" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📸</div>
                  <p style={{ fontSize:14, fontWeight:600, color: dragOver ? "var(--accent)" : "var(--text)", marginBottom:4 }}>{t.img_drop}</p>
                  <p style={{ fontSize:13, color:"var(--accent)", marginBottom:4, fontWeight:500 }}>{t.img_paste}</p>
                  <p style={{ fontSize:12, color:"var(--text2)" }}>{t.img_fmt}</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:"none" }}
                    onChange={e => handleImageSelect(e.target.files)} />
                </div>
              ) : (
                <div style={{ borderRadius:12, border:"1px solid var(--border)", overflow:"hidden", background:"var(--bg)" }}>
                  {/* Multi-image thumbnails */}
                  <div style={{ display:"flex", gap:8, padding:12, flexWrap:"wrap" }}>
                    {imagePreviews.map((p, i) => p && (
                      <div key={i} style={{ position:"relative", width:90, height:90, borderRadius:10, overflow:"hidden", border:"1px solid var(--border)" }}>
                        <img src={p} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        <button onClick={() => removeImage(i)} style={{
                          position:"absolute", top:4, right:4, width:22, height:22, borderRadius:11,
                          background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", fontSize:12,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>✕</button>
                      </div>
                    ))}
                    {imageFiles.length < 5 && (
                      <div onClick={() => fileInputRef.current?.click()}
                        style={{ width:90, height:90, borderRadius:10, border:"2px dashed rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:24, color:"var(--text2)" }}>
                        +
                        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:"none" }}
                          onChange={e => handleImageSelect(e.target.files)} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize:11, color:"var(--text2)", padding:"0 12px 8px", opacity:0.6 }}>{imageFiles.length}/5</p>
 
                  {!imageExtracted && (
                    <div style={{ padding:16, borderTop:"1px solid var(--border)" }}>
                      <button onClick={extractFromImages} disabled={imageExtracting}
                        style={{ width:"100%", padding:"12px", borderRadius:8, border:"none",
                          background: imageExtracting ? "#1E293B" : "linear-gradient(135deg, #818CF8, #6366F1)",
                          color:"#fff", fontSize:14, fontWeight:700, opacity: imageExtracting ? 0.7 : 1 }}>
                        {imageExtracting ? (
                          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            <span style={{ display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></span>
                            {t.img_extracting}
                          </span>
                        ) : t.img_extract}
                      </button>
                    </div>
                  )}
 
                  {imageExtracted && (
                    <div style={{ padding:16, borderTop:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                        <span style={{ color:"#6EE7B7", fontSize:14 }}>✓</span>
                        <span style={{ fontSize:12, fontWeight:600, color:"#6EE7B7" }}>{t.img_done}</span>
                      </div>
                      <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={5}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:8, background:"rgba(0,0,0,0.3)", border:"1px solid var(--border)", color:"var(--text)", fontSize:12, lineHeight:1.6, resize:"vertical", boxSizing:"border-box" }} />
                      <p style={{ fontSize:11, color:"var(--text2)", marginTop:4 }}>{t.img_hint}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
 
          {/* Action buttons — with RESET */}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={runCheck} disabled={(!ingredients.trim() && !productName.trim()) || analyzing}
              style={{ flex:1, padding:"14px", borderRadius:10, border:"none", background:(ingredients.trim()||productName.trim()) ? "linear-gradient(135deg,#4F8FFF,#2563EB)" : "#1E293B", color:"#fff", fontSize:15, fontWeight:700, opacity:analyzing?.7:1 }}>
              {analyzing ? t.btn_checking : t.btn_check}
            </button>
            <button onClick={() => { setProductName("Alpha Muscle Pro X"); setInputMode("text"); setIngredients("L-Arginine 500mg, Tribulus Terrestris 300mg, Yohimbe Bark Extract (standardized for Yohimbine) 200mg, Horny Goat Weed Extract (Epimedium) 150mg, Diindolylmethane (DIM) 100mg, Fenugreek 200mg, Pea Protein Isolate 5g, Melatonin 3mg, Zinc 15mg"); }}
              style={{ padding:"14px 16px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text2)", fontSize:13, fontWeight:500 }}>{t.btn_sample}</button>
            <button onClick={resetAll}
              style={{ padding:"14px 16px", borderRadius:10, border:"1px solid rgba(239,68,68,0.3)", background:"transparent", color:"#F87171", fontSize:13, fontWeight:500 }}>{t.btn_reset}</button>
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
                  ? `⚠️ ${t.db_found} (${results.dbMatches.length}건)`
                  : results.level === "safe"
                    ? t.no_detect
                    : t.detect_n.replace("{n}", results.detected.length)}
              </h2>
            </div>
 
            {/* DB Matches */}
            {results.dbMatches?.length > 0 && (
              <div style={{ background:"#1C0A0A", border:"1px solid rgba(239,68,68,0.2)", borderRadius:16, padding:20, marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:"#FCA5A5", letterSpacing:"0.02em" }}>{t.db_title}</h3>
                {results.dbMatches.map((m, i) => (
                  <div key={i} style={{ padding:"12px 14px", marginBottom:8, borderRadius:10, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.12)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:5, background:"#991B1B", color:"#fff" }}>{t.db_label}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:"#FCA5A5" }}>{m.productName}</span>
                    </div>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12, color:"var(--text2)" }}>
                      {m.detectedIngredient && <span>검출성분: <strong style={{ color:"#EF4444" }}>{m.detectedIngredient}</strong>{m.detectedIngredientKr && ` (${m.detectedIngredientKr})`}</span>}
                      {m.manufacturer && <span>제조사: {m.manufacturer}</span>}
                      {m.country && <span>제조국: {m.country}</span>}
                      {m.source && <span>출처: {m.source}</span>}
                      {m.targetCountry && (
                        <span style={{ padding:"2px 8px", borderRadius:4, background:"rgba(239,68,68,0.15)", color:"#FCA5A5", fontWeight:600, fontSize:11 }}>
                          {m.targetCountry === "한국" ? "🇰🇷" : m.targetCountry === "미국" ? "🇺🇸" : m.targetCountry === "일본" ? "🇯🇵" : m.targetCountry === "EU" ? "🇪🇺" : "🌐"} {m.targetCountry} 통관 차단 대상
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize:11, color:"#FCA5A5", marginTop:8, opacity:0.7 }}>{t.db_warn}</p>
              </div>
            )}
 
            {results.detected.length > 0 && (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:20, marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:"var(--text2)", letterSpacing:"0.02em" }}>{t.match_title}</h3>
                {results.detected.map((d, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:6, borderRadius:10,
                    background: d.risk === "high" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                    border: `1px solid ${d.risk === "high" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)"}` }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:5, background: d.risk === "high" ? "#991B1B" : "#92400E", color:"#fff" }}>
                      {d.risk === "high" ? t.high_label : t.med_label}</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>{d.name}</span>
                    <span style={{ fontSize:11, color:"var(--text2)", marginLeft:"auto", maxWidth:"35%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>...{d.ctx}...</span>
                  </div>
                ))}
              </div>
            )}
 
            {(aiLoading || aiText) && (
              <div style={{ background:"var(--surface)", border:"1px solid rgba(129,140,248,0.15)", borderRadius:16, padding:20, marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:"#A5B4FC" }}>
                  {t.ai_title} {aiLoading && <span style={{ fontSize:11, color:"var(--text2)", fontWeight:400 }}>...</span>}
                </h3>
                {aiLoading ? (
                  <div style={{ textAlign:"center", padding:24 }}>
                    <div style={{ fontSize:28, animation:"pulse 1.5s infinite" }}>🔬</div>
                    <p style={{ color:"var(--text2)", fontSize:12, marginTop:8 }}>{t.ai_loading}</p>
                  </div>
                ) : (
                  <pre style={{ margin:0, padding:16, borderRadius:10, background:"var(--bg)", color:"#C4C8D4", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:"'Noto Sans KR','Outfit',sans-serif" }}>{aiText}</pre>
                )}
              </div>
            )}
 
            {results.level === "safe" && (
              <div style={{ background:"var(--surface)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:16, padding:28, textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
                <p style={{ fontSize:16, fontWeight:700, color:"#6EE7B7", marginBottom:4 }}>{t.safe_h}</p>
                <p style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>{t.safe_p1}<br/>{t.safe_p2}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
