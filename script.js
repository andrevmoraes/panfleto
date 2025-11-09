function gerarPanfleto() {
    // Pegar valores dos inputs
    const palestrante = document.getElementById('palestrante').value.trim();
    const data = document.getElementById('data').value.trim();
    const horario = document.getElementById('horario').value.trim();
    
    // Validação com mensagem mais clara
    if (!palestrante || !data || !horario) {
        alert('⚠️ Por favor, preencha TODOS os campos antes de continuar!');
        return;
    }
    
    // Mostrar área de preview com classe
    const previewArea = document.getElementById('preview-area');
    previewArea.classList.add('show');
    previewArea.style.display = 'block';
    
    // Pegar o canvas e contexto
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Função para desenhar todo o conteúdo
    function desenharConteudo(logoImg) {
        // ==== LOGO (com sombra igual aos textos) ====
        if (logoImg && logoImg.complete) {
            // Calcular dimensões mantendo proporção
            const maxWidth = 450;
            const maxHeight = 300;
            let width = logoImg.width;
            let height = logoImg.height;
            
            // Redimensionar mantendo proporção
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }
            
            // Centralizar horizontalmente
            const x = (canvas.width - width) / 2;
            const y = 30;
            
            // Aplicar a mesma sombra dos textos
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Desenhar a logo com sombra
            ctx.drawImage(logoImg, x, y, width, height);
        }
        
        // Manter sombra padrão para textos (já está configurada)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // ==== ÁREA CENTRAL - CONTEÚDO PRINCIPAL ====
        
        // Título PALESTRA
        ctx.fillStyle = 'white';
        ctx.font = 'bold 100px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PALESTRA', canvas.width / 2, 380);
        
        // Nome do palestrante (sem itálico, com sombra)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 75px Arial, sans-serif';
        ctx.fillText(palestrante.toUpperCase(), canvas.width / 2, 530);
        
        // ==== DATA E HORÁRIO ====
        
        // Data
        ctx.fillStyle = 'white';
        ctx.font = 'bold 90px Arial, sans-serif';
        ctx.fillText(data, canvas.width / 2, 690);
        
        // Horário
        ctx.font = 'bold 85px Arial, sans-serif';
        ctx.fillText(horario, canvas.width / 2, 800);
        
        // ==== RODAPÉ - ENDEREÇO ====
        
        // Resetar sombra temporariamente para o retângulo
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 900, canvas.width, 180);
        
        // Reativar sombra para o texto do rodapé
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RUA 13 DE MAIO, Nº140 - CENTRO', canvas.width / 2, 980);
        ctx.fillText('MOGI MIRIM / SP', canvas.width / 2, 1040);
        
        // Resetar sombra no final
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // ==== DESIGN DO PANFLETO ====
    
    // Carregar imagem de fundo
    const fundoImg = new Image();
    fundoImg.src = 'fundo.jpg'; // ou 'fundo.png' - coloque na pasta do projeto
    
    // Carregar a logo
    const logo = new Image();
    logo.src = 'logo.png';
    
    fundoImg.onerror = function() {
        // Se não tiver imagem, usa gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#5dbeeb');
        gradient.addColorStop(0.5, '#3a9ec7');
        gradient.addColorStop(1, '#2876a3');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Camada fosca/overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar conteúdo
        desenharConteudo(logo);
    };
    
    fundoImg.onload = function() {
        // Desenhar imagem de fundo cobrindo todo o canvas
        ctx.drawImage(fundoImg, 0, 0, canvas.width, canvas.height);
        
        // Overlay semi-transparente para suavizar e melhorar legibilidade do texto
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar conteúdo por cima do fundo
        desenharConteudo(logo);
    };
    
    // Scroll suave até a preview com pequeno delay para iOS
    setTimeout(() => {
        document.getElementById('preview-area').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

function baixarImagem(event) {
    const canvas = document.getElementById('canvas');
    const palestrante = document.getElementById('palestrante').value.trim();
    const btn = event.target;
    
    // Feedback imediato
    const textoOriginal = btn.textContent;
    btn.textContent = '⏳ PREPARANDO...';
    btn.disabled = true;
    
    // Converter canvas para blob
    canvas.toBlob(async (blob) => {
        const arquivo = new File([blob], `panfleto-${palestrante.replace(/\s+/g, '-')}.png`, { 
            type: 'image/png' 
        });
        
        // Verificar se o navegador suporta compartilhamento
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            try {
                await navigator.share({
                    files: [arquivo],
                    title: 'Panfleto de Palestra',
                    text: `Palestra com ${palestrante}`
                });
                
                // Feedback visual de sucesso
                btn.textContent = '✅ COMPARTILHADO!';
                btn.style.background = '#059669';
                
                setTimeout(() => {
                    btn.textContent = textoOriginal;
                    btn.style.background = '#10b981';
                    btn.disabled = false;
                }, 2000);
                
            } catch (erro) {
                // Se cancelar o compartilhamento
                if (erro.name === 'AbortError') {
                    btn.textContent = textoOriginal;
                    btn.disabled = false;
                } else {
                    console.log('Erro ao compartilhar:', erro);
                    // Fallback: baixar normalmente
                    baixarNormalmente(canvas, palestrante, btn, textoOriginal);
                }
            }
        } else {
            // Navegador não suporta compartilhamento - baixa normalmente
            baixarNormalmente(canvas, palestrante, btn, textoOriginal);
        }
    }, 'image/png');
}

function baixarNormalmente(canvas, palestrante, btn, textoOriginal) {
    const link = document.createElement('a');
    link.download = `panfleto-${palestrante.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Feedback visual
    btn.textContent = '✅ SALVO!';
    btn.style.background = '#059669';
    
    setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = '#10b981';
        btn.disabled = false;
    }, 3000);
}

function baixarImagem() {
    const canvas = document.getElementById('canvas');
    const palestrante = document.getElementById('palestrante').value.trim();
    
    // Converter canvas para imagem
    const link = document.createElement('a');
    link.download = `panfleto-${palestrante.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Feedback visual
    const btn = event.target;
    const textoOriginal = btn.textContent;
    btn.textContent = '✅ Baixado!';
    btn.style.background = '#059669';
    
    setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = '#10b981';
    }, 2000);
}
