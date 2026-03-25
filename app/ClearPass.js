import { useState, useEffect, useRef } from "react";
 
/* ─── Banned ingredient database ─── */
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
  "페니부트","페놀프탈레인","덱사메타손","프레드니솔론"
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
 
/* ─── i18n ─── */
const T = {
  ko: {
    nav_start: "판독 시작", nav_pricing: "요금제",
    hero_badge: "4개국 위해식품 DB 5,482건 기반",
    hero_h1_1: "해외직구 통관,", hero_h1_2: "리스크를 미리 차단합니다",
    hero_p: "구매대행 사업자를 위한 통관 리스크 사전 판독 서비스",
    hero_sub: "식품 · 건강기능식품 · 영양제 · 보충제 전용",
    hero_cta: "무료 판독 시작", hero_cta2: "요금 안내",
    stat1_n: "5,482", stat1_l: "위해식품 DB", stat1_s: "건",
    stat2_l: "지원 국가", stat2_s: "개국",
    stat3_l: "판독 소요", stat3_s: "초",
    how_title: "작동 방식",
    step1_t: "성분 입력", step1_d: "텍스트 붙여넣기, 이미지 업로드, 또는 URL 입력",
    step2_t: "DB 대조", step2_d: "4개국 위해식품 데이터베이스와 자동 대조",
    step3_t: "AI 분석", step3_d: "식약처 기준 금지 성분 여부를 AI가 정밀 판독",
    step4_t: "결과 리포트", step4_d: "위험도 등급과 근거가 포함된 판독 결과 즉시 제공",
    countries_title: "지원 국가",
    cta_title: "지금 바로 확인해보세요",
    cta_sub: "가입 불필요 · 무료 3건 체험",
    cta_btn: "판독 시작 →",
    footer: "© 2026 ClearPass · 본 결과는 참고용이며 최종 통관 여부는 세관 판단에 따릅니다",
    scope_label: "검사 범위:", scope_food: "식품 · 건강기능식품 · 영양제 · 보충제",
    scope_not: "의약품 · 화장품 · 전자제품은 현재 미지원",
    input_product: "제품명", input_product_ph: "예: Hardon Blue, NOW Foods Omega-3",
    tab_text: "텍스트", tab_image: "이미지", tab_url: "URL",
    text_ph: "성분표 텍스트를 여기에 붙여넣으세요",
    text_sub: "아마존/iHerb 등 상세페이지에서 Supplement Facts를 복사(Ctrl+C)한 뒤 여기에 붙여넣기(Ctrl+V)",
    img_drop: "성분표 사진을 드래그하거나 클릭해서 업로드",
    img_paste: "Win+Shift+S로 영역 캡처 → 여기서 Ctrl+V로 바로 붙여넣기",
    img_format: "JPG, PNG, WebP 지원 · 여러 장 업로드 가능",
    img_extract: "AI 성분 추출 시작",
    img_extracting: "AI가 성분표를 읽고 있습니다...",
    img_done: "성분 추출 완료",
    img_edit_hint: "추출된 텍스트를 확인하고 필요시 수정한 뒤 판독을 시작하세요.",
    url_title: "제품 URL을 입력하세요",
    url_sub: "아마존, iHerb 등 해외 쇼핑몰 지원 | 네이버·쿠팡 등 국내몰은 준비 중",
    url_btn: "분석", url_loading: "분석 중...",
    url_hint: "AI가 해당 페이지에서 제품명과 성분 정보를 자동으로 추출합니다",
    btn_check: "판독 시작", btn_checking: "분석 중...", btn_sample: "샘플", btn_reset: "초기화",
    import_country: "수입국:",
    r_danger: "위험", r_warning: "주의", r_safe: "안전",
    r_db_title: "위해식품 DB 매칭 결과",
    r_db_label: "위해식품",
    r_db_warn: "이 제품은 위해식품으로 등록되어 있으며, 통관 시 차단/폐기될 가능성이 매우 높습니다.",
    r_match_title: "1차 성분 매칭",
    r_ai_title: "AI 정밀 판독",
    r_ai_loading: "AI가 문맥을 분석하고 있습니다...",
    r_safe_title: "1차 판독 통과",
    r_safe_p1: "성분 텍스트에서 금지 성분이 검출되지 않았습니다.",
    r_safe_p2: "라벨 미표기 성분이 존재할 수 있으므로 최종 판단은 세관에 위임됩니다.",
    r_no_detect: "금지 성분이 검출되지 않았습니다",
    r_db_found: "위해식품 DB에 등록된 제품입니다",
    r_detect_found: "금지/주의 성분 검출",
    pricing_title: "요금 안내", pricing_sub: "무료 체험 3건 포함 · 부가세 별도",
    pricing_cta: "선택", pricing_rec: "추천",
  },
  en: {
    nav_start: "Start Scan", nav_pricing: "Pricing",
    hero_badge: "Based on 5,482 hazardous product records from 4 countries",
    hero_h1_1: "Cross-border Customs,", hero_h1_2: "Block Risks Before Import",
    hero_p: "Pre-screening service for purchasing agents to detect customs risks",
    hero_sub: "Food · Supplements · Vitamins · Health Products Only",
    hero_cta: "Free Scan", hero_cta2: "Pricing",
    stat1_n: "5,482", stat1_l: "Hazardous Products DB", stat1_s: "",
    stat2_l: "Countries", stat2_s: "",
    stat3_l: "Scan Time", stat3_s: "sec",
    how_title: "How It Works",
    step1_t: "Input", step1_d: "Paste text, upload image, or enter URL",
    step2_t: "DB Match", step2_d: "Auto-match against 4-country hazardous product database",
    step3_t: "AI Analysis", step3_d: "AI precisely screens for banned ingredients",
    step4_t: "Report", step4_d: "Instant results with risk level and evidence",
    countries_title: "Supported Countries",
    cta_title: "Try it now",
    cta_sub: "No signup required · 3 free scans",
    cta_btn: "Start Scan →",
    footer: "© 2026 ClearPass · Results are for reference only. Final customs decisions are made by authorities.",
    scope_label: "Scope:", scope_food: "Food · Supplements · Vitamins · Health Products",
    scope_not: "Pharmaceuticals · Cosmetics · Electronics not supported",
    input_product: "Product Name", input_product_ph: "e.g., Hardon Blue, NOW Foods Omega-3",
    tab_text: "Text", tab_image: "Image", tab_url: "URL",
    text_ph: "Paste supplement facts text here",
    text_sub: "Copy Supplement Facts from Amazon/iHerb product page and paste here (Ctrl+V)",
    img_drop: "Drag & drop or click to upload label image",
    img_paste: "Screen capture (Win+Shift+S) → Paste here (Ctrl+V)",
    img_format: "JPG, PNG, WebP supported · Multiple images allowed",
    img_extract: "Extract Ingredients with AI",
    img_extracting: "AI is reading the label...",
    img_done: "Extraction complete",
    img_edit_hint: "Review extracted text and edit if needed before scanning.",
    url_title: "Enter Product URL",
    url_sub: "Amazon, iHerb supported | Domestic sites coming soon",
    url_btn: "Analyze", url_loading: "Analyzing...",
    url_hint: "AI will automatically extract product name and ingredients from the page",
    btn_check: "Start Scan", btn_checking: "Analyzing...", btn_sample: "Sample", btn_reset: "Reset",
    import_country: "Import to:",
    r_danger: "DANGER", r_warning: "CAUTION", r_safe: "SAFE",
    r_db_title: "Hazardous Product DB Match",
    r_db_label: "HAZARDOUS",
    r_db_warn: "This product is registered as hazardous and is highly likely to be blocked at customs.",
    r_match_title: "Ingredient Match Results",
    r_ai_title: "AI Detailed Analysis",
    r_ai_loading: "AI is analyzing context...",
    r_safe_title: "Passed Initial Screening",
    r_safe_p1: "No banned ingredients detected in the ingredient text.",
    r_safe_p2: "Unlisted ingredients may exist. Final decision rests with customs authorities.",
    r_no_detect: "No banned ingredients detected",
    r_db_found: "Product registered in hazardous product DB",
    r_detect_found: "Banned/caution ingredients detected",
    pricing_title: "Pricing", pricing_sub: "3 free scans included · Tax excluded",
    pricing_cta: "Select", pricing_rec: "Best Value",
  },
  ja: {
    nav_start: "判定開始", nav_pricing: "料金",
    hero_badge: "4カ国の有害食品DB 5,482件に基づく",
    hero_h1_1: "海外直購の通関、", hero_h1_2: "リスクを事前にブロック",
    hero_p: "購買代行事業者向けの通関リスク事前判定サービス",
    hero_sub: "食品・健康食品・サプリメント専用",
    hero_cta: "無料判定開始", hero_cta2: "料金案内",
    stat1_n: "5,482", stat1_l: "有害食品DB", stat1_s: "件",
    stat2_l: "対応国", stat2_s: "カ国",
    stat3_l: "判定時間", stat3_s: "秒",
    how_title: "仕組み",
    step1_t: "成分入力", step1_d: "テキスト貼り付け、画像アップロード、またはURL入力",
    step2_t: "DB照合", step2_d: "4カ国の有害食品データベースと自動照合",
    step3_t: "AI分析", step3_d: "AIが禁止成分を精密に判定",
    step4_t: "判定結果", step4_d: "リスクレベルと根拠を含む結果を即時提供",
    countries_title: "対応国",
    cta_title: "今すぐ確認",
    cta_sub: "登録不要・無料3件",
    cta_btn: "判定開始 →",
    footer: "© 2026 ClearPass · 本結果は参考用であり、最終通関判断は税関に委ねます",
    scope_label: "検査範囲:", scope_food: "食品・健康食品・サプリメント",
    scope_not: "医薬品・化粧品・電子製品は未対応",
    input_product: "製品名", input_product_ph: "例: Hardon Blue, NOW Foods Omega-3",
    tab_text: "テキスト", tab_image: "画像", tab_url: "URL",
    text_ph: "成分表テキストをここに貼り付けてください",
    text_sub: "Amazon/iHerbの商品ページからSupplement Factsをコピーして貼り付け",
    img_drop: "成分表の写真をドラッグまたはクリックしてアップロード",
    img_paste: "Win+Shift+Sでキャプチャ → ここでCtrl+Vで貼り付け",
    img_format: "JPG, PNG, WebP対応 · 複数画像可",
    img_extract: "AI成分抽出開始",
    img_extracting: "AIが成分表を読み取っています...",
    img_done: "成分抽出完了",
    img_edit_hint: "抽出されたテキストを確認し、必要に応じて修正してから判定を開始してください。",
    url_title: "製品URLを入力",
    url_sub: "Amazon, iHerb対応 | 国内モールは準備中",
    url_btn: "分析", url_loading: "分析中...",
    url_hint: "AIがページから製品名と成分情報を自動抽出します",
    btn_check: "判定開始", btn_checking: "分析中...", btn_sample: "サンプル", btn_reset: "リセット",
    import_country: "輸入国:",
    r_danger: "危険", r_warning: "注意", r_safe: "安全",
    r_db_title: "有害食品DBマッチ結果",
    r_db_label: "有害食品",
    r_db_warn: "この製品は有害食品として登録されており、通関時にブロック・廃棄される可能性が非常に高いです。",
    r_match_title: "1次成分マッチ",
    r_ai_title: "AI精密判定",
    r_ai_loading: "AIがコンテキストを分析しています...",
    r_safe_title: "1次判定通過",
    r_safe_p1: "成分テキストから禁止成分は検出されませんでした。",
    r_safe_p2: "ラベル未表記の成分が存在する可能性があるため、最終判断は税関に委ねます。",
    r_no_detect: "禁止成分は検出されませんでした",
    r_db_found: "有害食品DBに登録された製品です",
    r_detect_found: "禁止/注意成分検出",
    pricing_title: "料金案内", pricing_sub: "無料体験3件含む・税別",
    pricing_cta: "選択", pricing_rec: "おすすめ",
  },
};
 
/* ─── Main App ─── */
export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ko");
  const t = T[lang] || T.ko;
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
 
  function navigateTo(p) { window.history.pushState({ page: p }, "", `#${p}`); setPage(p); }
  useEffect(() => {
    const h = (e) => setPage(e.state?.page || "home");
    window.addEventListener("popstate", h);
    window.history.replaceState({ page: "home" }, "", "#home");
    return () => window.removeEventListener("popstate", h);
  }, []);
 
  const countries = [
    { code: "kr", label: "KR", name: "한국", flag: "🇰🇷", active: true },
    { code: "jp", label: "JP", name: "日本", flag: "🇯🇵", active: true },
    { code: "us", label: "US", name: "USA", flag: "🇺🇸", active: true },
    { code: "eu", label: "EU", name: "EU", flag: "🇪🇺", active: true },
  ];
 
  /* ─── Multi-image handling ─── */
  function handleImageSelect(files) {
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (newFiles.length === 0) return;
    setImageExtracted(false);
    setIngredients("");
    const combined = [...imageFiles, ...newFiles].slice(0, 5); // max 5
    setImageFiles(combined);
    combined.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => {
          const next = [...prev];
          next[i] = e.target.result;
          return next;
        });
      };
      reader.readAsDataURL(file);
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
      if (files.length > 0) handleImageSelect(files);
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [inputMode, imageFiles]);
 
  function removeImage(idx) {
    const nf = imageFiles.filter((_, i) => i !== idx);
    const np = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(nf);
    setImagePreviews(np);
    if (nf.length === 0) { setImageExtracted(false); setIngredients(""); }
  }
 
  async function extractFromImages() {
    if (imagePreviews.length === 0) return;
    setImageExtracting(true);
    let allText = "";
    try {
      for (let i = 0; i < imagePreviews.length; i++) {
        const base64Data = imagePreviews[i].split(",")[1];
        const mediaType = imageFiles[i]?.type || "image/jpeg";
        const res = await fetch("/api/claude", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514", max_tokens: 1500,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: `This is a supplement/food product label image. Extract ALL ingredient text visible in this image. Include everything: ingredient names, amounts, percentages, "Other Ingredients", warnings about contents.\n\nRules:\n- Output ONLY the extracted text, nothing else\n- Keep original language\n- If no ingredient information is found, respond with: NO_INGREDIENTS_FOUND` }
            ]}],
          }),
        });
        const data = await res.json();
        if (data.error) {
          const errStr = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
          if (errStr.includes("rate_limit")) { alert("요청이 많아 일시적으로 제한되었습니다. 1분 후 다시 시도해주세요."); break; }
        } else {
          const text = data.content?.map(c => c.text || "").join("\n") || "";
          if (!text.includes("NO_INGREDIENTS_FOUND")) allText += (allText ? "\n\n" : "") + text;
        }
      }
      if (allText) { setIngredients(allText); setImageExtracted(true); }
      else alert("이미지에서 성분 정보를 찾을 수 없습니다.");
    } catch (err) { alert("이미지 분석 중 오류: " + err.message); }
    setImageExtracting(false);
  }
 
  /* ─── Reset ─── */
  function resetAll() {
    setProductName(""); setIngredients(""); setResults(null); setAiText("");
    setImageFiles([]); setImagePreviews([]); setImageExtracted(false);
    setUrlInput(""); setDbMatches([]); setInputMode("text");
  }
 
  /* ─── Check ─── */
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
          messages: [{ role: "user", content: `당신은 한국 식약처(MFDS) 해외직구 위해식품 통관 전문가입니다.
 
중요 규칙:
1. 아래 성분들은 한국 식약처 "해외직구 위해식품 차단 목록"에 실제 등재된 금지/주의 성분입니다.
2. 해외에서는 일반 보충제로 판매되더라도, 한국 통관 기준으로는 금지입니다.
3. 1차 매칭에서 검출된 성분을 "안전하다"고 뒤집으려면, 반드시 해당 성분명이 다른 단어의 일부인 경우에만 가능합니다.
4. L-Citrulline, Melatonin, 5-HTP, Yohimbine 등은 해외에서 일반적이지만 한국에서는 금지 성분입니다.
 
[위험 등급]: ${highList || "없음"}
[주의 등급]: ${medList || "없음"}
[성분 텍스트]: ${text.substring(0,1500)}
 
아래 양식으로만 한국어로 답변:
🔍 AI 정밀 판독
[위험 성분] • 성분명 — 금지/주의 사유 (1줄)
[가짜 알람 (안전)] • 성분명 — 안전 사유 (1줄) (해당 없으면 "없음")
[종합] 통관 위험도: 높음/중간/낮음 / 근거: (1줄)` }],
        }),
      });
      const data = await res.json();
      setAiText(data.content?.map(c => c.text || "").join("\n") || "분석 실패");
    } catch { setAiText("⚠️ AI 연결 실패 — 1차 매칭 결과를 참고하세요."); }
    setAiLoading(false);
  }
 
  const R = {
    danger: { bg: "#1C0A0A", border: "#DC2626", text: "#FCA5A5", badge: `🚨 ${t.r_danger}`, badgeBg: "#991B1B" },
    warning: { bg: "#1A1506", border: "#D97706", text: "#FDE68A", badge: `⚠️ ${t.r_warning}`, badgeBg: "#92400E" },
    safe: { bg: "#061A0E", border: "#059669", text: "#6EE7B7", badge: `✅ ${t.r_safe}`, badgeBg: "#065F46" }
  };
 
  /* ─── Styles ─── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    :root { --bg:#05060B; --surface:#0C0D14; --surface2:#12131C; --border:rgba(255,255,255,0.05); --text:#D4D5DB; --text2:#6B6D7B; --accent:#3B7BF7; --accent2:#2860D8; }
    body { background:var(--bg); color:var(--text); }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .fu { animation:fadeUp .5s ease both } .fu1{animation-delay:.08s} .fu2{animation-delay:.16s} .fu3{animation-delay:.24s} .fu4{animation-delay:.32s}
    input:focus,textarea:focus { outline:none; border-color:var(--accent)!important; box-shadow:0 0 0 2px rgba(59,123,247,0.08) }
    button { cursor:pointer; transition:all .12s ease }
    button:hover { filter:brightness(1.08) }
    button:active { transform:scale(0.98) }
    ::selection { background:rgba(59,123,247,0.25) }
  `;
 
  const Nav = ({ showCountry }) => (
    <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(5,6,11,0.9)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--border)", padding:"0 20px" }}>
      <div style={{ maxWidth:860, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:56 }}>
        <button onClick={() => navigateTo("home")} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", color:"var(--text)" }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#fff", fontWeight:700 }}>C</div>
          <span style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.01em", fontFamily:"'DM Sans'" }}>ClearPass</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {showCountry && (
            <>
              <span style={{ fontSize:11, color:"var(--text2)", fontWeight:500 }}>{t.import_country}</span>
              {countries.map(c => (
                <button key={c.code} onClick={() => setCountry(c.code)} style={{
                  padding:"5px 10px", borderRadius:5, border:`1px solid ${country===c.code?"var(--accent)":"var(--border)"}`,
                  background:country===c.code?"rgba(59,123,247,0.1)":"transparent",
                  color:country===c.code?"var(--accent)":"var(--text2)", fontSize:11, fontWeight:600,
                }}>{c.label} {c.name}</button>
              ))}
            </>
          )}
          {/* Language selector */}
          <div style={{ marginLeft:8, display:"flex", gap:2, background:"var(--surface)", borderRadius:5, padding:2 }}>
            {[{c:"ko",l:"한"},{c:"en",l:"EN"},{c:"ja",l:"JP"}].map(x => (
              <button key={x.c} onClick={() => setLang(x.c)} style={{
                padding:"4px 8px", borderRadius:4, border:"none", fontSize:10, fontWeight:700,
                background:lang===x.c?"var(--accent)":"transparent", color:lang===x.c?"#fff":"var(--text2)",
              }}>{x.l}</button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
 
  /* ═══════════════════ LANDING PAGE ═══════════════════ */
  if (page === "home") return (
    <div style={{ fontFamily:"'DM Sans','Noto Sans KR',sans-serif", minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <style>{css}</style>
      <Nav />
 
      {/* Hero */}
      <section style={{ maxWidth:860, margin:"0 auto", padding:"80px 20px 60px", textAlign:"center" }}>
        <div className="fu" style={{ display:"inline-block", padding:"5px 14px", borderRadius:4, background:"var(--surface2)", border:"1px solid var(--border)", fontSize:12, color:"var(--text2)", fontWeight:500, marginBottom:28, letterSpacing:"0.02em" }}>
          {t.hero_badge}
        </div>
        <h1 className="fu fu1" style={{ fontSize:"clamp(28px,4.5vw,48px)", fontWeight:800, lineHeight:1.2, letterSpacing:"-0.03em", marginBottom:16, color:"#ECEDF1" }}>
          {t.hero_h1_1}<br/>
          <span style={{ color:"var(--accent)" }}>{t.hero_h1_2}</span>
        </h1>
        <p className="fu fu2" style={{ fontSize:15, color:"var(--text2)", maxWidth:480, margin:"0 auto 10px", lineHeight:1.7 }}>{t.hero_p}</p>
        <p className="fu fu2" style={{ fontSize:11, color:"var(--text2)", opacity:0.5, marginBottom:36 }}>{t.hero_sub}</p>
        <div className="fu fu3" style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigateTo("check")} style={{ padding:"12px 32px", borderRadius:8, border:"none", background:"var(--accent)", color:"#fff", fontSize:14, fontWeight:700 }}>{t.hero_cta}</button>
          <button onClick={() => navigateTo("pricing")} style={{ padding:"12px 24px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--text2)", fontSize:14, fontWeight:500 }}>{t.hero_cta2}</button>
        </div>
      </section>
 
      {/* Stats */}
      <section style={{ maxWidth:860, margin:"0 auto", padding:"0 20px 60px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
          {[
            { n: "5,482", s: t.stat1_s, l: t.stat1_l },
            { n: "4", s: t.stat2_s, l: t.stat2_l },
            { n: "2", s: t.stat3_s, l: t.stat3_l },
          ].map((s, i) => (
            <div key={i} style={{ padding:"24px 16px", borderRadius:12, background:"var(--surface)", border:"1px solid var(--border)", textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:800, color:"#ECEDF1", letterSpacing:"-0.02em", fontFamily:"'DM Sans'" }}>{s.n}<span style={{ fontSize:14, color:"var(--text2)", fontWeight:500 }}>{s.s}</span></div>
              <div style={{ fontSize:12, color:"var(--text2)", marginTop:4, fontWeight:500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>
 
      {/* How it works */}
      <section style={{ maxWidth:860, margin:"0 auto", padding:"0 20px 60px" }}>
        <h2 style={{ fontSize:20, fontWeight:700, textAlign:"center", marginBottom:32, color:"#ECEDF1" }}>{t.how_title}</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12 }}>
          {[
            { n:"01", t:t.step1_t, d:t.step1_d },
            { n:"02", t:t.step2_t, d:t.step2_d },
            { n:"03", t:t.step3_t, d:t.step3_d },
            { n:"04", t:t.step4_t, d:t.step4_d },
          ].map((s, i) => (
            <div key={i} style={{ padding:20, borderRadius:12, background:"var(--surface)", border:"1px solid var(--border)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--accent)", marginBottom:8, fontFamily:"'DM Sans'", letterSpacing:"0.04em" }}>STEP {s.n}</div>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4, color:"#ECEDF1" }}>{s.t}</h3>
              <p style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* Countries */}
      <section style={{ maxWidth:860, margin:"0 auto", padding:"0 20px 60px" }}>
        <h2 style={{ fontSize:20, fontWeight:700, textAlign:"center", marginBottom:24, color:"#ECEDF1" }}>{t.countries_title}</h2>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {[
            { flag:"🇰🇷", name:"한국", sub:"식약처 4,631건", active:true },
            { flag:"🇺🇸", name:"USA", sub:"FDA 465건", active:true },
            { flag:"🇪🇺", name:"EU", sub:"RASFF 203건", active:true },
            { flag:"🇯🇵", name:"日本", sub:"후생노동성 183건", active:true },
          ].map((c,i) => (
            <div key={i} style={{ padding:"16px 24px", borderRadius:10, background:"var(--surface)", border:"1px solid var(--border)", textAlign:"center", minWidth:120 }}>
              <div style={{ fontSize:28, marginBottom:4 }}>{c.flag}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#ECEDF1" }}>{c.name}</div>
              <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </section>
 
      {/* CTA */}
      <section style={{ maxWidth:520, margin:"0 auto", padding:"0 20px 80px", textAlign:"center" }}>
        <div style={{ padding:40, borderRadius:16, background:"var(--surface)", border:"1px solid var(--border)" }}>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8, color:"#ECEDF1" }}>{t.cta_title}</h2>
          <p style={{ fontSize:13, color:"var(--text2)", marginBottom:24 }}>{t.cta_sub}</p>
          <button onClick={() => navigateTo("check")} style={{ padding:"12px 36px", borderRadius:8, border:"none", background:"var(--accent)", color:"#fff", fontSize:14, fontWeight:700 }}>{t.cta_btn}</button>
        </div>
      </section>
 
      <footer style={{ borderTop:"1px solid var(--border)", padding:"20px", textAlign:"center", fontSize:10, color:"var(--text2)" }}><p>{t.footer}</p></footer>
    </div>
  );
 
  /* ═══════════════════ PRICING PAGE ═══════════════════ */
  if (page === "pricing") return (
    <div style={{ fontFamily:"'DM Sans','Noto Sans KR',sans-serif", minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <style>{css}</style>
      <Nav />
      <section style={{ maxWidth:700, margin:"0 auto", padding:"48px 20px" }}>
        <h1 style={{ fontSize:24, fontWeight:800, textAlign:"center", marginBottom:8, color:"#ECEDF1" }}>{t.pricing_title}</h1>
        <p style={{ textAlign:"center", color:"var(--text2)", fontSize:13, marginBottom:40 }}>{t.pricing_sub}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12 }}>
          {[
            { name:"Starter", price:"4,900", count:"20건", per:"245원/건", pop:false },
            { name:"Standard", price:"19,000", count:"100건", per:"190원/건", pop:true },
            { name:"Pro", price:"49,000", count:"300건", per:"163원/건", pop:false },
          ].map((p, i) => (
            <div key={i} style={{ padding:28, borderRadius:12, background:p.pop?"rgba(59,123,247,0.04)":"var(--surface)", border:`1px solid ${p.pop?"rgba(59,123,247,0.2)":"var(--border)"}`, textAlign:"center", position:"relative" }}>
              {p.pop && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", padding:"3px 12px", borderRadius:10, background:"var(--accent)", color:"#fff", fontSize:10, fontWeight:700 }}>{t.pricing_rec}</div>}
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:14, color:"#ECEDF1" }}>{p.name}</h3>
              <div style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.02em", color:"#ECEDF1", fontFamily:"'DM Sans'" }}>₩{p.price}</div>
              <div style={{ fontSize:12, color:"var(--text2)", margin:"8px 0 18px" }}>{p.count} · {p.per}</div>
              <button style={{ width:"100%", padding:"10px", borderRadius:6, border:p.pop?"none":"1px solid var(--border)", background:p.pop?"var(--accent)":"transparent", color:p.pop?"#fff":"var(--text2)", fontSize:13, fontWeight:600 }}>{t.pricing_cta}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
 
  /* ═══════════════════ CHECK PAGE ═══════════════════ */
  return (
    <div style={{ fontFamily:"'DM Sans','Noto Sans KR',sans-serif", minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <style>{css}</style>
      <Nav showCountry />
 
      <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 16px" }}>
        {/* Scope */}
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", marginBottom:14, borderRadius:8, background:"var(--surface)", border:"1px solid var(--border)" }}>
          <span style={{ fontSize:11, color:"var(--text2)" }}>
            <strong style={{ color:"var(--accent)" }}>{t.scope_label}</strong> {t.scope_food} | <span style={{ opacity:0.5 }}>{t.scope_not}</span>
          </span>
        </div>
 
        {/* Input card */}
        <div className="fu" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:20, marginBottom:16 }}>
          {/* Product name */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:600, color:"var(--text2)", marginBottom:5 }}>{t.input_product}</label>
            <input type="text" placeholder={t.input_product_ph} value={productName} onChange={e => setProductName(e.target.value)}
              style={{ width:"100%", padding:"10px 14px", borderRadius:8, background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14, boxSizing:"border-box" }} />
          </div>
 
          {/* Mode toggle */}
          <div style={{ display:"flex", gap:3, marginBottom:14, background:"var(--bg)", borderRadius:8, padding:3 }}>
            {[{k:"text",l:`📝 ${t.tab_text}`},{k:"image",l:`📷 ${t.tab_image}`},{k:"url",l:`🔗 ${t.tab_url}`}].map(m => (
              <button key={m.k} onClick={() => setInputMode(m.k)} style={{
                flex:1, padding:"8px", borderRadius:6, border:"none", fontSize:12, fontWeight:600,
                background:inputMode===m.k?"rgba(59,123,247,0.12)":"transparent",
                color:inputMode===m.k?"var(--accent)":"var(--text2)",
              }}>{m.l}</button>
            ))}
          </div>
 
          {/* Text mode */}
          {inputMode === "text" && (
            <div style={{ marginBottom:16 }}>
              <div style={{ position:"relative" }}>
                {!ingredients && (
                  <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:1, padding:16 }}>
                    <div style={{ fontSize:28, marginBottom:6, opacity:0.3 }}>📋</div>
                    <p style={{ fontSize:13, fontWeight:500, color:"var(--text2)", opacity:0.5, textAlign:"center" }}>{t.text_ph}</p>
                    <p style={{ fontSize:10, color:"var(--text2)", opacity:0.3, textAlign:"center", marginTop:4 }}>{t.text_sub}</p>
                  </div>
                )}
                <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={6}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:8, background:"var(--bg)", border:`1px solid ${ingredients?"var(--accent)":"var(--border)"}`, color:"var(--text)", fontSize:13, lineHeight:1.7, resize:"vertical", boxSizing:"border-box", position:"relative", zIndex:2 }} />
              </div>
            </div>
          )}
 
          {/* URL mode */}
          {inputMode === "url" && (
            <div style={{ marginBottom:16 }}>
              <div style={{ padding:16, borderRadius:10, border:"1px solid var(--border)", background:"var(--bg)" }}>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{t.url_title}</p>
                <p style={{ fontSize:10, color:"var(--text2)", marginBottom:10 }}>{t.url_sub}</p>
                <div style={{ display:"flex", gap:6 }}>
                  <input type="url" placeholder="https://www.amazon.com/..." value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    style={{ flex:1, padding:"10px 14px", borderRadius:8, background:"rgba(0,0,0,0.3)", border:"1px solid var(--border)", color:"var(--text)", fontSize:13, boxSizing:"border-box" }} />
                  <button onClick={async () => {
                    if (!urlInput.trim()) return;
                    setUrlLoading(true);
                    try {
                      const res = await fetch("/api/claude", {
                        method:"POST", headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({
                          model:"claude-sonnet-4-20250514", max_tokens:1500,
                          messages:[{role:"user",content:`You have web search capability. Search for the product at this URL: ${urlInput}\n\nFind and extract:\n1. The product name\n2. ALL ingredients / Supplement Facts\n\nRules:\n- Output the product name on the first line prefixed with "PRODUCT_NAME: "\n- Output all ingredients after a line "INGREDIENTS:"\n- Keep original language\n- If you cannot find the product or ingredients, respond with: NOT_FOUND`}],
                          tools:[{type:"web_search_20250305",name:"web_search"}],
                        }),
                      });
                      const data = await res.json();
                      if (data.error) {
                        const errStr = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
                        alert(errStr.includes("rate_limit") ? "요청이 많아 일시적으로 제한되었습니다." : "URL 분석 오류");
                      } else {
                        const text = data.content?.map(c => c.text || "").join("\n") || "";
                        if (text.includes("NOT_FOUND")) alert("해당 URL에서 제품 정보를 찾을 수 없습니다.");
                        else {
                          const nm = text.match(/PRODUCT_NAME:\s*(.+)/);
                          const ig = text.split("INGREDIENTS:");
                          if (nm) setProductName(nm[1].trim());
                          if (ig[1]) setIngredients(ig[1].trim());
                          setInputMode("text");
                        }
                      }
                    } catch (err) { alert("URL 분석 실패: "+err.message); }
                    setUrlLoading(false);
                  }} disabled={!urlInput.trim()||urlLoading}
                    style={{ padding:"10px 16px", borderRadius:8, border:"none", background:urlInput.trim()?"var(--accent)":"#1E293B", color:"#fff", fontSize:12, fontWeight:700, whiteSpace:"nowrap", opacity:urlLoading?0.7:1 }}>
                    {urlLoading ? t.url_loading : t.url_btn}
                  </button>
                </div>
                <p style={{ fontSize:10, color:"var(--text2)", marginTop:6, opacity:0.5 }}>{t.url_hint}</p>
              </div>
            </div>
          )}
 
          {/* Image mode - multi */}
          {inputMode === "image" && (
            <div style={{ marginBottom:16 }}>
              {imagePreviews.length === 0 ? (
                <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding:"32px 16px", borderRadius:10, border:`2px dashed ${dragOver?"var(--accent)":"rgba(255,255,255,0.08)"}`,
                    background:dragOver?"rgba(59,123,247,0.04)":"var(--bg)", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:0.4 }}>📸</div>
                  <p style={{ fontSize:13, fontWeight:500, color:dragOver?"var(--accent)":"var(--text)", marginBottom:4 }}>{t.img_drop}</p>
                  <p style={{ fontSize:11, color:"var(--accent)", marginBottom:4, fontWeight:500 }}>💡 {t.img_paste}</p>
                  <p style={{ fontSize:11, color:"var(--text2)" }}>{t.img_format}</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:"none" }}
                    onChange={e => handleImageSelect(e.target.files)} />
                </div>
              ) : (
                <div style={{ borderRadius:10, border:"1px solid var(--border)", overflow:"hidden", background:"var(--bg)" }}>
                  {/* Image thumbnails */}
                  <div style={{ display:"flex", gap:6, padding:10, flexWrap:"wrap" }}>
                    {imagePreviews.map((p, i) => p && (
                      <div key={i} style={{ position:"relative", width:80, height:80, borderRadius:8, overflow:"hidden", border:"1px solid var(--border)" }}>
                        <img src={p} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        <button onClick={() => removeImage(i)} style={{
                          position:"absolute", top:2, right:2, width:20, height:20, borderRadius:10,
                          background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", fontSize:10,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>✕</button>
                      </div>
                    ))}
                    {imageFiles.length < 5 && (
                      <div onClick={() => fileInputRef.current?.click()}
                        style={{ width:80, height:80, borderRadius:8, border:"2px dashed rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:20, color:"var(--text2)" }}>+
                        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:"none" }}
                          onChange={e => handleImageSelect(e.target.files)} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize:10, color:"var(--text2)", padding:"0 10px 6px", opacity:0.6 }}>{imageFiles.length}/5 images</p>
 
                  {!imageExtracted && (
                    <div style={{ padding:12, borderTop:"1px solid var(--border)" }}>
                      <button onClick={extractFromImages} disabled={imageExtracting}
                        style={{ width:"100%", padding:"10px", borderRadius:7, border:"none",
                          background:imageExtracting?"#1E293B":"var(--accent)", color:"#fff", fontSize:13, fontWeight:700, opacity:imageExtracting?.7:1 }}>
                        {imageExtracting ? (
                          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                            <span style={{ display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></span>
                            {t.img_extracting}
                          </span>
                        ) : `🔬 ${t.img_extract}`}
                      </button>
                    </div>
                  )}
 
                  {imageExtracted && (
                    <div style={{ padding:12, borderTop:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:6 }}>
                        <span style={{ color:"#6EE7B7", fontSize:12 }}>✓</span>
                        <span style={{ fontSize:11, fontWeight:600, color:"#6EE7B7" }}>{t.img_done}</span>
                      </div>
                      <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} rows={4}
                        style={{ width:"100%", padding:"8px 10px", borderRadius:6, background:"rgba(0,0,0,0.3)", border:"1px solid var(--border)", color:"var(--text)", fontSize:11, lineHeight:1.6, resize:"vertical", boxSizing:"border-box" }} />
                      <p style={{ fontSize:10, color:"var(--text2)", marginTop:3 }}>{t.img_edit_hint}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
 
          {/* Action buttons */}
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={runCheck} disabled={(!ingredients.trim()&&!productName.trim())||analyzing}
              style={{ flex:1, padding:"12px", borderRadius:8, border:"none", background:(ingredients.trim()||productName.trim())?"var(--accent)":"#1E293B", color:"#fff", fontSize:14, fontWeight:700, opacity:analyzing?.7:1 }}>
              {analyzing ? t.btn_checking : `🔍 ${t.btn_check}`}
            </button>
            <button onClick={() => { setProductName("Alpha Muscle Pro X"); setInputMode("text"); setIngredients("L-Arginine 500mg, Tribulus Terrestris 300mg, Yohimbe Bark Extract (standardized for Yohimbine) 200mg, Horny Goat Weed Extract (Epimedium) 150mg, Diindolylmethane (DIM) 100mg, Fenugreek 200mg, Pea Protein Isolate 5g, Melatonin 3mg, Zinc 15mg"); }}
              style={{ padding:"12px 14px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--text2)", fontSize:12, fontWeight:500 }}>{t.btn_sample}</button>
            <button onClick={resetAll}
              style={{ padding:"12px 14px", borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--text2)", fontSize:12, fontWeight:500 }}>{t.btn_reset}</button>
          </div>
        </div>
 
        {/* Results */}
        {results && (
          <div style={{ animation:"fadeUp .4s ease both" }}>
            <div style={{ background:R[results.level].bg, border:`1px solid ${R[results.level].border}40`, borderRadius:14, padding:"16px 20px", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                <span style={{ padding:"3px 10px", borderRadius:6, background:R[results.level].badgeBg, color:"#fff", fontSize:11, fontWeight:700 }}>{R[results.level].badge}</span>
                {results.fromImage && <span style={{ padding:"2px 7px", borderRadius:5, background:"rgba(129,140,248,0.12)", color:"#A5B4FC", fontSize:10, fontWeight:600 }}>📷</span>}
                {results.dbMatches?.length > 0 && <span style={{ padding:"2px 7px", borderRadius:5, background:"rgba(239,68,68,0.12)", color:"#FCA5A5", fontSize:10, fontWeight:600 }}>🗄️ DB</span>}
                <span style={{ fontSize:11, color:R[results.level].text, opacity:.6 }}>{results.product} · {results.time}</span>
              </div>
              <h2 style={{ fontSize:17, fontWeight:700, color:R[results.level].text }}>
                {results.dbMatches?.length > 0
                  ? `⚠️ ${t.r_db_found} (${results.dbMatches.length}건)`
                  : results.level === "safe" ? t.r_no_detect : `${t.r_detect_found} ${results.detected.length}개`}
              </h2>
            </div>
 
            {results.dbMatches?.length > 0 && (
              <div style={{ background:"#1C0A0A", border:"1px solid rgba(239,68,68,0.15)", borderRadius:14, padding:16, marginBottom:14 }}>
                <h3 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"#FCA5A5" }}>🗄️ {t.r_db_title}</h3>
                {results.dbMatches.map((m, i) => (
                  <div key={i} style={{ padding:"10px 12px", marginBottom:6, borderRadius:8, background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.1)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, background:"#991B1B", color:"#fff" }}>{t.r_db_label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#FCA5A5" }}>{m.productName}</span>
                    </div>
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", fontSize:11, color:"var(--text2)" }}>
                      {m.detectedIngredient && <span>검출: <strong style={{ color:"#EF4444" }}>{m.detectedIngredient}</strong>{m.detectedIngredientKr && ` (${m.detectedIngredientKr})`}</span>}
                      {m.manufacturer && <span>제조사: {m.manufacturer}</span>}
                      {m.country && <span>제조국: {m.country}</span>}
                      {m.source && <span>출처: {m.source}</span>}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize:10, color:"#FCA5A5", marginTop:6, opacity:0.6 }}>{t.r_db_warn}</p>
              </div>
            )}
 
            {results.detected.length > 0 && (
              <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:16, marginBottom:14 }}>
                <h3 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"var(--text2)" }}>{t.r_match_title}</h3>
                {results.detected.map((d, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", marginBottom:4, borderRadius:8,
                    background:d.risk==="high"?"rgba(239,68,68,0.04)":"rgba(245,158,11,0.04)",
                    border:`1px solid ${d.risk==="high"?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)"}` }}>
                    <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:4, background:d.risk==="high"?"#991B1B":"#92400E", color:"#fff" }}>
                      {d.risk==="high"?t.r_danger:t.r_warning}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{d.name}</span>
                    <span style={{ fontSize:10, color:"var(--text2)", marginLeft:"auto", maxWidth:"30%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>...{d.ctx}...</span>
                  </div>
                ))}
              </div>
            )}
 
            {(aiLoading || aiText) && (
              <div style={{ background:"var(--surface)", border:"1px solid rgba(59,123,247,0.1)", borderRadius:14, padding:16, marginBottom:14 }}>
                <h3 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"var(--accent)" }}>
                  🤖 {t.r_ai_title} {aiLoading && <span style={{ fontSize:10, color:"var(--text2)", fontWeight:400 }}>...</span>}
                </h3>
                {aiLoading ? (
                  <div style={{ textAlign:"center", padding:20 }}>
                    <div style={{ fontSize:24, animation:"pulse 1.5s infinite" }}>🔬</div>
                    <p style={{ color:"var(--text2)", fontSize:11, marginTop:6 }}>{t.r_ai_loading}</p>
                  </div>
                ) : (
                  <pre style={{ margin:0, padding:14, borderRadius:8, background:"var(--bg)", color:"#C4C8D4", fontSize:12, lineHeight:1.8, whiteSpace:"pre-wrap", wordBreak:"break-word", fontFamily:"'Noto Sans KR','DM Sans',sans-serif" }}>{aiText}</pre>
                )}
              </div>
            )}
 
            {results.level === "safe" && (
              <div style={{ background:"var(--surface)", border:"1px solid rgba(16,185,129,0.1)", borderRadius:14, padding:24, textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:6 }}>✅</div>
                <p style={{ fontSize:15, fontWeight:700, color:"#6EE7B7", marginBottom:4 }}>{t.r_safe_title}</p>
                <p style={{ fontSize:11, color:"var(--text2)", lineHeight:1.6 }}>{t.r_safe_p1}<br/>{t.r_safe_p2}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
