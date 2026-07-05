import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { startWorld } from "./world.js";

const terminalElement = document.querySelector("#terminal");
const fontFamily = '"IyagiGGCHalf", ui-monospace, "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace';

const terminal = new Terminal({
  allowTransparency: false,
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

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(terminalElement);

function fit() {
  fitAddon.fit();
}

fit();
window.addEventListener("resize", fit);

document.fonts?.ready.then(() => {
  fit();
  terminal.refresh(0, terminal.rows - 1);
});

startWorld(terminal);
