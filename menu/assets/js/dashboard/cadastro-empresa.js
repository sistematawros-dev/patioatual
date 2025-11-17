// ========================================
// CADASTRO DE EMPRESA - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // === COLLAPSIBLE SECTIONS ===
    const collapsibleHeaders = document.querySelectorAll('.section-header-collapsible');

    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;

            if (content && content.classList.contains('section-content')) {
                if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            }
        });
    });

    // === FORM SUBMISSION ===
    const saveButton = document.querySelector('.form-actions .btn-primary');

    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();

            // Aqui você pode adicionar validação do formulário
            const formData = collectFormData();
            console.log('Dados do formulário:', formData);

            // Simular salvamento
            alert('Cadastro salvo com sucesso!');
            // window.location.href = './pessoas-empresas.html';
        });
    }

    // === COLLECT FORM DATA ===
    function collectFormData() {
        const tipo = document.querySelector('input[name="tipo"]:checked')?.value;

        return {
            tipo: tipo,
            razaoSocial: document.querySelector('input[placeholder="Nome Empresa"]')?.value,
            cnpj: document.querySelector('input[placeholder="00.000.000/0000-00"]')?.value,
            inscricaoEstadual: document.querySelector('input[placeholder="Inscrição Estadual"]')?.value,
            endereco: document.querySelector('input[placeholder="Rua"]')?.value,
            numero: document.querySelector('input[placeholder="00"]')?.value,
            complemento: document.querySelector('input[placeholder="Casa"]')?.value,
            bairro: document.querySelector('input[placeholder="Bairro"]')?.value,
            logradouro: document.querySelector('input[placeholder="Logradouro"]')?.value,
            uf: document.querySelector('input[placeholder="UF"]')?.value,
            cidade: document.querySelector('input[placeholder="Cidade"]')?.value,
            responsavel: document.querySelector('input[placeholder="Nome Responsável"]')?.value,
            telefone: document.querySelector('input[placeholder="(XX) XXXXX-XXXX"]')?.value,
            email: document.querySelector('input[type="email"]')?.value,
            observacoes: document.querySelector('textarea')?.value
        };
    }

    // === INPUT MASKS ===

    // CNPJ Mask
    const cnpjInput = document.querySelector('input[placeholder="00.000.000/0000-00"]');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length <= 14) {
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            }

            e.target.value = value;
        });
    }

    // Phone Mask
    const phoneInput = document.querySelector('input[placeholder="(XX) XXXXX-XXXX"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }

            e.target.value = value;
        });
    }

    // UF Mask (uppercase)
    const ufInput = document.querySelector('input[placeholder="UF"]');
    if (ufInput) {
        ufInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        });
    }

    // === RADIO BUTTON CHANGE ===
    const radioButtons = document.querySelectorAll('input[name="tipo"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('Tipo selecionado:', this.value);

            // Atualizar estilos dos labels no tipo-group
            const radioGroupContainer = this.closest('.radio-group-container');
            if (radioGroupContainer) {
                const allLabels = radioGroupContainer.querySelectorAll('.radio-label');
                allLabels.forEach(label => {
                    label.style.background = 'transparent';
                    label.style.color = 'var(--figma-text-secondary, #6b7280)';
                });

                const currentLabel = this.closest('.radio-label');
                if (currentLabel) {
                    currentLabel.style.background = 'var(--figma-surface-secondary, #f3f4f6)';
                    currentLabel.style.color = 'var(--figma-text-primary, #111827)';
                }
            }

            // Aqui você pode adicionar lógica para mostrar/esconder campos
            // baseado no tipo selecionado (Pessoa ou Empresa)
        });

        // Aplicar estilo inicial ao radio selecionado
        if (radio.checked) {
            const radioGroupContainer = radio.closest('.radio-group-container');
            if (radioGroupContainer) {
                const currentLabel = radio.closest('.radio-label');
                if (currentLabel) {
                    currentLabel.style.background = 'var(--figma-surface-secondary, #f3f4f6)';
                    currentLabel.style.color = 'var(--figma-text-primary, #111827)';
                }
            }
        }
    });
});
