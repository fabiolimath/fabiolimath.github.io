# Materiais de aula

Site publicado em <https://fabiolimath.github.io/>.

## Estrutura

```
index.html                         página inicial
disciplinas/
  calculo3/
    index.html                     lista de materiais da disciplina
    fourier/index.html             apostila de Séries de Fourier
motor/
  fol.js                           macros e figuras do Preambulo nas aulas
  exemplo.html                     página de teste de todas as macros e figuras
ferramentas/figuras.mjs            compila as figuras LaTeX (roda no Actions)
vendor/Preambulo/                  submodule do github.com/fabiolimath/Preambulo
vendor/Strata.viz/                 submodule do github.com/fabiolimath/Strata.viz (editor das aulas)
```

Cada material fica em uma pasta própria com um `index.html`, o que dá
endereços curtos, como `https://fabiolimath.github.io/disciplinas/calculo3/fourier/`.

## Publicação

O workflow `.github/workflows/pages.yml` publica o site sempre que um PR é
mesclado na `main` (também dá para rodar à mão em **Actions → Publicar no
GitHub Pages → Run workflow**). Só `index.html` e a pasta `disciplinas/` vão
para o ar.

Configuração única: **Settings → Pages → Build and deployment → Source:
GitHub Actions**.

## Para acrescentar um material

1. Crie a pasta, por exemplo `disciplinas/calculo3/laplace/`, com o arquivo `index.html`.
2. Acrescente o link na lista `disciplinas/calculo3/index.html`.
3. Abra um PR e mescle; em um ou dois minutos está no ar.

## Strata (editor das aulas)

As aulas são feitas com o [Strata.viz](https://github.com/fabiolimath/Strata.viz):
o arquivo da aula tem só o conteúdo, e o editor (modos leitura, apresentação e
edição) vem de `strata/strata.js` e `strata/strata.css`. O Strata entra como
submodule em `vendor/Strata.viz`, fixado num commit; na publicação, o workflow
copia os dois arquivos para `strata/`. O `<head>` de uma aula:

```html
<link rel="stylesheet" href="https://fabiolimath.github.io/strata/strata.css">
<script src="https://fabiolimath.github.io/strata/strata.js"></script>
<script src="https://fabiolimath.github.io/motor/fol.js"></script>
```

O `fol.js` vem depois do `strata.js`. Os endereços são absolutos para que uma
cópia salva no computador também funcione (com internet). As convenções do
HTML estão no README do Strata.

**Atualizar o Strata**: o Dependabot abre um PR aqui quando a `main` do
Strata.viz tiver commits novos; mesclar o PR muda a versão usada por todas as
aulas.

## Preambulo (fol-MathJax.sty e fol-LaTeX.sty)

O Preambulo entra como submodule em `vendor/Preambulo`, fixado num commit.
Na publicação, o workflow copia o `fol-MathJax.sty` para `motor/` e compila
as figuras com o `fol-LaTeX.sty`, sempre na versão fixada.

Numa aula com o Strata, basta pôr no `<head>`, depois do `strata.js` (numa
página sem o Strata, depois do `window.MathJax = {...}` e antes do `<script>`
do MathJax):

```html
<script src="https://fabiolimath.github.io/motor/fol.js"></script>
```

- **Macros**: o trecho entre "Início do bloco MathJax" e "Fim do bloco
  MathJax" do `fol-MathJax.sty` é passado ao MathJax antes da primeira
  tipografia. `\sen`, `\red`, `\Imp`, `\zer`, `\Mat`, `ea` etc. passam a valer.
- **Figuras**: cada figura é um bloco
  `<figure><script type="text/latex">\aroxy{1}{2}{1}</script></figure>`, com
  qualquer código LaTeX (macros do `fol-LaTeX.sty`, `tikzpicture`, `axis`...).
  Na publicação ela vira `figuras/<código>.svg` e a aula mostra a imagem.
  Uma figura nova aparece como aviso até a próxima publicação; uma figura
  com erro vira um quadro vermelho e um aviso no log do Actions.

**Atualizar o Preambulo**: o Dependabot abre um PR aqui quando a `main` do
Preambulo tiver commits novos. Mesclar o PR muda a versão usada pelas aulas.

## Embutir no Moodle

```html
<iframe src="https://fabiolimath.github.io/disciplinas/calculo3/fourier/"
        title="Séries de Fourier" style="width:100%; height:85vh; border:0"
        allowfullscreen></iframe>
<p><a href="https://fabiolimath.github.io/disciplinas/calculo3/fourier/" target="_blank">Abrir em nova aba</a></p>
```
