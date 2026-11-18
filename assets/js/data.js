/* =============================================================================
   SNU Dental Prep Portfolio — seed data
   -----------------------------------------------------------------------------
   여기 있는 8개 케이스는 "구조 예시"입니다. 실제 기록으로 바꿔 쓰세요.

   · 사진을 넣는 방법 ①  브라우저에서 카드/상세의 (사진) 칸을 클릭 → 파일 선택
                          (내 브라우저 localStorage 에만 저장됩니다)
   · 사진을 넣는 방법 ②  저장소에 사진을 올리고(예: assets/photos/) 아래 photos[].src
                          에 경로를 적습니다. 이렇게 하면 모든 기기에서 보입니다.
                          예) { label: "교합면 (Occlusal)", src: "assets/photos/46-occlusal.jpg" }
                          src 가 null 이면 검은색 (사진) 빈칸으로 표시됩니다.
   · photos[].label 은 상세 화면의 다각도 사진 이름입니다. 자유롭게 바꾸세요.
   · checks[].state: "good" | "fair" | "warn"  → 자가평가 색상
   ========================================================================== */

window.SDP_TRACKS = [
  {
    id: "preclinical",
    name: "전임상 실습",
    en: "Preclinical · 본2",
    short: "전임상",
    desc: "마네킹·덴티폼 기반 프렙. 와동 형성과 크라운 삭제의 기본기를 수치로 남깁니다.",
  },
  {
    id: "clinic",
    name: "원내생진료",
    en: "Student Clinic · 본3–4",
    short: "원내생진료",
    desc: "실제 환자 케이스. 술전·프렙 후·보철물 장착까지 한 케이스로 누적합니다.",
  },
];

window.SDP_SUBJECTS = [
  { id: "conservative", name: "보존", en: "Conservative Dentistry" },
  { id: "prosthodontics", name: "보철", en: "Prosthodontics" },
  { id: "endodontics", name: "근관", en: "Endodontics" },
  { id: "pediatric", name: "소아치과", en: "Pediatric Dentistry" },
  { id: "perio", name: "치주/외과", en: "Periodontics & Oral Surgery" },
];

window.SDP_CASES = [
  {
    id: "c-46-gold-inlay",
    track: "preclinical",
    subject: "conservative",
    tooth: "#46",
    toothName: "하악 우측 제1대구치",
    title: "2급 금인레이 와동 형성",
    titleEn: "Class II Gold Inlay Cavity Preparation",
    course: "치과보존학실습 I",
    date: "2026-09-18",
    materials: "Dentiform #46 · Typodont",
    instruments: ["#330 Bur", "#245 Bur", "Round Bur #2", "Enamel Chisel", "Wedge"],
    photos: [
      { label: "교합면 (Occlusal)", src: null },
      { label: "협측 (Buccal)", src: null },
      { label: "설측 (Lingual)", src: null },
      { label: "근심 인접면 (Proximal)", src: null },
    ],
    checks: [
      { k: "협설 폭경 (Isthmus)", v: "2.0 mm 유지", state: "good" },
      { k: "치은벽 평탄도", v: "90° 근사", state: "good" },
      { k: "치수벽 평탄도", v: "경사 약간 있음", state: "fair" },
      { k: "인접면 Step", v: "제거 완료", state: "good" },
      { k: "Undercut", v: "협측 벽 1곳", state: "warn" },
    ],
    feedback:
      "인접면 변연이 깔끔하고 폭경 조절이 안정적이었음. 다만 치수벽이 근심으로 살짝 기울어 gold 인레이의 교합면 두께가 얇아질 수 있음 — 마무리에서 평탄화를 한 번 더. 협측 벽 undercut은 왁스업 단계에서 문제가 되므로 다음엔 mirror로 확인 후 마무리할 것.",
  },
  {
    id: "c-16-composite",
    track: "preclinical",
    subject: "conservative",
    tooth: "#16",
    toothName: "상악 우측 제1대구치",
    title: "I·II급 복합레진 와동 형성",
    titleEn: "Class I·II Composite Cavity Preparation",
    course: "치과보존학실습 I",
    date: "2026-10-02",
    materials: "Dentiform #16 · Typodont",
    instruments: ["#330 Bur", "#245 Bur", "Bevel Trim Bur", "Enamel Chisel"],
    photos: [
      { label: "교합면 (Occlusal)", src: null },
      { label: "협측 (Buccal)", src: null },
      { label: "설측 (Lingual)", src: null },
      { label: "Bevel 근접 (Marginal)", src: null },
    ],
    checks: [
      { k: "Bevel 폭", v: "0.5–0.7 mm", state: "good" },
      { k: "교합면 폭경", v: "협측 교두 보존", state: "good" },
      { k: "치은측 변연", v: "법랑질 내 유지", state: "fair" },
      { k: "와동벽 평행성", v: "양호", state: "good" },
    ],
    feedback:
      "삭제량이 보존적이고 교두를 세운 판단이 좋았음. 근심 협측 bevel이 부분적으로 끊겨 광학적 변연이 흐려질 수 있으니 bevel bur 각도를 일정하게 유지. 치은측은 법랑질 안에 남겨야 접착 신뢰도가 올라감.",
  },
  {
    id: "c-36-fgc",
    track: "preclinical",
    subject: "prosthodontics",
    tooth: "#36",
    toothName: "하악 좌측 제1대구치",
    title: "구치부 Full Gold Crown 프렙",
    titleEn: "Posterior Full Gold Crown Preparation",
    course: "치과보철학실습 I",
    date: "2026-10-16",
    materials: "Dentiform #36 · Typodont",
    instruments: ["Tapered Chamfer Diamond Bur", "Occlusal Reduction Bur", "#330 Bur", "Margin Trimmer"],
    photos: [
      { label: "교합면 (Occlusal)", src: null },
      { label: "협측 (Buccal)", src: null },
      { label: "설측 (Lingual)", src: null },
      { label: "변연 근접 (Margin)", src: null },
    ],
    checks: [
      { k: "Occlusal reduction", v: "1.5 mm (기능 교두 2.0)", state: "good" },
      { k: "Axial reduction", v: "1.2 mm 균일", state: "good" },
      { k: "Taper (수렴각)", v: "총 6–8°", state: "fair" },
      { k: "Chamfer 폭", v: "1.0 mm", state: "good" },
      { k: "Undercut", v: "없음", state: "good" },
    ],
    feedback:
      "전체적으로 균일한 삭제. 기능 교두부 교합면 삭제가 비기능侧보다 조금 부족했음(약 1.7 mm) — 금은 연성이지만 교합 간섭 위험이 있어 2.0 mm 확보 권장. 근심 협측 taper가 다른 면보다 커서 인상 채득 시 인발 방향을 확인할 것.",
  },
  {
    id: "c-11-zirconia",
    track: "preclinical",
    subject: "prosthodontics",
    tooth: "#11",
    toothName: "상악 우측 중절치",
    title: "전치부 Zirconia Crown 프렙",
    titleEn: "Anterior Zirconia Crown Preparation",
    course: "치과보철학실습 I",
    date: "2026-10-30",
    materials: "Dentiform #11 · Typodont",
    instruments: ["Tapered Round-End Diamond", "Depth Cutting Bur", "Fine Grit Finishing Bur", "Chamfer Bur"],
    photos: [
      { label: "순측 (Facial)", src: null },
      { label: "구개측 (Palatal)", src: null },
      { label: "절단연 (Incisal)", src: null },
      { label: "변연 근접 (Margin)", src: null },
    ],
    checks: [
      { k: "순측 삭제량", v: "1.2–1.5 mm", state: "good" },
      { k: "절단연 삭제", v: "2.0 mm", state: "good" },
      { k: "구개측 삭제", v: "1.0 mm", state: "fair" },
      { k: "Margin 형태", v: "Chamfer 균일", state: "good" },
      { k: "인접면 접촉", v: "치은측까지 분리", state: "good" },
    ],
    feedback:
      "순측 삭제량과 절단연 확보가 정확했고 margin이 매우 깔끔함. 구개측 1/3에서 삭제가 얕아 지르코니아 두께가 부족할 수 있음 — 특히 절단 1/3 구개측은 1.0 mm 이상. 전치부는 순측 곡면을 따라 bur를 눕히면 자연스러운 곡률이 나옴.",
  },
  {
    id: "c-37-access",
    track: "preclinical",
    subject: "endodontics",
    tooth: "#37",
    toothName: "하악 좌측 제2대구치",
    title: "하악 대구치 치수강 개방 (Access Opening)",
    titleEn: "Mandibular Molar Access Opening",
    course: "근관치료학실습",
    date: "2026-11-06",
    materials: "Dentiform #37 · Typodont",
    instruments: ["#2 Round Bur", "Endo-Z Bur", "DG16 Explorer", "Ultrasonic Tip"],
    photos: [
      { label: "교합면 개방 (Occlusal)", src: null },
      { label: "근관구 근접 (Orifice)", src: null },
      { label: "방사선 (Radiograph)", src: null },
      { label: "근관 입구 확인 (Canal)", src: null },
    ],
    checks: [
      { k: "개방 형태", v: "삼각형 (근심 2 · 원심 1)", state: "good" },
      { k: "치수강 천장 제거", v: "완전 제거", state: "good" },
      { k: "근관구 위치", v: "MB·ML·D 확인", state: "fair" },
      { k: "Straight-line access", v: "부분 확보", state: "fair" },
      { k: "치수강저 천공", v: "없음", state: "good" },
    ],
    feedback:
      "치수강 천장을 깨끗하게 제거하고 근관구를 시야에 노출시킨 점이 좋았음. 근심 협측 근관구가 약간 협측으로 쏠려 있어 file 도입 시 직선 접근이 어려울 수 있음 — 개방연을 협측으로 조금 더 확장. 천공 없이 마무리한 것이 가장 중요한 성과.",
  },
  {
    id: "c-75-ssc",
    track: "preclinical",
    subject: "pediatric",
    tooth: "#75",
    toothName: "하악 좌측 제2유구치",
    title: "유구치 SSC 프렙",
    titleEn: "Primary Molar Stainless Steel Crown Preparation",
    course: "소아치과학실습",
    date: "2026-11-13",
    materials: "Dentiform #75 · Typodont",
    instruments: ["#330 Bur", "Tapered Diamond Bur", "SSC Crimping Plier", "Finishing Bur"],
    photos: [
      { label: "교합면 (Occlusal)", src: null },
      { label: "협측 (Buccal)", src: null },
      { label: "설측 (Lingual)", src: null },
      { label: "변연 적합 (Margin)", src: null },
    ],
    checks: [
      { k: "교합면 삭제", v: "1.0–1.5 mm", state: "good" },
      { k: "근심·원심 인접면", v: "접촉 완전 분리", state: "good" },
      { k: "풍융부 (Bulge)", v: "일직선화", state: "fair" },
      { k: "변연 위치", v: "치은연하 0.5 mm", state: "good" },
      { k: "Crown 적합", v: "Crimp 후 snap", state: "good" },
    ],
    feedback:
      "유구치의 풍융부를 일직선으로 정리한 판단이 정확했음. 다만 근심 협측 모서리에서 삭제가 부족해 crown이 걸리는 느낌 — 적합 확인 후 국소적으로 더 다듬을 것. 유구치는 치수강이 커서 교합면 삭제 중 노출 위험이 있으니 depth cut 후 단계적으로.",
  },
  {
    id: "c-47-clinic-composite",
    track: "clinic",
    subject: "conservative",
    tooth: "#47",
    toothName: "하악 우측 제2대구치",
    title: "2급 복합레진 충전 (원내생진료)",
    titleEn: "Class II Composite Restoration — Student Clinic",
    course: "원내생진료 · 보존과",
    date: "2027-03-00",
    slot: true,
    materials: "실제 환자 · 술전 / 프렙 후 / 충전 후",
    instruments: ["#330 Bur", "Bevel Trim Bur", "Sectional Matrix", "Etchant · Bond"],
    photos: [
      { label: "술전 (Pre-op)", src: null },
      { label: "프렙 후 (Prepared)", src: null },
      { label: "매트릭스 장착 (Matrix)", src: null },
      { label: "충전 후 (Restored)", src: null },
    ],
    checks: [
      { k: "술전 방사선", v: "기록 슬롯", state: "fair" },
      { k: "인접면 접촉", v: "기록 슬롯", state: "fair" },
      { k: "교합 조정", v: "기록 슬롯", state: "fair" },
      { k: "환자 구강위생 교육", v: "기록 슬롯", state: "fair" },
    ],
    feedback:
      "원내생진료 케이스로 전환할 때 이 슬롯을 복제해 쓰세요. 술전·프렙 후·충전 후 사진을 반드시 같은 각도로 남기면 케이스 발표 자료로 바로 쓸 수 있습니다.",
  },
  {
    id: "c-24-clinic-pfm",
    track: "clinic",
    subject: "prosthodontics",
    tooth: "#24",
    toothName: "상악 좌측 제1소구치",
    title: "PFM Crown 프렙 (원내생진료)",
    titleEn: "PFM Crown Preparation — Student Clinic",
    course: "원내생진료 · 보철과",
    date: "2027-09-00",
    slot: true,
    materials: "실제 환자 · 지대치 / 임시치관 / 장착",
    instruments: ["Chamfer Diamond Bur", "Occlusal Reduction Bur", "Margin Trimmer", "Impression Tray"],
    photos: [
      { label: "술전 (Pre-op)", src: null },
      { label: "프렙 후 (Prepared)", src: null },
      { label: "인상 (Impression)", src: null },
      { label: "장착 후 (Cemented)", src: null },
    ],
    checks: [
      { k: "순측 금속 margin", v: "기록 슬롯", state: "fair" },
      { k: "교합면 삭제", v: "기록 슬롯", state: "fair" },
      { k: "임시치관 적합", v: "기록 슬롯", state: "fair" },
      { k: "색조 선택 (Shade)", v: "기록 슬롯", state: "fair" },
    ],
    feedback:
      "원내생진료 보철 케이스 슬롯입니다. PFM은 순측 도재 공간(1.2 mm)과 설측 금속 공간(0.5 mm)을 따로 확보해야 하므로, 프렙 단계에서 순·설 삭제량을 분리해 기록해 두면 좋습니다.",
  },
];
