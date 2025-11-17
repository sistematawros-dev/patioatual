// ========================================
// CONFIGURAÇÃO E RENDERIZAÇÃO DOS MENUS
// ========================================
const sidebarMenuItems = [
    {
        type: 'link',
        label: 'Painel',
        icon: 'house',
        href: './menu.html'
    },
    {
        type: 'group',
        label: 'Cadastros',
        icon: 'list',
        items: [
            {
                label: 'Pessoas e Empresas',
                href: './pessoas-empresas.html'
            },
            {
                label: 'Produtos e Serviços',
                href: './produtos-servicos.html'
            }
        ]
    },


    {
        type: 'link',
        label: 'BI e Relatórios',
        icon: 'chart-no-axes-combined',
        href: '#'
    },
    {
        type: 'group',
        label: 'Patio',
        icon: 'list',
        items: [
            {
                label: 'Agenda',
                href: './Agenda.html'
            },
            {
                label: 'Agendamento',
                href: './Agendamento.html'
            },
            {
                label: 'CPF/CNPJ',
                href: './CPFCNPJ.html'
            },
            {
                label: 'Instruções',
                href: './Instrucoes.html'
            },
            {
                label: 'Patio',
                href: './Controlepatio.html'
            },
            {
                label: 'Veiculos',
                href: './Veiculos.html'
            },
            {
                label: 'Usuários',
                href: './Acessos.html'
            }
        ]
    }
];

function createNavLink(item) {
    const link = document.createElement('a');
    link.className = 'nav-item';
    link.href = item.href || '#';

    if (item.target) {
        link.target = item.target;
    }

    if (item.icon) {
        const icon = document.createElement('i');
        icon.dataset.lucide = item.icon;
        icon.className = 'nav-icon';
        link.appendChild(icon);
    }

    const text = document.createElement('span');
    text.className = 'nav-text';
    text.textContent = item.label || '';
    link.appendChild(text);

    return link;
}

function createNavGroup(group) {
    if (!Array.isArray(group.items) || group.items.length === 0) {
        return document.createDocumentFragment();
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'nav-group';

    const button = document.createElement('button');
    button.className = 'nav-item nav-dropdown';

    const content = document.createElement('div');
    content.className = 'nav-item-content';

    if (group.icon) {
        const icon = document.createElement('i');
        icon.dataset.lucide = group.icon;
        icon.className = 'nav-icon';
        content.appendChild(icon);
    }

    const text = document.createElement('span');
    text.className = 'nav-text';
    text.textContent = group.label || '';
    content.appendChild(text);

    button.appendChild(content);

    const arrow = document.createElement('i');
    arrow.dataset.lucide = group.dropdownIcon || 'chevron-down';
    arrow.className = 'dropdown-arrow';
    button.appendChild(arrow);

    const submenu = document.createElement('div');
    submenu.className = 'nav-submenu';

    group.items.forEach((subitem) => {
        const subLink = document.createElement('a');
        subLink.className = 'nav-subitem';
        subLink.href = subitem.href || '#';
        subLink.textContent = subitem.label || '';

        if (subitem.target) {
            subLink.target = subitem.target;
        }

        submenu.appendChild(subLink);
    });

    wrapper.appendChild(button);
    wrapper.appendChild(submenu);

    return wrapper;
}

function renderSidebarMenu(items, targetSelector = '.sidebar-nav') {
    const container = document.querySelector(targetSelector);

    if (!container) {
        console.warn('Sidebar navigation container not found.');
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
        if (item.type === 'group') {
            fragment.appendChild(createNavGroup(item));
        } else {
            fragment.appendChild(createNavLink(item));
        }
    });

    container.innerHTML = '';
    container.appendChild(fragment);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderSidebarMenu(sidebarMenuItems);
});

window.sidebarMenuItems = sidebarMenuItems;
window.renderSidebarMenu = renderSidebarMenu;
