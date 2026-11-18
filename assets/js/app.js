/* =============================================================================
   SNU Dental Prep Portfolio — app
   · 사진은 localStorage 에만 저장된다 (공개 저장소에 환자 사진을 올리지 않기 위함).
   · 기본 데이터는 data.js (window.SDP_CASES).
   ========================================================================== */

(function () {
  "use strict";

  var KEY_PHOTOS = "sdp.v1.photos";
  var KEY_CASES = "sdp.v1.cases";

  var TRACKS = window.SDP_TRACKS || [];
  var SUBJECTS = window.SDP_SUBJECTS || [];
  var SEED = window.SDP_CASES || [];

  var state = {
    photos: loadJSON(KEY_PHOTOS, {}),
    custom: loadJSON(KEY_CASES, []),
    trackFilter: "all",
    subjectFilter: "all",
    query: "",
    openCaseId: null,
    pendingSlot: null, // { caseId, index } or { upload: index }
    uploadPhotos: [null, null, null, null],
    lastFocus: null,
    bulk: []
  };

  /* ---------------------------------------------------------------- utils */

  function loadJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      toast("저장 공간이 가득 찼습니다. JSON 내보내기로 백업해 주세요.");
      return false;
    }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function trackById(id) {
    for (var i = 0; i < TRACKS.length; i++) if (TRACKS[i].id === id) return TRACKS[i];
    return { id: id, name: id, en: "", short: id, desc: "" };
  }

  function subjectById(id) {
    for (var i = 0; i < SUBJECTS.length; i++) if (SUBJECTS[i].id === id) return SUBJECTS[i];
    return { id: id, name: id, en: "" };
  }

  function allCases() {
    return state.custom.concat(SEED);
  }

  function findCase(id) {
    var list = allCases();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function photoFor(item, index) {
    var key = item.id + "::" + index;
    if (Object.prototype.hasOwnProperty.call(state.photos, key) && state.photos[key]) {
      return state.photos[key];
    }
    var slot = (item.photos || [])[index];
    return slot && slot.src ? slot.src : null;
  }

  function filledCount(item) {
    var n = 0;
    var slots = item.photos || [];
    for (var i = 0; i < slots.length; i++) if (photoFor(item, i)) n += 1;
    return n;
  }

  function totalSlots(item) { return (item.photos || []).length; }

  function formatDate(value) {
    if (!value) return "—";
    var parts = String(value).split("-");
    if (parts.length < 2) return value;
    if (parts[1] === "00") return parts[0] + " (예정)";
    if (parts.length === 3 && parts[2] === "00") return parts[0] + "." + parts[1];
    var d = new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return value;
    return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate());
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  var toastTimer = null;
  function toast(message) {
    var node = qs("#toast");
    if (!node) return;
    node.textContent = message;
    node.setAttribute("data-show", "true");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      node.removeAttribute("data-show");
    }, 2600);
  }

  /* ------------------------------------------------------- photo placeholder */

  function photoPlaceholder(extraClass) {
    var box = el("div", "photo-empty" + (extraClass ? " " + extraClass : ""));
    box.appendChild(el("span", "ph-label", "(사진)"));
    return box;
  }

  /* ---------------------------------------------------------------- header */

  function renderTrackCards() {
    var grid = qs("#track-grid");
    if (!grid) return;
    grid.innerHTML = "";
    TRACKS.forEach(function (t) {
      var list = allCases().filter(function (c) { return c.track === t.id; });
      var card = el("a", "track-card");
      card.href = "#collection";
      card.setAttribute("data-track", t.id);
      card.addEventListener("click", function (e) {
        e.preventDefault();
        state.trackFilter = t.id;
        state.subjectFilter = "all";
        syncFilters();
        renderGrid();
        var target = qs("#collection");
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      var top = el("div", "track-top");
      top.appendChild(el("span", "track-name", t.name));
      top.appendChild(el("span", "track-en", t.en));
      card.appendChild(top);
      card.appendChild(el("p", "track-desc", t.desc));

      var count = el("div", "track-count");
      count.appendChild(el("b", null, String(list.length)));
      count.appendChild(document.createTextNode(" 건 등록 · 클릭해서 모아 보기"));
      card.appendChild(count);
      grid.appendChild(card);
    });
  }

  function renderStats() {
    var cases = allCases();
    var filled = 0;
    var slots = 0;
    cases.forEach(function (c) { filled += filledCount(c); slots += totalSlots(c); });

    var subjects = {};
    cases.forEach(function (c) { subjects[c.subject] = true; });
    var subjectCount = Object.keys(subjects).length;

    var setNode = function (sel, value, suffix) {
      var node = qs(sel);
      if (!node) return;
      node.textContent = String(value);
      if (suffix) {
        var small = document.createElement("small");
        small.textContent = suffix;
        node.appendChild(small);
      }
    };

    setNode("#stat-cases", cases.length, "건");
    setNode("#stat-photos", filled, "/" + slots);
    setNode("#stat-subjects", subjectCount, "과목");
    setNode("#stat-tracks", TRACKS.length, "트랙");
  }

  /* ---------------------------------------------------------------- filters */

  function renderSubjectChips() {
    var wrap = qs("#subject-filter");
    if (!wrap) return;
    wrap.innerHTML = "";
    var all = el("button", null, "전체 과목");
    all.type = "button";
    all.setAttribute("data-subject", "all");
    wrap.appendChild(all);

    SUBJECTS.forEach(function (s) {
      var b = el("button", null, s.name);
      b.type = "button";
      b.setAttribute("data-subject", s.id);
      wrap.appendChild(b);
    });
  }

  function syncFilters() {
    qsa("#track-filter button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-track") === state.trackFilter ? "true" : "false");
    });
    qsa("#subject-filter button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-subject") === state.subjectFilter ? "true" : "false");
    });
  }

  function bindFilters() {
    var trackWrap = qs("#track-filter");
    if (trackWrap) {
      trackWrap.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-track]");
        if (!btn) return;
        state.trackFilter = btn.getAttribute("data-track");
        syncFilters();
        renderGrid();
      });
    }
    var subjWrap = qs("#subject-filter");
    if (subjWrap) {
      subjWrap.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-subject]");
        if (!btn) return;
        state.subjectFilter = btn.getAttribute("data-subject");
        syncFilters();
        renderGrid();
      });
    }
    var search = qs("#search-input");
    if (search) {
      search.addEventListener("input", function () {
        state.query = search.value.trim().toLowerCase();
        renderGrid();
      });
    }
  }

  function matches(item) {
    if (state.trackFilter !== "all" && item.track !== state.trackFilter) return false;
    if (state.subjectFilter !== "all" && item.subject !== state.subjectFilter) return false;
    if (!state.query) return true;
    var hay = [
      item.tooth, item.toothName, item.title, item.titleEn, item.course,
      (item.instruments || []).join(" "),
      subjectById(item.subject).name, subjectById(item.subject).en,
      trackById(item.track).name
    ].join(" ").toLowerCase();
    return hay.indexOf(state.query) !== -1;
  }

  /* ------------------------------------------------------------------- grid */

  function renderGrid() {
    var grid = qs("#case-grid");
    if (!grid) return;
    grid.innerHTML = "";

    var list = allCases().filter(matches);

    if (!list.length) {
      var empty = el("div", "empty-state");
      empty.appendChild(el("p", null, "조건에 맞는 케이스가 없습니다."));
      empty.appendChild(el("span", null, "필터를 바꾸거나 + 새 실습 등록으로 첫 기록을 남겨 보세요."));
      grid.appendChild(empty);
      return;
    }

    list.forEach(function (item) { grid.appendChild(buildCard(item)); });
  }

  function buildCard(item) {
    var card = el("button", "case-card");
    card.type = "button";
    card.setAttribute("data-id", item.id);
    card.setAttribute("aria-label", item.tooth + " " + item.title + " 상세 보기");

    var thumb = el("div", "case-thumb photo-empty");
    thumb.appendChild(el("span", "ph-label", "(사진)"));
    var firstPhoto = photoFor(item, 0);
    if (firstPhoto) {
      thumb.classList.remove("photo-empty");
      thumb.innerHTML = "";
      var img = el("img");
      img.src = firstPhoto;
      img.alt = item.tooth + " " + item.title;
      img.loading = "lazy";
      thumb.appendChild(img);
    }

    var badges = el("div", "thumb-badges");
    var trackBadge = el("span", "badge badge-track", trackById(item.track).short);
    trackBadge.setAttribute("data-track", item.track);
    badges.appendChild(trackBadge);
    if (item.slot) badges.appendChild(el("span", "badge badge-tpl", "예시"));
    thumb.appendChild(badges);
    card.appendChild(thumb);

    var body = el("div", "case-body");

    var toprow = el("div", "case-toprow");
    toprow.appendChild(el("span", "tooth", item.tooth));
    toprow.appendChild(el("span", "case-subject", subjectById(item.subject).name));
    body.appendChild(toprow);

    body.appendChild(el("h3", "case-title", item.title));

    var meta = el("div", "case-meta");
    meta.appendChild(el("span", null, formatDate(item.date)));
    meta.appendChild(el("span", "sep"));
    meta.appendChild(el("span", null, filledCount(item) + "/" + totalSlots(item) + " 사진"));
    body.appendChild(meta);

    if (item.instruments && item.instruments.length) {
      var tools = el("div", "case-tools");
      item.instruments.slice(0, 3).forEach(function (t) { tools.appendChild(el("span", "tool-tag", t)); });
      if (item.instruments.length > 3) {
        tools.appendChild(el("span", "tool-tag", "+" + (item.instruments.length - 3)));
      }
      body.appendChild(tools);
    }

    card.appendChild(body);

    card.addEventListener("click", function () {
      state.lastFocus = card;
      openDetail(item.id);
    });

    return card;
  }

  /* ----------------------------------------------------------- detail modal */

  function openDetail(id) {
    var item = findCase(id);
    if (!item) return;
    state.openCaseId = id;

    var eyebrow = qs("#detail-eyebrow");
    var title = qs("#detail-title");
    var sub = qs("#detail-sub");
    var body = qs("#detail-body");
    if (!eyebrow || !title || !sub || !body) return;

    eyebrow.innerHTML = "";
    var t = trackById(item.track);
    eyebrow.appendChild(el("span", null, t.name));
    eyebrow.appendChild(el("span", null, "·"));
    eyebrow.appendChild(el("span", null, subjectById(item.subject).name));
    if (item.slot) eyebrow.appendChild(el("span", null, "· 예시 슬롯"));

    title.textContent = item.title;
    sub.textContent = item.tooth + " · " + (item.toothName || "FDI 표기") +
      (item.course ? " · " + item.course : "") + (item.date ? " · " + formatDate(item.date) : "");

    body.innerHTML = "";

    var grid = el("div", "detail-grid");

    /* 사진 슬롯 */
    var left = el("div");
    var slotGrid = el("div", "slot-grid");
    (item.photos || []).forEach(function (slot, index) {
      slotGrid.appendChild(buildSlot(item, slot, index));
    });
    left.appendChild(slotGrid);

    var photoNote = el("p", null, "각 칸을 클릭하면 해당 각도의 사진을 넣습니다. 넣은 사진은 이 브라우저에만 저장됩니다.");
    photoNote.style.cssText = "margin:12px 0 0;font-size:11.5px;line-height:1.6;color:#98a2b3;";
    left.appendChild(photoNote);
    grid.appendChild(left);

    /* 메타 */
    var right = el("div");

    var caseBlock = el("div", "meta-block");
    caseBlock.appendChild(el("div", "meta-label", "Case"));
    var kv = el("div", "kv-grid");
    kv.appendChild(kvItem("치식 (FDI)", item.tooth, true));
    kv.appendChild(kvItem("치아", item.toothName || "—"));
    kv.appendChild(kvItem("트랙", t.name));
    kv.appendChild(kvItem("과목", subjectById(item.subject).name));
    caseBlock.appendChild(kv);

    if (item.materials) {
      var mat = el("div", "kv");
      mat.style.cssText = "margin-top:1px;border-radius:0 0 10px 10px;border:1px solid #e3e7ef;border-top:0;";
      mat.appendChild(el("div", "kv-k", "실습 모델 / 재료"));
      mat.appendChild(el("div", "kv-v", item.materials));
      caseBlock.appendChild(mat);
    }
    right.appendChild(caseBlock);

    if (item.instruments && item.instruments.length) {
      var toolBlock = el("div", "meta-block");
      toolBlock.appendChild(el("div", "meta-label", "사용 기구 · 버"));
      var tools = el("div", "case-tools");
      item.instruments.forEach(function (x) { tools.appendChild(el("span", "tool-tag", x)); });
      toolBlock.appendChild(tools);
      right.appendChild(toolBlock);
    }

    if (item.checks && item.checks.length) {
      var checkBlock = el("div", "meta-block");
      checkBlock.appendChild(el("div", "meta-label", "체크포인트 · 자가평가"));
      var list = el("div", "check-list");
      item.checks.forEach(function (c) {
        var row = el("div", "check-row");
        var led = el("span", "led");
        led.setAttribute("data-state", c.state || "fair");
        row.appendChild(led);
        row.appendChild(el("span", "check-k", c.k));
        row.appendChild(el("span", "check-v", c.v));
        list.appendChild(row);
      });
      checkBlock.appendChild(list);
      right.appendChild(checkBlock);
    }

    if (item.feedback) {
      var fbBlock = el("div", "meta-block");
      fbBlock.appendChild(el("div", "meta-label", "교수님 피드백 · 메모"));
      fbBlock.appendChild(el("div", "feedback-box", item.feedback));
      right.appendChild(fbBlock);
    }

    grid.appendChild(right);
    body.appendChild(grid);

    showModal("detail");
  }

  function kvItem(k, v, mono) {
    var box = el("div", "kv");
    box.appendChild(el("div", "kv-k", k));
    box.appendChild(el("div", "kv-v" + (mono ? " mono" : ""), v));
    return box;
  }

  function buildSlot(item, slot, index) {
    var wrap = el("div", "slot");
    var src = photoFor(item, index);
    if (src) wrap.classList.add("has-photo");

    var btn = el("button", "slot-btn");
    btn.type = "button";
    btn.setAttribute("aria-label", (slot.label || "사진") + " — 사진 넣기/바꾸기");
    btn.setAttribute("data-slot", String(index));

    if (src) {
      var img = el("img", "slot-img");
      img.src = src;
      img.alt = (item.title || "") + " " + (slot.label || "");
      btn.appendChild(img);
    } else {
      var ph = el("div", "photo-empty");
      ph.style.cssText = "position:absolute;inset:0;";
      ph.appendChild(el("span", "ph-label", "(사진)"));
      btn.appendChild(ph);
    }

    btn.addEventListener("click", function () {
      pickPhoto(item.id, index);
    });
    wrap.appendChild(btn);

    if (src) {
      var clear = el("button", "slot-clear", "×");
      clear.type = "button";
      clear.setAttribute("aria-label", "이 사진을 지우고 빈칸으로 되돌리기");
      clear.addEventListener("click", function (e) {
        e.stopPropagation();
        clearPhoto(item.id, index);
      });
      wrap.appendChild(clear);
    }

    var name = el("div", "slot-name");
    name.appendChild(el("span", null, slot.label || "사진 " + (index + 1)));
    name.appendChild(el("span", "hint", src ? "등록됨" : "비어 있음"));
    wrap.appendChild(name);

    return wrap;
  }

  /* --------------------------------------------------------------- photo io */

  function pickPhoto(caseId, index) {
    state.pendingSlot = { caseId: caseId, index: index };
    var input = qs("#file-input");
    if (!input) return;
    input.value = "";
    input.click();
  }

  function clearPhoto(caseId, index) {
    var key = caseId + "::" + index;
    delete state.photos[key];
    saveJSON(KEY_PHOTOS, state.photos);
    toast("사진을 지우고 (사진) 빈칸으로 되돌렸습니다.");
    refresh();
    openDetail(caseId);
  }

  function handleFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast("이미지 파일만 넣을 수 있습니다.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = String(reader.result || "");
      var target = state.pendingSlot;
      if (!target) return;

      if (typeof target.upload === "number") {
        state.uploadPhotos[target.upload] = dataUrl;
        renderUploadGrid();
        state.pendingSlot = null;
        return;
      }

      state.photos[target.caseId + "::" + target.index] = dataUrl;
      saveJSON(KEY_PHOTOS, state.photos);
      refresh();
      openDetail(target.caseId);
      toast("사진을 넣었습니다. 이 브라우저에 저장되었습니다.");
      state.pendingSlot = null;
    };
    reader.onerror = function () { toast("사진을 읽지 못했습니다. 다른 파일로 시도해 주세요."); };
    reader.readAsDataURL(file);
  }

  /* --------------------------------------------------------------- new case */

  function buildUploadSlots() {
    var grid = qs("#upload-grid");
    if (!grid) return;
    grid.innerHTML = "";
    var labels = currentUploadLabels();
    labels.forEach(function (label, index) {
      var wrap = el("div", "upload-slot");
      wrap.setAttribute("data-upload", String(index));
      var face = el("div", "uface photo-empty");
      var src = state.uploadPhotos[index];
      if (src) {
        face.classList.remove("photo-empty");
        var img = el("img");
        img.src = src;
        img.alt = label;
        face.appendChild(img);
      } else {
        face.appendChild(el("span", "ph-label", "(사진)"));
      }
      wrap.appendChild(face);
      wrap.appendChild(el("div", "upload-name", label));
      wrap.addEventListener("click", function () {
        state.pendingSlot = { upload: index };
        var input = qs("#file-input");
        if (!input) return;
        input.value = "";
        input.click();
      });
      grid.appendChild(wrap);
    });
  }

  function currentUploadLabels() {
    var checked = qs('#new-track-group input[name="track"]:checked');
    var track = checked ? checked.value : "preclinical";
    if (track === "clinic") return ["술전", "프렙 후", "인상", "장착 후"];
    return ["교합면", "협측", "설측", "프렙 후 근접"];
  }

  function renderUploadGrid() {
    buildUploadSlots();
  }

  function resetNewForm() {
    var form = qs("#new-form");
    if (form) form.reset();
    state.uploadPhotos = [null, null, null, null];
    var err = qs("#new-error");
    if (err) { err.removeAttribute("data-show"); err.textContent = ""; }
    qsa("#new-form .field").forEach(function (f) { f.classList.remove("is-invalid"); });
    buildUploadSlots();
  }

  function submitNewCase(event) {
    event.preventDefault();
    var form = qs("#new-form");
    if (!form) return;

    var err = qs("#new-error");
    var trackInput = qs('#new-track-group input[name="track"]:checked');
    var subjectSelect = qs("#new-subject");
    var toothInput = qs("#new-tooth");
    var titleInput = qs("#new-title-input");

    var track = trackInput ? trackInput.value : "preclinical";
    var subject = subjectSelect ? subjectSelect.value : "conservative";
    var tooth = toothInput ? toothInput.value.trim() : "";
    var title = titleInput ? titleInput.value.trim() : "";

    var bad = [];
    if (!tooth) { bad.push("치식 번호"); if (toothInput) toothInput.closest(".field").classList.add("is-invalid"); }
    if (!title) { bad.push("시술 / 프렙명"); if (titleInput) titleInput.closest(".field").classList.add("is-invalid"); }

    if (bad.length) {
      if (err) {
        err.textContent = bad.join(", ") + "을(를) 적어 주세요.";
        err.setAttribute("data-show", "true");
      }
      return;
    }

    var labels = currentUploadLabels();
    var photos = labels.map(function (label, index) {
      return { label: label, src: state.uploadPhotos[index] || null };
    });

    var instrumentsRaw = (qs("#new-instruments") || {}).value || "";
    var instruments = instrumentsRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);

    var checksRaw = (qs("#new-checks") || {}).value || "";
    var checks = checksRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) {
      return { k: s, v: "", state: "fair" };
    });

    var id = "c-" + Date.now().toString(36);
    var item = {
      id: id,
      track: track,
      subject: subject,
      tooth: tooth.charAt(0) === "#" ? tooth : "#" + tooth,
      toothName: "",
      title: title,
      titleEn: "",
      course: (qs("#new-course") || {}).value || "",
      date: (qs("#new-date") || {}).value || "",
      materials: "",
      instruments: instruments,
      photos: photos,
      checks: checks,
      feedback: (qs("#new-feedback") || {}).value || ""
    };

    // 사진은 케이스 배열이 아니라 photo store 에 넣어 둔다 (내보내기 구조 단순화)
    item.photos.forEach(function (p, index) {
      if (p.src) {
        state.photos[id + "::" + index] = p.src;
        p.src = null;
      }
    });

    state.custom.unshift(item);
    saveJSON(KEY_CASES, state.custom);
    saveJSON(KEY_PHOTOS, state.photos);

    closeModal("new");
    resetNewForm();

    state.trackFilter = "all";
    state.subjectFilter = "all";
    state.query = "";
    var search = qs("#search-input");
    if (search) search.value = "";
    syncFilters();
    refresh();
    toast("새 기록을 등록했습니다.");

    var card = qs('.case-card[data-id="' + id + '"]');
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ----------------------------------------------------------- export/import */

  function exportJSON() {
    var payload = {
      app: "snu-dental-prep-portfolio",
      version: 1,
      exportedAt: new Date().toISOString(),
      cases: state.custom,
      photos: state.photos
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var stamp = new Date();
    a.href = url;
    a.download = "snu-dental-prep-" + stamp.getFullYear() + pad(stamp.getMonth() + 1) + pad(stamp.getDate()) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast("JSON 파일로 내보냈습니다.");
  }

  function importJSON(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result || "{}"));
        var importedCases = Array.isArray(data.cases) ? data.cases : [];
        var importedPhotos = data.photos && typeof data.photos === "object" ? data.photos : {};

        var known = {};
        state.custom.forEach(function (c) { known[c.id] = true; });
        importedCases.forEach(function (c) {
          if (c && c.id && !known[c.id]) {
            state.custom.unshift(c);
            known[c.id] = true;
          }
        });

        Object.keys(importedPhotos).forEach(function (k) {
          state.photos[k] = importedPhotos[k];
        });

        saveJSON(KEY_CASES, state.custom);
        saveJSON(KEY_PHOTOS, state.photos);
        refresh();
        toast("가져오기 완료 — " + importedCases.length + "건의 케이스를 확인했습니다.");
      } catch (e) {
        toast("JSON 파일을 읽지 못했습니다. 형식을 확인해 주세요.");
      }
    };
    reader.readAsText(file);
  }

  /* ------------------------------------------------------------ modal plumbing */

  function showModal(name) {
    var node = qs("#modal-" + name);
    if (!node) return;
    var alreadyOpen = node.getAttribute("data-open") === "true";
    node.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    if (alreadyOpen) return;
    var focusable = node.querySelector("button, [href], input, select, textarea");
    if (focusable) focusable.focus({ preventScroll: true });
  }

  function closeModal(name) {
    var node = qs("#modal-" + name);
    if (!node) return;
    node.setAttribute("data-open", "false");
    document.body.style.overflow = "";
    if (name === "detail") state.openCaseId = null;
    if (state.lastFocus && state.lastFocus.focus) {
      state.lastFocus.focus({ preventScroll: true });
      state.lastFocus = null;
    }
  }

  function bindModals() {
    qsa("[data-close]").forEach(function (node) {
      node.addEventListener("click", function () {
        closeModal(node.getAttribute("data-close"));
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      qsa('.modal[data-open="true"]').forEach(function (m) {
        closeModal(m.id.replace("modal-", ""));
      });
    });
  }

  /* ------------------------------------------------------------------ render */

  function refresh() {
    renderTrackCards();
    renderStats();
    renderGrid();
    if (state.openCaseId) {
      var modal = qs("#modal-detail");
      if (modal && modal.getAttribute("data-open") === "true") openDetail(state.openCaseId);
    }
  }

  function seedSubjectSelect() {
    var select = qs("#new-subject");
    if (!select) return;
    select.innerHTML = "";
    SUBJECTS.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name + " · " + s.en;
      select.appendChild(opt);
    });
  }

  function bindHeaderActions() {
    var bex = qs("#btn-export");
    if (bex) bex.addEventListener("click", exportJSON);

    var bimp = qs("#btn-import");
    var impInput = qs("#import-input");
    if (bimp && impInput) {
      bimp.addEventListener("click", function () {
        impInput.value = "";
        impInput.click();
      });
      impInput.addEventListener("change", function () {
        if (impInput.files && impInput.files[0]) importJSON(impInput.files[0]);
      });
    }

    var breset = qs("#btn-reset");
    if (breset) {
      breset.addEventListener("click", function () {
        var ok = window.confirm("이 브라우저에 저장된 새 케이스와 사진을 모두 지우고 처음 상태로 돌립니다. 내려받은 JSON 백업은 그대로 남습니다. 계속할까요?");
        if (!ok) return;
        state.photos = {};
        state.custom = [];
        saveJSON(KEY_PHOTOS, state.photos);
        saveJSON(KEY_CASES, state.custom);
        state.trackFilter = "all";
        state.subjectFilter = "all";
        state.query = "";
        var search = qs("#search-input");
        if (search) search.value = "";
        syncFilters();
        refresh();
        toast("브라우저 기록을 초기화했습니다.");
      });
    }

    var bnew = qs("#btn-new");
    if (bnew) {
      bnew.addEventListener("click", function () {
        state.lastFocus = bnew;
        state.uploadPhotos = [null, null, null, null];
        buildUploadSlots();
        var today = qs("#new-date");
        if (today && !today.value) {
          var d = new Date();
          today.value = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
        }
        showModal("new");
      });
    }

    var form = qs("#new-form");
    if (form) form.addEventListener("submit", submitNewCase);

    var fileInput = qs("#file-input");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
        else state.pendingSlot = null;
      });
    }

    var trackGroup = qs("#new-track-group");
    if (trackGroup) {
      trackGroup.addEventListener("change", function () {
        state.uploadPhotos = [null, null, null, null];
        buildUploadSlots();
      });
    }

    qsa("#new-form input").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("is-invalid");
      });
    });
  }

  /* -------------------------------------------------------------------- init */

  function init() {
    seedSubjectSelect();
    renderSubjectChips();
    bindFilters();
    bindHeaderActions();
    bindModals();
    buildUploadSlots();
    syncFilters();
    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
