// Sidebar Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const navItems = document.querySelectorAll('.nav-item');
    const navGroups = document.querySelectorAll('.nav-group');

    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();

        // Se a pesquisa está vazia, mostrar tudo
        if (searchTerm === '') {
            showAllItems();
            return;
        }

        // Filtrar itens do menu principal
        navItems.forEach(item => {
            // Não processar nav-dropdown aqui
            if (item.classList.contains('nav-dropdown')) return;

            const navText = item.querySelector('.nav-text');
            if (navText) {
                const text = navText.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            }
        });

        // Filtrar grupos de navegação (ex: Cadastros)
        navGroups.forEach(group => {
            const dropdownButton = group.querySelector('.nav-dropdown');
            const submenu = group.querySelector('.nav-submenu');
            const groupText = dropdownButton.querySelector('.nav-text').textContent.toLowerCase();

            let hasVisibleSubitems = false;
            let groupMatches = groupText.includes(searchTerm);
            let anySubitemMatches = false;

            // Verificar subitens
            const groupSubitems = group.querySelectorAll('.nav-subitem');
            groupSubitems.forEach(subitem => {
                const subitemText = subitem.textContent.toLowerCase();
                // Mostrar subitem se ele corresponder à pesquisa OU se o grupo corresponder
                if (subitemText.includes(searchTerm)) {
                    subitem.style.display = 'block';
                    hasVisibleSubitems = true;
                    anySubitemMatches = true;
                } else if (groupMatches) {
                    // Se o grupo corresponde, mostrar todos os subitens
                    subitem.style.display = 'block';
                    hasVisibleSubitems = true;
                } else {
                    subitem.style.display = 'none';
                }
            });

            // Mostrar grupo se houver subitens visíveis OU se o grupo corresponder
            if (hasVisibleSubitems) {
                group.style.display = 'block';

                // Se os subitens correspondem mas o grupo NÃO corresponde, esconder o botão do grupo
                if (anySubitemMatches && !groupMatches) {
                    dropdownButton.style.display = 'none';
                } else {
                    dropdownButton.style.display = 'flex';
                }

                // Expandir automaticamente quando houver resultados e forçar exibição
                dropdownButton.classList.add('open');
                submenu.style.setProperty('display', 'flex', 'important');
                submenu.style.setProperty('max-height', '1000px', 'important');
                submenu.style.setProperty('opacity', '1', 'important');
            } else {
                group.style.display = 'none';
                dropdownButton.classList.remove('open');
                submenu.style.removeProperty('display');
                submenu.style.removeProperty('max-height');
                submenu.style.removeProperty('opacity');
            }
        });
    });

    function showAllItems() {
        // Mostrar todos os itens principais
        navItems.forEach(item => {
            item.style.display = 'flex';
        });

        // Mostrar todos os grupos
        navGroups.forEach(group => {
            group.style.display = 'block';

            // Mostrar o botão do dropdown e remover classe open
            const dropdownButton = group.querySelector('.nav-dropdown');
            if (dropdownButton) {
                dropdownButton.style.display = 'flex';
                dropdownButton.classList.remove('open');
            }

            // Remover estilos inline do submenu para restaurar comportamento normal
            const submenu = group.querySelector('.nav-submenu');
            if (submenu) {
                submenu.style.removeProperty('display');
                submenu.style.removeProperty('max-height');
                submenu.style.removeProperty('opacity');
            }

            // Mostrar todos os subitens
            const groupSubitems = group.querySelectorAll('.nav-subitem');
            groupSubitems.forEach(subitem => {
                subitem.style.display = 'block';
            });
        });
    }
});
