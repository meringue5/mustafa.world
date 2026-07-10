(function registerTerminalUI(global) {
"use strict";

const RESET = "\x1b[0m";
const INPUT_ROWS = 5;
const PANEL_PADDING = 2;

function renderInputPanel({ cols, statusAnsi, candidates, candidatesAnsi, prompt, spare }) {
  const inner = frameInnerWidth(cols);

  return [
    { kind: "inputFrameTop", ansi: border(`┌${"─".repeat(inner)}┐`) },
    { kind: "status", ansi: frameAnsi(statusAnsi, cols) },
    { kind: "candidates", ansi: candidatesAnsi ? frameAnsi(candidatesAnsi, cols) : frameText("candidates", candidates, cols) },
    { kind: "prompt", ansi: frameText("prompt", prompt, cols) },
    { kind: "spare", ansi: frameBottom(spare, cols) }
  ];
}

function promptCursorColumn(prompt, cols) {
  return Math.min(frameContentColumn(displayWidth(fitText(prompt, frameContentWidth(cols)))), cols);
}

function frameInnerWidth(cols) {
  return Math.max(cols - 2, 1);
}

function frameContentWidth(cols) {
  return Math.max(frameInnerWidth(cols) - PANEL_PADDING * 2, 1);
}

function frameContentColumn(offset = 0) {
  return PANEL_PADDING + 2 + offset;
}

function renderRow(row, cols) {
  if (row.ansi) return row.ansi;
  return paint(row.kind, padRight(row.text, cols));
}

function highlightedRows(text, terms, tone, cols) {
  if (!text) return [];
  return wrapText(text, cols).map((line) => {
    const ansi = highlightTerms(line, terms, tone);
    return {
      ansi: `${ansi}${" ".repeat(Math.max(cols - displayWidth(line), 0))}${RESET}`,
      plain: line
    };
  });
}

function paint(kind, text) {
  const colors = {
    error: "\x1b[31m",
    header: "\x1b[1;37m",
    input: "\x1b[36m",
    muted: "\x1b[2m",
    placeTitle: "\x1b[1;33m",
    prompt: "\x1b[1m",
    rule: "\x1b[2m",
    candidates: "\x1b[2m",
    spare: "\x1b[2m",
    system: "\x1b[33m",
    world: "\x1b[37m"
  };

  return `${colors[kind] ?? ""}${text}${RESET}`;
}

function wrapText(text, width) {
  const lines = [];
  let line = "";

  for (const char of Array.from(text)) {
    if (char === "\n") {
      lines.push(line);
      line = "";
      continue;
    }

    if (displayWidth(line + char) > width) {
      lines.push(line);
      line = char.trimStart();
      continue;
    }

    line += char;
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function fitText(text, width) {
  let line = "";
  for (const char of Array.from(text)) {
    if (displayWidth(line + char) > width) break;
    line += char;
  }
  return line;
}

function centerText(text, width) {
  const left = Math.max(Math.floor((width - displayWidth(text)) / 2), 0);
  return fitText(`${" ".repeat(left)}${text}${" ".repeat(width)}`, width);
}

function padRight(text, width) {
  const fitted = fitText(text, width);
  return `${fitted}${" ".repeat(Math.max(width - displayWidth(fitted), 0))}`;
}

function displayWidth(text) {
  return Array.from(text).reduce((total, char) => total + charWidth(char), 0);
}

function frameText(kind, text, cols) {
  return `${border("│")}${paint(kind, `${" ".repeat(PANEL_PADDING)}${padRight(text, frameContentWidth(cols))}${" ".repeat(PANEL_PADDING)}`)}${border("│")}${RESET}`;
}

function frameAnsi(ansi, cols) {
  return `${border("│")}${" ".repeat(PANEL_PADDING)}${fitAnsi(ansi, frameContentWidth(cols))}${" ".repeat(PANEL_PADDING)}${border("│")}${RESET}`;
}

function frameBottom(text, cols) {
  const inner = frameInnerWidth(cols);
  if (!text) return border(`└${"─".repeat(inner)}┘`);

  const label = ` ${fitText(text, Math.max(inner - 2, 0))} `;
  const fill = "─".repeat(Math.max(inner - displayWidth(label), 0));
  return border(`└${label}${fill}┘`);
}

function border(text) {
  return `\x1b[90m${text}${RESET}`;
}

function fitAnsi(ansi, width) {
  const plain = stripAnsi(ansi);
  const visible = displayWidth(plain);
  if (visible >= width) return ansi;
  return `${ansi}${" ".repeat(width - visible)}`;
}

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "");
}

function highlightTerms(text, terms, tone) {
  const sortedTerms = [...new Set(terms.filter(Boolean))].sort((a, b) => displayWidth(b) - displayWidth(a));
  if (!sortedTerms.length) return text;

  let output = "";
  let index = 0;

  while (index < text.length) {
    const term = sortedTerms.find((item) => text.startsWith(item, index));
    if (!term) {
      output += text[index];
      index += 1;
      continue;
    }

    output += `${highlightColor(tone)}${term}${RESET}`;
    index += term.length;
  }

  return output;
}

function highlightColor(tone) {
  if (tone === "actor") return "\x1b[1;35m";
  if (tone === "link") return "\x1b[32m";
  return "\x1b[36m";
}

function charWidth(char) {
  const code = char.codePointAt(0);
  if (
    (code >= 0x1100 && code <= 0x11ff) ||
    (code >= 0x2e80 && code <= 0xa4cf) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xff01 && code <= 0xff60)
  ) {
    return 2;
  }
  return 1;
}

global.MustafaTerminalUI = {
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
};
})(globalThis);
