/*
 * fol.js — liga o Preambulo (github.com/fabiolimath/Preambulo) às aulas HTML.
 *
 * Uso, no <head> da aula, DEPOIS do "window.MathJax = {...}" e ANTES do
 * <script> do MathJax:
 *
 *   <script src="https://fabiolimath.github.io/motor/fol.js"></script>
 *
 * 1. Macros: lê o motor/fol-MathJax.sty publicado (cópia do Preambulo, na
 *    versão fixada pelo submodule vendor/Preambulo) e passa ao MathJax o
 *    trecho entre "Início do bloco MathJax" e "Fim do bloco MathJax", antes
 *    da primeira tipografia. Quem espera o MathJax.startup.promise já
 *    encontra \sen, \red, \Imp, \zer, \Mat etc. definidos.
 *
 * 2. Figuras: cada <script type="text/latex"> ... </script> da página é uma
 *    figura feita com o fol-LaTeX.sty (TikZ/pgfplots), por exemplo
 *
 *      <figure><script type="text/latex">\aroxy{1}{2}{1}</script></figure>
 *
 *    Na publicação, o GitHub Actions compila cada uma para
 *    figuras/<código>.svg (ferramentas/figuras.mjs); aqui só se mostra a
 *    imagem logo depois do <script>. O <código> é um resumo do texto da
 *    figura: mudou o texto, muda a imagem. Uma figura que ainda não foi
 *    publicada aparece como um aviso com o código LaTeX.
 *
 * Tudo é retrocompatível: sem MathJax na página, só as figuras funcionam;
 * sem internet, a página segue com as macros que ela mesma definir.
 */
(function () {
  'use strict';

  var base = (document.currentScript && document.currentScript.src || '').replace(/[^\/]*$/, '');
  var FOL = window.FOL = window.FOL || {};
  FOL.base = base;

  /* ---------- resumo (cyrb53, 53 bits, em hexadecimal) ----------
     Deve ser igual ao de ferramentas/figuras.mjs. */
  function resumo(str) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
  }
  function normalizar(tex) { return tex.replace(/\r\n?/g, '\n').trim(); }
  FOL.resumo = function (tex) { return resumo(normalizar(tex)); };

  /* ---------- 1. Macros do fol-MathJax.sty ---------- */
  function extrairBloco(sty) {
    // As marcas são as linhas de %%% com o título, não a menção no cabeçalho.
    var ini = sty.search(/^%{3,}\s*In.cio do bloco MathJax\s*%+\s*$/m);
    var fim = sty.search(/^%{3,}\s*Fim do bloco MathJax\s*%+\s*$/m);
    if (ini < 0 || fim < 0) return null;
    return sty.slice(sty.indexOf('\n', ini) + 1, fim);
  }

  var styPromise = null;
  function lerSty() {
    if (!styPromise) {
      styPromise = fetch(base + 'fol-MathJax.sty', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); });
    }
    return styPromise;
  }
  if (base && window.fetch) lerSty().catch(function () {});

  FOL.carregarMacros = function () {
    return lerSty().then(function (sty) {
      var bloco = extrairBloco(sty);
      if (!bloco) throw new Error('marcas do bloco MathJax não encontradas');
      return MathJax.tex2svgPromise(bloco, { display: false }).then(function (no) {
        var erro = no.querySelector('[data-mjx-error]');
        if (erro) console.warn('[fol] erro no fol-MathJax.sty:', erro.getAttribute('data-mjx-error'));
        FOL.macros = true;
      });
    }).catch(function (e) {
      console.warn('[fol] macros do Preambulo não carregadas:', e.message || e);
      FOL.macros = false;
    });
  };

  // Engata no pageReady do MathJax (antes da primeira tipografia), preservando
  // um pageReady da própria página. O MathJax.startup.promise só se cumpre
  // depois disso, então quem espera por ele já encontra as macros.
  var cfg = window.MathJax;
  if (cfg && typeof cfg === 'object' && !cfg.version) {
    cfg.startup = cfg.startup || {};
    var pageReadyPagina = cfg.startup.pageReady;
    cfg.startup.pageReady = function () {
      return FOL.carregarMacros().then(function () {
        return pageReadyPagina ? pageReadyPagina() : MathJax.startup.defaultPageReady();
      });
    };
  }

  /* ---------- 2. Figuras LaTeX ---------- */
  function mostrarFigura(script) {
    var tex = normalizar(script.textContent);
    if (!tex) return;
    var prox = script.nextElementSibling;
    if (prox && prox.classList.contains('fol-figura')) prox.remove();   // salva pelo modo edição
    var img = document.createElement('img');
    img.className = 'fol-figura';
    img.alt = 'Figura: ' + tex;
    img.setAttribute('contenteditable', 'false');
    // O SVG vem em pontos do LaTeX; 4/3 os converte em pixels de CSS (1pt = 4/3 px),
    // para a figura ter o tamanho que teria impressa.
    img.onload = function () { if (!img.style.width) img.style.width = (img.naturalWidth * 4 / 3) + 'px'; };
    img.src = base + '../figuras/' + resumo(tex) + '.svg';
    img.onerror = function () {
      var aviso = document.createElement('pre');
      aviso.className = 'fol-figura fol-figura-pendente';
      aviso.setAttribute('contenteditable', 'false');
      aviso.title = 'A figura é gerada quando a aula é publicada no site.';
      aviso.textContent = 'Figura ainda não publicada:\n' + tex;
      img.replaceWith(aviso);
    };
    script.after(img);
  }
  FOL.figuras = function (raiz) {
    (raiz || document).querySelectorAll('script[type="text/latex"]').forEach(mostrarFigura);
  };

  var css = document.createElement('style');
  css.textContent =
    'img.fol-figura{display:block;margin:.6em auto;max-width:100%;height:auto}' +
    'pre.fol-figura-pendente{margin:.6em auto;padding:.5em .8em;border:1px dashed #c60;' +
    'color:#a40;background:#fff8ee;font-size:.8em;white-space:pre-wrap;max-width:100%}';
  document.head.appendChild(css);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { FOL.figuras(); });
  else FOL.figuras();
})();
