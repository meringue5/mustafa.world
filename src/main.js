import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { startWorld } from "./world.js";

const terminalElement = document.querySelector("#terminal");
const fontFamily = '"IyagiGGCHalf", ui-monospace, "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace';
const TERMINAL_PROFILE = {
  cols: 132,
  rows: 50,
  minScale: 0.45,
  maxScale: 1.2
};
const FALLBACK_FRAME_WIDTH = 1220;
const FALLBACK_FRAME_HEIGHT = 930;
const STAGE_MARGIN = 32;
const FONT_LOAD_TIMEOUT_MS = 3000;
let terminalFrameSize = {
  width: FALLBACK_FRAME_WIDTH,
  height: FALLBACK_FRAME_HEIGHT
};
const terminalFrameElement = document.querySelector("#terminal-frame");

const terminal = new Terminal({
  allowTransparency: false,
  cols: TERMINAL_PROFILE.cols,
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
  rows: TERMINAL_PROFILE.rows,
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
terminal.open(terminalElement);
terminal.resize(TERMINAL_PROFILE.cols, TERMINAL_PROFILE.rows);

function updateStageScale() {
  const widthScale = (window.innerWidth - STAGE_MARGIN) / terminalFrameSize.width;
  const heightScale = (window.innerHeight - STAGE_MARGIN) / terminalFrameSize.height;
  const scale = Math.min(widthScale, heightScale, TERMINAL_PROFILE.maxScale);
  document.documentElement.style.setProperty("--terminal-scale", String(Math.max(scale, TERMINAL_PROFILE.minScale)));
}

function syncTerminalFrame() {
  terminal.resize(TERMINAL_PROFILE.cols, TERMINAL_PROFILE.rows);

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
  updateStageScale();
  requestAnimationFrame(syncTerminalFrame);
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
