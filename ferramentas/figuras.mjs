// Compila as figuras LaTeX das aulas para SVG (roda no GitHub Actions).
//
// Uso: node ferramentas/figuras.mjs <pasta do site montado> <pasta do Preambulo>
//
// Procura <script type="text/latex">...</script> em todos os .html da pasta,
// compila cada figura com pdflatex usando o fol-MathJax.sty e o fol-LaTeX.sty
// do Preambulo (o do submodule, na versão fixada) e grava
// <site>/figuras/<resumo>.svg, o mesmo nome que o motor/fol.js procura.
// Uma figura com erro vira um SVG de aviso e uma anotação no Actions, sem
// impedir a publicação do resto do site.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

// Mesmo resumo do motor/fol.js (cyrb53).
export function resumo(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}
export const normalizar = (tex) => tex.replace(/\r\n?/g, '\n').trim();

// Mesmo cabeçalho do Xournal_FOL_template.tex, sem a parte do Xournal++.
const documento = (tex) => String.raw`\documentclass[border=2pt]{standalone}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{fol-MathJax}
\usepackage{fol-LaTeX}
\begin{document}
` + tex + String.raw`
\end{document}
`;

function htmls(dir, lista = []) {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) { if (nome !== 'figuras' && !nome.startsWith('.')) htmls(p, lista); }
    else if (nome.endsWith('.html')) lista.push(p);
  }
  return lista;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svgErro = (tex) => `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="60" viewBox="0 0 420 60">
<rect x="1" y="1" width="418" height="58" fill="#fff0f0" stroke="#c00" stroke-dasharray="4 3"/>
<text x="12" y="25" font-family="sans-serif" font-size="14" fill="#c00">Erro ao compilar a figura LaTeX (veja o log do Actions)</text>
<text x="12" y="45" font-family="monospace" font-size="11" fill="#600">${esc(tex.slice(0, 60))}</text></svg>\n`;

const [site, preambulo] = process.argv.slice(2).map((p) => p && resolve(p));
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!site || !preambulo) { console.error('uso: node figuras.mjs <site> <Preambulo>'); process.exit(2); }

  const figuras = new Map();   // resumo -> { tex, onde }
  for (const arq of htmls(site)) {
    const html = readFileSync(arq, 'utf8');
    for (const m of html.matchAll(/<script\b[^>]*\btype\s*=\s*["']text\/latex["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      const tex = normalizar(m[1]);
      if (tex && !figuras.has(resumo(tex))) figuras.set(resumo(tex), { tex, onde: arq.slice(site.length + 1) });
    }
  }

  const saida = join(site, 'figuras');
  mkdirSync(saida, { recursive: true });
  const env = { ...process.env, TEXINPUTS: `${preambulo}//:` };
  let erros = 0;
  for (const [h, { tex, onde }] of figuras) {
    const tmp = mkdtempSync(join(tmpdir(), 'fig-'));
    try {
      writeFileSync(join(tmp, 'f.tex'), documento(tex));
      execFileSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', 'f.tex'], { cwd: tmp, env, stdio: 'pipe' });
      execFileSync('pdftocairo', ['-svg', 'f.pdf', join(saida, h + '.svg')], { cwd: tmp });
      console.log(`ok    ${h}.svg  (${onde})`);
    } catch (e) {
      erros++;
      let log = '';
      try { log = readFileSync(join(tmp, 'f.log'), 'utf8'); } catch {}
      const msg = (log.match(/^! .*(\n.*){0,3}/m) || [String(e.message)])[0];
      console.log(`::warning file=${onde}::Figura LaTeX com erro: ${msg.replace(/\n/g, ' ')}`);
      console.log(`ERRO  ${h}.svg  (${onde})\n${tex}\n${msg}`);
      writeFileSync(join(saida, h + '.svg'), svgErro(tex));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  console.log(`${figuras.size} figura(s), ${erros} com erro.`);
}
