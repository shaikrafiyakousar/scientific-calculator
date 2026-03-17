let expression = '';
let angleMode = 'deg';
let sciVisible = false;
let lastWasResult = false;

const exprEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

// Convert degrees to radians if needed
function toRad(x) {
  return angleMode === 'deg' ? x * Math.PI / 180 : x;
}

// Switch between DEG and RAD mode
function setAngleMode(mode) {
  angleMode = mode;
  document.getElementById('btnDeg').classList.toggle('active', mode === 'deg');
  document.getElementById('btnRad').classList.toggle('active', mode === 'rad');
  updateDisplay(); // Live recalculate on mode switch
}

// Show/hide scientific buttons
function toggleSci() {
  sciVisible = !sciVisible;
  document.querySelectorAll('.sci-row').forEach(el => el.classList.toggle('show', sciVisible));
  document.getElementById('sciToggle').style.color = sciVisible ? 'var(--accent)' : '';
}

// Update the display
function updateDisplay() {
  exprEl.textContent = expression;
  try {
    const val = evaluate(expression);
    if (!isNaN(val) && isFinite(val)) {
      resultEl.textContent = parseFloat(val.toFixed(10)).toString();
      resultEl.classList.remove('error');
    }
  } catch(e) {}
}

// Add a number or operator
function inputStr(str) {
  if (lastWasResult && /[0-9(π]/.test(str)) {
    expression = '';
  }
  lastWasResult = false;
  expression += str;
  updateDisplay();
}

// Add a function like sin( cos( etc
function inputFn(fn) {
  if (lastWasResult) expression = '';
  lastWasResult = false;
  expression += fn;
  updateDisplay();
}

// Delete last character
function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

// Clear everything
function clearAll() {
  expression = '';
  resultEl.textContent = '0';
  resultEl.classList.remove('error');
  exprEl.textContent = '';
  lastWasResult = false;
}

// Evaluate the math expression
function evaluate(expr) {
  // Auto-close unclosed parentheses
  let openCount = (expr.match(/\(/g) || []).length;
  let closeCount = (expr.match(/\)/g) || []).length;
  expr += ')'.repeat(openCount - closeCount);

  let e = expr.replace(/π/g, '(' + Math.PI + ')');
  e = e.replace(/sin\(/g, '_sin(');
  e = e.replace(/cos\(/g, '_cos(');
  e = e.replace(/tan\(/g, '_tan(');
  e = e.replace(/log\(/g, '_log(');
  e = e.replace(/ln\(/g, '_ln(');
  e = e.replace(/sqrt\(/g, '_sqrt(');
  e = e.replace(/\^/g, '**');

  const _sin  = x => Math.sin(toRad(x));
  const _cos  = x => Math.cos(toRad(x));
  const _tan  = x => Math.tan(toRad(x));
  const _log  = x => Math.log10(x);
  const _ln   = x => Math.log(x);
  const _sqrt = x => Math.sqrt(x);

  return Function('_sin','_cos','_tan','_log','_ln','_sqrt',
    '"use strict"; return (' + e + ')')(_sin,_cos,_tan,_log,_ln,_sqrt);
}

// Calculate final result
function calculate() {
  if (!expression) return;
  try {
    const val = evaluate(expression);
    if (isNaN(val) || !isFinite(val)) throw new Error('Invalid');
    exprEl.textContent = expression + ' =';
    const pretty = parseFloat(val.toFixed(10)).toString();
    resultEl.textContent = pretty;
    resultEl.classList.remove('error');
    expression = pretty;
    lastWasResult = true;
  } catch(e) {
    resultEl.textContent = 'Error';
    resultEl.classList.add('error');
  }
}

// Keyboard support
document.addEventListener('keydown', e => {
  const k = e.key;
  if (k >= '0' && k <= '9') inputStr(k);
  else if (['+', '-', '*', '/'].includes(k)) inputStr(k);
  else if (k === '.') inputStr('.');
  else if (k === '(' || k === ')') inputStr(k);
  else if (k === 'Enter' || k === '=') calculate();
  else if (k === 'Backspace') deleteLast();
  else if (k === 'Escape') clearAll();
  else if (k === '^') inputStr('^');
});