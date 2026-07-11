// ====================================
// CONFIG — paste your Apps Script Web App URL here
// ====================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlD1RUdKmzedXm9CaPYyEJxKZiY_r2pwLNvl9pzns9gcaqGse5FP0FNHvfXifztDL0pQ/exec";

// ====================================
// ELEMENTS
// ====================================
const formScreen = document.getElementById('formScreen');
const successScreen = document.getElementById('successScreen');
const regForm = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const nextBtn = document.getElementById('nextBtn');
const printBtn = document.getElementById('printBtn');
const formError = document.getElementById('formError');
const loadingOverlay = document.getElementById('loadingOverlay');
const darkToggle = document.getElementById('darkToggle');

// ====================================
// LIVE CLOCK + DATE
// ====================================
function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').textContent =
    now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('liveDate').textContent =
    now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
updateClock();
setInterval(updateClock, 1000);

// ====================================
// DARK MODE
// ====================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('hhi_theme', theme);
}
const savedTheme = localStorage.getItem('hhi_theme') || 'light';
applyTheme(savedTheme);
darkToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ====================================
// FORM VALIDATION
// ====================================
function validateForm(data) {
  if (!data.battleType) return "Please select a battle type.";
  if (!data.fullName.trim()) return "Please enter full name.";
  if (!data.stageName.trim()) return "Please enter stage name.";
  if (!data.age || data.age < 5 || data.age > 99) return "Please enter a valid age.";
  if (!data.gender) return "Please select gender.";
  if (!/^[0-9]{10}$/.test(data.mobile)) return "Please enter a valid 10-digit mobile number.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Please enter a valid email or leave it blank.";
  if (!data.city.trim()) return "Please enter city.";
  if (!data.tshirtSize) return "Please select a t-shirt size.";
  return null;
}

function getFormData() {
  return {
    battleType: document.getElementById('battleType').value,
    fullName: document.getElementById('fullName').value,
    stageName: document.getElementById('stageName').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    mobile: document.getElementById('mobile').value,
    email: document.getElementById('email').value,
    city: document.getElementById('city').value,
    tshirtSize: document.getElementById('tshirtSize').value
  };
}

// ====================================
// SUBMIT
// ====================================
regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const data = getFormData();
  const errorMsg = validateForm(data);
  if (errorMsg) {
    formError.textContent = errorMsg;
    formError.hidden = false;
    return;
  }

  setSubmitting(true);

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.error) {
      formError.textContent = "Something went wrong: " + result.error;
      formError.hidden = false;
      setSubmitting(false);
      return;
    }

    showSuccess(result, data);

  } catch (err) {
    formError.textContent = "Could not connect. Please check your internet and try again.";
    formError.hidden = false;
  }

  setSubmitting(false);
});

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.querySelector('.btn-label').hidden = isSubmitting;
  submitBtn.querySelector('.btn-spinner').hidden = !isSubmitting;
  loadingOverlay.hidden = !isSubmitting;
}

// ====================================
// SUCCESS SCREEN
// ====================================
function showSuccess(result, data) {
  document.getElementById('outBattleType').textContent = result.battleType;
  document.getElementById('outName').textContent = result.fullName;
  document.getElementById('outToken').textContent = result.token;

  // Fill print receipt too
  const now = new Date();
  document.getElementById('p_token').textContent = result.token;
  document.getElementById('p_name').textContent = result.fullName;
  document.getElementById('p_stage').textContent = data.stageName;
  document.getElementById('p_battle').textContent = result.battleType;
  document.getElementById('p_date').textContent = now.toLocaleDateString('en-IN');
  document.getElementById('p_time').textContent = now.toLocaleTimeString('en-IN');

  formScreen.hidden = true;
  successScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====================================
// CLEAR / NEXT / PRINT
// ====================================
clearBtn.addEventListener('click', () => {
  regForm.reset();
  formError.hidden = true;
});

nextBtn.addEventListener('click', () => {
  regForm.reset();
  formError.hidden = true;
  successScreen.hidden = true;
  formScreen.hidden = false;
});

printBtn.addEventListener('click', () => {
  window.print();
});
