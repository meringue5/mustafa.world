import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { startWorld } from "./world.js";

const terminalElement = document.querySelector("#terminal");
const fontFamily = '"IyagiGGCHalf", ui-monospace, "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace';
const TERMINAL_PROFILES = {
  desktop: {
    id: "desktop",
    cols: 132,
    rows: 50,
    minScale: 0.45,
    maxScale: 1.2,
    stageMargin: 32,
    fallbackFrame: { width: 1220, height: 930 }
  },
  compact: {
    id: "compact",
    cols: 80,
    rows: 40,
    minScale: 0.42,
    maxScale: 1.1,
    stageMargin: 12,
    fallbackFrame: { width: 752, height: 748 }
  }
};
const FONT_LOAD_TIMEOUT_MS = 3000;
const terminalFrameElement = document.querySelector("#terminal-frame");
let activeProfile = selectTerminalProfile();
let terminalFrameSize = { ...activeProfile.fallbackFrame };

const terminal = new Terminal({
  allowTransparency: false,
  cols: activeProfile.cols,
  convertEol: false,
  customGlyphs: false,
  cursorBlink: true,
  cursorStyle: "block",
  drawBoldTextInBrightColors: true,
  fontFamily,
  fontSize: 15,
  fontWeight: "normal",
  fontWeightBold: "normal",
  letterSpacing: 0,
  lineHeight: 1,
  rows: activeProfile.rows,
  scrollback: 0,
  theme: {
    background: "#000000",
    foreground: "#aaaaaa",
    cursor: "#ffffff",
    selectionBackground: "#555555",
    black: "#000000",
    red: "#aa0000",
    green: "#00aa00",
    yellow: "#aa5500",
    blue: "#0000aa",
    magenta: "#aa00aa",
    cyan: "#00aaaa",
    white: "#aaaaaa",
    brightBlack: "#555555",
    brightRed: "#ff5555",
    brightGreen: "#55ff55",
    brightYellow: "#ffff55",
    brightBlue: "#5555ff",
    brightMagenta: "#ff55ff",
    brightCyan: "#55ffff",
    brightWhite: "#ffffff"
  }
});

await waitForTerminalFont();
syncVisualViewportProperties();
syncProfileProperties();
terminal.open(terminalElement);
terminal.resize(activeProfile.cols, activeProfile.rows);

function updateStageScale() {
  const viewport = syncVisualViewportProperties();
  const widthScale = Math.max(viewport.width - activeProfile.stageMargin, 1) / terminalFrameSize.width;
  const heightScale = Math.max(viewport.height - activeProfile.stageMargin, 1) / terminalFrameSize.height;
  const fitScale = Math.min(widthScale, heightScale);
  const scale = fitScale < activeProfile.minScale ? fitScale : Math.min(fitScale, activeProfile.maxScale);
  document.documentElement.style.setProperty("--terminal-scale", String(scale));
}

function syncTerminalFrame() {
  applyTerminalProfile();

  const xtermElement = terminalElement.querySelector(".xterm");
  const screenElement = terminalElement.querySelector(".xterm-screen");
  if (!xtermElement || !screenElement) {
    updateStageScale();
    return;
  }

  const xtermStyle = getComputedStyle(xtermElement);
  const paddingX = parseFloat(xtermStyle.paddingLeft) + parseFloat(xtermStyle.paddingRight);
  const paddingY = parseFloat(xtermStyle.paddingTop) + parseFloat(xtermStyle.paddingBottom);
  const width = Math.ceil(screenElement.offsetWidth + paddingX);
  const height = Math.ceil(screenElement.offsetHeight + paddingY);

  if (width > 0 && height > 0) {
    terminalFrameSize = { width, height };
    document.documentElement.style.setProperty("--terminal-frame-width", `${width}px`);
    document.documentElement.style.setProperty("--terminal-frame-height", `${height}px`);
  }

  updateStageScale();
  terminal.refresh(0, terminal.rows - 1);
}

function scheduleTerminalFrameSync({ reveal = false } = {}) {
  requestAnimationFrame(() => {
    syncTerminalFrame();
    requestAnimationFrame(() => {
      syncTerminalFrame();
      if (reveal) terminalFrameElement?.classList.add("is-ready");
    });
  });
}

scheduleTerminalFrameSync({ reveal: true });
window.addEventListener("resize", () => {
  scheduleTerminalFrameSync();
});
window.visualViewport?.addEventListener("resize", () => {
  scheduleTerminalFrameSync();
});
window.visualViewport?.addEventListener("scroll", () => {
  updateStageScale();
});

document.fonts?.ready.then(() => {
  scheduleTerminalFrameSync();
});

startWorld(terminal);

async function waitForTerminalFont() {
  if (!document.fonts?.load) return;

  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('15px "IyagiGGCHalf"'),
        document.fonts.ready
      ]),
      new Promise((resolve) => setTimeout(resolve, FONT_LOAD_TIMEOUT_MS))
    ]);
  } catch {
    // If the webfont fails, keep the app usable with the fallback monospace stack.
  }
}

function applyTerminalProfile() {
  const nextProfile = selectTerminalProfile();
  if (nextProfile.id === activeProfile.id && terminal.cols === nextProfile.cols && terminal.rows === nextProfile.rows) {
    return;
  }

  activeProfile = nextProfile;
  terminalFrameSize = { ...activeProfile.fallbackFrame };
  syncProfileProperties();
  terminal.resize(activeProfile.cols, activeProfile.rows);
}

function selectTerminalProfile() {
  const viewport = viewportSize();
  if (viewport.width < 720 || viewport.height < 560) {
    return TERMINAL_PROFILES.compact;
  }
  return TERMINAL_PROFILES.desktop;
}

function syncProfileProperties() {
  document.documentElement.style.setProperty("--terminal-cols", String(activeProfile.cols));
  document.documentElement.style.setProperty("--terminal-rows", String(activeProfile.rows));
  document.documentElement.style.setProperty("--terminal-frame-width", `${terminalFrameSize.width}px`);
  document.documentElement.style.setProperty("--terminal-frame-height", `${terminalFrameSize.height}px`);
  terminalFrameElement?.setAttribute("aria-label", `${activeProfile.cols} by ${activeProfile.rows} terminal frame`);
}

function syncVisualViewportProperties() {
  const viewport = viewportSize();
  document.documentElement.style.setProperty("--visual-viewport-width", `${viewport.width}px`);
  document.documentElement.style.setProperty("--visual-viewport-height", `${viewport.height}px`);
  return viewport;
}

function viewportSize() {
  const visualViewport = window.visualViewport;
  return {
    width: visualViewport?.width ?? window.innerWidth,
    height: visualViewport?.height ?? window.innerHeight
  };
}
