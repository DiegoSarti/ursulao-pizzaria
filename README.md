# Ursulão Pizzas — site

Site estático (HTML + CSS + JavaScript puro). Não precisa instalar nada.

## Estruturas

```
ursulao-pizzas/
├── index.html          → página principal
├── css/
│   └── style.css       → todo o visual (cores no topo, em :root)
├── js/
│   ├── cardapio.js     → sabores e preços (edite aqui!)
│   └── main.js         → busca, filtros, menu mobile, "aberto agora"
└── assets/img/         → logo do urso (vermelho e branco), favicon e ilustrações (SVG)
```

## Como abrir no VS Code

1. Descompacte o ZIP e abra a pasta `ursulao-pizzas` no VS Code (Arquivo → Abrir pasta).
2. Instale a extensão **Live Server** (Ritwick Dey).
3. Clique com o botão direito no `index.html` → **Open with Live Server**.

Também funciona dando dois cliques no `index.html`.

## Como editar

- **Preços/sabores:** `js/cardapio.js` — cada linha é `["Nome", "Ingredientes", precoGrande, precoBroto]`.
- **Selos ("Da casa", "Veggie"…):** objeto `SELOS` no fim do `cardapio.js`.
- **Cores:** variáveis `--red`, `--dough`, `--cream` no topo do `style.css`.
- **Fotos reais:** coloque as fotos em `assets/img/` (ex.: `pizza-ursulao.jpg`) e troque o `src` das imagens no `index.html`. Use fotos de até ~300 KB (formato .webp ou .jpg).
- **WhatsApp:** se a pizzaria tiver, troque os links `tel:+551155117173` por `https://wa.me/55119XXXXXXXX`.

## Publicar

Arraste a pasta para **Netlify Drop** (app.netlify.com/drop), ou use GitHub Pages / Vercel.
