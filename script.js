window.addEventListener("DOMContentLoaded", () => {
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
      contents.forEach(c => c.classList.remove("active"));
      const targetId = item.dataset.target;
      document.getElementById(targetId).classList.add("active");
    });
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



window.clearMessages = async () => {
  if (!confirm("🔥 本当にDBから全メッセージ消す？戻せないよ")) return;

  const url = "https://my-chat-app-37b9e-default-rtdb.firebaseio.com/messages.json";

  await fetch(url, { method: "DELETE" });
  console.log("✨ 完全削除完了");
  chat.innerHTML = "";
};



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
      window.location.reload();
    })
    .catch(error => {
      console.error("Googleログインエラー:", error);
      window.location.reload();
    });
};


// -------------------- ログイン状態の監視 --------------------
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("ログイン中:", user.email);

    document.getElementById("main2_c").style.display = "block";
    document.getElementById("main2_t").style.display = "none";
    document.getElementById("googleLogin").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
    document.getElementById("you_name").style.display = "flex";
    let initial = (user.email?.trim()?.charAt(0) || "").toUpperCase();
    document.getElementById("you_name").textContent = initial;
    document.getElementById("you_name").style.backgroundColor = nameToColor(user.email);
  } else {
    console.log("未ログイン");

    document.getElementById("main2_c").style.display = "none";
    document.getElementById("main2_t").style.display = "block";
    document.getElementById("you_name").style.display = "none";
    document.getElementById("googleLogin").style.display = "block";
    document.getElementById("logoutBtn").style.display = "none";
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
    url: "https://www.youtube.com/shorts/cwLPzpgxJ9M",
    title: "うまさ比べ"
  }
];


function getYouTubeId(url) {
  const regExp = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^\?&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

videos.forEach((v) => {
  const item = document.createElement("div");
  item.classList.add("videoItem");

  const videoId = getYouTubeId(v.url);
  if (!videoId) return;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const thumb = document.createElement("img");
  thumb.src = thumbUrl;
  thumb.classList.add("thumbnail");
  thumb.addEventListener("click", () => playVideo(v.url, v.title));

  const link = document.createElement("a");
  link.href = "#";
  link.textContent = v.title;
  link.classList.add("videoTitle");
  link.addEventListener("click", (e) => { e.preventDefault(); playVideo(v.url, v.title); });

  item.appendChild(thumb);
  item.appendChild(link);
  videoList.appendChild(item);
});

function playVideo(url, title) {
  const videoId = getYouTubeId(url);
  if (!videoId) return;
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  videoPlayer.src = embedUrl;
  videoTitle.textContent = title;
  videoList.style.display = "none";
  videoContainer.style.display = "block";
}

backBtn2.addEventListener("click", () => {
  videoPlayer.src = ""; // 再生停止
  videoContainer.style.display = "none";
  videoList.style.display = "flex";
});


document.addEventListener('DOMContentLoaded', (event) => {
    const main3Container = document.querySelector('.generator-container') || document.body; 

    /* -------------------------
          タブ切り替え処理
    -------------------------- */
    const tabs = main3Container.querySelectorAll(".tab");
    const contents = main3Container.querySelectorAll(".tabContentList .tabContent");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        if (!tab.classList.contains("active")) {
          const tabId = tab.getAttribute("data-tab-id");
          tabs.forEach(t => t.classList.remove("active"));
          contents.forEach(c => c.classList.remove("active"));
          tab.classList.add("active");
          main3Container.querySelector(`#content_${tabId}`).classList.add("active");
        }
      });
    });

    /* -------------------------
          SVG生成関数
    -------------------------- */

    function makeRibbonSVG(opts) {
      const { stroke, fill, strokeWidth, variant, ratio, ratio2 } = opts;
      const baseW = 880;
      const baseH = 140;
      let w = baseW;
      if (ratio > 0) w = baseW + (ratio * 6);
      if (ratio < 0) w = baseW - (Math.abs(ratio) * 6);
      w = Math.max(400, w);

      const handFilter = (variant === 'hand') ? `
        <filter id="rough">
          <feTurbulence baseFrequency="0.8" numOctaves="2" seed="3" stitchTiles="stitch" />
          <feDisplacementMap in="SourceGraphic" scale="4" />
        </filter>` : '';

      const shadow = (variant === 'shadow') ? `
        <filter id="drops">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.12"/>
        </filter>` : '';

      const boxW = w * 0.68;
      const boxX = (w - boxW) / 2;
      const rx = (variant === 'cute') ? 26 : 18;
      const h = (variant === 'cute') ? 110 : 70;
      const centerY = (baseH - h) / 2;

      return `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="${baseH}" 
          viewBox="0 0 ${w} ${baseH}">
      <defs>
        ${handFilter}
        ${shadow}
        <style>
          .outline { fill:${fill}; stroke:${stroke}; stroke-width:${strokeWidth}; stroke-linecap:round; stroke-linejoin:round; }
          .ribbon-tail { fill:${fill}; stroke:${stroke}; stroke-width:${strokeWidth}; stroke-linecap:round; stroke-linejoin:round; }
        </style>
      </defs>

      <g ${variant === 'shadow' ? 'filter="url(#drops)"' : ''}>
        <rect x="${boxX}" y="${centerY}" width="${boxW}" height="${h}" rx="${rx}"
          class="outline" ${variant==='hand'?'filter="url(#rough)"':''} />

        <path d="M${boxX} ${centerY} L${boxX - 50} ${centerY + h/2} L${boxX} ${centerY + h} Z" 
          class="ribbon-tail" ${variant==='hand'?'filter="url(#rough)"':''}/>

        <path d="M${boxX + boxW} ${centerY} L${boxX + boxW + 50} ${centerY + h/2} L${boxX + boxW} ${centerY + h} Z" 
          class="ribbon-tail" ${variant==='hand'?'filter="url(#rough)"':''}/>
      </g>
    </svg>`;
    }

    function makeBoxSVG(opts){
      const { stroke, fill, strokeWidth, variant, ratio, ratio2 } = opts;
      const base = 420;
      let w = base;
      let h = base;

      if (ratio > 0) {
        w = base - (ratio * 6);
      } else if (ratio < 0) {
        h = base - (Math.abs(ratio) * 6);
      }

      var rx = ratio2 * 0.9 ;
      rx = (variant === 'cute') ? rx+15 : rx;
      w = Math.max(135, w);
      h = Math.max(135, h);


      const rough = (variant === 'hand') ? `
        <filter id="roughBox">
          <feTurbulence baseFrequency="0.7" numOctaves="1" seed="7"/>
          <feDisplacementMap in="SourceGraphic" scale="5"/>
        </filter>` : '';

      const shadow = (variant === 'shadow') ? `
        <filter id="dropsBox">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.2"/>
        </filter>` : '';

      return `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" 
          viewBox="0 0 ${base} ${base}">
      <defs>
        ${rough}
        ${shadow}
      </defs>

      <rect x="${(base-w/1.3)/2}" y="${(base-h/1.3)/2}" width="${w/1.3}" height="${h/1.3}" rx="${rx}"
        fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"
        ${variant === 'hand' ? 'filter="url(#roughBox)"' : ''}
        ${variant === 'shadow' ? 'filter="url(#dropsBox)"' : ''}/>
    </svg>`;
    }

    function makeSVG(opts){
      const { stroke, fill, strokeWidth, variant, ratio, ratio2 } = opts;
      const base = 420;
      const rough = (variant === 'hand') ? `
        <filter id="roughBox">
          <feTurbulence baseFrequency="0.7" numOctaves="1" seed="7"/>
          <feDisplacementMap in="SourceGraphic" scale="5"/>
        </filter>` : '';

      const shadow = (variant === 'shadow') ? `
        <filter id="dropsBox">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.2"/>
        </filter>` : '';

      return `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" 
          viewBox="0 0 ${base} ${base}">
      <defs>
        ${rough}
        ${shadow}
      </defs>
      ${document.getElementById('svg_code').value}
    </svg>`;
    }
  
    function makeBox2SVG(opts){
      const { stroke, fill, strokeWidth, variant, ratio, ratio2 } = opts;
      const baseW = 800;
      const baseH = 220;
      const rectH = 160;
      let w = baseW;
      if (ratio > 0) w = baseW + (ratio * 6);
      if (ratio < 0) w = baseW - (Math.abs(ratio) * 6);
      w = Math.max(0, w);

      const h = baseH;
      var rx = rectH / 2 - 100 + ratio2 /2 ;

      const handFilter = (variant === 'hand') ? `
        <filter id="rough2">
          <feTurbulence baseFrequency="0.85" numOctaves="2" seed="6"/>
          <feDisplacementMap in="SourceGraphic" scale="5"/>
        </filter>` : '';

      const shadow = (variant === 'shadow') ? `
        <filter id="drops2">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.18"/>
        </filter>` : '';

      return `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"
          viewBox="0 0 ${w} ${h}">
      <defs>
        ${handFilter}
        ${shadow}
      </defs>

      <rect x="${(w - (w*0.82)) / 2}" 
            y="30" 
            width="${w * 0.82}" 
            height="160" 
            rx="${rx}"
            fill="${fill}" 
            stroke="${stroke}" 
            stroke-width="${strokeWidth}"
            ${variant === 'hand' ? 'filter="url(#rough2)"' : ''}
            ${variant === 'shadow' ? 'filter="url(#drops2)"' : ''}/>
    </svg>`;
    }

    /* -------------------------
          DOM / 設定反映
    -------------------------- */

    const ribbonWrap   = main3Container.querySelector('#ribbonWrap');
    const boxWrap      = main3Container.querySelector('#boxWrap');
    const svgWrap      = main3Container.querySelector('#svgWrap');
    const box2Wrap     = main3Container.querySelector('#box2Wrap');
    const preset       = main3Container.querySelector('#preset');
    const strokeColor  = main3Container.querySelector('#strokeColor');
    const fillColor    = main3Container.querySelector('#fillColor');
    const strokeWidth  = main3Container.querySelector('#strokeWidth');
    const exportW      = main3Container.querySelector('#exportW');
    const ratioSlider  = main3Container.querySelector('#ratio');
    const ratioText    = main3Container.querySelector('#ratioValue');
    const ratioSlider2  = main3Container.querySelector('#ratio2');
    const ratioText2    = main3Container.querySelector('#ratioValue2');
    const applyBtn     = main3Container.querySelector('#apply');

    function readOpts() {
      return {
        stroke: strokeColor.value,
        fill: fillColor.value,
        strokeWidth: Number(strokeWidth.value),
        variant: preset.value,
        ratio: Number(ratioSlider.value),
        ratio2: Number(ratioSlider2.value)
      };
    }

    function renderAll(){
      const opts = readOpts();
      ribbonWrap.innerHTML = makeRibbonSVG(opts);
      boxWrap.innerHTML = makeBoxSVG(opts);
      box2Wrap.innerHTML = makeBox2SVG(opts);
      svgWrap.innerHTML = makeBox2SVG(opts);
    }


    /* -------------------------
      PNG保存処理（背景透明）
    -------------------------- */

    function svgToImage(svgString, width, callback){
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = function(){
        const canvas = document.createElement('canvas');
        const aspect = img.width / img.height;

        canvas.width = Number(width);
        canvas.height = Math.round(Number(width) / aspect);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(url);
        callback(canvas);
      };

      img.src = url;
    }

    function downloadCanvas(canvas, filename){
      canvas.toBlob(blob => {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);

        a.href = url;
        a.download = filename;
        a.click();

        setTimeout(()=>URL.revokeObjectURL(url), 1000);
      }, "image/png");
    }


    /* -------------------------
          EVENT
    -------------------------- */

    main3Container.querySelector('#downloadRibbon').addEventListener('click', ()=>{
      svgToImage(makeRibbonSVG(readOpts()), exportW.value, canvas => downloadCanvas(canvas, "ribbon.png"));
    });

    main3Container.querySelector('#downloadBox').addEventListener('click', ()=>{
      svgToImage(makeBoxSVG(readOpts()), exportW.value, canvas => downloadCanvas(canvas, "box.png"));
    });

    main3Container.querySelector('#downloadsvg').addEventListener('click', ()=>{
      svgToImage(makeSVG(readOpts()), exportW.value, canvas => downloadCanvas(canvas, "box.png"));
    });

    main3Container.querySelector('#downloadBox2').addEventListener('click', ()=>{
      svgToImage(makeBox2SVG(readOpts()), exportW.value, 
        canvas => downloadCanvas(canvas, "waku.png"));
    });

    // 即時反映
    [strokeColor, fillColor, strokeWidth, preset, ratioSlider, ratioSlider2].forEach(el =>
      el.addEventListener("input", renderAll)
    );

    // ratio表示
    ratioSlider.addEventListener("input", () => {
      ratioText.textContent = `引数：${ratioSlider.value}`;
    });

    // ratio2表示
    ratioSlider2.addEventListener("input", () => {
      ratioText2.textContent = `引数：${ratioSlider2.value}`;
    });

    applyBtn.addEventListener("click", renderAll);

    /* 初期描画 */
    renderAll();
});
