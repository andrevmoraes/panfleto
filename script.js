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
        debugArea.classList.add('show');
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

    const campoData = document.getElementById('data');
    if (campoData) {
        campoData.type = 'date';
        const hoje = new Date();
        const diaSemana = hoje.getDay(); // 0 domingo .. 6 sábado
        const diasAteSegunda = ((8 - diaSemana) % 7) || 7;
        const proximaSegunda = new Date(hoje);
        proximaSegunda.setDate(hoje.getDate() + diasAteSegunda);

        const ano = proximaSegunda.getFullYear();
        const mes = String(proximaSegunda.getMonth() + 1).padStart(2, '0');
        const dia = String(proximaSegunda.getDate()).padStart(2, '0');
        campoData.value = `${ano}-${mes}-${dia}`;
    }
});

// Função para mostrar/ocultar debug
function toggleDebug() {
    const debugArea = document.getElementById('debug-area');
    if (!debugArea) {
        return;
    }
    debugArea.classList.toggle('show');
}

function formatarHorarioParaPanfleto(valor) {
    if (!valor) {
        return '';
    }

    const normalizado = valor.trim();

    if (normalizado.includes('h') || normalizado.includes('H')) {
        return normalizado.replace('H', 'h');
    }

    const partes = normalizado.split(':');
    if (partes.length >= 2) {
        const [hora, minuto] = partes;
        if (hora !== '' && minuto !== '') {
            return `${hora}h${minuto}`;
        }
    }

    return normalizado;
}

function formatarDataParaPanfleto(valor) {
    if (!valor) {
        return '';
    }

    const normalizado = valor.trim();

    if (/\d{2}\/\d{2}\/\d{4}/.test(normalizado)) {
        return normalizado;
    }

    const partes = normalizado.split('-');
    if (partes.length === 3) {
        const [ano, mes, dia] = partes;
        if (ano && mes && dia) {
            return `${dia}/${mes}/${ano}`;
        }
    }

    return normalizado;
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
    const dataRaw = document.getElementById('data').value.trim();
    const dataTexto = formatarDataParaPanfleto(dataRaw);
    const horarioValor = document.getElementById('horario').value.trim();
    const horarioTexto = formatarHorarioParaPanfleto(horarioValor);
    
    // Validação com mensagem mais clara
    if (!palestrante || !dataRaw || !horarioValor) {
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
    
    let fundoDisponivel = false;
    let logoDisponivel = false;

    // Função para desenhar todo o conteúdo
    function desenharConteudo(logoImg) {
    const associacaoTexto = 'ASSOCIAÇÃO ESPÍRITA JESUS E CARIDADE';
    const tituloPrincipal = 'Juca de Andrade';
    let cabecalhoBottom = 0;

        const maxLinhaLargura = canvas.width - 220;
        function definirFonte(baseSize, weight, texto) {
            let tamanho = baseSize;
            ctx.font = `${weight} ${tamanho}px Arial, sans-serif`;
            while (ctx.measureText(texto).width > maxLinhaLargura && tamanho > baseSize * 0.7) {
                tamanho -= 2;
                ctx.font = `${weight} ${tamanho}px Arial, sans-serif`;
            }
            return `${weight} ${tamanho}px Arial, sans-serif`;
        }

        // ==== LOGO + TITULO SUPERIOR ====
        const margemTopo = 35;

        if (logoImg && logoImg.complete) {
            const maxWidth = 260;
            const maxHeight = 220;
            let width = logoImg.width;
            let height = logoImg.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }

            const logoX = 110;
            const logoY = margemTopo;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.drawImage(logoImg, logoX, logoY, width, height);
            ctx.restore();

            const textX = logoX + width + 60;
            const maxTextWidth = canvas.width - textX - 120;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            let assocFontSize = 34;
            ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            while (ctx.measureText(associacaoTexto).width > maxTextWidth && assocFontSize > 24) {
                assocFontSize -= 1;
                ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            }

            let tituloFontSize = 70;
            ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            while (ctx.measureText(tituloPrincipal).width > maxTextWidth && tituloFontSize > 50) {
                tituloFontSize -= 1;
                ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            }

            const linhaEspacamento = 14;
            const totalTextHeight = assocFontSize + linhaEspacamento + tituloFontSize;
            let textoTop = logoY + (height - totalTextHeight) / 2;
            if (textoTop < logoY) {
                textoTop = logoY;
            }
            const maxTop = logoY + height - totalTextHeight;
            if (textoTop > maxTop) {
                textoTop = maxTop;
            }

            ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            ctx.fillText(associacaoTexto, textX, textoTop);
            ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            ctx.fillText(tituloPrincipal, textX, textoTop + assocFontSize + linhaEspacamento);
            ctx.restore();

            const textoBottom = textoTop + assocFontSize + linhaEspacamento + tituloFontSize;
            cabecalhoBottom = Math.max(logoY + height, textoBottom);
        } else {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            let assocFontSize = 44;
            ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            const maxAssocWidth = canvas.width - 220;
            while (ctx.measureText(associacaoTexto).width > maxAssocWidth && assocFontSize > 26) {
                assocFontSize -= 1;
                ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            }

            let tituloFontSize = 76;
            ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            while (ctx.measureText(tituloPrincipal).width > maxAssocWidth && tituloFontSize > 52) {
                tituloFontSize -= 1;
                ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            }

            const headerTop = margemTopo + 20;
            const lineSpacing = 18;
            ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            ctx.fillText(associacaoTexto, canvas.width / 2, headerTop);
            ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            const tituloY = headerTop + assocFontSize + lineSpacing;
            ctx.fillText(tituloPrincipal, canvas.width / 2, tituloY);
            ctx.restore();

            cabecalhoBottom = tituloY + tituloFontSize;
        }

        // Configurar sombra padrão para textos do corpo
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        
        // ==== ÁREA CENTRAL - CONTEÚDO PRINCIPAL ====
        const footerHeight = 180;
        const footerTop = canvas.height - footerHeight;

    const contentDesejadoTopo = Math.max(cabecalhoBottom + 110, 360);
        const contentBottomLimite = footerTop - 80;

        const espacamentoMinimoTotal = 260; // mínimo desejado entre topo e base do bloco central
        let contentTopo = Math.max(contentDesejadoTopo, cabecalhoBottom + 40);
        let conteudoAltura = Math.max(contentBottomLimite - contentTopo, espacamentoMinimoTotal);

        const excesso = contentTopo + conteudoAltura - contentBottomLimite;
        if (excesso > 0) {
            contentTopo = Math.max(contentTopo - excesso, cabecalhoBottom + 40);
            conteudoAltura = contentBottomLimite - contentTopo;
        }

        if (conteudoAltura < espacamentoMinimoTotal) {
            conteudoAltura = Math.max(contentBottomLimite - Math.max(contentTopo, cabecalhoBottom + 40), 0);
        }

        conteudoAltura = Math.max(conteudoAltura, 0);
        const step = conteudoAltura > 0 ? conteudoAltura / 3 : 0; // três espaços entre quatro linhas

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

    const palestranteTexto = palestrante.toUpperCase();

    ctx.font = definirFonte(96, 'bold', 'PALESTRA');
        const palestraY = contentTopo;
        ctx.fillText('PALESTRA', canvas.width / 2, palestraY);

    ctx.font = definirFonte(78, 'bold', palestranteTexto);
        const palestranteY = palestraY + step;
    ctx.fillText(palestranteTexto, canvas.width / 2, palestranteY);

    ctx.font = definirFonte(88, 'bold', dataTexto);
        const dataY = palestranteY + step;
    ctx.fillText(dataTexto, canvas.width / 2, dataY);

    ctx.font = definirFonte(74, 'bold', horarioTexto);
        const horarioY = dataY + step;
    ctx.fillText(horarioTexto, canvas.width / 2, horarioY);
        
        // ==== RODAPÉ - ENDEREÇO ====
        
        // Resetar sombra temporariamente para o retângulo
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(0, footerTop, canvas.width, footerHeight);
        
        // Reativar sombra para o texto do rodapé
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.textAlign = 'center';
    const linhaFooter1 = footerTop + 80;
    const linhaFooter2 = footerTop + 138;
    ctx.fillText('RUA 13 DE MAIO, Nº140 - CENTRO', canvas.width / 2, linhaFooter1);
    ctx.fillText('MOGI MIRIM / SP', canvas.width / 2, linhaFooter2);
        
        // Resetar sombra no final
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    function desenharFundo() {
        if (fundoDisponivel) {
            ctx.drawImage(fundoImg, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#5dbeeb');
            gradient.addColorStop(0.5, '#3a9ec7');
            gradient.addColorStop(1, '#2876a3');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        desenharFundo();
        desenharConteudo(logoDisponivel ? logo : null);
    }

    // ==== DESIGN DO PANFLETO ====

    const fundoImg = new Image();
    const logo = new Image();

    fundoImg.onload = function() {
        fundoDisponivel = true;
        render();
    };
    fundoImg.onerror = function() {
        fundoDisponivel = false;
        render();
    };

    logo.onload = function() {
        logoDisponivel = true;
        render();
    };
    logo.onerror = function() {
        logoDisponivel = false;
        render();
    };

    fundoImg.src = 'fundo.jpg';
    logo.src = 'logo.png';

    render();
    
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
                        title: 'Panfleto de Palestra'
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

