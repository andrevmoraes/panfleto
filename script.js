// Função auxiliar para mostrar logs na página
function debugLog(mensagem) {
    console.log(mensagem);
    
    try {
        const debugArea = document.getElementById('debug-area');
        const debugLogDiv = document.getElementById('debug-log');
        
        if (!debugArea || !debugLogDiv) {
            console.error('Elementos de debug não encontrados!');
            return;
        }
        
        // Mostrar automaticamente quando houver logs
        debugArea.style.display = 'block';
        const timestamp = new Date().toLocaleTimeString();
        const newLog = `<div style="margin-bottom: 5px; color: #333;">[${timestamp}] ${mensagem}</div>`;
        debugLogDiv.innerHTML += newLog;
        debugLogDiv.scrollTop = debugLogDiv.scrollHeight;
        
        console.log('Log adicionado com sucesso:', mensagem);
    } catch (error) {
        console.error('Erro no debugLog:', error);
    }
}

// Teste inicial ao carregar a página (sem log automático)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 Página carregada - Sistema de debug ativo');
});

// Função para mostrar/ocultar debug
function toggleDebug() {
    const debugArea = document.getElementById('debug-area');
    if (debugArea.style.display === 'none') {
        debugArea.style.display = 'block';
    } else {
        debugArea.style.display = 'none';
    }
}

// Wrapper para chamar a função com log
function baixarImagemWrapper(event) {
    debugLog('🔴 BOTÃO CLICADO!');
    debugLog('🔵 Wrapper: Prestes a chamar baixarImagem');
    
    try {
        baixarImagem(event);
        debugLog('🔵 Wrapper: baixarImagem retornou');
    } catch (e) {
        debugLog('❌ Wrapper: ERRO ao chamar baixarImagem: ' + e.message);
        alert('ERRO: ' + e.message);
    }
}

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
    debugLog('🟢 ENTROU na função baixarImagem');
    
    try {
        debugLog('🔵 Dentro do try');
        debugLog('🔵 === FUNÇÃO BAIXAR IMAGEM CHAMADA ===');
        
        const canvas = document.getElementById('canvas');
        const palestrante = document.getElementById('palestrante').value.trim();
        const btn = event ? event.target : null;
        
        debugLog(`🔵 Canvas: ${canvas ? 'OK' : 'NÃO ENCONTRADO'}`);
        debugLog(`🔵 Palestrante: ${palestrante || 'VAZIO'}`);
        debugLog(`🔵 Botão: ${btn ? 'OK' : 'NÃO ENCONTRADO'}`);
        debugLog(`🔵 Event: ${event ? 'OK' : 'NULL'}`);
        
        if (!canvas) {
            debugLog('❌ ERRO CRÍTICO: Canvas não encontrado!');
            return;
        }
        
        if (!btn) {
            debugLog('❌ ERRO: Botão não encontrado no event.target');
            return;
        }
        
        debugLog(`Navegador: ${navigator.userAgent}`);
        
        // Feedback imediato
        const textoOriginal = btn.textContent;
        btn.textContent = '⏳ PREPARANDO...';
        btn.disabled = true;
        
        debugLog('🔵 Convertendo canvas para blob...');
    
    // Converter canvas para blob
    canvas.toBlob(async (blob) => {
        if (!blob) {
            debugLog('❌ ERRO: Falha ao criar blob');
            btn.textContent = '❌ ERRO';
            setTimeout(() => {
                btn.textContent = textoOriginal;
                btn.disabled = false;
            }, 2000);
            return;
        }
        
        debugLog(`✅ Blob criado: ${blob.size} bytes`);
        
        const arquivo = new File([blob], `panfleto-${palestrante.replace(/\s+/g, '-')}.png`, { 
            type: 'image/png' 
        });
        
        debugLog(`✅ File criado: ${arquivo.name} (${arquivo.size} bytes)`);
        debugLog(`🔵 navigator.share existe? ${!!navigator.share}`);
        debugLog(`🔵 navigator.canShare existe? ${!!navigator.canShare}`);
        
        // Verificar se o navegador suporta compartilhamento
        if (navigator.share) {
            // Verificar se pode compartilhar arquivos
            const podeCompartilharArquivos = navigator.canShare && navigator.canShare({ files: [arquivo] });
            debugLog(`🔵 Pode compartilhar arquivos? ${podeCompartilharArquivos}`);
            
            try {
                if (podeCompartilharArquivos) {
                    debugLog('🔵 Tentando compartilhar com arquivo...');
                    // Compartilhar com arquivo
                    await navigator.share({
                        files: [arquivo],
                        title: 'Panfleto de Palestra',
                        text: `Palestra com ${palestrante}`
                    });
                    debugLog('✅ Compartilhamento bem-sucedido!');
                } else {
                    debugLog('⚠️ Compartilhamento de arquivos não suportado');
                    debugLog('🔵 Usando fallback: download direto');
                    baixarNormalmente(canvas, palestrante, btn, textoOriginal);
                    return;
                }
                
                // Feedback visual de sucesso
                btn.textContent = '✅ COMPARTILHADO!';
                btn.style.background = '#059669';
                
                setTimeout(() => {
                    btn.textContent = textoOriginal;
                    btn.style.background = '#10b981';
                    btn.disabled = false;
                }, 2000);
                
            } catch (erro) {
                debugLog(`❌ Erro no share: ${erro.name} - ${erro.message}`);
                
                // Se cancelar o compartilhamento
                if (erro.name === 'AbortError') {
                    debugLog('⚠️ Usuário cancelou o compartilhamento');
                    btn.textContent = textoOriginal;
                    btn.disabled = false;
                } else {
                    debugLog('🔵 Usando fallback: download');
                    baixarNormalmente(canvas, palestrante, btn, textoOriginal);
                }
            }
        } else {
            debugLog('⚠️ navigator.share não disponível');
            debugLog('🔵 Usando fallback: download');
            baixarNormalmente(canvas, palestrante, btn, textoOriginal);
        }
    }, 'image/png');
    
    } catch (erro) {
        debugLog(`❌ ERRO CRÍTICO NA FUNÇÃO: ${erro.message}`);
        debugLog(`Stack: ${erro.stack}`);
        alert('ERRO: ' + erro.message);
    }
}

function baixarNormalmente(canvas, palestrante, btn, textoOriginal) {
    debugLog('🔵 Iniciando download normal...');
    
    const link = document.createElement('a');
    link.download = `panfleto-${palestrante.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    debugLog('✅ Download iniciado');
    
    // Feedback visual
    btn.textContent = '✅ SALVO!';
    btn.style.background = '#059669';
    
    setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = '#10b981';
        btn.disabled = false;
    }, 3000);
}

