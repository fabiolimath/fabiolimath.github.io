# Materiais de aula

Site publicado em <https://fabiolimath.github.io/>.

## Estrutura

```
index.html                         página inicial
disciplinas/
  calculo3/
    index.html                     lista de materiais da disciplina
    fourier/index.html             apostila de Séries de Fourier
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

## Embutir no Moodle

```html
<iframe src="https://fabiolimath.github.io/disciplinas/calculo3/fourier/"
        title="Séries de Fourier" style="width:100%; height:85vh; border:0"
        allowfullscreen></iframe>
<p><a href="https://fabiolimath.github.io/disciplinas/calculo3/fourier/" target="_blank">Abrir em nova aba</a></p>
```
