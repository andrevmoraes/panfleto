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

// Estado da foto de perfil do palestrante
let perfilDataUrl = null;
let perfilImg = new Image();
let perfilDisponivel = false;

perfilImg.onload = function() {
    perfilDisponivel = true;
};

perfilImg.onerror = function() {
    perfilDisponivel = false;
};

// Função auxiliar para calcular próxima segunda-feira
function calcularProximaSegunda() {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 domingo .. 6 sábado
    const diasAteSegunda = ((8 - diaSemana) % 7) || 7;
    const proximaSegunda = new Date(hoje);
    proximaSegunda.setDate(hoje.getDate() + diasAteSegunda);

    const ano = proximaSegunda.getFullYear();
    const mes = String(proximaSegunda.getMonth() + 1).padStart(2, '0');
    const dia = String(proximaSegunda.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Teste inicial ao carregar a página (sem log automático)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 Página carregada - Sistema de debug ativo');

    const campoData = document.getElementById('data');
    if (campoData) {
        campoData.value = calcularProximaSegunda();
        
        // Observar mudanças no campo de data para repor valor se ficar vazio
        campoData.addEventListener('change', function() {
            if (!this.value) {
                this.value = calcularProximaSegunda();
            }
        });
        
        campoData.addEventListener('blur', function() {
            if (!this.value) {
                this.value = calcularProximaSegunda();
            }
        });
    }

    const campoFoto = document.getElementById('foto');
    const previewFoto = document.getElementById('preview-foto');
    if (campoFoto) {
        campoFoto.addEventListener('change', function() {
            const arquivo = this.files && this.files[0];
            if (!arquivo) {
                perfilDataUrl = null;
                perfilDisponivel = false;
                perfilImg.src = '';
                if (previewFoto) {
                    previewFoto.src = '';
                    previewFoto.style.display = 'none';
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                perfilDataUrl = event.target.result;
                perfilImg.src = perfilDataUrl;

                if (previewFoto) {
                    previewFoto.src = perfilDataUrl;
                    previewFoto.style.display = 'block';
                }
            };

            reader.onerror = function(err) {
                debugLog('❌ Erro ao ler imagem: ' + err);
                perfilDataUrl = null;
                perfilDisponivel = false;
                if (previewFoto) {
                    previewFoto.src = '';
                    previewFoto.style.display = 'none';
                }
            };

            reader.readAsDataURL(arquivo);
        });
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
    const campoTituloEvento = document.getElementById('titulo-evento');
    const tituloEventoInput = campoTituloEvento ? campoTituloEvento.value.trim() : '';
    const tituloEvento = (tituloEventoInput || 'PALESTRA').toUpperCase();
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
        const margemTopo = 30;

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

            // Texto associação com sombra mais forte
            ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = 'white';
            ctx.fillText(associacaoTexto, textX, textoTop);
            
            // Título principal com sombra padrão
            ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = 'white';
            ctx.fillText(tituloPrincipal, textX, textoTop + assocFontSize + linhaEspacamento);
            ctx.restore();

            const textoBottom = textoTop + assocFontSize + linhaEspacamento + tituloFontSize;
            cabecalhoBottom = Math.max(logoY + height, textoBottom);
        } else {
            ctx.save();
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
            
            // Texto associação com sombra mais forte
            ctx.font = `600 ${assocFontSize}px Arial, sans-serif`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = 'white';
            ctx.fillText(associacaoTexto, canvas.width / 2, headerTop);
            
            // Título principal com sombra padrão
            ctx.font = `bold ${tituloFontSize}px Arial, sans-serif`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = 'white';
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

        const topBound = Math.max(cabecalhoBottom + 50, 300);
        const bottomBound = footerTop - 30;
        const areaDisponivel = Math.max(0, bottomBound - topBound);

        ctx.fillStyle = 'white';
        const palestranteTexto = palestrante.toUpperCase();
        // VARIÁVEIS DE ALINHAMENTO
        let areaTextoX;
        let larguraMaxTexto;

        if (perfilDisponivel && perfilImg.complete) {
            // FOTO A ESQUERDA - REDONDA COM CROP QUADRADO CENTRALIZADO
            const fotoSize = 420;
            const fotoX = 70;
            const margemDireita = 48;
            const espacoEntreFotoETexto = 56;
            
            // Centralizar foto verticalmente na área disponível
            let fotoY = topBound + Math.max(0, (areaDisponivel - fotoSize) / 2);
            if (fotoY < topBound) fotoY = topBound;
            
            const fotoRaio = fotoSize / 2;

            // Crop quadrado centralizado
            const imgW = perfilImg.width;
            const imgH = perfilImg.height;
            let sx, sy, sw, sh;
            if (imgW / imgH > 1) {
                sw = imgH; sh = imgH; sx = (imgW - imgH) / 2; sy = 0;
            } else {
                sw = imgW; sh = imgW; sx = 0; sy = (imgH - imgW) / 2;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(fotoX + fotoRaio, fotoY + fotoRaio, fotoRaio, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(perfilImg, sx, sy, sw, sh, fotoX, fotoY, fotoSize, fotoSize);
            ctx.restore();

            ctx.beginPath();
            ctx.arc(fotoX + fotoRaio, fotoY + fotoRaio, fotoRaio - 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.textAlign = 'right';
            areaTextoX = canvas.width - margemDireita;
            larguraMaxTexto = Math.max(120, areaTextoX - (fotoX + fotoSize + espacoEntreFotoETexto));
        } else {
            ctx.textAlign = 'center';
            areaTextoX = canvas.width / 2;
            larguraMaxTexto = canvas.width - 200;
        }

        // === TAMANHOS FIXOS: data e horário (sempre cabem em uma linha) ===
        const FONTE_DATA    = 74;
        const FONTE_HORARIO = 65;
        const alturaDataFixa    = FONTE_DATA    * 1.2;
        const alturaHorarioFixa = FONTE_HORARIO * 1.2;
        const GAP = 26;

        // === HELPER: quebrar texto em linhas respeitando larguraMaxTexto ===
        function quebrarLinhas(texto) {
            const palavras = texto.split(' ');
            if (palavras.length <= 1) return [texto];
            const linhas = [];
            let linhaAtual = '';
            for (const palavra of palavras) {
                const tentativa = linhaAtual ? linhaAtual + ' ' + palavra : palavra;
                if (ctx.measureText(tentativa).width > larguraMaxTexto && linhaAtual) {
                    linhas.push(linhaAtual);
                    linhaAtual = palavra;
                } else {
                    linhaAtual = tentativa;
                }
            }
            if (linhaAtual) linhas.push(linhaAtual);
            return linhas;
        }

        // === HELPER: bloco dinâmico — reduz fonte até caber em alturaMax ===
        function calcularBloco(texto, fontBase, fonteMin, alturaMax) {
            for (let t = fontBase; t >= fonteMin; t -= 2) {
                ctx.font = `bold ${t}px Arial, sans-serif`;
                const linhas = quebrarLinhas(texto);
                const altura = linhas.length * (t * 1.2);
                if (altura <= alturaMax) return { tamanho: t, linhas, altura };
            }
            ctx.font = `bold ${fonteMin}px Arial, sans-serif`;
            const linhas = quebrarLinhas(texto);
            return { tamanho: fonteMin, linhas, altura: linhas.length * (fonteMin * 1.2) };
        }

        // Espaço para data + horário + 3 gaps; restante vai para título + nome (50/50)
        const espacoFixo     = alturaDataFixa + alturaHorarioFixa + GAP * 3;
        const espacoDinamico = Math.max(100, areaDisponivel - espacoFixo);

        const blocoTitulo = calcularBloco(tituloEvento,     90, 48, espacoDinamico / 2);
        const blocoNome   = calcularBloco(palestranteTexto, 84, 48, espacoDinamico / 2);

        // Gap adaptativo com o espaço realmente sobrando
        const alturaTotal    = blocoTitulo.altura + blocoNome.altura + alturaDataFixa + alturaHorarioFixa;
        const espacoSobrando = areaDisponivel - alturaTotal;
        const gapReal = Math.max(10, Math.min(GAP, Math.floor(espacoSobrando / 3)));

        // Centralizar verticalmente na área disponível
        let yTop = topBound + Math.max(0, (areaDisponivel - (alturaTotal + gapReal * 3)) / 2);

        // Título do evento
        ctx.font = `bold ${blocoTitulo.tamanho}px Arial, sans-serif`;
        blocoTitulo.linhas.forEach((linha, i) => {
            ctx.fillText(linha, areaTextoX, yTop + blocoTitulo.tamanho + i * blocoTitulo.tamanho * 1.2);
        });
        yTop += blocoTitulo.altura + gapReal;

        // Nome do palestrante
        ctx.font = `bold ${blocoNome.tamanho}px Arial, sans-serif`;
        blocoNome.linhas.forEach((linha, i) => {
            ctx.fillText(linha, areaTextoX, yTop + blocoNome.tamanho + i * blocoNome.tamanho * 1.2);
        });
        yTop += blocoNome.altura + gapReal;

        // Data (tamanho fixo)
        ctx.font = `bold ${FONTE_DATA}px Arial, sans-serif`;
        ctx.fillText(dataTexto, areaTextoX, yTop + FONTE_DATA);
        yTop += alturaDataFixa + gapReal;

        // Horário (tamanho fixo)
        ctx.font = `bold ${FONTE_HORARIO}px Arial, sans-serif`;
        ctx.fillText(horarioTexto, areaTextoX, yTop + FONTE_HORARIO);
        
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
                        files: [arquivo]
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

