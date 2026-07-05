const rooms = {
  living: {
    name: "거실",
    art: "assets/room-living.svg",
    description:
      "거실은 낮은 테이블과 오래된 조명이 지키고 있다. 방금 닫힌 브라우저 탭처럼, 공기가 아직 미세하게 따뜻하다.",
    ambient: [
      "창틀 근처에서 작은 빛 조각이 천천히 밀린다.",
      "소파의 천이 아주 낮은 소리로 제자리로 돌아온다.",
      "테이블 위 먼지가 화면 픽셀처럼 떠 있다."
    ],
    actions: {
      "소파에 앉아": "소파가 몸의 무게를 기억하듯 천천히 내려앉는다. ST가 조금 회복됐다.",
      "창밖 봐": "창밖은 너무 구체적이지 않다. 대신 오늘의 남은 시간이 얇은 막처럼 비친다.",
      "테이블 봐": "테이블 위에는 컵 자국 하나와 아직 이름 없는 메모 한 장이 있다."
    }
  },
  studio: {
    name: "작업실",
    art: "assets/room-studio.svg",
    description:
      "작업실에는 케이블, 노트, 모니터 불빛이 느슨하게 얽혀 있다. 아직 완성되지 않은 생각들이 전원 대기 중이다.",
    ambient: [
      "모니터가 아주 짧게 밝아졌다가 다시 숨을 죽인다.",
      "책상 아래의 케이블이 작은 미로처럼 엉켜 있다.",
      "노트 한 귀퉁이가 스스로 접혀 있는 것처럼 보인다."
    ],
    actions: {
      "책상 봐": "책상에는 열어둔 일과 미뤄둔 일이 같은 높이로 쌓여 있다.",
      "노트 열어": "첫 줄에만 글자가 있다. '다시 접속하고 싶은 공간인가?'",
      "불 켜": "작업등이 켜진다. MP가 아주 조금 맑아졌다."
    }
  },
  bedroom: {
    name: "침실",
    art: "assets/room-bedroom.svg",
    description:
      "침실은 세계의 해상도가 조금 낮아지는 곳이다. 이불의 가장자리가 화면 밖까지 이어진 듯하다.",
    ambient: [
      "커튼이 느리게 흔들리며 방 안의 윤곽을 다시 그린다.",
      "베개 한쪽이 아직 꿈의 압력을 품고 있다.",
      "조명이 낮아서 모든 사물이 한 박자 늦게 보인다."
    ],
    actions: {
      "침대 봐": "이불이 반쯤 접혀 있다. 잠깐 누우면 시간이 부드럽게 접힐 것 같다.",
      "조명 낮춰": "방이 더 조용해진다. 로그의 소리도 한 줄 뒤로 물러난다.",
      "누워": "짧게 누웠다. HP와 ST가 조금 회복됐다."
    }
  },
  veranda: {
    name: "베란다",
    art: "assets/room-veranda.svg",
    description:
      "베란다는 집의 가장자리다. 바깥으로 나가지는 않지만, 바깥이 있다는 사실을 계속 알려준다.",
    ambient: [
      "유리문에 실내의 글자들이 거꾸로 비친다.",
      "작은 화분들이 서로 다른 속도로 마르고 있다.",
      "먼 곳의 소음이 압축된 파일처럼 희미하게 도착한다."
    ],
    actions: {
      "화분 봐": "작은 잎 하나가 새로 났다. 아무 알림도 없이 진행된 업데이트 같다.",
      "바람 쐐": "바람이 들어와 입력창 끝에 맺힌 생각을 조금 식힌다.",
      "난간 봐": "난간 너머의 풍경은 아직 구현되지 않았다. 그래서 더 넓어 보인다."
    }
  }
};

const roomAliases = {
  거실: "living",
  living: "living",
  작업실: "studio",
  studio: "studio",
  침실: "bedroom",
  bedroom: "bedroom",
  베란다: "veranda",
  veranda: "veranda"
};

const baseCommands = [
  "둘러봐",
  "가 거실",
  "가 작업실",
  "가 침실",
  "가 베란다",
  "상태",
  "조용히 있어",
  "도움",
  "기록 지워"
];

const state = {
  room: "living",
  hp: 8,
  mp: 5,
  st: 7,
  selectedSuggestion: 0,
  suggestions: []
};

const els = {
  form: document.querySelector("#commandForm"),
  input: document.querySelector("#commandInput"),
  logPane: document.querySelector("#logPane"),
  logLines: document.querySelector("#logLines"),
  suggestions: document.querySelector("#suggestions"),
  roomArt: document.querySelector("#roomArt"),
  roomName: document.querySelector("#roomName"),
  hpMeter: document.querySelector("#hpMeter"),
  mpMeter: document.querySelector("#mpMeter"),
  stMeter: document.querySelector("#stMeter"),
  hpText: document.querySelector("#hpText"),
  mpText: document.querySelector("#mpText"),
  stText: document.querySelector("#stText"),
  clock: document.querySelector("#clock")
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function roParticle(word) {
  const lastCode = word.charCodeAt(word.length - 1);
  const hangulStart = 0xac00;
  const hangulEnd = 0xd7a3;

  if (lastCode < hangulStart || lastCode > hangulEnd) return "로";

  const finalConsonant = (lastCode - hangulStart) % 28;
  return finalConsonant === 0 || finalConsonant === 8 ? "로" : "으로";
}

function nowStamp() {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function setClock() {
  els.clock.textContent = nowStamp();
}

function addLog(text, tone = "normal") {
  const line = document.createElement("div");
  line.className = `log-line log-line--${tone}`;

  const time = document.createElement("span");
  time.className = "log-time";
  time.textContent = nowStamp();

  const body = document.createElement("span");
  body.className = "log-text";
  body.textContent = text;

  line.append(time, body);
  els.logLines.append(line);
  els.logPane.scrollTop = els.logPane.scrollHeight;
}

function updateStatus() {
  const room = rooms[state.room];
  els.roomName.textContent = room.name;
  els.roomArt.src = room.art;
  els.hpText.textContent = pad(state.hp);
  els.mpText.textContent = pad(state.mp);
  els.stText.textContent = pad(state.st);
  els.hpMeter.style.width = `${(state.hp / 8) * 100}%`;
  els.mpMeter.style.width = `${(state.mp / 5) * 100}%`;
  els.stMeter.style.width = `${(state.st / 10) * 100}%`;
}

function currentRoomCommands() {
  return Object.keys(rooms[state.room].actions);
}

function nextMoveCommand() {
  const roomKeys = Object.keys(rooms);
  const currentIndex = roomKeys.indexOf(state.room);
  const nextKey = roomKeys[(currentIndex + 1) % roomKeys.length];
  return `가 ${rooms[nextKey].name}`;
}

function commandPool() {
  return [...currentRoomCommands(), ...baseCommands];
}

function normalizeCommand(value) {
  return value.trim().replace(/\s+/g, " ");
}

function getSuggestions(value) {
  const normalized = normalizeCommand(value);
  const pool = commandPool();

  if (!normalized) {
    return [...currentRoomCommands(), "둘러봐", nextMoveCommand()].slice(0, 6);
  }

  const afterMove = normalized.match(/^(가|이동)\s*(.*)$/);
  if (afterMove) {
    const query = afterMove[2] ?? "";
    return Object.values(rooms)
      .map((room) => `가 ${room.name}`)
      .filter((command) => command.includes(query))
      .slice(0, 6);
  }

  const starts = pool.filter((command) => command.startsWith(normalized));
  const includes = pool.filter((command) => !command.startsWith(normalized) && command.includes(normalized));
  return [...starts, ...includes].slice(0, 6);
}

function renderSuggestions() {
  els.suggestions.replaceChildren();
  state.suggestions.forEach((suggestion, index) => {
    const row = document.createElement("div");
    row.className = `suggestion${index === state.selectedSuggestion ? " suggestion--active" : ""}`;

    const marker = document.createElement("span");
    marker.className = "suggestion-marker";
    marker.textContent = "▶";
    marker.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.textContent = suggestion;

    row.append(marker, text);
    els.suggestions.append(row);
  });
}

function refreshSuggestions() {
  state.suggestions = getSuggestions(els.input.value);
  state.selectedSuggestion = Math.min(state.selectedSuggestion, Math.max(state.suggestions.length - 1, 0));
  renderSuggestions();
}

function chooseSuggestion() {
  const suggestion = state.suggestions[state.selectedSuggestion];
  if (!suggestion) return false;
  els.input.value = suggestion;
  refreshSuggestions();
  return true;
}

function describeRoom() {
  const room = rooms[state.room];
  addLog(room.description);
  addLog(room.ambient[Math.floor(Math.random() * room.ambient.length)], "quiet");
}

function moveTo(roomKey) {
  if (!roomKey || !rooms[roomKey]) {
    addLog("그 방향은 아직 집의 구조 안에 없다.", "system");
    return;
  }

  if (roomKey === state.room) {
    addLog(`${rooms[roomKey].name}에 이미 있다. 방은 그대로인데 시선만 조금 달라졌다.`, "quiet");
    return;
  }

  state.room = roomKey;
  state.st = Math.max(0, state.st - 1);
  updateStatus();
  addLog(`${rooms[roomKey].name}${roParticle(rooms[roomKey].name)} 이동했다.`, "system");
  describeRoom();
  refreshSuggestions();
}

function recover(kind) {
  if (kind === "full") {
    state.hp = Math.min(8, state.hp + 1);
    state.st = Math.min(10, state.st + 2);
  } else if (kind === "mind") {
    state.mp = Math.min(5, state.mp + 1);
  } else {
    state.st = Math.min(10, state.st + 1);
  }
  updateStatus();
}

function performRoomAction(command) {
  const actionText = rooms[state.room].actions[command];
  if (!actionText) return false;

  addLog(actionText);

  if (command === "소파에 앉아") recover("body");
  if (command === "불 켜") recover("mind");
  if (command === "누워") recover("full");

  return true;
}

function parseMoveTarget(command) {
  const direct = roomAliases[command];
  if (direct) return direct;

  const moveMatch = command.match(/^(가|이동)\s+(.+)$/);
  if (!moveMatch) return null;

  return roomAliases[moveMatch[2]];
}

function showHelp() {
  addLog("가능한 입력: 둘러봐 / 가 [방 이름] / 상태 / 조용히 있어 / 현재 방의 사물 입력", "system");
  addLog(`지금 방에서 떠오르는 입력: ${currentRoomCommands().join(" · ")}`, "quiet");
}

function showStatus() {
  addLog(`HP ${pad(state.hp)} / MP ${pad(state.mp)} / ST ${pad(state.st)} / LOC ${rooms[state.room].name}`, "system");
}

function clearLog() {
  els.logLines.replaceChildren();
  addLog("로그를 비웠다. 방은 그대로 남아 있다.", "system");
}

function waitQuietly() {
  state.st = Math.min(10, state.st + 1);
  updateStatus();
  addLog(rooms[state.room].ambient[Math.floor(Math.random() * rooms[state.room].ambient.length)], "quiet");
}

function handleCommand(rawCommand) {
  const command = normalizeCommand(rawCommand);

  if (!command) {
    addLog("입력되지 않은 말이 프롬프트 뒤에 잠깐 머문다.", "quiet");
    return;
  }

  addLog(`> ${command}`, "input");

  if (performRoomAction(command)) return;

  const moveTarget = parseMoveTarget(command);
  if (moveTarget) {
    moveTo(moveTarget);
    return;
  }

  if (["둘러봐", "봐", "look"].includes(command)) {
    describeRoom();
    return;
  }

  if (["상태", "status"].includes(command)) {
    showStatus();
    return;
  }

  if (["조용히 있어", "기다려", "쉼"].includes(command)) {
    waitQuietly();
    return;
  }

  if (["도움", "help", "?"].includes(command)) {
    showHelp();
    return;
  }

  if (command === "기록 지워") {
    clearLog();
    return;
  }

  addLog("그 입력은 아직 이 집의 언어가 아니다. 후보 목록이 살짝 흔들린다.", "system");
}

function boot() {
  setClock();
  updateStatus();
  addLog("Prototype 0 부팅 완료.", "system");
  addLog("거실에서 시작한다. 입력창은 조용히 깜빡이고 있다.", "quiet");
  describeRoom();
  refreshSuggestions();
  els.input.focus();
}

function submitCommand() {
  const command = els.input.value;
  els.input.value = "";
  state.selectedSuggestion = 0;
  handleCommand(command);
  refreshSuggestions();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitCommand();
});

els.input.addEventListener("input", () => {
  state.selectedSuggestion = 0;
  refreshSuggestions();
});

els.input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitCommand();
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.selectedSuggestion = (state.selectedSuggestion + 1) % Math.max(state.suggestions.length, 1);
    renderSuggestions();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    state.selectedSuggestion =
      (state.selectedSuggestion - 1 + Math.max(state.suggestions.length, 1)) % Math.max(state.suggestions.length, 1);
    renderSuggestions();
  }

  if (event.key === "Tab") {
    event.preventDefault();
    chooseSuggestion();
  }
});

document.addEventListener("click", () => {
  els.input.focus();
});

window.setInterval(setClock, 1000);

boot();
