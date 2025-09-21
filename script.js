/**
 * 語詞測驗工具的核心邏輯。
 */

const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const quizArea = document.getElementById('quizArea');

let wordData = [];
let currentSentences = [];

// 初始化：嘗試從 localStorage 讀取詞庫，否則從 words.json 取得
async function loadWordData() {
  // 優先使用老師上傳的 localStorage 詞庫
  const stored = localStorage.getItem('wordData');
  if (stored) {
    try {
      wordData = JSON.parse(stored);
      if (Array.isArray(wordData) && wordData.length > 0) {
        return;
      }
    } catch (err) {
      console.error('Parsing local word data failed', err);
    }
  }
  // 從外部檔案取得
  try {
    const response = await fetch('words.json');
    if (!response.ok) throw new Error('載入詞庫失敗');
    const data = await response.json();
    if (Array.isArray(data)) {
      wordData = data;
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 隨機打亂陣列
 * @param {Array} array 
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 使用 Web Speech API 朗讀句子
 * @param {string} sentence 完整句子
 */
function speakSentence(sentence) {
  if (!('speechSynthesis' in window)) {
    console.warn('這個瀏覽器不支援語音合成');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(sentence);
  // 嘗試選擇中文語音
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find((v) => v.lang.startsWith('zh'));
  if (zhVoice) {
    utterance.voice = zhVoice;
  }
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

/**
 * 開始測驗
 */
async function startTest() {
  startButton.disabled = true;
  resetButton.disabled = false;
  quizArea.innerHTML = '';
  // 讀取詞庫
  await loadWordData();
  if (!wordData || wordData.length === 0) {
    quizArea.textContent = '目前沒有詞庫資料，請先於教師頁面上傳或編輯資料。';
    return;
  }
  // 詢問使用者要測試幾個詞語
  let countStr = prompt(`請輸入要測驗的詞語數量 (最多 ${wordData.length} 個)：`);
  if (!countStr) {
    startButton.disabled = false;
    resetButton.disabled = true;
    return;
  }
  let count = parseInt(countStr.trim(), 10);
  if (isNaN(count) || count <= 0) {
    alert('請輸入正確的數字');
    startButton.disabled = false;
    resetButton.disabled = true;
    return;
  }
  if (count > wordData.length) count = wordData.length;
  // 隨機取樣
  const shuffled = shuffle([...wordData]);
  currentSentences = shuffled.slice(0, count);
  // 生成題目並朗讀
  currentSentences.forEach((item, index) => {
    const word = item.word;
    const sentence = item.sentence;
    // 建立空格句子
    const regex = new RegExp(word, 'g');
    const blanked = sentence.replace(regex, '_____');
    const p = document.createElement('p');
    p.className = 'sentence';
    // 將空白部分替換成 input 元素
    const parts = blanked.split('_____');
    parts.forEach((part, i) => {
      p.append(document.createTextNode(part));
      if (i < parts.length - 1) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'blank';
        input.dataset.answer = word;
        p.append(input);
      }
    });
    quizArea.append(p);
    // 朗讀句子，包含完整詞語
    setTimeout(() => speakSentence(sentence), index * 15000);
  });
  // 增加提交按鈕
  const submitBtn = document.createElement('button');
  submitBtn.textContent = '提交答案';
  submitBtn.id = 'submitBtn';
  submitBtn.addEventListener('click', evaluateResults);
  quizArea.append(submitBtn);
}

/**
 * 評分功能
 */
function evaluateResults() {
  const blanks = document.querySelectorAll('input.blank');
  let correctCount = 0;
  blanks.forEach((input) => {
    const userAnswer = input.value.trim();
    const answer = input.dataset.answer;
    if (userAnswer === answer) {
      input.style.borderColor = '#4caf50';
      correctCount++;
    } else {
      input.style.borderColor = '#f44336';
    }
    input.disabled = true;
  });
  const result = document.createElement('div');
  result.className = 'result';
  result.textContent = `答對 ${correctCount} / ${blanks.length} 題。`;
  quizArea.append(result);
  // 停止朗讀，避免重複
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * 重新開始
 */
function resetTest() {
  // 取消目前朗讀
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  quizArea.innerHTML = '';
  startButton.disabled = false;
  resetButton.disabled = true;
}

startButton.addEventListener('click', startTest);
resetButton.addEventListener('click', resetTest);
