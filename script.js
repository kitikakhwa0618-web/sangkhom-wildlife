const IUCN_LABEL = {
  LC: "LC · ไม่น่ากังวล",
  NT: "NT · ใกล้ถูกคุกคาม",
  VU: "VU · มีแนวโน้มใกล้สูญพันธุ์",
  EN: "EN · ใกล้สูญพันธุ์",
  CR: "CR · ใกล้สูญพันธุ์อย่างยิ่ง",
  DD: "DD · ข้อมูลไม่เพียงพอ",
  NE: "NE · ยังไม่ได้ประเมิน"
};

const grid = document.getElementById("grid");
const chips = document.getElementById("chips");
const q = document.getElementById("q");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const dlg = document.getElementById("dlg");
const dBody = document.getElementById("d-body");

let group = "ทั้งหมด";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function media(sp) {
  return sp.image
    ? `<img src="${esc(sp.image)}" alt="${esc(sp.nameTh)}" loading="lazy">`
    : esc(sp.emoji || "🐾");
}

function renderChips() {
  const groups = ["ทั้งหมด", ...new Set(SPECIES.map(s => s.group))];
  chips.innerHTML = groups
    .map(g => `<button class="chip" type="button" aria-pressed="${g === group}" data-g="${esc(g)}">${esc(g)}</button>`)
    .join("");
}

function render() {
  const term = q.value.trim().toLowerCase();
  const list = SPECIES.filter(s => {
    const okGroup = group === "ทั้งหมด" || s.group === group;
    const hay = [s.nameTh, s.nameEn, s.sci].join(" ").toLowerCase();
    return okGroup && hay.includes(term);
  });
  grid.innerHTML = list.map(s => `
    <li class="card" data-g="${esc(s.group)}">
      <button type="button" data-id="${esc(s.id)}">
        <span class="thumb" aria-hidden="true">${media(s)}</span>
        <span>
          <h2>${esc(s.nameTh)}</h2>
          <p class="sci">${esc(s.sci)}</p>
          <p class="grp">${esc(s.group)}</p>
        </span>
      </button>
    </li>`).join("");
  empty.hidden = list.length > 0;
  count.textContent = `พบ ${list.length} จาก ${SPECIES.length} ชนิด`;
}

function openSpecies(id, pushHash = true) {
  const s = SPECIES.find(x => x.id === id);
  if (!s) return;
  const big = s.image
    ? `<img class="d-img" src="${esc(s.image)}" alt="${esc(s.nameTh)}">`
    : `<div class="d-emoji" aria-hidden="true">${esc(s.emoji || "🐾")}</div>`;
  dBody.innerHTML = `
    <div data-g="${esc(s.group)}">
      ${big}
      <div class="d-head">
        <h2 id="d-title">${esc(s.nameTh)}</h2>
        <p>${esc(s.nameEn)} · <em>${esc(s.sci)}</em></p>
      </div>
      <p>${esc(s.note)}</p>
      <dl>
        <dt>กลุ่ม</dt><dd>${esc(s.group)}</dd>
        <dt>ที่อยู่อาศัย</dt><dd>${esc(s.habitat)}</dd>
        <dt>อาหาร</dt><dd>${esc(s.diet)}</dd>
        <dt>ช่วงที่พบ</dt><dd>${esc(s.active)}</dd>
        <dt>สถานะ IUCN</dt><dd>${esc(IUCN_LABEL[s.iucn] || s.iucn)}</dd>
      </dl>
      <p class="tip"><strong>ข้อสังเกต:</strong> ${esc(s.tip)}</p>
    </div>`;
  if (!dlg.open) dlg.showModal();
  if (pushHash) history.replaceState(null, "", "#" + s.id);
}

chips.addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  group = b.dataset.g;
  renderChips();
  render();
});
q.addEventListener("input", render);
grid.addEventListener("click", e => {
  const b = e.target.closest("button[data-id]");
  if (b) openSpecies(b.dataset.id);
});
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));

renderChips();
render();
if (location.hash.length > 1) openSpecies(decodeURIComponent(location.hash.slice(1)), false);
