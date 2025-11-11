const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#hd ul");

toggle.addEventListener("click", () => {
  menu.classList.toggle("show");
  toggle.classList.toggle("active");
});
const menuItems = document.querySelectorAll("#hd ul li");
const contents = document.querySelectorAll(".content");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // すべての main を非表示
    contents.forEach(c => c.classList.remove("active"));
     // 対象IDを取得して表示
    const targetId = item.dataset.target;
    document.getElementById(targetId).classList.add("active");
  });
});


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGPCCNoeWuPAhGpKLdabyAU-5hTdHemw8",
  authDomain: "my-chat-app-37b9e.firebaseapp.com",
  databaseURL: "https://my-chat-app-37b9e-default-rtdb.firebaseio.com",
  projectId: "my-chat-app-37b9e",
  storageBucket: "my-chat-app-37b9e.appspot.com",
  messagingSenderId: "111829020213",
  appId: "1:111829020213:web:44f631c678dcb8525c8b7c",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const messagesRef = ref(db, "messages");
const chat = document.getElementById("chat");
const textInput = document.getElementById("text");
const sendBtn = document.getElementById("send");
const nameInput = document.getElementById("name");
const stampBtns = document.querySelectorAll(".stamp-btn");

// リアルタイム受信
onValue(messagesRef, (snapshot) => {
  chat.innerHTML = "";
  const data = snapshot.val();
  if(data){
    Object.values(data).forEach(msg => {
      const div = document.createElement("div");
      div.className = "message";
      if(msg.stamp){
        div.innerHTML = `<strong>${msg.user || '名無し'}:</strong> <br>
                         <img src="${msg.stamp}" style="width:50px;">`;
      } else {
        div.textContent = `${msg.user || '名無し'}: ${msg.text}`;
      }
      chat.appendChild(div);
    });
    chat.scrollTop = chat.scrollHeight;
  }
});

// テキスト送信
sendBtn.addEventListener("click", async () => {
  const user = nameInput.value.trim() || '名無し';
  const text = textInput.value.trim();
  if(text){
    await push(messagesRef, { text, user, time: Date.now() });
    textInput.value = "";
  }
});

// スタンプ送信
stampBtns.forEach(btn => {
  btn.addEventListener("click", async () => {
    const user = nameInput.value.trim() || '名無し';
    const url = btn.dataset.url;
    await push(messagesRef, { stamp: url, user, time: Date.now() });
  });
});

// ホーム画面ボタンのスムーズスクロール
document.getElementById("getStartedBtn")?.addEventListener("click", () => {
  document.querySelector("#chat")?.scrollIntoView({ behavior: "smooth" });
});


const chatBox = document.getElementById("chat-box");
const input = document.getElementById("chat-input");
const sendBtn2 = document.getElementById("chat-send");
// 🔑 あなたのOpenAI APIキーをここに
const OPENAI_API_KEY = "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";
// HTMLをエスケープして「タグを実行させない」
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;
  addMessage("user", userMessage);
  input.value = "";
  addMessage("assistant", "ChatGPTが考え中... 🤔");
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "あなたは親切なAIアシスタントです。HTMLなどのコードはエスケープして安全に表示してください。" },
          { role: "user", content: userMessage }
        ]
      })
    });
    const data = await res.json();
    const reply = data.choices[0].message.content.trim();
    chatBox.lastChild.remove();
    addMessage("assistant", reply);
  } catch (err) {
    chatBox.lastChild.remove();
    addMessage("assistant", "⚠️ エラーが発生しました: " + err.message);
  }
}
// ✅ HTMLをエスケープして安全に表示
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + role;
  div.innerHTML = (role === "user" ? "👤 <b>あなた</b>:<br>" : "🤖 <b>ChatGPT</b>:<br>") + escapeHTML(text).replace(/\n/g, "<br>");
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
// Enterで送信 / Shift+Enterで改行
input.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn2.addEventListener("click", sendMessage);

//学習

let questionSets = [];
let currentSet = null;
let current = 0;
let score = 0;

// DOM
const selectScreen = document.getElementById("select-screen");
const quizElem = document.getElementById("quiz");
const resultElem = document.getElementById("result");
const scoreListElem = document.getElementById("score-list");
const selectDiv = document.getElementById("selectSet");
const qElem = document.getElementById("question");
const oElem = document.getElementById("options");
const pBar = document.getElementById("progress-bar");
const scoreElem = document.getElementById("score");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const titleElem = document.getElementById("set-title");
const showScoresBtn = document.getElementById("show-scores");
const scoreItems = document.getElementById("score-items");
const backBtn = document.getElementById("back-btn");
const resetBtn = document.getElementById("reset-btn");

// -------------------- JSON読み込み --------------------
async function loadSets() {
  try {
    const res = await fetch("questions.json"); // JSONファイル名
    if (!res.ok) throw new Error("JSON読み込み失敗");
    questionSets = await res.json();

    // options をシャッフルして元の配列に上書き
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array; // シャッフル済み配列を返す
    }

    questionSets.forEach(subject => {
      subject.questions.forEach(q => {
        q.options = shuffleArray(q.options); // 上書き
      });
    });

    renderSetButtons();
  } catch (e) {
    selectDiv.textContent = "問題データを読み込めませんでした。";
    console.error(e);
  }
}


// -------------------- セット選択 --------------------
function renderSetButtons() {
  selectDiv.innerHTML = "";
  questionSets.forEach((set, index) => {
    const btn = document.createElement("button");
    btn.textContent = set.title;
    btn.className = "option";
    btn.addEventListener("click", () => startSet(index));
    selectDiv.appendChild(btn);
  });
}

// -------------------- クイズ開始 --------------------
function startSet(index) {
  currentSet = questionSets[index];
  current = 0;
  score = 0;
  titleElem.textContent = currentSet.title;
  selectScreen.style.display = "none";
  scoreListElem.style.display = "none";
  quizElem.style.display = "block";
  loadQuestion();
}

// -------------------- 問題読み込み --------------------
function loadQuestion() {
  const q = currentSet.questions[current];
  const qNumberElem = document.getElementById("question-number");
  qElem.textContent = q.question;
  oElem.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option";
    btn.onclick = () => selectAnswer(btn, opt, q.answer);
    oElem.appendChild(btn);
  });
  pBar.style.width = `${(current / currentSet.questions.length) * 100}%`;
  scoreElem.textContent = `スコア: ${score}`;
  qNumberElem.textContent = `${currentSet.questions.length}問中 ${current + 1}問目`;
}


// -------------------- 回答判定 --------------------
function selectAnswer(btn, choice, correctAnswers) {
  const buttons = oElem.querySelectorAll(".option");
  buttons.forEach(b => b.disabled = true);

  if (correctAnswers.includes(choice)) {
    btn.classList.add("correct");
    score += 10;
  } else {
    btn.classList.add("wrong");
    buttons.forEach(b => {
      if (correctAnswers.includes(b.textContent)) b.classList.add("correct");
    });
  }

  scoreElem.textContent = `スコア: ${score}`;
  setTimeout(nextQuestion, 900);
}

// -------------------- 次の問題 --------------------
function nextQuestion() {
  current++;
  if (current < currentSet.questions.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
}

// -------------------- 結果表示 --------------------
function finishQuiz() {
  quizElem.style.display = "none";
  resultElem.style.display = "block";
  pBar.style.width = "100%";

  const maxScore = currentSet.questions.length * 10;
  finalScore.innerHTML = `最終スコア: ${score} / ${maxScore}`;

  saveHighScore(currentSet.title, score);
  const best = getHighScore(currentSet.title);
  const bestMsg = (score >= best)
    ? "🎉 最高スコアを更新しました！"
    : `これまでの最高スコア: ${best}`;
  finalScore.innerHTML += `<br>${bestMsg}`;
}

// -------------------- スコア管理 --------------------
function saveHighScore(title, newScore) {
  const key = `score_${title}`;
  const oldScore = parseInt(localStorage.getItem(key) || "0");
  if (newScore > oldScore) localStorage.setItem(key, newScore);
}
function getHighScore(title) {
  const key = `score_${title}`;
  return parseInt(localStorage.getItem(key) || "0");
}

// -------------------- ボタン --------------------
restartBtn.onclick = () => {
  resultElem.style.display = "none";
  selectScreen.style.display = "block";
};
showScoresBtn.onclick = () => {
  scoreItems.innerHTML = "";
  questionSets.forEach(set => {
    const li = document.createElement("li");
    li.textContent = `${set.title}：${getHighScore(set.title)}点`;
    scoreItems.appendChild(li);
  });
  selectScreen.style.display = "none";
  scoreListElem.style.display = "block";
};
backBtn.onclick = () => {
  scoreListElem.style.display = "none";
  selectScreen.style.display = "block";
};
resetBtn.onclick = () => {
  if(confirm("本当に全てのスコアを削除しますか？")) {
    localStorage.clear();
    alert("スコアデータをリセットしました！");
    scoreItems.innerHTML = "<li>データがありません。</li>";
  }
};

// -------------------- 初期化 --------------------
loadSets();



  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
  import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "あなたのAPIキー",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-app",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:xxxxxxx"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // ログインボタン
  document.getElementById("loginBtn").onclick = () => {
    signInWithPopup(auth, provider)
      .then(result => {
        const user = result.user;
        document.getElementById("status").textContent = `ログイン中: ${user.displayName}`;
      })
      .catch(error => console.error(error));
  };

  // ログアウトボタン
  document.getElementById("logoutBtn").onclick = () => {
    signOut(auth);
    document.getElementById("status").textContent = "ログアウトしました";
  };
