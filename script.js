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

//ここから変わるお

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mainMenu = document.getElementById("menu");
const gameover = document.getElementById("gameover");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const resultText = document.getElementById("resultText");

const seWin = document.getElementById("seWin");
const seLose = document.getElementById("seLose");
const seHit = document.getElementById("seHit");

let question = "";
let answer = 0;
let playerInput = ""; // ← 変更
let cpuTime = 0;
let playerAnswered = false;
let gameRunning = false;
let score = 0;
let difficulty = 1200;

function randomQuestion() {
  let a, b, op;
  if (Math.random() < 0.5) {
    // 掛け算
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    op = "×";
    answer = a * b;
  } else {
    // 割り算（割り切れるもののみ）
    b = Math.floor(Math.random() * 9) + 1;
    answer = Math.floor(Math.random() * 9) + 1;
    a = b * answer;
    op = "÷";
  }
  question = `${a} ${op} ${b} = ?`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";
  ctx.fillText(`問題: ${question}`, 150, 150);

  ctx.fillStyle = "#0f0";
  ctx.fillText(`あなたの答え: ${playerInput}`, 150, 200); // ← 修正

  ctx.fillStyle = "#f44";
  ctx.fillText(`敵が狙っている...`, 150, 250);

  ctx.fillStyle = "#FFD700";
  ctx.fillText(`連勝数: ${score}`, 450, 50);
}

function startGame() {
  score = 0;
  mainMenu.style.display = "none";
  gameover.style.display = "none";
  gameRunning = true;
  nextQuestion();
}

function nextQuestion() {
  playerAnswered = false;
  playerInput = ""; // ← 修正
  randomQuestion();
  draw();
  cpuTime = Math.random() * difficulty + 500;
  setTimeout(cpuAnswer, cpuTime);
}

function cpuAnswer() {
  if (!playerAnswered && gameRunning) {
    lose();
  }
}

function playerSubmit() {
  if (!gameRunning) return;
  playerAnswered = true;
  seHit.play();

  if (Number(playerInput) === answer) { // ← 修正
    win();
  } else {
    lose();
  }
}

function win() {
  score++;
  seWin.play();
  drawEffect("勝ち！", "#0f0");
  setTimeout(nextQuestion, 1000);
}

function lose() {
  seLose.play();
  gameRunning = false;
  gameover.style.display = "block";
  resultText.textContent = `負けました！連勝数: ${score}`;
}

function drawEffect(text, color) {
  ctx.fillStyle = color;
  ctx.font = "60px Arial Black";
  ctx.fillText(text, 250, 300);
}

window.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key >= "0" && e.key <= "9") {
    playerInput += e.key;
  } else if (e.key === "Backspace") {
    playerInput = playerInput.slice(0, -1);
  } else if (e.key === "Enter") {
    playerSubmit();
  }
  draw();
});

startBtn.onclick = () => {
  difficulty = Number(document.getElementById("difficulty").value);
  startGame();
};
retryBtn.onclick = () => {
  mainMenu.style.display = "block";
  gameover.style.display = "none";
};
mainMenu.style.display = "block";
