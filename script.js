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

function nameToColor(name) {
    // 文字列をハッシュ化
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // ハッシュ値から色を生成（RGB）
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}


loadSets();

const firebaseConfig2 = {
  apiKey: "AIzaSyClGlBau_2lk1cty7ZbomKH5F39URXOlw4",
  authDomain: "roguin-7ee69.firebaseapp.com",
  projectId: "roguin-7ee69",
  storageBucket: "roguin-7ee69.firebasestorage.app",
  messagingSenderId: "255974650605",
  appId: "1:255974650605:web:c46301b9a0da7f958a52e4",
  measurementId: "G-PXRMCCHVLC"
};
firebase.initializeApp(firebaseConfig2);

const auth = firebase.auth();


// -------------------- Google ログイン（POPUP） --------------------
const googleProvider = new firebase.auth.GoogleAuthProvider();

document.getElementById("googleLogin").onclick = () => {
  auth.signInWithPopup(googleProvider)
    .then(result => {
      console.log("Googleログイン成功:", result.user);
    })
    .catch(error => {
      console.error("Googleログインエラー:", error);
    });
};


// -------------------- ログイン状態の監視 --------------------
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("ログイン中:", user.email);

    document.getElementById("main2_c").style.display = "block";
    document.getElementById("main2_t").style.display = "none";
    document.getElementById("you_name").style.display = "flex";
    let initial = (user.email?.trim()?.charAt(0) || "").toUpperCase();
    document.getElementById("you_name").textContent = initial;
    document.getElementById("you_name").style.backgroundColor = nameToColor(user.email);
  } else {
    console.log("未ログイン");

    document.getElementById("main2_c").style.display = "none";
    document.getElementById("main2_t").style.display = "block";
    document.getElementById("you_name").style.display = "none";
  }
});


// -------------------- ログアウト --------------------
document.getElementById("logoutBtn").onclick = () => {
  auth.signOut()
    .then(() => {
      console.log("ログアウト完了");
      alert("ログアウトしました");
      location.reload();
    })
    .catch(error => {
      console.error("ログアウトエラー:", error);
    });
};

//ここから動画
const videoList = document.getElementById("videoList");
const videoContainer = document.getElementById("videoContainer");
const videoPlayer = document.getElementById("videoPlayer");
const videoTitle = document.getElementById("videoTitle");
const backBtn2 = document.getElementById("backBtn");

// 配列には URL とタイトルを設定
const videos = [
  {
    url: "https://www.youtube.com/watch?v=fnNwgcj3fWU",
    title: "三つの新曲"
  },
  {
    url: "https://www.youtube.com/watch?v=gnceX9APNIg&list=RDgnceX9APNIg&start_radio=1",
    title: "カビー"
  }
];


// YouTube ID を抽出する関数
function getYouTubeId(url) {
  const regExp = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^\?&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// 一覧生成
videos.forEach((v) => {
  const item = document.createElement("div");
  item.classList.add("videoItem");

  // サムネ自動生成
  const videoId = getYouTubeId(v.url);
  if (!videoId) return; // 無効URLはスキップ
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  // サムネ
  const thumb = document.createElement("img");
  thumb.src = thumbUrl;
  thumb.classList.add("thumbnail");
  thumb.addEventListener("click", () => playVideo(v.url, v.title));

  // タイトルリンク
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = v.title;
  link.classList.add("videoTitle");
  link.addEventListener("click", (e) => {
    e.preventDefault();
    playVideo(v.url, v.title);
  });

  item.appendChild(thumb);
  item.appendChild(link);
  videoList.appendChild(item);
});

// 動画再生
function playVideo(url, title) {
  const videoId = getYouTubeId(url);
  if (!videoId) return;

  // 埋め込み用URL
  const embedUrl = url.includes("shorts")
    ? `https://www.youtube.com/embed/${videoId}`
    : `https://www.youtube.com/embed/${videoId}`;

  // iframe の src を変更するだけ
  videoPlayer.src = embedUrl;
  videoTitle.textContent = title;

  videoList.style.display = "none";
  videoContainer.style.display = "block";
}

// 戻るボタン
backBtn2.addEventListener("click", () => {
  // src を空にして停止
  videoPlayer.src = "";
  videoContainer.style.display = "none";
  videoList.style.display = "flex";
});
