import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { startWorld } from "./world.js";

const terminalElement = document.querySelector("#terminal");
const fontFamily = '"IyagiGGCHalf", ui-monospace, "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace';
const TERMINAL_COLS = 132;
const TERMINAL_ROWS = 50;
const TERMINAL_FRAME_WIDTH = 1220;
const TERMINAL_FRAME_HEIGHT = 778;
const STAGE_MARGIN = 32;

const terminal = new Terminal({
  allowTransparency: false,
  cols: TERMINAL_COLS,
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
  rows: TERMINAL_ROWS,
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

terminal.open(terminalElement);
terminal.resize(TERMINAL_COLS, TERMINAL_ROWS);

function updateStageScale() {
  const widthScale = (window.innerWidth - STAGE_MARGIN) / TERMINAL_FRAME_WIDTH;
  const heightScale = (window.innerHeight - STAGE_MARGIN) / TERMINAL_FRAME_HEIGHT;
  const scale = Math.min(widthScale, heightScale, 1);
  document.documentElement.style.setProperty("--terminal-scale", String(Math.max(scale, 0.45)));
}

updateStageScale();
window.addEventListener("resize", updateStageScale);

document.fonts?.ready.then(() => {
  terminal.resize(TERMINAL_COLS, TERMINAL_ROWS);
  updateStageScale();
  terminal.refresh(0, terminal.rows - 1);
});

startWorld(terminal);
