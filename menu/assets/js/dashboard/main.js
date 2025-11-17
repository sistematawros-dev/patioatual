// ========================================
// TAWROS - Scripts Principais
// ========================================

class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupUserDropdown();
        this.setupTabs();
        this.setupAnimations();
        this.setupGraphTooltip();
        this.initCharts();
    }

    // ========================================
    // MENU MOBILE E SIDEBAR TOGGLE
    // ========================================
    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const body = document.body;

        // Criar overlay se não existir
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Em desktop (>768px), toggle collapsed
                if (window.innerWidth > 768) {
                    sidebar.classList.toggle('collapsed');
                    body.classList.toggle('sidebar-collapsed');

                    // Salvar preferência no localStorage
                    const isCollapsed = sidebar.classList.contains('collapsed');
                    localStorage.setItem('sidebarCollapsed', isCollapsed);

                    // Reinicializar ícones Lucide após animação
                    setTimeout(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }, 300);
                } else {
                    // Em mobile, toggle open
                    sidebar.classList.toggle('open');
                    overlay.classList.toggle('active');
                }
            });
        }

        // Restaurar estado do sidebar do localStorage
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true' && window.innerWidth > 768) {
            sidebar.classList.add('collapsed');
            body.classList.add('sidebar-collapsed');
        }

        // Ajustar comportamento em resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            } else {
                sidebar.classList.remove('collapsed');
                body.classList.remove('sidebar-collapsed');
            }
        });
    }

    // ========================================
    // DROPDOWNS - COM ANIMAÇÃO SUAVE
    // ========================================
    setupDropdowns() {
        // Dropdown da navegação
        const navDropdowns = document.querySelectorAll('.nav-dropdown');

        navDropdowns.forEach(dropdown => {
            const submenu = dropdown.nextElementSibling;

            // Prevenir propagação para não fechar ao clicar
            dropdown.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = dropdown.classList.contains('open');

                // Fechar todos os outros dropdowns
                navDropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('open');
                        const otherSubmenu = otherDropdown.nextElementSibling;
                        if (otherSubmenu && otherSubmenu.classList.contains('nav-submenu')) {
                            otherSubmenu.style.maxHeight = '0';
                            otherSubmenu.style.opacity = '0';
                        }
                    }
                });

                // Toggle do dropdown clicado
                dropdown.classList.toggle('open');

                if (submenu && submenu.classList.contains('nav-submenu')) {
                    if (!isOpen) {
                        // Abrir
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                        submenu.style.opacity = '1';
                    } else {
                        // Fechar
                        submenu.style.maxHeight = '0';
                        submenu.style.opacity = '0';
                    }
                }
            });
        });

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    // ========================================
    // USER DROPDOWN MENU
    // ========================================
    setupUserDropdown() {
        const userProfileButton = document.getElementById('userProfileButton');
        const userDropdown = document.getElementById('userDropdown');

        if (!userProfileButton || !userDropdown) return;

        // Toggle dropdown ao clicar no botão
        userProfileButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = userDropdown.classList.contains('open');

            // Toggle classes
            userDropdown.classList.toggle('open');
            userProfileButton.classList.toggle('open');
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-profile-container')) {
                userDropdown.classList.remove('open');
                userProfileButton.classList.remove('open');
            }
        });

        // Fechar dropdown ao clicar em um item
        const dropdownItems = userDropdown.querySelectorAll('.user-dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Prevenir comportamento padrão do link
                e.preventDefault();

                // Aqui você pode adicionar lógica específica para cada item
                if (item.classList.contains('logout')) {
                    console.log('Logout clicked');
                    // Adicionar lógica de logout aqui
                }

                // Fechar dropdown
                userDropdown.classList.remove('open');
                userProfileButton.classList.remove('open');
            });
        });
    }

    // ========================================
    // TABS
    // ========================================
    setupTabs() {
        // Tabs genéricos
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active de todos os tabs no mesmo grupo
                const tabGroup = tab.parentElement;
                tabGroup.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active');
                });

                // Adiciona active no tab clicado
                tab.classList.add('active');
            });
        });

        // Production tabs
        const productionTabs = document.querySelectorAll('.production-tab');
        productionTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active de todos os tabs no mesmo grupo
                const tabGroup = tab.parentElement;
                tabGroup.querySelectorAll('.production-tab').forEach(t => {
                    t.classList.remove('active');
                });

                // Adiciona active no tab clicado
                tab.classList.add('active');
            });
        });

        // Time filter buttons
        const timeFilterBtns = document.querySelectorAll('.time-filter-btn');
        timeFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active de todos os botões
                timeFilterBtns.forEach(b => b.classList.remove('active'));

                // Adiciona active no botão clicado
                btn.classList.add('active');
            });
        });
    }

    // ========================================
    // ANIMAÇÕES
    // ========================================
    setupAnimations() {
        // Animação de entrada dos cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar todos os cards
        document.querySelectorAll('.metric-card, .chart-card, .production-card, .growth-card, .suggestions-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    }

    // ========================================
    // GRAPH TOOLTIP
    // ========================================
    setupGraphTooltip() {
        const canvas = document.getElementById('engagementChart');
        const tooltip = document.getElementById('graphTooltip');
        const pointLine = document.getElementById('pointLine');

        if (!canvas || !tooltip || !pointLine) return;

        // Dados do gráfico (sincronizar com charts.js)
        const data = [10, 12, 8, 15, 10, 8, 10];
        const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
        const dates = [
            'Segunda-feira, 19 de julho de 2025',
            'Terça-feira, 20 de julho de 2025',
            'Quarta-feira, 21 de julho de 2025',
            'Quinta-feira, 22 de julho de 2025',
            'Sexta-feira, 23 de julho de 2025',
            'Sábado, 24 de julho de 2025',
            'Domingo, 25 de julho de 2025'
        ];

        // Calcular posições dos pontos
        const calculatePoints = () => {
            const paddingLeft = 35;
            const paddingRight = 15;
            const paddingTop = 15;
            const paddingBottom = 25;
            const chartWidth = canvas.offsetWidth - paddingLeft - paddingRight;
            const chartHeight = canvas.offsetHeight - paddingTop - paddingBottom;
            const maxValue = 18; // Valor máximo do gráfico

            const points = [];
            data.forEach((value, index) => {
                const x = paddingLeft + (chartWidth / (data.length - 1)) * index;
                const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
                points.push({ x, y, value, label: labels[index], date: dates[index] });
            });
            return points;
        };

        let currentPoint = null;

        // Mudar cursor ao passar sobre os pontos
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const points = calculatePoints();
            let isOverPoint = false;

            for (let point of points) {
                const distance = Math.sqrt(
                    Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                );
                // Raio de detecção de 10px para melhor usabilidade
                if (distance <= 10) {
                    isOverPoint = true;
                    break;
                }
            }

            canvas.style.cursor = isOverPoint ? 'pointer' : 'default';
        });

        // Detectar clique no ponto
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const points = calculatePoints();
            let clickedPoint = null;

            // Verificar se clicou próximo a algum ponto (raio de 10px)
            for (let point of points) {
                const distance = Math.sqrt(
                    Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                );
                if (distance <= 10) {
                    clickedPoint = point;
                    break;
                }
            }

            if (clickedPoint) {
                currentPoint = clickedPoint;

                // Atualizar conteúdo do tooltip
                tooltip.querySelector('.tooltip-date-header').textContent = clickedPoint.date;
                tooltip.querySelector('.tooltip-value-large').textContent = `${clickedPoint.value}%`;

                // Calcular mudança (simulação)
                const change = Math.floor(Math.random() * 3) + 1;
                tooltip.querySelector('.tooltip-percentage').textContent = `${change}%`;

                // Posicionar linha vertical
                const paddingTop = 15;
                const paddingBottom = 25;
                const chartHeight = canvas.offsetHeight - paddingTop - paddingBottom;

                pointLine.style.left = clickedPoint.x + 'px';
                pointLine.style.top = clickedPoint.y + 'px';
                pointLine.style.height = (paddingTop + chartHeight - clickedPoint.y) + 'px';
                pointLine.classList.add('show');

                // Posicionar tooltip acima do gráfico
                let tooltipX = clickedPoint.x + 15;
                let tooltipY = clickedPoint.y - 90;

                // Ajustar para não sair da tela (horizontal)
                const tooltipWidth = tooltip.offsetWidth || 250;
                if (tooltipX + tooltipWidth > rect.width) {
                    tooltipX = clickedPoint.x - tooltipWidth - 15;
                }

                // Garantir que fique acima do ponto
                if (tooltipY < 0) {
                    tooltipY = 10;
                }

                tooltip.style.left = tooltipX + 'px';
                tooltip.style.top = tooltipY + 'px';
                tooltip.classList.add('show');
            }
        });

        // Fechar tooltip e linha ao clicar fora
        document.addEventListener('click', (e) => {
            if (!canvas.contains(e.target) && !tooltip.contains(e.target)) {
                tooltip.classList.remove('show');
                pointLine.classList.remove('show');
                currentPoint = null;
            }
        });
    }

    // ========================================
    // INICIALIZAR GRÁFICOS
    // ========================================
    initCharts() {
        // Os gráficos serão inicializados pelo charts.js
        console.log('Dashboard inicializado');
    }
}

// ========================================
// UTILITÁRIOS
// ========================================

// Formatar números
function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

// Formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formatar porcentagem
function formatPercent(value) {
    return `${value.toFixed(2)}%`;
}

// Debounce para otimizar eventos
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();

    // Atualizar dados em tempo real (simulação)
    setInterval(() => {
        updateMetrics();
    }, 30000); // Atualiza a cada 30 segundos
});

// ========================================
// ATUALIZAÇÃO DE MÉTRICAS (Simulação)
// ========================================
function updateMetrics() {
    // Aqui você pode fazer chamadas AJAX para atualizar os dados
    // Por enquanto, apenas um log
    console.log('Atualizando métricas...', new Date().toLocaleTimeString());
}

// ========================================
// EXPORTAR FUNÇÕES ÚTEIS
// ========================================
window.Dashboard = Dashboard;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.formatPercent = formatPercent;
