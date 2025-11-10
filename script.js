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
const sendBtn = document.getElementById("chat-send");
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
sendBtn.addEventListener("click", sendMessage);
