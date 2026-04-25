import React from 'react';
import { View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

interface MathTextProps {
  content: string;
  color?: string;
  fontSize?: number;
  containerStyle?: any;
}

/**
 * Safety net: wraps bare LaTeX commands (e.g. \frac{a}{b}) in $...$ delimiters
 * if they aren't already inside math delimiters.
 * Adapted from Skeeme's MathText component.
 */
function wrapBareLaTeX(text: string): string {
  if (!text) return '';
  const latexCmds = [
    'frac', 'text', 'sqrt', 'sum', 'prod', 'int', 'lim', 'log', 'ln',
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'times', 'cdot', 'div',
    'pm', 'mp', 'leq', 'geq', 'neq', 'approx', 'equiv', 'infty',
    'partial', 'nabla', 'alpha', 'beta', 'gamma', 'delta', 'epsilon',
    'theta', 'lambda', 'mu', 'sigma', 'omega', 'pi', 'phi', 'psi',
    'Delta', 'Gamma', 'Omega', 'Sigma', 'mathrm', 'mathbf',
    'operatorname', 'left', 'right', 'displaystyle', 'overline',
    'underline', 'hat', 'bar', 'vec', 'dot', 'ddot', 'tilde',
    'binom', 'choose', 'mod', 'pmod'
  ];

  const cmdPattern = new RegExp(
    '^\\\\(' + latexCmds.join('|') + ')(?=[^a-zA-Z]|$)'
  );

  let result = '';
  let inDollar = false;
  let inDoubleDollar = false;
  let i = 0;

  while (i < text.length) {
    if (text[i] === '$' && i + 1 < text.length && text[i + 1] === '$') {
      inDoubleDollar = !inDoubleDollar;
      result += '$$';
      i += 2;
      continue;
    }

    if (text[i] === '$' && !inDoubleDollar) {
      inDollar = !inDollar;
      result += '$';
      i++;
      continue;
    }

    if (inDollar || inDoubleDollar) {
      result += text[i];
      i++;
      continue;
    }

    if (text[i] === '\\') {
      const remaining = text.substring(i);
      const cmdMatch = remaining.match(cmdPattern);

      if (cmdMatch) {
        let exprEnd = i + cmdMatch[0].length;
        while (exprEnd < text.length && text[exprEnd] === '{') {
          let depth = 0;
          for (let j = exprEnd; j < text.length; j++) {
            if (text[j] === '{') depth++;
            else if (text[j] === '}') {
              depth--;
              if (depth === 0) { exprEnd = j + 1; break; }
            }
          }
          if (exprEnd === i + cmdMatch[0].length) break;
        }

        while (exprEnd < text.length && (text[exprEnd] === '_' || text[exprEnd] === '^')) {
          exprEnd++;
          if (exprEnd < text.length && text[exprEnd] === '{') {
            let depth2 = 0;
            for (let k = exprEnd; k < text.length; k++) {
              if (text[k] === '{') depth2++;
              else if (text[k] === '}') {
                depth2--;
                if (depth2 === 0) { exprEnd = k + 1; break; }
              }
            }
          } else if (exprEnd < text.length && text[exprEnd] !== ' ') {
            exprEnd++;
          }
        }

        result += '$' + text.substring(i, exprEnd) + '$';
        i = exprEnd;
        continue;
      }
    }

    result += text[i];
    i++;
  }

  return result;
}

/**
 * Build the WebView JS as a plain string (not a template literal)
 * to avoid escaping nightmares with nested backticks and regex.
 */
function buildScript(encodedContent: string): string {
  return [
    'var rawContent = decodeURIComponent("' + encodedContent + '");',
    '',
    'function formatContent(text) {',
    '  if (!text) return "";',
    '  var clean = text.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");',
    '  var blocks = clean.split(/\\n\\n+/);',
    '  var out = "";',
    '  for (var b = 0; b < blocks.length; b++) {',
    '    var block = blocks[b].trim();',
    '    if (!block) continue;',
    '    var lines = block.split(/\\n/);',
    '    for (var i = 0; i < lines.length; i++) {',
    '      var line = lines[i].trim();',
    '      if (!line) continue;',
    '      var numMatch = line.match(/^(\\d+)[.):] +(.*)/);',
    '      var bulletMatch = line.match(/^[\\-\\*\\u2022]\\s+(.*)/);',
    '      var h3Match = line.match(/^### +(.*)/);',
    '      var h2Match = line.match(/^## +(.*)/);',
    '      var h1Match = line.match(/^# +(.*)/);',
    '      if (h3Match) {',
    '        out += \'<h3>\' + formatInline(h3Match[1]) + \'</h3>\';',
    '      } else if (h2Match) {',
    '        out += \'<h2>\' + formatInline(h2Match[1]) + \'</h2>\';',
    '      } else if (h1Match) {',
    '        out += \'<h1>\' + formatInline(h1Match[1]) + \'</h1>\';',
    '      } else if (numMatch) {',
    '        out += \'<div class="list-item"><div class="list-index">\' + numMatch[1] + \'</div><div class="list-content">\' + formatInline(numMatch[2]) + \'</div></div>\';',
    '      } else if (bulletMatch) {',
    '        out += \'<div class="list-item"><div class="bullet-dot">\\u2022</div><div class="list-content">\' + formatInline(bulletMatch[1]) + \'</div></div>\';',
    '      } else {',
    '        out += \'<div class="para">\' + formatInline(line) + \'</div>\';',
    '      }',
    '    }',
    '  }',
    '  return out;',
    '}',
    '',
    'function formatInline(t) {',
    '  if (!t) return "";',
    '  t = t.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>");',
    '  t = t.replace(/\\*([^*]+?)\\*/g, "<em>$1</em>");',
    '  return t;',
    '}',
    '',
    'document.getElementById("math-container").innerHTML = formatContent(rawContent);',
    '',
    'var lastH = 0;',
    'function sendHeight() {',
    '  var c = document.getElementById("math-container");',
    '  if (!c) return;',
    '  var h = c.offsetHeight;',
    '  if (Math.abs(h - lastH) > 1 && h > 0) {',
    '    lastH = h;',
    '    window.ReactNativeWebView.postMessage(JSON.stringify({ height: h }));',
    '  }',
    '}',
    '',
    'sendHeight();',
    '',
    'document.addEventListener("DOMContentLoaded", function() {',
    '  if (window.renderMathInElement) {',
    '    renderMathInElement(document.getElementById("math-container"), {',
    '      delimiters: [',
    '        {left: "$$", right: "$$", display: true},',
    '        {left: "\\\\[", right: "\\\\]", display: true},',
    '        {left: "$", right: "$", display: false},',
    '        {left: "\\\\(", right: "\\\\)", display: false}',
    '      ],',
    '      throwOnError: false',
    '    });',
    '    setTimeout(sendHeight, 150);',
    '    setTimeout(sendHeight, 600);',
    '  }',
    '});',
    '',
    'var obs = new MutationObserver(sendHeight);',
    'obs.observe(document.getElementById("math-container"), { childList: true, subtree: true, characterData: true });',
    'window.addEventListener("load", function() { setTimeout(sendHeight, 300); });',
  ].join('\n');
}

/**
 * MathText — renders text content with LaTeX math support via KaTeX.
 * Uses a WebView with locally-bundled KaTeX assets for offline support.
 * Adapted from Skeeme's MathText component.
 */
function MathTextInner({
  content = '',
  color,
  fontSize = 16,
  containerStyle
}: MathTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const resolvedColor = color || (isDark ? '#FFFFFF' : '#4B4B4B');
  const strongColor = isDark ? '#FFFFFF' : '#000000';

  const [height, setHeight] = React.useState(24);
  const processedContent = React.useMemo(() => wrapBareLaTeX(content), [content]);
  const encodedContent = React.useMemo(() => encodeURIComponent(processedContent), [processedContent]);

  // Check if content has any potential math or markdown — if not, skip expensive WebView
  const hasMath = React.useMemo(() => {
    return /[\$\\#\*\-]/.test(content) || /^\s*\d+\.\s/m.test(content) || /[²³⁴⁵⁶⁷⁸⁹⁰₀₁₂₃₄₅₆₇₈₉]/.test(content);
  }, [content]);

  // For plain text without math, render natively for performance
  if (!hasMath) {
    const RNText = require('react-native').Text;
    return (
      <RNText
        style={[
          { color: resolvedColor, fontSize, lineHeight: fontSize * 1.6, fontWeight: '700' },
          containerStyle
        ]}
      >
        {content}
      </RNText>
    );
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; background-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: ${resolvedColor};
      font-size: ${fontSize}px;
      font-weight: 700;
      word-wrap: break-word;
      overflow: hidden;
      line-height: 1.75;
    }
    #math-container { padding: 4px 0; }
    .para { margin: 0 0 0.9em 0; }
    .para:last-child { margin-bottom: 0; }
    .list-item { display: flex; align-items: flex-start; margin: 0.6em 0; }
    .list-index {
      flex-shrink: 0; width: 22px; height: 22px; border-radius: 11px;
      background-color: rgba(88, 204, 2, 0.1); color: #58CC02;
      font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      margin-right: 10px; margin-top: 2px;
    }
    .bullet-dot {
      flex-shrink: 0; width: 22px; text-align: center;
      font-weight: 900; color: ${resolvedColor}; opacity: 0.5; margin-right: 10px;
    }
    .list-content { flex: 1; line-height: 1.7; }
    .katex { font-size: 1.05em; }
    .katex-display { text-align: left !important; margin: 0.8em 0; padding-left: 0; }
    .katex-display > .katex { text-align: left !important; display: inline-block; }
    strong, b { font-weight: 900; color: ${strongColor}; }
    em, i { font-style: italic; }
    h1, h2, h3 { color: ${strongColor}; margin: 1.5em 0 0.5em 0; line-height: 1.3; font-weight: 900; }
    h1 { font-size: 1.7em; }
    h2 { font-size: 1.4em; }
    h3 { font-size: 1.25em; }
  </style>
</head>
<body>
  <div id="math-container"></div>
  <script>${buildScript(encodedContent)}</script>
</body>
</html>`;

  return (
    <View style={[{ height: Math.max(height, 24), width: '100%' }, containerStyle]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.height) {
              setHeight(Math.ceil(data.height) + 8);
            }
          } catch { }
        }}
      />
    </View>
  );
}

export const MathText = React.memo(MathTextInner);
