import world from "./generated/world.json";
import {
  INPUT_ROWS,
  RESET,
  centerText,
  displayWidth,
  frameContentColumn,
  frameContentWidth,
  highlightedRows,
  promptCursorColumn,
  renderInputPanel,
  renderRow,
  wrapText
} from "./terminal-ui.js";

const CSI = "\x1b[";
const ALT_SCREEN = "\x1b[?1049h";
const SHOW_CURSOR = "\x1b[?25h";
const HIDE_CURSOR = "\x1b[?25l";
const DIM = "\x1b[2m";
const SELECTED_CANDIDATE = "\x1b[30;47m";
const BOTTOM_ROWS = INPUT_ROWS;
const CONTENT_LIMIT = 180;

const maxStats = {
  hp: 100,
  mp: 100,
  st: 100
};

const rooms = world.rooms;
const actorDefs = collectActors(rooms);

const builtInCommands = {
  look: "look",
  "둘러봐": "look",
  "살펴봐": "look",
  "봐": "look",
  links: "links",
  "연결": "links",
  status: "status",
  "상태": "status",
  inventory: "inventory",
  inv: "inventory",
  i: "inventory",
  "소지품": "inventory",
  "인벤토리": "inventory",
  wait: "wait",
  "기다려": "wait",
  help: "help",
  "도움": "help",
  clear: "clear"
};

const state = {
  room: world.startRoom,
  input: "",
  selected: 0,
  scrollOffset: 0,
  hp: 80,
  mp: 50,
  st: 70,
  inventory: [],
  content: [],
  candidateHitboxes: [],
  candidateRow: 0,
  actorLocations: Object.fromEntries(actorDefs.map((actor) => [actor.id, actor.homeRoom]))
};

let term;

export function startWorld(xterm) {
  term = xterm;
  term.write(ALT_SCREEN + HIDE_CURSOR);
  appendPlaceSnapshot();
  term.onData(handleData);
  term.onResize(render);
  term.element?.addEventListener("pointerdown", handleTerminalPointer, { passive: false });
  render();
  term.focus();
}

function handleData(data) {
  if (data === "\r") {
    submit();
    return;
  }

  if (data === "\u007f") {
    state.input = Array.from(state.input).slice(0, -1).join("");
    state.selected = 0;
    render();
    return;
  }

  if (data === "\t") {
    acceptSuggestion();
    return;
  }

  if (data === "\x1b[A") {
    scrollContent(1);
    return;
  }

  if (data === "\x1b[B") {
    scrollContent(-1);
    return;
  }

  if (data === "\x1b[D") {
    moveSelection(-1);
    return;
  }

  if (data === "\x1b[C") {
    moveSelection(1);
    return;
  }

  if (data === "\x1b[5~") {
    scrollContent(pageScrollSize());
    return;
  }

  if (data === "\x1b[6~") {
    scrollContent(-pageScrollSize());
    return;
  }

  if (data === "\x1b[F") {
    state.scrollOffset = 0;
    render();
    return;
  }

  if (data === "\x03") {
    state.input = "";
    addLog("system", "^C");
    render();
    return;
  }

  if (isPrintable(data)) {
    state.input += data;
    state.selected = 0;
    render();
  }
}

function submit() {
  const raw = normalizeSpaces(state.input);
  const model = suggestionModel();

  if (raw && model.items.length && !parseExecutable(raw)) {
    acceptSuggestion(model);
    return;
  }

  state.input = "";
  state.selected = 0;

  if (!raw) {
    render();
    return;
  }

  addLog("input", raw);
  runCommand(raw);
  render();
}

function runCommand(command) {
  const action = parseExecutable(command);
  if (!action) {
    const question = incompleteQuestion(command);
    addLog(question ? "system" : "error", question ?? "unknown command.");
    return;
  }

  if (action.type === "move") {
    move(action.link);
    return;
  }

  if (action.type === "builtin") {
    runBuiltIn(action.id);
    return;
  }

  if (action.type === "eat") {
    eat(action.target);
    return;
  }

  if (action.type === "pet") {
    pet(action.target);
    return;
  }

  if (action.type === "inspect") {
    inspect(action.target);
  }
}

function handleTerminalPointer(event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  const handled = selectCandidateFromEvent(event);
  if (handled) {
    event.preventDefault();
    return;
  }

  term.focus();
  if (event.pointerType !== "mouse") event.preventDefault();
}

function selectCandidateFromEvent(event) {
  const cell = terminalCellFromEvent(event);
  if (!cell || cell.row !== state.candidateRow) return false;

  const hitbox = state.candidateHitboxes.find((box) => cell.col >= box.start && cell.col <= box.end);
  if (!hitbox) return false;

  term.focus();
  state.selected = hitbox.index;
  acceptSuggestion();
  return true;
}

function terminalCellFromEvent(event) {
  const screen = term?.element?.querySelector(".xterm-screen");
  if (!screen || !term.cols || !term.rows) return null;

  const rect = screen.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const col = Math.floor(((event.clientX - rect.left) / rect.width) * term.cols) + 1;
  const row = Math.floor(((event.clientY - rect.top) / rect.height) * term.rows) + 1;

  if (col < 1 || col > term.cols || row < 1 || row > term.rows) return null;
  return { col, row };
}

function runBuiltIn(id) {
  if (id === "look") {
    appendPlaceSnapshot();
    return;
  }

  if (id === "links") {
    addLog("system", linkSummary(currentRoom()));
    return;
  }

  if (id === "status") {
    addLog("system", statusSummary());
    return;
  }

  if (id === "inventory") {
    addLog("system", inventorySummary());
    return;
  }

  if (id === "wait") {
    state.st = clamp(state.st + 5, 0, maxStats.st);
    addLog("world", "잠시 기다린다.");
    tickActors(0.85);
    appendPlaceSnapshot();
    return;
  }

  if (id === "help") {
    addLog("system", "verbs: 가, 살펴봐, 먹어, 쓰다듬어, 기다려, 상태, 소지품");
    addLog("system", `places: ${currentRoom().links.map((link) => linkTargetName(link)).join(", ")}`);
    addLog("system", "movement: `<장소>로 가`, `가 <장소>`.");
    return;
  }

  if (id === "clear") {
    state.content = [];
    appendPlaceSnapshot();
  }
}

function move(link) {
  const destination = rooms[link.to];
  if (!destination) {
    addLog("error", "broken link.");
    return;
  }

  state.room = link.to;
  state.st = clamp(state.st - 10, 0, maxStats.st);
  addLog("world", link.arrivalText || `${destination.name}에 도착했다.`);
  tickActors(0.35);
  appendPlaceSnapshot();
}

function eat(target) {
  if (!hasTag(target, "edible")) {
    addLog("error", `${target.name}은 먹을 수 있는 대상으로 보이지 않는다.`);
    return;
  }

  addLog("world", `${withObjectParticle(target.name)} 먹었다.`);
  tickActors(0.25);
}

function pet(target) {
  if (target.kind !== "actor" || !hasTag(target, "touchable")) {
    addLog("error", `${target.name}은 쓰다듬을 수 있는 대상으로 보이지 않는다.`);
    return;
  }

  addLog("world", `${withObjectParticle(target.name)} 쓰다듬었다.`);
  tickActors(0.25);
}

function inspect(target) {
  if (target.kind === "actor") {
    addLog("world", actorPresenceLine(target, state.room));
    return;
  }

  addLog("world", `${target.name}을 살펴본다.`);
}

function parseExecutable(command) {
  const normalized = normalizeSpaces(command);
  const link = resolveLink(normalized);
  if (link) return { type: "move", link };

  const builtIn = builtInCommands[normalized];
  if (builtIn) return { type: "builtin", id: builtIn };

  const eatTarget = parseTargetVerb(normalized, ["먹어", "먹"], ["을", "를"]);
  if (eatTarget) return { type: "eat", target: eatTarget };

  const petTarget = parseTargetVerb(normalized, ["쓰다듬어", "쓰다듬"], ["을", "를"]);
  if (petTarget) return { type: "pet", target: petTarget };

  const inspectTarget = parseTargetVerb(normalized, ["살펴봐", "봐"], ["을", "를"]);
  if (inspectTarget) return { type: "inspect", target: inspectTarget };

  return null;
}

function parseTargetVerb(command, verbs, particles) {
  for (const verb of verbs) {
    if (command === verb) return null;

    if (command.startsWith(`${verb} `)) {
      return findVisibleEntity(stripParticles(command.slice(verb.length).trim(), particles));
    }

    if (command.endsWith(` ${verb}`)) {
      return findVisibleEntity(stripParticles(command.slice(0, -verb.length).trim(), particles));
    }
  }

  return null;
}

function incompleteQuestion(command) {
  const normalized = normalizeSpaces(command);

  if (["가", "이동", "이동해"].includes(normalized) || normalized.startsWith("가 ")) {
    return "어디로 갈까?";
  }

  const linkedPlace = currentRoom().links.find((link) => linkTargetName(link) === normalized || (link.aliases ?? []).includes(normalized));
  if (linkedPlace) {
    return `${withDestinationParticle(linkTargetName(linkedPlace))} 가?`;
  }

  if (["먹어", "먹"].includes(normalized)) return "무엇을 먹을까?";
  if (["줘", "주", "건네줘"].includes(normalized)) return "무엇을 누구에게 줄까?";
  if (["쓰다듬어", "쓰다듬"].includes(normalized)) return "누구를 쓰다듬을까?";

  return null;
}

function resolveLink(command) {
  const normalized = normalizeSpaces(command);
  const moveTarget = moveTargetFromCommand(normalized);
  if (moveTarget === null) return null;

  const query = stripDestinationParticle(moveTarget);

  return currentRoom().links.find((link) => {
    const target = rooms[link.to];
    const names = [
      link.label,
      link.to,
      target?.slug,
      target?.name,
      ...(link.aliases ?? [])
    ].filter(Boolean);

    return names.some((name) => normalizeSpaces(name) === query);
  });
}

function moveTargetFromCommand(command) {
  const prefixMatch = command.match(/^(?:가|이동|이동해)\s+(.+)$/);
  if (prefixMatch) return prefixMatch[1].trim();

  const particleMatch = command.match(/^(.+?)(?:으로|로|에)\s*가$/);
  if (particleMatch) return particleMatch[1].trim();

  const spacedMatch = command.match(/^(.+?)\s+(?:가|이동|이동해)$/);
  if (spacedMatch) return spacedMatch[1].trim();

  return null;
}

function currentRoom() {
  return rooms[state.room];
}

function addLog(kind, text) {
  appendContent({ type: "log", kind, text, time: timeText() });
}

function appendPlaceSnapshot() {
  const room = currentRoom();
  appendContent({
    type: "place",
    roomId: room.id,
    name: room.name,
    description: room.description,
    sensation: room.sensation,
    objects: room.objects ?? [],
    actors: actorsInRoom(room.id).map((actor) => ({
      ...actor,
      description: actorPresenceLine(actor, room.id)
    })),
    links: room.links.map((link) => ({
      name: linkTargetName(link),
      aliases: link.aliases ?? []
    }))
  });
}

function appendContent(entry) {
  state.content.push(entry);
  state.content = state.content.slice(-CONTENT_LIMIT);
  state.scrollOffset = 0;
}

function tickActors(chance) {
  for (const actor of actorDefs) {
    if (Math.random() >= chance) continue;

    const from = state.actorLocations[actor.id];
    const room = rooms[from];
    const links = room?.links ?? [];
    if (!links.length) continue;

    const link = links[Math.floor(Math.random() * links.length)];
    const to = link.to;
    if (!rooms[to] || to === from) continue;

    state.actorLocations[actor.id] = to;

    if (from === state.room) {
      addLog("world", `${actor.name}가 ${linkTargetName(link)} 쪽으로 간다.`);
    } else if (to === state.room) {
      addLog("world", `${actor.name}가 ${rooms[from]?.name ?? "다른 곳"}에서 들어온다.`);
    }
  }
}

function suggestionModel() {
  const input = normalizeSpaces(state.input);
  const executable = input ? parseExecutable(input) : null;
  if (executable) {
    return { question: "", items: [candidate("실행", input)] };
  }

  if (!input || !isSuggestionBoundary(state.input)) {
    return { question: "", items: [] };
  }

  const verbPrompt = promptForVerb(input);
  if (verbPrompt) return verbPrompt;

  const verbCandidates = actionCandidates(input);
  if (verbCandidates.length) {
    return { question: "", items: verbCandidates.slice(0, 7) };
  }

  const particlePrompt = promptForExactEntity(input);
  if (particlePrompt) return particlePrompt;

  const postParticlePrompt = promptAfterParticle(input);
  if (postParticlePrompt) return postParticlePrompt;

  const destinationPrompt = promptForDestination(input);
  if (destinationPrompt) return destinationPrompt;

  return {
    question: "",
    items: [...linkCandidates(input), ...entityCandidates(input), ...actionCandidates(input)].slice(0, 7)
  };
}

function promptForVerb(input) {
  if (["가", "이동", "이동해"].includes(input) || input.startsWith("가 ")) {
    const query = input.replace(/^(?:가|이동|이동해)\s*/, "");
    return { question: "어디로?", items: linkCandidates(query) };
  }

  if (["먹어", "먹"].includes(input)) {
    return { question: "무엇을?", items: edibleCandidates() };
  }

  if (["줘", "주", "건네줘"].includes(input)) {
    return { question: "무엇을?", items: portableCandidates() };
  }

  if (["쓰다듬어", "쓰다듬"].includes(input)) {
    return { question: "누구를?", items: actorCandidates("", "pet") };
  }

  return null;
}

function promptForExactEntity(input) {
  const entity = findVisibleEntity(input);
  if (!entity) return null;

  if (entity.kind === "actor") {
    return {
      question: `${entity.name}?`,
      items: [
        candidate(withObjectParticle(entity.name), withObjectParticle(entity.name)),
        candidate(`${entity.name}에게`, `${entity.name}에게`),
        candidate(`${entity.name}와`, `${entity.name}와`)
      ]
    };
  }

  return {
    question: `${entity.name}?`,
    items: [
      candidate(withObjectParticle(entity.name), withObjectParticle(entity.name)),
      candidate(`${entity.name}을 살펴봐`, `${withObjectParticle(entity.name)} 살펴봐`)
    ]
  };
}

function promptAfterParticle(input) {
  const objectName = stripObjectParticle(input);
  if (objectName !== input) {
    const entity = findVisibleEntity(objectName);
    if (!entity) return null;

    const items = [];
    if (entity.kind === "actor") {
      items.push(candidate("쓰다듬어", `${withObjectParticle(entity.name)} 쓰다듬어`));
    }
    if (hasTag(entity, "edible")) {
      items.push(candidate("먹어", `${withObjectParticle(entity.name)} 먹어`));
    }
    items.push(candidate("살펴봐", `${withObjectParticle(entity.name)} 살펴봐`));
    return { question: "다음 행동", items };
  }

  const recipientName = stripRecipientParticle(input);
  if (recipientName !== input) {
    return { question: "무엇을?", items: portableCandidates() };
  }

  return null;
}

function promptForDestination(input) {
  const moveTarget = moveTargetFromCommand(input);
  if (moveTarget !== null) {
    return { question: "어디로?", items: linkCandidates(moveTarget) };
  }

  const links = linkCandidates(input);
  if (links.length) {
    return { question: "어디로?", items: links };
  }

  return null;
}

function linkCandidates(query) {
  const normalizedQuery = normalizeSpaces(stripDestinationParticle(query));
  return currentRoom().links
    .map((link) => {
      const name = linkTargetName(link);
      return {
        label: name,
        insertText: `${withDestinationParticle(name)} 가`,
        searchText: [name, link.label, ...(link.aliases ?? [])].join(" ")
      };
    })
    .filter((item) => includesQuery(item.searchText, normalizedQuery));
}

function entityCandidates(query) {
  return visibleEntities()
    .map((entity) => candidate(entity.name, entity.name, entity.aliases.join(" ")))
    .filter((item) => includesQuery(item.searchText, query));
}

function actionCandidates(query) {
  return [
    candidate("가", "가"),
    candidate("먹어", "먹어"),
    candidate("줘", "줘"),
    candidate("쓰다듬어", "쓰다듬어"),
    candidate("살펴봐", "살펴봐"),
    candidate("기다려", "기다려"),
    candidate("상태", "상태"),
    candidate("소지품", "소지품"),
    candidate("도움", "도움")
  ].filter((item) => includesQuery(item.searchText, query));
}

function edibleCandidates() {
  return visibleEntities()
    .filter((entity) => hasTag(entity, "edible"))
    .map((entity) => candidate(entity.name, `${withObjectParticle(entity.name)} 먹어`));
}

function portableCandidates() {
  return visibleEntities()
    .filter((entity) => hasTag(entity, "portable") || hasTag(entity, "giftable"))
    .map((entity) => candidate(entity.name, withObjectParticle(entity.name)));
}

function actorCandidates(query, action) {
  return actorsInRoom(state.room)
    .map((actor) => {
      const insertText = action === "pet" ? `${withObjectParticle(actor.name)} 쓰다듬어` : actor.name;
      return candidate(actor.name, insertText, actor.aliases.join(" "));
    })
    .filter((item) => includesQuery(item.searchText, query));
}

function candidate(label, insertText = label, searchText = label) {
  return {
    label,
    insertText,
    searchText: `${label} ${insertText} ${searchText}`
  };
}

function isSuggestionBoundary(input) {
  return /\s$/.test(input);
}

function acceptSuggestion(model = suggestionModel()) {
  const item = model.items[state.selected] ?? model.items[0];
  if (!item) return;
  state.input = item.insertText;
  state.selected = 0;
  render();
}

function moveSelection(delta) {
  const items = suggestionModel().items;
  if (!items.length) return;
  state.selected = (state.selected + delta + items.length) % items.length;
  render();
}

function scrollContent(delta) {
  const maxScroll = maxScrollOffset();
  state.scrollOffset = clamp(state.scrollOffset + delta, 0, maxScroll);
  render();
}

function render() {
  const cols = Math.max(term.cols || 80, 32);
  const rows = Math.max(term.rows || 24, 12);
  const model = suggestionModel();
  state.selected = Math.min(state.selected, Math.max(model.items.length - 1, 0));
  const candidateLine = candidatesLine(model, cols);

  const promptText = state.input;
  const bodyHeight = bodyRowCount();
  const contentRows = renderContentRows(cols);
  const maxScroll = Math.max(contentRows.length - bodyHeight, 0);
  state.scrollOffset = clamp(state.scrollOffset, 0, maxScroll);

  const end = contentRows.length - state.scrollOffset;
  const start = Math.max(end - bodyHeight, 0);
  let bodyRows = contentRows.slice(start, end);

  while (bodyRows.length < bodyHeight) {
    bodyRows.push({ kind: "normal", text: "" });
  }

  const inputRows = renderInputPanel({
    cols,
    statusAnsi: statusBar(frameContentWidth(cols)),
    candidates: candidateLine.text,
    candidatesAnsi: candidateLine.ansi,
    prompt: promptText,
    spare: spareText()
  });
  const screenRows = [
    ...bodyRows,
    ...inputRows
  ].slice(0, rows);

  const output = screenRows.map((row) => renderRow(row, cols)).join("\r\n");
  const promptRow = Math.min(screenRows.findIndex((row) => row.kind === "prompt") + 1, rows);
  const cursorCol = promptCursorColumn(promptText, cols);
  const candidateRow = screenRows.findIndex((row) => row.kind === "candidates") + 1;
  state.candidateRow = candidateRow > 0 ? candidateRow : 0;
  state.candidateHitboxes = state.candidateRow ? candidateLine.hitboxes : [];

  term.write(`${HIDE_CURSOR}${CSI}H${CSI}2J${output}${CSI}${promptRow};${cursorCol}H${SHOW_CURSOR}`);
}

function renderContentRows(cols) {
  return state.content.flatMap((entry) => {
    if (entry.type === "place") return renderPlaceRows(entry, cols);
    return renderLogEntry(entry, cols);
  });
}

function renderLogEntry(entry, cols) {
  const prefix = eventPrefix(entry.kind);
  const width = Math.max(cols - displayWidth(prefix), 8);
  const lines = wrapText(entry.text, width);
  return lines.map((line, index) => ({
    kind: entry.kind,
    text: `${index === 0 ? prefix : " ".repeat(displayWidth(prefix))}${line}`
  }));
}

function eventPrefix(kind) {
  if (kind === "input") return "> ";
  if (kind === "error") return "! ";
  if (kind === "system") return "# ";
  return "· ";
}

function renderPlaceRows(snapshot, cols) {
  const objectTerms = termsFor(snapshot.objects);
  const actorTerms = termsFor(snapshot.actors);
  const linkTerms = snapshot.links.flatMap((link) => [link.name, ...link.aliases]);
  const rows = [
    { kind: "normal", text: "" },
    { kind: "placeTitle", text: snapshot.name },
    { kind: "normal", text: "" },
    ...highlightedRows(snapshot.description, objectTerms, "object", cols)
  ];

  if (snapshot.sensation) {
    rows.push(...highlightedRows(snapshot.sensation, objectTerms, "object", cols));
  }

  if (snapshot.actors.length) {
    rows.push(
      { kind: "normal", text: "" },
      ...snapshot.actors.flatMap((actor) => highlightedRows(actor.description, actorTerms, "actor", cols))
    );
  }

  rows.push(
    { kind: "normal", text: "" },
    ...highlightedRows(linkSummary(snapshot), linkTerms, "link", cols),
    { kind: "normal", text: "" }
  );
  return rows;
}

function linkSummary(roomOrSnapshot) {
  const labels = "links" in roomOrSnapshot
    ? roomOrSnapshot.links.map((link) => ("to" in link ? linkTargetName(link) : link.name))
    : [];
  return labels.length ? `연결: ${labels.join(", ")}` : "연결: 없음";
}

function statusSummary() {
  return `HP ${state.hp}/${maxStats.hp}  MP ${state.mp}/${maxStats.mp}  STA ${state.st}/${maxStats.st}  LOC ${currentRoom().name}`;
}

function inventorySummary() {
  if (!state.inventory.length) return "소지품: 없음";
  return `소지품: ${state.inventory.map((item) => item.name).join(", ")}`;
}

function statusBar(cols) {
  const gaugeWidth = gaugeWidthFor(cols);
  const parts = [
    gauge("HP", state.hp, maxStats.hp, gaugeWidth, "41"),
    "  ",
    gauge("MP", state.mp, maxStats.mp, gaugeWidth, "44"),
    "  ",
    gauge("STA", state.st, maxStats.st, gaugeWidth, "42")
  ];

  let visibleWidth = parts.reduce((total, part) => total + (typeof part === "string" ? displayWidth(part) : part.width), 0);
  let ansi = parts.map((part) => (typeof part === "string" ? part : part.ansi)).join("");

  const locText = `  LOC ${currentRoom().name}`;
  if (visibleWidth + displayWidth(locText) <= cols) {
    ansi += locText;
    visibleWidth += displayWidth(locText);
  }

  return ansi + " ".repeat(Math.max(cols - visibleWidth, 0)) + RESET;
}

function gauge(label, value, max, width, bgCode) {
  const labelText = `${label} `;
  const number = width >= 7 ? `${String(value).padStart(2, "0")}/${max}` : String(value);
  const numberText = centerText(number, width);
  const filled = Math.round((value / max) * width);
  let ansi = `\x1b[1;97m${labelText}${RESET}`;

  for (let index = 0; index < width; index += 1) {
    const bg = index < filled ? bgCode : "100";
    ansi += `\x1b[${bg}m\x1b[97m${numberText[index] ?? " "}`;
  }

  return {
    ansi: `${ansi}${RESET}`,
    width: displayWidth(labelText) + width
  };
}

function gaugeWidthFor(cols) {
  if (cols >= 92) return 18;
  if (cols >= 72) return 14;
  if (cols >= 54) return 10;
  if (cols >= 36) return 7;
  return 5;
}

function candidatesLine(model, cols) {
  if (!model.question && !model.items.length) return { text: "", ansi: "", hitboxes: [] };
  if (!model.items.length) return { text: model.question, ansi: `${DIM}${model.question}${RESET}`, hitboxes: [] };

  const contentWidth = frameContentWidth(cols);
  let text = "";
  let ansi = DIM;
  let offset = 0;
  const hitboxes = [];
  const question = model.question ? `${model.question} ` : "";

  if (question) {
    const fittedQuestion = fitCandidateSegment(question, contentWidth);
    text += fittedQuestion;
    ansi += fittedQuestion;
    offset += displayWidth(fittedQuestion);
  }

  for (let index = 0; index < model.items.length; index += 1) {
    const item = model.items[index];
    const separator = index > 0 ? "  " : "";
    const label = item.label;
    const nextWidth = displayWidth(separator) + displayWidth(label);

    if (offset + nextWidth > contentWidth) break;

    if (index > 0) {
      text += separator;
      ansi += separator;
      offset += 2;
    }

    const startOffset = offset;
    const endOffset = offset + displayWidth(label) - 1;

    text += label;
    ansi += index === state.selected ? `${RESET}${SELECTED_CANDIDATE}${label}${RESET}${DIM}` : label;
    offset = endOffset + 1;

    if (startOffset < contentWidth) {
      hitboxes.push({
        index,
        start: frameContentColumn(startOffset),
        end: frameContentColumn(Math.min(endOffset, contentWidth - 1))
      });
    }
  }

  return { text, ansi: `${ansi}${RESET}`, hitboxes };
}

function fitCandidateSegment(text, width) {
  let line = "";
  for (const char of Array.from(text)) {
    if (displayWidth(line + char) > width) break;
    line += char;
  }
  return line;
}

function spareText() {
  return state.scrollOffset > 0 ? `SCROLL +${state.scrollOffset}` : "";
}

function collectActors(roomMap) {
  return Object.values(roomMap).flatMap((room) =>
    (room.actors ?? []).map((actor) => ({
      ...actor,
      kind: "actor",
      tags: actor.tags ?? ["animate", "touchable"],
      homeRoom: room.id
    }))
  );
}

function actorsInRoom(roomId) {
  return actorDefs.filter((actor) => state.actorLocations[actor.id] === roomId);
}

function visibleEntities() {
  const room = currentRoom();
  const objects = (room.objects ?? []).map((object) => ({
    ...object,
    kind: "object",
    aliases: object.aliases ?? [],
    tags: object.tags ?? []
  }));
  return [...objects, ...actorsInRoom(room.id)];
}

function findVisibleEntity(query) {
  const normalized = normalizeSpaces(query);
  return visibleEntities().find((entity) => {
    const names = [entity.name, ...(entity.aliases ?? [])].map(normalizeSpaces);
    return names.includes(normalized);
  });
}

function actorPresenceLine(actor, roomId) {
  if (roomId === actor.homeRoom) return actor.description;
  return `${actor.name}가 ${rooms[roomId]?.name ?? "이곳"} 한쪽에 있다.`;
}

function linkTargetName(link) {
  return rooms[link.to]?.name ?? link.label ?? link.to;
}

function termsFor(items) {
  return items.flatMap((item) => [item.name, ...(item.aliases ?? [])]);
}

function hasTag(entity, tag) {
  return (entity.tags ?? []).includes(tag);
}

function includesQuery(text, query) {
  const normalizedQuery = normalizeSpaces(query);
  if (!normalizedQuery) return true;
  return normalizeSpaces(text).includes(normalizedQuery);
}

function stripParticles(text, particles) {
  return particles.reduce((result, particle) => {
    if (result.endsWith(particle)) return result.slice(0, -particle.length).trim();
    return result;
  }, normalizeSpaces(text));
}

function stripObjectParticle(text) {
  return stripParticles(text, ["을", "를"]);
}

function stripRecipientParticle(text) {
  return stripParticles(text, ["에게", "한테"]);
}

function stripDestinationParticle(text) {
  return stripParticles(text, ["으로", "로", "에"]);
}

function withObjectParticle(text) {
  return `${text}${hasFinalConsonant(text) ? "을" : "를"}`;
}

function withDestinationParticle(text) {
  return `${text}${destinationParticle(text)}`;
}

function destinationParticle(text) {
  const code = lastHangulCode(text);
  if (code === null) return "로";
  const jong = (code - 0xac00) % 28;
  return jong > 0 && jong !== 8 ? "으로" : "로";
}

function hasFinalConsonant(text) {
  const code = lastHangulCode(text);
  if (code === null) return false;
  return (code - 0xac00) % 28 > 0;
}

function lastHangulCode(text) {
  const last = Array.from(text.trim()).at(-1);
  if (!last) return null;
  const code = last.codePointAt(0);
  return code >= 0xac00 && code <= 0xd7a3 ? code : null;
}

function pageScrollSize() {
  return Math.max(1, bodyRowCount() - 1);
}

function bodyRowCount() {
  return Math.max(2, (term?.rows || 24) - BOTTOM_ROWS);
}

function maxScrollOffset() {
  const cols = Math.max(term?.cols || 80, 32);
  return Math.max(renderContentRows(cols).length - bodyRowCount(), 0);
}

function normalizeSpaces(text) {
  return text.trim().replace(/\s+/g, " ");
}

function timeText() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function isPrintable(data) {
  return !/[\x00-\x08\x0b-\x1f\x7f]/.test(data);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pad(value) {
  return String(value).padStart(2, "0");
}
