'use strict';

/* ──────────────────────────────────────────────
   ESTADO
   ────────────────────────────────────────────── */
let employees = [
  { id: 1, name: 'Encargado', amount: 250000 },
  { id: 2, name: 'Obrero 1', amount: 300000 },
];

let materials = [];

let nextEmpId = 3;
let nextMatId = 2;

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

function readNum(id, fallback = 0) {
  return parseFloat($(id).value) || fallback;
}

function setText(id, val) {
  const el = $(id);
  if (el) el.textContent = val;
}

function fmtLocal(n) {
  return n.toLocaleString('es-CO');
}

function fmtUSD(n) {
  return `$${n.toFixed(2)}`;
}

/* ──────────────────────────────────────────────
   CONSTRUCCIÓN DE FILA DE ÍTEM
   ────────────────────────────────────────────── */
function buildRow({ name, amount, amountInputmode, amountStep, amountPlaceholder,
                    computedText, onNameChange, onAmountChange, onRemove }) {

  const row = document.createElement('div');
  row.className = 'item-row';

  /* — Fila superior: nombre + botón — */
  const rowTop = document.createElement('div');
  rowTop.className = 'item-row-top';

  const inputName = document.createElement('input');
  inputName.type        = 'text';
  inputName.className   = 'item-name-input';
  inputName.placeholder = 'Descripción';
  inputName.value       = name;
  inputName.inputMode   = 'text';
  inputName.autocomplete = 'off';
  inputName.addEventListener('input', () => onNameChange(inputName.value));

  const btnRemove = document.createElement('button');
  btnRemove.className   = 'btn-remove';
  btnRemove.title       = 'Eliminar';
  btnRemove.type        = 'button';
  btnRemove.textContent = '✕';
  btnRemove.addEventListener('click', onRemove);

  rowTop.appendChild(inputName);
  rowTop.appendChild(btnRemove);

  /* — Fila inferior: monto + badge calculado — */
  const rowBottom = document.createElement('div');
  rowBottom.className = 'item-row-bottom';

  const inputAmount = document.createElement('input');
  inputAmount.type        = 'number';
  inputAmount.className   = 'item-amount-input';
  inputAmount.placeholder = amountPlaceholder;
  inputAmount.value       = amount;
  inputAmount.min         = '0';
  inputAmount.step        = amountStep;
  inputAmount.inputMode   = amountInputmode;   // 'numeric' o 'decimal'
  inputAmount.autocomplete = 'off';
  inputAmount.addEventListener('input', () => {
    onAmountChange(parseFloat(inputAmount.value) || 0);
  });

  const badge = document.createElement('div');
  badge.className   = 'item-computed-badge';
  badge.textContent = computedText;

  rowBottom.appendChild(inputAmount);
  rowBottom.appendChild(badge);

  row.appendChild(rowTop);
  row.appendChild(rowBottom);

  return row;
}

/* ──────────────────────────────────────────────
   RENDER — EMPLEADOS
   ────────────────────────────────────────────── */
function renderEmployees() {
  const list = $('emp-list');
  list.innerHTML = '';
  const rate = readNum('exchangeRate', 3600);

  employees.forEach(emp => {
    const usd = emp.amount / rate;
    const row = buildRow({
      name:             emp.name,
      amount:           emp.amount,
      amountInputmode:  'numeric',
      amountStep:       '1000',
      amountPlaceholder:'0',
      computedText:     fmtUSD(usd),
      onNameChange:   (val) => { updateEmployee(emp.id, 'name',   val); },
      onAmountChange: (val) => { updateEmployee(emp.id, 'amount', val); },
      onRemove:       ()    => { removeEmployee(emp.id); },
    });
    list.appendChild(row);
  });

  calculate();
}

/* ──────────────────────────────────────────────
   RENDER — MATERIALES
   ────────────────────────────────────────────── */
function renderMaterials() {
  const list = $('mat-list');
  list.innerHTML = '';

  materials.forEach(mat => {
    const row = buildRow({
      name:             mat.name,
      amount:           mat.amount,
      amountInputmode:  'decimal',
      amountStep:       '0.5',
      amountPlaceholder:'0.00',
      computedText:     fmtUSD(mat.amount),
      onNameChange:   (val) => { updateMaterial(mat.id, 'name',   val); },
      onAmountChange: (val) => { updateMaterial(mat.id, 'amount', val); },
      onRemove:       ()    => { removeMaterial(mat.id); },
    });
    list.appendChild(row);
  });

  calculate();
}

/* ──────────────────────────────────────────────
   CRUD — EMPLEADOS
   ────────────────────────────────────────────── */
function addEmployee() {
  employees.push({ id: nextEmpId++, name: '', amount: 0 });
  renderEmployees();
  // Hacer scroll suave al nuevo ítem en móvil
  $('emp-list').lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeEmployee(id) {
  employees = employees.filter(e => e.id !== id);
  renderEmployees();
}

function updateEmployee(id, field, val) {
  const emp = employees.find(e => e.id === id);
  if (emp) emp[field] = val;
  calculate();
}

/* ──────────────────────────────────────────────
   CRUD — MATERIALES
   ────────────────────────────────────────────── */
function addMaterial() {
  materials.push({ id: nextMatId++, name: '', amount: 0 });
  renderMaterials();
  $('mat-list').lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeMaterial(id) {
  materials = materials.filter(m => m.id !== id);
  renderMaterials();
}

function updateMaterial(id, field, val) {
  const mat = materials.find(m => m.id === id);
  if (mat) mat[field] = val;
  calculate();
}

/* ──────────────────────────────────────────────
   CÁLCULO PRINCIPAL
   ────────────────────────────────────────────── */
function calculate() {
  const rate   = readNum('exchangeRate', 3600);
  const empFee = readNum('emp-fee', 0) / 100;
  const matFee = readNum('mat-fee', 0) / 100;

  /* Empleados */
  const empLocalTotal = employees.reduce((s, e) => s + e.amount, 0);
  const empUsdBase    = empLocalTotal / rate;
  const empFeeAmt     = empUsdBase * empFee;
  const empTotal      = empUsdBase + empFeeAmt;

  /* Materiales (ya en USD) */
  const matUsdBase = materials.reduce((s, m) => s + m.amount, 0);
  const matFeeAmt  = matUsdBase * matFee;
  const matTotal   = matUsdBase + matFeeAmt;

  /* Gran total */
  const grand = empTotal + matTotal;

  /* DOM — empleados */
  setText('emp-subtotal-usd',   fmtUSD(empTotal));
  setText('emp-subtotal-local', `${fmtLocal(empLocalTotal)} local`);
  setText('emp-fee-amt',        fmtUSD(empFeeAmt));

  /* DOM — materiales */
  setText('mat-subtotal-usd',   fmtUSD(matTotal));
  setText('mat-subtotal-local', `${fmtUSD(matUsdBase)} base`);
  setText('mat-fee-amt',        fmtUSD(matFeeAmt));

  /* DOM — total */
  setText('grand-total',     fmtUSD(grand));
  setText('grand-breakdown', `Empleados ${fmtUSD(empTotal)}  +  Materiales ${fmtUSD(matTotal)}`);

  const empPct = (empFee * 100).toFixed(0);
  const matPct = (matFee * 100).toFixed(0);
  setText('formula-display',
    `(${fmtLocal(empLocalTotal)} ÷ ${fmtLocal(rate)} + ${empPct}%) + (${fmtUSD(matUsdBase)} + ${matPct}%)`);

  /* Actualizar badges calculados sin re-render completo */
  refreshBadges(rate);
}

/* ──────────────────────────────────────────────
   REFRESH BADGES (evita re-render de toda la lista)
   ────────────────────────────────────────────── */
function refreshBadges(rate) {
  document.querySelectorAll('#emp-list .item-row').forEach((row, i) => {
    if (!employees[i]) return;
    const badge = row.querySelector('.item-computed-badge');
    if (badge) badge.textContent = fmtUSD(employees[i].amount / rate);
  });

  document.querySelectorAll('#mat-list .item-row').forEach((row, i) => {
    if (!materials[i]) return;
    const badge = row.querySelector('.item-computed-badge');
    if (badge) badge.textContent = fmtUSD(materials[i].amount);
  });
}

/* ──────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  $('exchangeRate').addEventListener('input', () => {
    renderEmployees();
    renderMaterials();
  });

  $('emp-fee').addEventListener('input', calculate);
  $('mat-fee').addEventListener('input', calculate);

  $('btn-add-employee').addEventListener('click', addEmployee);
  $('btn-add-material').addEventListener('click', addMaterial);

  /* Render inicial */
  renderEmployees();
  renderMaterials();
});
