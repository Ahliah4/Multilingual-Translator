const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');

// Live character counter
inputText.addEventListener('input', () => {
  charCount.textContent = inputText.value.length;
});

// Ctrl + Enter shortcut
inputText.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') translateText();
});

// Toast notification
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function translateText() {
  const text   = inputText.value.trim();
  const source = document.getElementById('sourceLang').value;
  const target = document.getElementById('targetLang').value;
  const output = document.getElementById('outputText');
  const status = document.getElementById('statusMessage');

  if (!text) { showToast('Nothing to translate'); return; }

  output.classList.add('loading');
  output.textContent = '';
  status.textContent = 'Translating…';

  // Optional: add &de=youremail@example.com to raise free rate limit to 10k words/day
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      // MyMemory returns HTTP 200 even on errors — must check responseStatus
      if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails || 'API error');
      }
      output.textContent = data.responseData.translatedText;
      output.classList.remove('loading');
      status.textContent = '';
    })
    .catch(err => {
      output.textContent = '';
      output.classList.remove('loading');
      status.textContent = 'Translation failed. Try again.';
      console.error('Translation error:', err);
    });
}

function swapLanguages() {
  const src = document.getElementById('sourceLang');
  const tgt = document.getElementById('targetLang');
  if (src.value === 'auto') { showToast("Can't swap Auto Detect"); return; }

  const tmp = src.value;
  src.value = tgt.value;
  tgt.value = tmp;

  // Swap text content too
  const inputVal  = inputText.value;
  const outputVal = document.getElementById('outputText').textContent;
  inputText.value = outputVal;
  document.getElementById('outputText').textContent = inputVal;
  charCount.textContent = inputText.value.length;
}

function speakInput() {
  const text = inputText.value;
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = document.getElementById('sourceLang').value;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function speakOutput() {
  const text = document.getElementById('outputText').textContent;
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = document.getElementById('targetLang').value;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function copyInput() {
  navigator.clipboard.writeText(inputText.value)
    .then(() => showToast('Input copied ✓'));
}

function copyOutput() {
  const t = document.getElementById('outputText').textContent;
  navigator.clipboard.writeText(t)
    .then(() => showToast('Translation copied ✓'));
}

window.onload = () => translateText();