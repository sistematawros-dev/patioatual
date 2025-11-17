# Tawros Dashboard

Dashboard profissional desenvolvido com HTML, CSS e JavaScript puro, baseado no design do Figma.

## Estrutura do Projeto

```
project/
├── index.html              # Página principal
├── styles/
│   ├── variables.css       # Variáveis CSS (cores, tipografia, espaçamentos)
│   ├── components.css      # Componentes reutilizáveis
│   └── main.css           # Layout principal e responsividade
├── scripts/
│   ├── main.js            # Scripts principais
│   └── charts.js          # Renderização de gráficos
├── assets/
│   ├── logo.svg           # Logo da aplicação
│   └── avatar.jpg         # Avatar do usuário
└── README.md
```

## Sistema de Design Componentizado

### Variáveis CSS (variables.css)

Todas as variáveis do design system estão centralizadas para fácil manutenção:

- **Cores**: Primárias, status, neutras, fundos, textos e bordas
- **Tipografia**: Famílias de fonte, tamanhos, pesos e alturas de linha
- **Espaçamentos**: Sistema de espaçamento consistente (xs até 4xl)
- **Border Radius**: Arredondamentos padronizados
- **Sombras**: Níveis de elevação (xs, sm, md, lg, xl)
- **Transições**: Velocidades de animação
- **Layout**: Dimensões da sidebar, header, etc.

### Componentes Reutilizáveis (components.css)

Componentes que podem ser usados em qualquer página:

#### Botões
```html
<button class="btn btn-primary">Botão Primário</button>
<button class="btn btn-secondary">Botão Secundário</button>
<button class="btn btn-ghost">Botão Ghost</button>
<button class="icon-button">🔔</button>
```

#### Inputs
```html
<input type="text" class="input" placeholder="Digite algo...">
<input type="text" class="search-input" placeholder="Buscar...">
```

#### Cards
```html
<div class="card">
    Conteúdo do card
</div>

<div class="metric-card">
    <div class="metric-header">
        <span class="metric-label">Taxa de crescimento</span>
        <button class="more-button">⋮</button>
    </div>
    <div class="metric-content">
        <div class="metric-value">21,42%</div>
        <div class="metric-change positive">
            <span class="change-arrow">↑</span>
            <span class="change-value">0,2%</span>
            <span class="change-period">vs. mês anterior</span>
        </div>
    </div>
</div>
```

#### Progress Bar
```html
<div class="progress-bar-container">
    <div class="progress-bar" style="width: 75%;">
        <span class="progress-label">75%</span>
    </div>
</div>
```

#### Badges
```html
<span class="badge badge-success">Sucesso</span>
<span class="badge badge-warning">Aviso</span>
<span class="badge badge-danger">Erro</span>
<span class="badge badge-info">Info</span>
```

#### Tabs
```html
<div class="tabs">
    <button class="tab active">Tab 1</button>
    <button class="tab">Tab 2</button>
    <button class="tab">Tab 3</button>
</div>
```

#### Avatar
```html
<img src="avatar.jpg" class="avatar" alt="Usuário">
<img src="avatar.jpg" class="avatar avatar-sm" alt="Usuário">
<img src="avatar.jpg" class="avatar avatar-lg" alt="Usuário">
```

### Classes Utilitárias

```html
<!-- Tamanhos de texto -->
<p class="text-xs">Texto extra pequeno</p>
<p class="text-sm">Texto pequeno</p>
<p class="text-base">Texto normal</p>
<p class="text-lg">Texto grande</p>

<!-- Cores de texto -->
<p class="text-primary">Texto primário</p>
<p class="text-secondary">Texto secundário</p>
<p class="text-tertiary">Texto terciário</p>

<!-- Pesos de fonte -->
<p class="font-normal">Normal</p>
<p class="font-medium">Médio</p>
<p class="font-semibold">Semi-negrito</p>
<p class="font-bold">Negrito</p>

<!-- Flexbox -->
<div class="flex items-center justify-between gap-lg">
    Conteúdo
</div>
```

## Responsividade

O layout é totalmente responsivo com breakpoints em:

- **Mobile**: até 640px
- **Tablet Portrait**: 768px
- **Tablet Landscape**: 1024px
- **Desktop**: 1280px+

### Comportamento Mobile

- Menu lateral se transforma em menu off-canvas
- Grid de métricas vira coluna única
- Gráficos se adaptam à largura da tela
- Botão de menu hambúrguer aparece
- Overlay escurece o fundo quando menu está aberto

## JavaScript

### Funcionalidades Implementadas

1. **Menu Mobile**: Toggle da sidebar com overlay
2. **Dropdowns**: Sistema de dropdowns interativos
3. **Tabs**: Sistema de abas
4. **Animações**: Fade-in dos cards ao scrollar
5. **Gráficos**: Renderização de gráficos sem bibliotecas externas

### Funções Utilitárias

```javascript
// Formatar números
formatNumber(1234567); // "1.234.567"

// Formatar moeda
formatCurrency(1234.56); // "R$ 1.234,56"

// Formatar porcentagem
formatPercent(21.42); // "21,42%"
```

## Como Usar em Outras Páginas

### 1. Incluir os arquivos CSS e JS

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <link rel="stylesheet" href="styles/variables.css">
    <link rel="stylesheet" href="styles/components.css">
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <!-- Seu conteúdo -->

    <script src="scripts/charts.js"></script>
    <script src="scripts/main.js"></script>
</body>
</html>
```

### 2. Usar os componentes

Copie a estrutura da sidebar e header do `index.html` e use os componentes do `components.css` para criar seu conteúdo.

### 3. Customizar cores

Edite as variáveis em `styles/variables.css` para mudar o esquema de cores:

```css
:root {
    --primary-blue: #2563EB;  /* Mude para sua cor primária */
    --success-green: #10B981; /* Cor de sucesso */
    /* ... */
}
```

## Recursos Adicionais

### Tema Escuro

O arquivo `variables.css` já inclui suporte a tema escuro via `prefers-color-scheme`. Para implementar um toggle manual, adicione uma classe ao body:

```javascript
document.body.classList.toggle('dark-mode');
```

E ajuste as variáveis CSS conforme necessário.

### Gráficos

Os gráficos são renderizados com Canvas API. Para adicionar novos gráficos:

1. Adicione um canvas no HTML: `<canvas id="meuGrafico"></canvas>`
2. Crie uma função de renderização em `scripts/charts.js`
3. Use os métodos existentes como exemplo

### Integração com Backend

Para conectar com uma API:

```javascript
// Exemplo de atualização de métricas
async function updateMetrics() {
    try {
        const response = await fetch('/api/metrics');
        const data = await response.json();

        // Atualizar DOM com os dados
        document.querySelector('.metric-value').textContent = data.value;
    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
    }
}
```

## Próximos Passos

1. Adicionar seus próprios assets (logo.svg, avatar.jpg) na pasta `assets/`
2. Substituir dados mockados por dados reais da sua API
3. Personalizar cores e estilos conforme sua identidade visual
4. Adicionar novas páginas usando os mesmos componentes
5. Implementar autenticação e rotas conforme necessário

## Suporte a Navegadores

- Chrome/Edge (últimas 2 versões)
- Firefox (últimas 2 versões)
- Safari (últimas 2 versões)
- iOS Safari 12+
- Chrome Android (última versão)

## Licença

Este projeto foi desenvolvido para uso interno da Tawros.
