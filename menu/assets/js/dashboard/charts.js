// ========================================
// TAWROS - Gráficos (Sem dependências externas)
// ========================================

class ChartRenderer {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.renderEngagementChart();
        this.renderDistributionChart();
        this.renderGrowthChart();
    }

    // ========================================
    // GRÁFICO DE ENGAJAMENTO
    // ========================================
    renderEngagementChart() {
        const canvas = document.getElementById('engagementChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = [10, 12, 8, 15, 10, 8, 10];
        const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

        this.drawLineChart(ctx, canvas, data, labels, '#F59E0B');
    }

    // ========================================
    // GRÁFICO DE DISTRIBUIÇÃO
    // ========================================
    renderDistributionChart() {
        const canvas = document.getElementById('distributionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = [
            { label: 'Tomate', value: 1000 },
            { label: 'Pimentão', value: 1200 },
            { label: 'Tomate', value: 700 },
            { label: 'Tomate', value: 900 },
            { label: 'Tomate', value: 500 }
        ];

        this.drawColumnChart(ctx, canvas, data);
    }

    // ========================================
    // GRÁFICO DE CRESCIMENTO
    // ========================================
    renderGrowthChart() {
        const canvas = document.getElementById('growthChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [
                { label: 'Germinação', data: [5000, 5500, 5200, 6000, 8000, 9000, 7000], color: '#0b3c49' },
                { label: 'Desenvolvimento', data: [4000, 4200, 4800, 4500, 5000, 5500, 5200], color: '#f6c03c' },
                { label: 'Transplante', data: [3000, 3500, 3200, 3800, 4200, 4500, 4000], color: '#0068ab' }
            ]
        };

        this.drawStackedBarChart(ctx, canvas, data);
    }

    // ========================================
    // DESENHAR GRÁFICO DE LINHA
    // ========================================
    drawLineChart(ctx, canvas, data, labels, color = '#2563EB') {
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const paddingLeft = 35;
        const paddingRight = 15;
        const paddingTop = 15;
        const paddingBottom = 25;
        const chartWidth = canvas.offsetWidth - paddingLeft - paddingRight;
        const chartHeight = canvas.offsetHeight - paddingTop - paddingBottom;

        // Usar 0 como valor mínimo e arredondar o máximo
        const minValue = 0;
        const maxValue = Math.ceil(Math.max(...data) / 2) * 2; // Arredondar para número par
        const range = maxValue - minValue;

        // Desenhar eixo Y com labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px "Archivo", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const ySteps = 9; // 0%, 2%, 4%, ..., 18%
        for (let i = 0; i <= ySteps; i++) {
            const value = (maxValue / ySteps) * i;
            const y = paddingTop + chartHeight - (i / ySteps) * chartHeight;

            // Desenhar label do eixo Y
            ctx.fillText(`${value.toFixed(0)}%`, paddingLeft - 8, y);

            // Desenhar linha de grade horizontal
            ctx.strokeStyle = '#f3f4f6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(paddingLeft + chartWidth, y);
            ctx.stroke();
        }

        // Calcular pontos
        const points = [];
        data.forEach((value, index) => {
            const x = paddingLeft + (chartWidth / (data.length - 1)) * index;
            const y = paddingTop + chartHeight - ((value - minValue) / range) * chartHeight;
            points.push({ x, y });
        });

        // Desenhar área preenchida (fill)
        const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)'); // Amarelo mais opaco no topo
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0.05)'); // Amarelo mais transparente embaixo

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(points[0].x, paddingTop + chartHeight); // Começar no eixo X
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.lineTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.lineTo(points[points.length - 1].x, paddingTop + chartHeight); // Voltar ao eixo X
        ctx.closePath();
        ctx.fill();

        // Desenhar linha
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // Desenhar pontos
        points.forEach(point => {
            // Círculo externo (borda branca)
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Círculo interno (cor do gráfico)
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Desenhar labels do eixo X
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px "Archivo", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        labels.forEach((label, index) => {
            const x = paddingLeft + (chartWidth / (data.length - 1)) * index;
            ctx.fillText(label, x, canvas.offsetHeight - paddingBottom + 8);
        });
    }

    // ========================================
    // DESENHAR GRÁFICO DE COLUNAS (BARRAS VERTICAIS)
    // ========================================
    drawColumnChart(ctx, canvas, data) {
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const paddingLeft = 50;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 35;
        const chartWidth = canvas.offsetWidth - paddingLeft - paddingRight;
        const chartHeight = canvas.offsetHeight - paddingTop - paddingBottom;

        const maxValue = 1200; // Valor máximo fixo
        const columnWidth = (chartWidth / data.length) * 0.7;
        const columnSpacing = (chartWidth / data.length) * 0.3;

        // Desenhar eixo Y com labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px "Archivo", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const ySteps = 6; // $0, $200, $400, $600, $800, $1.000, $1.200
        for (let i = 0; i <= ySteps; i++) {
            const value = (maxValue / ySteps) * i;
            const y = paddingTop + chartHeight - (i / ySteps) * chartHeight;

            // Label do eixo Y
            const formattedValue = value >= 1000
                ? `$${(value / 1000).toFixed(0)}.${String(value % 1000).padStart(3, '0')}`
                : `$${value}`;
            ctx.fillText(formattedValue, paddingLeft - 10, y);

            // Linha de grade horizontal
            ctx.strokeStyle = '#f3f4f6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(paddingLeft + chartWidth, y);
            ctx.stroke();
        }

        // Desenhar colunas
        data.forEach((item, index) => {
            const x = paddingLeft + index * (columnWidth + columnSpacing);
            const columnHeight = (item.value / maxValue) * chartHeight;
            const y = paddingTop + chartHeight - columnHeight;

            // Criar gradiente vertical APENAS abaixo da linha (de y até a base)
            const gradient = ctx.createLinearGradient(
                x + columnWidth / 2,
                y,                           // Início: exatamente na linha azul
                x + columnWidth / 2,
                paddingTop + chartHeight     // Fim: na base do gráfico
            );

            // Gradiente: começa com opacidade na linha e vai para transparente
            gradient.addColorStop(0, 'rgba(0, 104, 171, 0.2)');    // 20% opacidade logo abaixo da linha
            gradient.addColorStop(0.3, 'rgba(0, 104, 171, 0.1)');  // 10% opacidade
            gradient.addColorStop(1, 'rgba(0, 104, 171, 0)');      // Totalmente transparente na base

            // Desenhar APENAS a área abaixo da linha (de y até a base)
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, columnWidth, paddingTop + chartHeight - y);

            // Linha azul no topo (desenhada POR CIMA do gradiente)
            ctx.strokeStyle = '#0068ab';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + columnWidth, y);
            ctx.stroke();

            // Valor acima da linha azul
            ctx.fillStyle = '#0068ab';
            ctx.font = '600 11px "Archivo", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const formattedValue = `$${item.value.toLocaleString('pt-BR')}`;
            ctx.fillText(formattedValue, x + columnWidth / 2, y - 6);

            // Label embaixo
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px "Archivo", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(item.label, x + columnWidth / 2, canvas.offsetHeight - paddingBottom + 8);
        });
    }

    // ========================================
    // DESENHAR GRÁFICO DE BARRAS HORIZONTAIS
    // ========================================
    drawBarChart(ctx, canvas, data) {
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const padding = 40;
        const chartWidth = canvas.offsetWidth - padding * 2;
        const chartHeight = canvas.offsetHeight - padding * 2;

        const maxValue = Math.max(...data.map(d => d.value));
        const barHeight = chartHeight / data.length - 10;

        data.forEach((item, index) => {
            const barWidth = (item.value / maxValue) * chartWidth;
            const x = padding;
            const y = padding + (chartHeight / data.length) * index;

            // Desenhar barra
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Desenhar label
            ctx.fillStyle = '#6B7280';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, x, y - 5);

            // Desenhar valor
            ctx.fillStyle = '#111827';
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
            ctx.textAlign = 'right';
            ctx.fillText(item.value.toLocaleString(), canvas.offsetWidth - padding, y + barHeight / 2 + 4);
        });
    }

    // ========================================
    // DESENHAR GRÁFICO DE BARRAS EMPILHADAS
    // ========================================
    drawStackedBarChart(ctx, canvas, data) {
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        // Limpar o canvas
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        const paddingLeft = 20;
        const paddingRight = 20;
        const paddingTop = 8;
        const paddingBottom = 22;
        const chartWidth = canvas.offsetWidth - paddingLeft - paddingRight;
        const chartHeight = canvas.offsetHeight - paddingTop - paddingBottom;

        // Calcular valor máximo total
        const totals = data.labels.map((_, labelIndex) => {
            return data.datasets.reduce((sum, dataset) => sum + dataset.data[labelIndex], 0);
        });
        const maxValue = Math.max(...totals);

        // Barras mais largas com menos espaçamento (75% largura, 25% espaço)
        const barWidth = (chartWidth / data.labels.length) * 0.75;
        const barSpacing = (chartWidth / data.labels.length) * 0.25;

        data.labels.forEach((label, labelIndex) => {
            const x = paddingLeft + (chartWidth / data.labels.length) * labelIndex + barSpacing / 2;
            let cumulativeHeight = 0;

            // Desenhar barras empilhadas (de baixo para cima)
            [...data.datasets].reverse().forEach((dataset, datasetIndex) => {
                const value = dataset.data[labelIndex];
                const segmentHeight = (value / maxValue) * chartHeight;
                const y = paddingTop + chartHeight - cumulativeHeight - segmentHeight;

                ctx.fillStyle = dataset.color;

                // Se for o primeiro segmento (topo), adicionar cantos arredondados
                if (datasetIndex === 0) {
                    const radius = 4;
                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + barWidth - radius, y);
                    ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
                    ctx.lineTo(x + barWidth, y + segmentHeight);
                    ctx.lineTo(x, y + segmentHeight);
                    ctx.lineTo(x, y + radius);
                    ctx.arcTo(x, y, x + radius, y, radius);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Demais segmentos sem arredondamento
                    ctx.fillRect(x, y, barWidth, segmentHeight);
                }

                cumulativeHeight += segmentHeight;
            });

            // Desenhar label
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px "Archivo", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + barWidth / 2, canvas.offsetHeight - paddingBottom + 14);
        });
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const chartRenderer = new ChartRenderer();

    // Redimensionar gráficos quando a janela mudar de tamanho
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            chartRenderer.init();
        }, 250);
    });
});

// Exportar para uso global
window.ChartRenderer = ChartRenderer;
