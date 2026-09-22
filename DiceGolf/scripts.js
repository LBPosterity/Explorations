let COLS = 15;
let ROWS = 25;

// Each style: key, label, class name, character shown in cell
const STYLES = [
  { key: "clear",   label: "Clear / Erase", cls: "clear",   glyph: "" },
  { key: "fairway", label: "Fairway",       cls: "fairway", glyph: "." },
  { key: "sand",    label: "Sand Trap",     cls: "sand",    glyph: "⛆" },
  { key: "water",   label: "Water Hazard",  cls: "water",   glyph: "≈" },
  { key: "trees",   label: "Trees",         cls: "trees",   glyph: "🌲" },
  { key: "green",   label: "Green",         cls: "green",   glyph: "." },
  { key: "hole",    label: "Hole",          cls: "hole",    glyph: "⚑" },
  { key: "start",   label: "Starting Point",cls: "start",   glyph: "○" },
];

let activeStyle = STYLES[1].key; // default to fairway to start painting

// The default course layout baked into this file. Row-major, [row][col],
// each value is a style key from STYLES above.
const DEFAULT_DESIGN = [
  ["clear","sand","sand","sand","sand","clear","clear","clear","clear","clear","clear","clear","clear","clear","clear"],
  ["clear","clear","sand","sand","clear","green","green","green","green","green","clear","clear","clear","clear","clear"],
  ["clear","clear","clear","clear","green","green","hole","green","green","clear","clear","clear","clear","clear","clear"],
  ["clear","clear","clear","green","green","green","green","green","clear","clear","clear","trees","clear","clear","clear"],
  ["trees","clear","clear","fairway","fairway","green","green","fairway","clear","clear","trees","trees","clear","clear","water"],
  ["trees","clear","clear","clear","fairway","fairway","fairway","fairway","trees","trees","trees","clear","clear","water","water"],
  ["trees","trees","trees","clear","clear","fairway","fairway","trees","trees","trees","clear","clear","water","water","water"],
  ["trees","trees","clear","clear","clear","fairway","trees","fairway","clear","clear","clear","water","water","water","water"],
  ["water","trees","trees","water","clear","fairway","fairway","fairway","clear","clear","water","water","water","water","water"],
  ["water","water","water","water","clear","fairway","fairway","clear","clear","sand","clear","clear","clear","water","water"],
  ["water","water","water","clear","fairway","fairway","fairway","sand","sand","sand","clear","clear","clear","clear","clear"],
  ["water","water","trees","clear","fairway","fairway","fairway","sand","sand","clear","clear","clear","clear","clear","trees"],
  ["water","water","trees","trees","trees","fairway","fairway","fairway","fairway","fairway","clear","clear","clear","trees","trees"],
  ["water","water","trees","trees","trees","trees","trees","fairway","fairway","fairway","clear","trees","trees","trees","trees"],
  ["water","clear","clear","clear","fairway","trees","trees","trees","fairway","trees","trees","trees","trees","trees","trees"],
  ["clear","clear","clear","sand","fairway","fairway","fairway","fairway","fairway","fairway","clear","clear","trees","trees","clear"],
  ["clear","clear","clear","sand","sand","sand","sand","fairway","fairway","fairway","fairway","clear","clear","clear","clear"],
  ["clear","clear","clear","clear","sand","sand","sand","fairway","fairway","fairway","fairway","fairway","clear","clear","clear"],
  ["clear","clear","clear","clear","trees","fairway","fairway","fairway","fairway","fairway","fairway","clear","clear","clear","clear"],
  ["clear","clear","trees","trees","trees","fairway","fairway","fairway","fairway","fairway","clear","clear","clear","clear","clear"],
  ["clear","trees","trees","trees","trees","trees","clear","fairway","fairway","fairway","clear","clear","clear","clear","clear"],
  ["clear","clear","clear","trees","trees","clear","clear","fairway","fairway","fairway","fairway","clear","clear","clear","clear"],
  ["clear","clear","trees","trees","clear","clear","fairway","fairway","fairway","fairway","fairway","clear","clear","clear","clear"],
  ["clear","clear","trees","clear","trees","trees","fairway","fairway","start","fairway","clear","clear","clear","clear","clear"],
  ["clear","clear","clear","clear","trees","trees","trees","fairway","fairway","clear","clear","clear","clear","clear","clear"]
];

// The design currently being edited. Starts from the baked-in default.
let currentDesign = DEFAULT_DESIGN;

const styleListEl = document.getElementById("style-list");
const boardEl = document.getElementById("board");
const clearAllBtn = document.getElementById("clear-all-btn");

const courseNameInput = document.getElementById("course-name-input");
const courseNameDisplay = document.getElementById("course-name-display");

courseNameInput.addEventListener("input", () => {
  courseNameDisplay.textContent = courseNameInput.value || "Default Course";
});

function renderControls() {
  styleListEl.innerHTML = "";
  STYLES.forEach(style => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "style-btn" + (style.key === activeStyle ? " active" : "");
    btn.dataset.key = style.key;
    btn.innerHTML =
      '<span class="swatch ' + style.cls + '">' + style.glyph + '</span>' +
      '<span>' + style.label + '</span>';
    btn.addEventListener("click", () => {
      activeStyle = style.key;
      renderControls();
    });
    styleListEl.appendChild(btn);
  });
}

function styleByKey(key) {
  return STYLES.find(s => s.key === key);
}

function renderBoard() {
  boardEl.style.setProperty("--grid-cols", COLS);
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      const designRow = currentDesign[r];
      const key = (designRow && designRow[c]) ? designRow[c] : "clear";
      const style = styleByKey(key) || styleByKey("clear");
      cell.className = "cell " + style.cls;
      cell.dataset.styleKey = style.key;
      cell.textContent = style.glyph;
      cell.addEventListener("click", () => applyActiveStyle(cell));
      boardEl.appendChild(cell);
    }
  }
}

const colsInput = document.getElementById("cols-input");
const rowsInput = document.getElementById("rows-input");
const resizeBtn = document.getElementById("resize-btn");

resizeBtn.addEventListener("click", () => {
  const newCols = parseInt(colsInput.value, 10);
  const newRows = parseInt(rowsInput.value, 10);
  if (!newCols || !newRows || newCols < 1 || newRows < 1) return;
  currentDesign = getDesignFromBoard(); // keep existing edits within the overlap
  COLS = newCols;
  ROWS = newRows;
  renderBoard();
});

function applyActiveStyle(cell) {
  const current = styleByKey(cell.dataset.styleKey);
  const next = styleByKey(activeStyle);

  if (current) cell.classList.remove(current.cls);
  cell.classList.add(next.cls);
  cell.dataset.styleKey = next.key;
  cell.textContent = next.glyph;
}

clearAllBtn.addEventListener("click", () => {
  document.querySelectorAll(".cell").forEach(cell => {
    const current = styleByKey(cell.dataset.styleKey);
    if (current) cell.classList.remove(current.cls);
    cell.removeAttribute("data-style-key");
    cell.textContent = "";
  });
});

// Read the current board state into a row-major array of style keys.
function getDesignFromBoard() {
  const cells = boardEl.querySelectorAll(".cell");
  const design = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r * COLS + c];
      row.push(cell && cell.dataset.styleKey ? cell.dataset.styleKey : "clear");
    }
    design.push(row);
  }
  return design;
}

const downloadBtn = document.getElementById("download-btn");
const uploadBtn = document.getElementById("upload-btn");
const uploadInput = document.getElementById("upload-input");

let downloadCooldown = false;
downloadBtn.addEventListener("click", () => {
  if (downloadCooldown) return;
  downloadCooldown = true;
  downloadBtn.disabled = true;
  setTimeout(() => {
    downloadCooldown = false;
    downloadBtn.disabled = false;
  }, 2000);

  const data = {
    version: 1,
    name: courseNameInput.value || "Default Course",
    cols: COLS,
    rows: ROWS,
    design: getDesignFromBoard(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeName = (data.name || "golf-course").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
  link.download = (safeName || "golf-course") + ".json";
  link.click();
  URL.revokeObjectURL(url);
});

uploadBtn.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files && uploadInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      loadDesign(JSON.parse(reader.result));
    } catch (err) {
      alert("Could not load course: " + err.message);
    }
    uploadInput.value = ""; // allow re-uploading the same file
  };
  reader.readAsText(file);
});

function loadDesign(data) {
  if (!data || !Array.isArray(data.design)) {
    throw new Error("invalid course file");
  }
  const rows = data.rows || data.design.length;
  const cols = data.cols || (data.design[0] ? data.design[0].length : 0);
  if (!rows || !cols) throw new Error("invalid course dimensions");

  ROWS = rows;
  COLS = cols;
  currentDesign = data.design;
  rowsInput.value = ROWS;
  colsInput.value = COLS;

  const name = data.name || "Default Course";
  courseNameInput.value = name;
  courseNameDisplay.textContent = name;

  renderBoard();
}

renderControls();
renderBoard();
