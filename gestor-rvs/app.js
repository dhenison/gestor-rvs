// Gerenciamento de Estado e Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initRouting();
    initNetworkMonitor();
});

// --- Autenticação e Permissões ---
let currentUser = null;

function initAuth() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Checar login anterior
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            showMainLayout();
        } catch(e) {}
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Validação de Domínio
            if (!email.endsWith('@escola.seduc.pa.gov.br')) {
                alert('Acesso negado. Utilize um e-mail institucional válido (@escola.seduc.pa.gov.br).');
                return;
            }

            const btnEntrar = loginForm.querySelector('button');
            const txtOriginal = btnEntrar.innerText;
            btnEntrar.innerText = 'Autenticando...';
            btnEntrar.disabled = true;

            // Login Master Fixo (Fallback de Segurança)
            if (email === 'dhenison.guimaraes4178@escola.seduc.pa.gov.br' && password === 'Rvsgestor@88') {
                currentUser = {
                    Email: email,
                    Perfil: 'Manager',
                    Modulos: 'dashboard,alunos,turmas,frequencia,ocorrencias,pedemeia,calendario,relatorios,permissoes'
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showMainLayout();
                btnEntrar.innerText = txtOriginal;
                btnEntrar.disabled = false;
                return;
            }

            // Login pela Planilha (API)
            if (!navigator.onLine) {
                alert('Você está offline e este é seu primeiro login. Conecte-se à internet para autenticar.');
                btnEntrar.innerText = txtOriginal;
                btnEntrar.disabled = false;
                return;
            }

            try {
                const response = await fetch(GOOGLE_API_URL + "?action=getUsuarios");
                const data = await response.json();
                
                if (data.status === "success") {
                    const usuarios = data.dados;
                    const user = usuarios.find(u => u.Email === email && u.Senha === password);
                    
                    if (user) {
                        currentUser = user;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        showMainLayout();
                    } else {
                        alert('Usuário ou senha incorretos.');
                    }
                } else {
                    alert('Erro ao buscar usuários: ' + data.message);
                }
            } catch (error) {
                console.error("Erro no login:", error);
                alert('Falha de conexão com a API de autenticação.');
            }

            btnEntrar.innerText = txtOriginal;
            btnEntrar.disabled = false;
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            currentUser = null;
            document.getElementById('login-view').style.display = 'flex';
            document.getElementById('main-layout').style.display = 'none';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        });
    }
}

function showMainLayout() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('main-layout').style.display = 'flex';
    
    // Configurar menu lateral baseado nos módulos permitidos
    const modulosPermitidos = (currentUser.Modulos || "").split(',').map(m => m.trim());
    const links = document.querySelectorAll('.nav-links a');
    let primeiraRotaPermitida = null;

    links.forEach(link => {
        const route = link.getAttribute('data-route');
        const li = link.parentElement;
        
        if (modulosPermitidos.includes(route)) {
            li.style.display = 'block';
            if (!primeiraRotaPermitida) primeiraRotaPermitida = route;
        } else {
            li.style.display = 'none';
        }
    });

    // Mostrar link de permissões dinamicamente
    const navPermissoes = document.getElementById('nav-permissoes');
    if (navPermissoes) {
        if (modulosPermitidos.includes('permissoes')) {
            navPermissoes.style.display = 'block';
            if (!primeiraRotaPermitida) primeiraRotaPermitida = 'permissoes';
        } else {
            navPermissoes.style.display = 'none';
        }
    }

    // Carrega a primeira rota permitida (ou mensagem de erro)
    if (primeiraRotaPermitida) {
        links.forEach(l => l.classList.remove('active'));
        const linkAtivo = document.querySelector(`.nav-links a[data-route="${primeiraRotaPermitida}"]`);
        if (linkAtivo) linkAtivo.classList.add('active');
        
        loadRoute(primeiraRotaPermitida);
    } else {
        document.getElementById('page-content').innerHTML = '<h2 style="padding:20px;">Você não tem acesso a nenhum módulo do sistema.</h2>';
    }
}

// --- Roteamento SPA ---
function initRouting() {
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const route = e.currentTarget.getAttribute('data-route');
            loadRoute(route);
        });
    });
}

function loadRoute(route) {
    const pageContent = document.getElementById('page-content');
    const template = document.getElementById(`tpl-${route}`);
    
    if (template) {
        pageContent.innerHTML = '';
        pageContent.appendChild(template.content.cloneNode(true));

        // Inicializar lógicas específicas da rota
        if (route === 'dashboard') {
            if (typeof initDashboardModule === 'function') initDashboardModule();
        } else if (route === 'alunos') {
            initAlunosModule();
        } else if (route === 'frequencia') {
            initFrequenciaModule();
        } else if (route === 'ocorrencias') {
            initOcorrenciasModule();
        } else if (route === 'turmas') {
            initTurmasModule();
        } else if (route === 'calendario') {
            initCalendarioModule();
        } else if (route === 'relatorios') {
            initRelatoriosModule();
        } else if (route === 'permissoes') {
            initPermissoesModule();
        }
    } else {
        pageContent.innerHTML = `<h2>Módulo ${route} em construção...</h2>`;
    }
}

// --- Módulo Alunos (Câmera e Fila Offline) ---
function initAlunosModule() {
    const alunoForm = document.getElementById('aluno-form');
    const fotoInput = document.getElementById('foto_aluno');
    const fotoPreview = document.getElementById('photo-preview');

    let base64Foto = "";

    fotoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            fotoPreview.innerHTML = `<span style="font-size: 12px; color: #64748b;">Comprimindo...</span>`;
            try {
                if (typeof window.compressImage === 'function') {
                    base64Foto = await window.compressImage(file, 800, 0.7);
                } else {
                    // Fallback se não carregou
                    const reader = new FileReader();
                    base64Foto = await new Promise(resolve => {
                        reader.onload = ev => resolve(ev.target.result);
                        reader.readAsDataURL(file);
                    });
                }
                fotoPreview.innerHTML = `<img src="${base64Foto}" style="width:100%; border-radius:10px">`;
            } catch (err) {
                console.error("Erro na foto:", err);
                fotoPreview.innerHTML = `<span class="material-icons" style="color: #ef4444;">error</span>`;
            }
        }
    });

    // Submissão
    alunoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(alunoForm);
        const data = Object.fromEntries(formData.entries());
        
        // Substitui o File Object capturado pelo navegador pela string Base64 da imagem
        data.URL_Foto = base64Foto;
        
        // Adiciona metadados para a planilha
        data.aba = "Alunos"; 
        data.Data_Cadastro = new Date().toLocaleString('pt-BR');

        // Chama a função de envio que configuramos com a sua URL
        postData('/api/alunos', data);

        // Feedback visual
        alert('Processando cadastro...');
        alunoForm.reset();
        fotoPreview.innerHTML = `<span class="material-icons">camera_alt</span>`;
        base64Foto = ""; // Limpa a variável
    });

    // --- Lógica de Pesquisa de Aluno ---
    buscarAlunosDaPlanilha(); // Garante que a lista de alunos esteja atualizada
    buscarOcorrenciasDaPlanilha(); // Garante que as ocorrências estejam atualizadas para a timeline

    const btnBuscar = document.getElementById('btn-buscar-aluno');
    const inputBuscar = document.getElementById('busca-aluno');
    const resultadoContainer = document.getElementById('resultado-busca-aluno');
    const timelineContainer = document.getElementById('timeline-aluno');

    if (btnBuscar && inputBuscar) {
        btnBuscar.addEventListener('click', () => {
            const query = inputBuscar.value.trim().toLowerCase();
            resultadoContainer.style.display = 'block';
            timelineContainer.style.display = 'none';

            if (!query) {
                resultadoContainer.innerHTML = '<p style="color: #ef4444;">Digite um nome para pesquisar.</p>';
                return;
            }

            const encontrados = alunosCadastrados.filter(a => a.Nome && a.Nome.toLowerCase().includes(query));

            if (encontrados.length === 0) {
                resultadoContainer.innerHTML = '<p style="color: #64748b;">Nenhum aluno encontrado com esse nome.</p>';
            } else {
                resultadoContainer.innerHTML = '';
                encontrados.forEach(aluno => {
                    const card = document.createElement('div');
                    card.style.border = '1px solid #e2e8f0';
                    card.style.borderRadius = '8px';
                    card.style.padding = '15px';
                    card.style.marginBottom = '10px';
                    card.style.cursor = 'pointer';
                    card.style.backgroundColor = '#f8fafc';
                    card.innerHTML = `<strong>${aluno.Nome}</strong> - ${aluno.Turma || 'Sem Turma'}`;
                    
                    card.onclick = () => {
                        window.renderizarDetalhesAluno(aluno);
                    };
                    resultadoContainer.appendChild(card);
                });
            }
        });
    }
}

window.renderizarDetalhesAluno = function(aluno) {
    const resultadoContainer = document.getElementById('resultado-busca-aluno');
    const timelineContainer = document.getElementById('timeline-aluno');
    
    resultadoContainer.innerHTML = `
        <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; color: #1E3A8A;">Detalhes do Aluno</h4>
        <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
            
            <!-- Foto do Aluno -->
            <div style="text-align: center; flex-shrink: 0; margin-bottom: 15px; width: 140px;">
                <div id="display-foto-aluno" style="width: 120px; height: 120px; border-radius: 50%; background-color: #e2e8f0; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 3px solid #1E3A8A; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ${aluno.URL_Foto && aluno.URL_Foto.length > 10 ? `<img src="${formatarURLDrive(aluno.URL_Foto)}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span class="material-icons" style="font-size: 64px; color: #94a3b8;">person</span>`}
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 15px;">
                    <!-- Botão Câmera (Nativo / WebRTC) -->
                    <button class="btn btn-secondary" onclick="window.abrirCameraWebRTC('${aluno.Nome}')" style="display: inline-flex; justify-content: center; align-items: center; gap: 5px; cursor: pointer; padding: 6px; font-size: 11px; border-radius: 20px;">
                        <span class="material-icons" style="font-size: 14px;">photo_camera</span> Tirar Foto
                    </button>

                    <!-- Botão Arquivo / Galeria -->
                    <label for="input-nova-foto" class="btn btn-secondary" style="display: inline-flex; justify-content: center; align-items: center; gap: 5px; cursor: pointer; padding: 6px; font-size: 11px; border-radius: 20px; background-color: #f1f5f9; color: #475569;">
                        <span class="material-icons" style="font-size: 14px;">folder</span> Enviar Arquivo
                    </label>
                    <input type="file" id="input-nova-foto" accept="image/*" style="display: none;">
                </div>
                
                <div id="status-upload-foto" style="font-size: 11px; font-weight: bold; color: #3b82f6; margin-top: 8px; display: none;">Enviando...</div>
            </div>

            <!-- Dados Cadastrais -->
            <div style="flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0;"><strong>Nome:</strong> <span style="color: #334155;">${aluno.Nome || '-'}</span></p>
                <p style="margin: 0;"><strong>CPF:</strong> <span style="color: #334155;">${aluno.CPF || '-'}</span></p>
                <p style="margin: 0;"><strong>Turma:</strong> <span style="color: #334155;">${aluno.Turma || '-'}</span></p>
                <p style="margin: 0;"><strong>Idade:</strong> <span style="color: #334155;">${aluno.Idade || '-'}</span></p>
                <p style="margin: 0;"><strong>E-mail:</strong> <span style="color: #334155;">${aluno['E-mail'] || aluno.Email || '-'}</span></p>
                <p style="margin: 0;"><strong>Telefone:</strong> <span style="color: #334155;">${aluno.Telefone || '-'}</span></p>
                <p style="margin: 0;"><strong>Nome da Mãe:</strong> <span style="color: #334155;">${aluno.Nome_Mae || '-'}</span></p>
                <p style="margin: 0;"><strong>Nome do Pai:</strong> <span style="color: #334155;">${aluno.Nome_Pai || '-'}</span></p>
            </div>
        </div>
        <button class="btn btn-secondary" style="margin-top: 15px;" onclick="document.getElementById('resultado-busca-aluno').innerHTML = ''; document.getElementById('timeline-aluno').style.display='none'; document.getElementById('busca-aluno').value='';">Limpar Busca</button>
    `;

    // Lógica para capturar, comprimir e enviar a foto
    setTimeout(() => {
        const inputNovaFoto = document.getElementById('input-nova-foto');
        if (inputNovaFoto) {
            inputNovaFoto.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const statusDiv = document.getElementById('status-upload-foto');
                statusDiv.style.display = 'block';
                statusDiv.innerText = 'Comprimindo foto...';

                try {
                    const base64Comprimido = await compressImage(file, 800, 0.7); // Reduz para max 800px e 70% qualidade
                    
                    statusDiv.innerText = 'Enviando para o Drive...';
                    document.getElementById('display-foto-aluno').innerHTML = `<img src="${base64Comprimido}" style="width: 100%; height: 100%; object-fit: cover;">`; // Preview imediato

                    const payloadUpdateFoto = {
                        Nome: aluno.Nome,
                        fotoBase64: base64Comprimido,
                        aba: 'Alunos',
                        isUpdate: true,
                        isPhotoUpload: true // Flag especial para o Backend
                    };

                    // Envia para o servidor
                    if (navigator.onLine) {
                        fetch(GOOGLE_API_URL, {
                            method: 'POST',
                            mode: 'no-cors',
                            cache: 'no-cache',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payloadUpdateFoto)
                        });
                        
                        // Atualiza cadastro local para que se recarregar a tela não perca a foto provisoriamente
                        const idx = alunosCadastrados.findIndex(a => a.Nome === aluno.Nome);
                        if(idx > -1) {
                            alunosCadastrados[idx].URL_Foto = base64Comprimido; // Temporário local até recarregar a planilha
                            localStorage.setItem('alunosCadastrados', JSON.stringify(alunosCadastrados));
                        }
                        
                        statusDiv.innerText = 'Foto atualizada!';
                        statusDiv.style.color = '#10b981';
                        setTimeout(() => statusDiv.style.display = 'none', 3000);
                    } else {
                        alert('Você está offline. Conecte-se para enviar a foto.');
                        statusDiv.style.display = 'none';
                    }

                } catch (error) {
                    console.error("Erro na compressão:", error);
                    statusDiv.innerText = 'Erro ao processar foto.';
                    statusDiv.style.color = '#ef4444';
                }
            });
        }
    }, 100);
    
    // LINHA DO TEMPO DINÂMICA
    const timelineDinamica = document.getElementById('timeline-container-dinamico');
    if (timelineDinamica) {
        timelineDinamica.innerHTML = ''; // Limpa

        let eventos = [];

        // 1. Ocorrências (Como Autor ou Envolvido)
        ocorrenciasSalvas.forEach(oc => {
            const isAutor = oc.Nome_Aluno === aluno.Nome;
            const isEnvolvido = oc.Envolvidos && oc.Envolvidos.includes(aluno.Nome);
            
            if (isAutor || isEnvolvido) {
                let tituloEvento = isAutor ? `Ocorrência: ${oc.Tipo_Ocorrencia}` : `Envolvido em Ocorrência (${oc.Tipo_Ocorrencia})`;
                let iconeEvento = 'gavel';
                let corEvento = oc.Tipo_Ocorrencia === 'Suspensão' ? '#ef4444' : '#f59e0b'; // Vermelho para suspensão, amarelo/laranja para os outros
                
                if (oc.Tipo_Ocorrencia === 'Transferência de Turma') {
                    tituloEvento = 'Transferência de Turma';
                    iconeEvento = 'swap_horiz';
                    corEvento = '#3b82f6'; // Azul
                } else if (oc.Tipo_Ocorrencia === 'Atraso') {
                    iconeEvento = 'schedule';
                    corEvento = '#eab308'; // Amarelo
                }

                eventos.push({
                    data: new Date(oc.Data + 'T12:00:00'),
                    dataBruta: oc.Data,
                    tipo: 'ocorrencia',
                    titulo: tituloEvento,
                    descricao: oc.Descricao || 'Sem descrição detalhada.',
                    icone: iconeEvento,
                    cor: corEvento,
                    detalhesExtra: isAutor && oc.Envolvidos ? `Envolvidos: ${oc.Envolvidos}` : ''
                });
            }
        });

        // 2. Faltas (Frequência Diária F) e Alerta de Evasão
        frequenciaDiaria.forEach(freq => {
            if (freq.Nome_Aluno === aluno.Nome) {
                const isFalta = freq.Frequencia_Dia === 'F' || freq.Chamada_Entrada === 'F' || freq.Chamada_Saida === 'F';
                
                if (isFalta) {
                    const isEvasao = freq.Chamada_Entrada === 'P' && freq.Chamada_Saida === 'F' && !freq.Justificativa_Falta;
                    
                    if (isEvasao) {
                        eventos.push({
                            data: new Date(freq.Data + 'T12:00:00'),
                            dataBruta: freq.Data,
                            tipo: 'evasao',
                            titulo: '🚨 Alerta de Evasão',
                            descricao: 'O aluno teve presença na Entrada, mas falta na Saída sem justificativa prévia.',
                            icone: 'warning',
                            cor: '#ef4444',
                            detalhesExtra: `<button type="button" class="btn btn-sm btn-tratar-evasao" data-aluno="${aluno.Nome}" data-data="${freq.Data}" data-turma="${aluno.Turma}" style="background-color: #fca5a5; color: #7f1d1d; border: 1px solid #ef4444; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-weight: bold; margin-top: 5px;">Tratar Alerta</button>`
                        });
                    } else {
                        eventos.push({
                            data: new Date(freq.Data + 'T12:00:00'),
                            dataBruta: freq.Data,
                            tipo: 'falta',
                            titulo: freq.Justificativa_Falta === 'Evasão Confirmada' ? 'Evasão Confirmada (Falta Mantida)' : 'Falta Registrada',
                            descricao: freq.Justificativa_Falta ? `Justificativa: ${freq.Justificativa_Falta}` : `Falta nas aulas do dia.`,
                            icone: 'event_busy',
                            cor: freq.Justificativa_Falta === 'Evasão Confirmada' ? '#ef4444' : (freq.Justificativa_Falta ? '#3b82f6' : '#ef4444')
                        });
                    }
                }
            }
        });

        // Ordena do mais recente para o mais antigo
        eventos.sort((a, b) => b.data - a.data);

        if (eventos.length === 0) {
            timelineDinamica.innerHTML = '<p class="empty-state">Nenhum evento registrado para este aluno até o momento.</p>';
        } else {
            eventos.forEach(ev => {
                let pExtra = ev.detalhesExtra ? `<p style="font-size: 12px; color: #64748b; margin-top: 4px;">${ev.detalhesExtra}</p>` : '';
                
                // Formatar data local BR
                let dataFormatada = ev.dataBruta;
                try {
                    let dArr = ev.dataBruta.split('-');
                    if(dArr.length === 3) dataFormatada = `${dArr[2]}/${dArr[1]}/${dArr[0]}`;
                } catch(e) {}

                timelineDinamica.innerHTML += `
                    <div class="timeline-item">
                        <div class="timeline-icon" style="background-color: ${ev.cor}; color: white; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 20px;">${ev.icone}</span></div>
                        <div class="timeline-content">
                            <h4>${ev.titulo}</h4>
                            <p>${ev.descricao}</p>
                            ${pExtra}
                            <span class="time">${dataFormatada}</span>
                        </div>
                    </div>
                `;
            });
        }
        
        // Adicionar eventos aos botões de tratar evasão
        setTimeout(() => {
            document.querySelectorAll('.btn-tratar-evasao').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const nome = e.currentTarget.getAttribute('data-aluno');
                    const dataFreq = e.currentTarget.getAttribute('data-data');
                    const turma = e.currentTarget.getAttribute('data-turma');
                    window.abrirModalEvasao(nome, dataFreq, turma);
                });
            });
        }, 50);
    }

    const resumoContainer = document.getElementById('resumo-frequencia-aluno');
    if (resumoContainer) {
        resumoContainer.style.display = 'block';
        if (typeof window.calcularEstatisticasGlobais === 'function') {
            window.calcularEstatisticasGlobais(aluno.Nome);
        }
    }

    timelineContainer.style.display = 'block';
};

// --- Módulo Frequência ---
function initFrequenciaModule_deprecated() {
    // Popula data atual
    const inputData = document.getElementById('Freq_Data');
    if(inputData) {
        const hoje = new Date();
        const yyyy = hoje.getFullYear();
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const dd = String(hoje.getDate()).padStart(2, '0');
        inputData.value = `${yyyy}-${mm}-${dd}`;
    }

    const selectTurno = document.getElementById('Freq_Turno');
    const selectTurma = document.getElementById('Freq_Turma');

    // Inicialmente mostra carregando
    if(selectTurma) {
        selectTurma.innerHTML = '<option value="">Carregando turmas...</option>';
    }

    // Carregar dados se necessário
    if (!navigator.onLine) {
        popularSelectTurmasFrequencia();
    } else if (turmasCadastradas.length === 0 || alunosCadastrados.length === 0) {
         Promise.all([
             fetch(GOOGLE_API_URL + "?action=getTurmas").then(res => res.json()),
             fetch(GOOGLE_API_URL + "?action=getAlunos").then(res => res.json())
         ]).then(([resTurmas, resAlunos]) => {
             if (resTurmas.status === "success") turmasCadastradas = resTurmas.dados;
             if (resAlunos.status === "success") alunosCadastrados = resAlunos.dados;
             popularSelectTurmasFrequencia();
         }).catch(err => {
             console.error("Erro ao carregar dados:", err);
             if(selectTurma) selectTurma.innerHTML = '<option value="">Erro ao carregar turmas</option>';
         });
    } else {
        popularSelectTurmasFrequencia();
    }

    if (selectTurno) {
        selectTurno.addEventListener('change', () => {
            popularSelectTurmasFrequencia();
            document.getElementById('lista-frequencia').innerHTML = '<p class="empty-state">Selecione a turma para carregar os alunos.</p>';
        });
    }

    if (selectTurma) {
        selectTurma.addEventListener('change', (e) => {
            renderizarListaFrequencia(e.target.value);
        });
    }

    // Botões de consolidar
    const btnEntrada = document.getElementById('btn-consolidar-entrada');
    const btnSaida = document.getElementById('btn-consolidar-saida');
    
    if (btnEntrada) {
        btnEntrada.addEventListener('click', () => {
             alert("Funcionalidade Consolidar Entrada em desenvolvimento");
        });
    }
    if (btnSaida) {
        btnSaida.addEventListener('click', () => {
             alert("Funcionalidade Consolidar Saída em desenvolvimento");
        });
    }
}

function popularSelectTurmasFrequencia() {
    const selectTurno = document.getElementById('Freq_Turno');
    const selectTurma = document.getElementById('Freq_Turma');
    if (!selectTurma) return;

    const turno = selectTurno ? selectTurno.value : '';
    selectTurma.innerHTML = '<option value="">Selecione a turma...</option>';
    
    let turmasFiltradas = turmasCadastradas;
    if (turno) {
        turmasFiltradas = turmasCadastradas.filter(t => t.Turno === turno);
    }
    
    if (turmasFiltradas.length === 0) {
        selectTurma.innerHTML = '<option value="">Nenhuma turma encontrada</option>';
        return;
    }

    turmasFiltradas.forEach(t => {
        const option = document.createElement('option');
        option.value = t.Nome_Turma;
        option.textContent = t.Nome_Turma;
        selectTurma.appendChild(option);
    });
}

function renderizarListaFrequencia(nomeTurma) {
    const container = document.getElementById('lista-frequencia');
    if (!nomeTurma) {
        container.innerHTML = '<p class="empty-state">Selecione a turma para carregar os alunos.</p>';
        return;
    }

    const alunosDestaTurma = alunosCadastrados.filter(a => a.Turma === nomeTurma);

    if (alunosDestaTurma.length === 0) {
        container.innerHTML = `<p style="padding: 15px; color: #64748b; background: #f8fafc; border-radius: 8px; text-align: center;">Nenhum aluno matriculado na turma ${nomeTurma}.</p>`;
        return;
    }

    let html = `
        <div class="table-container" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
                <thead>
                    <tr style="background-color: #f8fafc; text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; width: 40%;">Nome do Aluno</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: center;">Entrada</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: center;">Saída</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0;">Falta Justificada</th>
                    </tr>
                </thead>
                <tbody>
    `;

    alunosDestaTurma.forEach((aluno) => {
        html += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: 500;">${aluno.Nome || '-'}</td>
                <td style="padding: 12px; text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; color: #10b981;">
                            <input type="radio" name="entrada_${aluno.CPF}" value="P" checked> P
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; color: #ef4444;">
                            <input type="radio" name="entrada_${aluno.CPF}" value="F"> F
                        </label>
                    </div>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; color: #10b981;">
                            <input type="radio" name="saida_${aluno.CPF}" value="P" checked> P
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; color: #ef4444;">
                            <input type="radio" name="saida_${aluno.CPF}" value="F"> F
                        </label>
                    </div>
                </td>
                <td style="padding: 12px;">
                    <input type="text" placeholder="Motivo (opcional)" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px;">
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// --- Módulo Ocorrências ---
function initOcorrenciasModule() {
    const form = document.getElementById('ocorrencias-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            postData('/api/ocorrencias', data);
            alert('Ocorrência salva (ou enfileirada)!');
            form.reset();
        });
    }
}

// --- Módulo Turmas ---
// Listas vazias que serão preenchidas via API
let turmasCadastradas = [];
let alunosCadastrados = [];

function initTurmasModule() {
    const form = document.getElementById('turma-form');
    
    // Buscar dados assim que a tela abre
    buscarTurmasDaPlanilha();
    buscarAlunosDaPlanilha();

    // Lógica de Filtro por Turno
    const turnoBtns = document.querySelectorAll('.btn-turno');
    turnoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            turnoBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = '#e2e8f0';
                b.style.color = '#334155';
            });
            const target = e.currentTarget;
            target.classList.add('active');
            target.style.background = '#eab308'; // Amarelo ativo
            target.style.color = '#0f172a';
            
            const turnoSelecionado = target.getAttribute('data-turno');
            renderizarBotoesTurma(turnoSelecionado);
        });
    });

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            enviarDadosTurma(form);
        });
    }
}

function buscarTurmasDaPlanilha() {
    const container = document.getElementById('lista-botoes-turma');
    if (!container) return;

    if (!navigator.onLine) {
        renderizarBotoesTurma('Manhã');
        return;
    }
    
    container.innerHTML = `<p>Carregando turmas da planilha...</p>`;
    document.getElementById('container-turmas').style.display = 'block';

    fetch(GOOGLE_API_URL + "?action=getTurmas")
        .then(res => res.json())
        .then(data => {
            if(data.status === "success") {
                turmasCadastradas = data.dados;
                const activeBtn = document.querySelector('.btn-turno.active');
                const turno = activeBtn ? activeBtn.getAttribute('data-turno') : 'Manhã';
                renderizarBotoesTurma(turno);
            } else {
                container.innerHTML = `<p style="color:red">Erro: ${data.message}</p>`;
            }
        })
        .catch(err => {
            console.error("Erro ao buscar turmas:", err);
            container.innerHTML = `<p style="color:red">Erro de conexão com a planilha.</p>`;
        });
}

function buscarAlunosDaPlanilha() {
    if (!navigator.onLine) return;

    fetch(GOOGLE_API_URL + "?action=getAlunos")
        .then(res => res.json())
        .then(data => {
            if(data.status === "success") {
                alunosCadastrados = data.dados;
            }
        })
        .catch(err => console.error("Erro ao buscar alunos:", err));
}

function buscarOcorrenciasDaPlanilha() {
    if (!navigator.onLine) return;

    fetch(GOOGLE_API_URL + "?action=getOcorrencias")
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                ocorrenciasSalvas = data.dados;
                localStorage.setItem('ocorrenciasSalvas', JSON.stringify(ocorrenciasSalvas));
            }
        })
        .catch(err => console.error("Erro ao buscar ocorrências:", err));
}

function renderizarBotoesTurma(turno) {
    const container = document.getElementById('lista-botoes-turma');
    document.getElementById('container-turmas').style.display = 'block';
    document.getElementById('container-alunos').style.display = 'none'; // Esconde os alunos ao trocar de turno
    
    if (!container) return;
    container.innerHTML = '';
    
    const filtradas = turmasCadastradas.filter(t => t.Turno === turno);

    if (filtradas.length === 0) {
        container.innerHTML = `<p style="color: #64748b;">Nenhuma turma encontrada para o turno da ${turno.toLowerCase()}.</p>`;
        return;
    }

    filtradas.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.background = '#1e293b';
        btn.innerText = t.Nome_Turma;
        btn.onclick = () => {
            // Estilo de seleção visual
            const todosBotoes = container.querySelectorAll('button');
            todosBotoes.forEach(b => b.style.border = 'none');
            btn.style.border = '2px solid #eab308';
            
            renderizarAlunosDaTurma(t.Nome_Turma);
        };
        container.appendChild(btn);
    });
}

function renderizarAlunosDaTurma(nomeTurma) {
    document.getElementById('container-alunos').style.display = 'block';
    // Adicionamos o botão de excluir turma ao lado do título
    document.getElementById('turma-selecionada-titulo').innerHTML = `${nomeTurma} 
        <button onclick="excluirTurma('${nomeTurma}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px; vertical-align: middle;" title="Excluir Turma">
            <span class="material-icons" style="font-size:20px;">delete</span>
        </button>`;
    
    const tbody = document.getElementById('tabela-alunos-turma-body');
    tbody.innerHTML = '';

    const alunosDestaTurma = alunosCadastrados.filter(a => a.Turma === nomeTurma);

    if(alunosDestaTurma.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 16px;">Nenhum aluno matriculado ou sincronização pendente.</td></tr>`;
        return;
    }

    alunosDestaTurma.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${a.Nome || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${a.CPF || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${a.Telefone || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${a.Status_WhatsApp || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                <button type="button" class="btn-transferir-aluno" data-aluno="${a.Nome}" data-turma="${nomeTurma}" title="Mudar de Turma" style="background: none; border: none; cursor: pointer; color: #1E3A8A;">
                    <span class="material-icons">swap_horiz</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    setTimeout(() => {
        document.querySelectorAll('.btn-transferir-aluno').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nome = e.currentTarget.getAttribute('data-aluno');
                const turmaAtual = e.currentTarget.getAttribute('data-turma');
                if (typeof window.abrirModalTransferencia === 'function') {
                    window.abrirModalTransferencia(nome, turmaAtual);
                }
            });
        });
    }, 50);
}

function enviarDadosTurma(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    postData('/api/turmas', data);
    
    // Atualiza a tabela local
    turmasCadastradas.push(data);
    const turnoAtivo = document.querySelector('.btn-turno.active').getAttribute('data-turno');
    renderizarBotoesTurma(turnoAtivo);
    
    alert('Turma salva na planilha (ou enfileirada)!');
    form.reset();
}

function excluirTurma(nome) {
    if(confirm('Tem certeza que deseja excluir a turma ' + nome + '?')) {
        const index = turmasCadastradas.findIndex(t => t.Nome_Turma === nome);
        if (index > -1) {
            const turmaParaExcluir = turmasCadastradas[index];
            postData('/api/turmas', { ...turmaParaExcluir, Acao: 'Excluir' });
            turmasCadastradas.splice(index, 1);
            
            // Re-renderiza o turno e esconde os alunos
            const turnoAtivo = document.querySelector('.btn-turno.active').getAttribute('data-turno');
            renderizarBotoesTurma(turnoAtivo);
        }
    }
}

// --- Rede e Fila Offline (Queue) ---
// --- Módulo Calendário Letivo ---
let eventosCalendario = JSON.parse(localStorage.getItem('eventosCalendario') || '[]');
let mesAtualCalendario = new Date().getMonth();
let anoAtualCalendario = new Date().getFullYear();

function initCalendarioModule() {
    const form = document.getElementById('calendario-form');
    const formBimestre = document.getElementById('bimestre-periodo-form');
    const selectTipoDia = document.getElementById('Tipo_Dia');
    const hiddenDiaLetivo = document.getElementById('Dia_Letivo');
    const hiddenContarFrequencia = document.getElementById('Contar_Frequencia');

    const btnAnterior = document.getElementById('btn-mes-anterior');
    const btnProximo = document.getElementById('btn-mes-proximo');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroMes = document.getElementById('filtro-mes');
    const filtroBimestre = document.getElementById('filtro-bimestre-select');

    // Inicializa filtros
    if (filtroMes) filtroMes.value = mesAtualCalendario.toString();

    // Busca dados
    buscarCalendarioDaPlanilha();

    if (formBimestre) {
        formBimestre.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formBimestre);
            const bimestre = formData.get('Bimestre');
            const dataInicio = formData.get('Data_Inicio');
            const dataFim = formData.get('Data_Fim');
            
            let semestre = '1º';
            if (bimestre === '3º' || bimestre === '4º') semestre = '2º';
            
            const eventoInicio = {
                Data: dataInicio,
                Tipo_Dia: 'Início do Bimestre',
                Descricao_Evento: 'Início do ' + bimestre + ' Bimestre',
                Bimestre: bimestre,
                Semestre: semestre,
                Dia_Letivo: 'Sim',
                Contar_Frequencia: 'Sim',
                aba: 'Calendario_Aulas'
            };
            
            const eventoFim = {
                Data: dataFim,
                Tipo_Dia: 'Fim do Bimestre',
                Descricao_Evento: 'Fim do ' + bimestre + ' Bimestre',
                Bimestre: bimestre,
                Semestre: semestre,
                Dia_Letivo: 'Sim',
                Contar_Frequencia: 'Sim',
                aba: 'Calendario_Aulas'
            };

            // Atualiza local e manda para API (Início)
            const indexInicio = eventosCalendario.findIndex(ev => ev.Data === dataInicio);
            if(indexInicio > -1) eventosCalendario[indexInicio] = eventoInicio;
            else eventosCalendario.push(eventoInicio);
            postData('/api/calendario', eventoInicio);

            // Atualiza local e manda para API (Fim)
            const indexFim = eventosCalendario.findIndex(ev => ev.Data === dataFim);
            if(indexFim > -1) eventosCalendario[indexFim] = eventoFim;
            else eventosCalendario.push(eventoFim);
            postData('/api/calendario', eventoFim);
            
            localStorage.setItem('eventosCalendario', JSON.stringify(eventosCalendario));

            renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
            atualizarContadores();
            
            alert(`Datas de início e fim do ${bimestre} Bimestre cadastradas com sucesso!`);
            formBimestre.reset();
        });
    }

    // Eventos dos Controles do Calendário
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            mesAtualCalendario--;
            if (mesAtualCalendario < 0) { mesAtualCalendario = 11; anoAtualCalendario--; }
            renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
            atualizarContadores();
        });
    }
    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            mesAtualCalendario++;
            if (mesAtualCalendario > 11) { mesAtualCalendario = 0; anoAtualCalendario++; }
            renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
            atualizarContadores();
        });
    }

    // Eventos dos Filtros
    if (filtroTipo) {
        filtroTipo.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('container-filtro-mes').style.display = val === 'mes' ? 'block' : 'none';
            document.getElementById('container-filtro-bimestre').style.display = val === 'bimestre' ? 'block' : 'none';
            atualizarContadores();
        });
    }
    if (filtroMes) {
        filtroMes.addEventListener('change', (e) => {
            mesAtualCalendario = parseInt(e.target.value);
            renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
            atualizarContadores();
        });
    }
    if (filtroBimestre) filtroBimestre.addEventListener('change', atualizarContadores);

    if (selectTipoDia) {
        selectTipoDia.addEventListener('change', (e) => {
            const tipo = e.target.value;
            if (tipo === 'Feriado' || tipo === 'Recesso Escolar') {
                hiddenDiaLetivo.value = 'Não';
                hiddenContarFrequencia.value = 'Não';
            } else {
                hiddenDiaLetivo.value = 'Sim';
                hiddenContarFrequencia.value = 'Sim';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            postData('/api/calendario', data);
            
            // Atualiza localmente
            const index = eventosCalendario.findIndex(ev => ev.Data === data.Data);
            if(index > -1) {
                eventosCalendario[index] = data;
            } else {
                eventosCalendario.push(data);
            }
            localStorage.setItem('eventosCalendario', JSON.stringify(eventosCalendario));
            
            renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
            atualizarContadores();
            
            alert('Evento salvo no calendário (ou enfileirado)!');
        });
    }
}

function formatarDataComparacao(dataBruta) {
    if (!dataBruta) return '';
    if (dataBruta.includes('T')) return dataBruta.split('T')[0];
    if (dataBruta.includes('/')) {
        const partes = dataBruta.split('/');
        if (partes.length === 3) return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return dataBruta.substring(0, 10);
}

function buscarCalendarioDaPlanilha() {
    if (!navigator.onLine) {
        renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
        return;
    }
    fetch(GOOGLE_API_URL + "?action=getCalendario")
        .then(res => res.json())
        .then(data => {
            if(data.status === "success") {
                eventosCalendario = (data.dados || []).map(e => {
                    e.Data = formatarDataComparacao(e.Data);
                    return e;
                });
                localStorage.setItem('eventosCalendario', JSON.stringify(eventosCalendario));
            }
            renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
            atualizarContadores();
        })
        .catch(err => {
            console.error("Erro ao buscar calendário:", err);
            renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
        });
}

function renderizarCalendario(mes, ano) {
    const grid = document.getElementById('grid-calendario');
    const titulo = document.getElementById('titulo-mes-ano');
    if (!grid || !titulo) return;

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    titulo.innerText = `${nomesMeses[mes]} ${ano}`;
    
    grid.innerHTML = '';
    
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    
    // Dias vazios no início
    for (let i = 0; i < primeiroDia; i++) {
        const div = document.createElement('div');
        div.style.padding = '10px';
        grid.appendChild(div);
    }
    
    // Dias do mês
    for (let i = 1; i <= diasNoMes; i++) {
        const div = document.createElement('div');
        div.innerText = i;
        div.style.padding = '10px';
        div.style.border = '1px solid #e2e8f0';
        div.style.borderRadius = '8px';
        div.style.cursor = 'pointer';
        div.style.backgroundColor = '#f8fafc';
        
        // Formatar data YYYY-MM-DD
        const strMes = (mes + 1).toString().padStart(2, '0');
        const strDia = i.toString().padStart(2, '0');
        const dataStr = `${ano}-${strMes}-${strDia}`;
        
        // Verifica se há evento nesta data
        const evento = eventosCalendario.find(e => e.Data === dataStr);
        if (evento) {
            if (evento.Tipo_Dia === 'Feriado' || evento.Tipo_Dia === 'Recesso Escolar') {
                div.style.backgroundColor = '#ef4444'; div.style.color = 'white'; div.style.border = 'none';
            } else if (evento.Tipo_Dia === 'Sábado Letivo') {
                div.style.backgroundColor = '#f59e0b'; div.style.color = 'white'; div.style.border = 'none';
            } else if (evento.Tipo_Dia === 'Evento') {
                div.style.backgroundColor = '#3b82f6'; div.style.color = 'white'; div.style.border = 'none';
            } else if (evento.Tipo_Dia && evento.Tipo_Dia.includes('Avaliação')) {
                div.style.backgroundColor = '#06b6d4'; div.style.color = 'white'; div.style.border = 'none';
            } else if (evento.Tipo_Dia === 'Início do Bimestre' || evento.Tipo_Dia === 'Fim do Bimestre') {
                div.style.backgroundColor = '#8b5cf6'; div.style.color = 'white'; div.style.border = 'none';
            } else if (evento.Tipo_Dia === 'Dia Normal') {
                div.style.backgroundColor = '#10b981'; div.style.color = 'white'; div.style.border = 'none';
            }
        }
        
        const dateObj = new Date(ano, mes, i);
        const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

        div.onclick = () => {
            // Preenche o form de qualquer maneira
            document.getElementById('Data_Cal').value = dataStr;
            const currentBimestre = document.getElementById('Bimestre').value || '1º';
            const currentSemestre = document.getElementById('Semestre').value || '1º';

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                // Finais de semana: vai direto pro formulário
                if (evento) {
                    document.getElementById('Tipo_Dia').value = evento.Tipo_Dia || '';
                    document.getElementById('Descricao_Evento').value = evento.Descricao_Evento || '';
                } else {
                    document.getElementById('Tipo_Dia').value = 'Sábado Letivo';
                    document.getElementById('Descricao_Evento').value = '';
                }
                document.getElementById('area-cadastro-calendario').scrollIntoView({ behavior: 'smooth' });
            } else {
                // Dias de semana (Seg-Sex): Ciclo de status rápido
                let novoTipo = 'Dia Normal';
                let novoDiaLetivo = 'Sim';
                
                if (!evento) {
                    novoTipo = 'Dia Normal';
                } else if (evento.Tipo_Dia === 'Dia Normal') {
                    novoTipo = 'Feriado';
                    novoDiaLetivo = 'Não';
                } else if (evento.Tipo_Dia === 'Feriado' || evento.Tipo_Dia === 'Recesso Escolar') {
                    novoTipo = 'Evento';
                } else {
                    novoTipo = 'Dia Normal'; // Volta pro início do ciclo
                }

                // Cria o objeto do evento para salvar
                const novoEvento = {
                    Data: dataStr,
                    Tipo_Dia: novoTipo,
                    Descricao_Evento: evento ? evento.Descricao_Evento : '',
                    Bimestre: evento ? evento.Bimestre : currentBimestre,
                    Semestre: evento ? evento.Semestre : currentSemestre,
                    Dia_Letivo: novoDiaLetivo,
                    Contar_Frequencia: novoDiaLetivo,
                    aba: 'Calendario_Aulas'
                };

                // Atualiza a interface do form para refletir a mudança
                document.getElementById('Tipo_Dia').value = novoTipo;
                document.getElementById('Descricao_Evento').value = novoEvento.Descricao_Evento;
                document.getElementById('Dia_Letivo').value = novoDiaLetivo;
                document.getElementById('Contar_Frequencia').value = novoDiaLetivo;

                // Salva no array local e re-renderiza
                const index = eventosCalendario.findIndex(ev => ev.Data === dataStr);
                if(index > -1) {
                    eventosCalendario[index] = novoEvento;
                } else {
                    eventosCalendario.push(novoEvento);
                }
                localStorage.setItem('eventosCalendario', JSON.stringify(eventosCalendario));
                renderizarCalendario(mesAtualCalendario, anoAtualCalendario);
                atualizarContadores();

                // Salva na planilha silenciosamente
                postData('/api/calendario', novoEvento);

                // Se virou Feriado ou Evento, desce pro form para a pessoa preencher o nome
                if (novoTipo === 'Feriado' || novoTipo === 'Evento') {
                    document.getElementById('area-cadastro-calendario').scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        
        grid.appendChild(div);
    }
}

function atualizarContadores() {
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const mesSelecionado = parseInt(document.getElementById('filtro-mes').value);
    const bimestreSelecionado = document.getElementById('filtro-bimestre-select').value;
    
    let eventosFiltrados = eventosCalendario;
    
    if (filtroTipo === 'mes') {
        eventosFiltrados = eventosCalendario.filter(e => {
            if (!e.Data) return false;
            const m = parseInt(e.Data.split('-')[1]) - 1; // 0-indexed
            return m === mesSelecionado;
        });
    } else if (filtroTipo === 'bimestre') {
        eventosFiltrados = eventosCalendario.filter(e => e.Bimestre === bimestreSelecionado);
    } // Se 'ano', usa todos os eventos

    let letivos = 0;
    let feriados = 0;
    let eventosCount = 0;
    let sabados = 0;

    eventosFiltrados.forEach(e => {
        if (e.Dia_Letivo === 'Sim') letivos++;
        if (e.Tipo_Dia === 'Feriado' || e.Tipo_Dia === 'Recesso Escolar') feriados++;
        if (e.Tipo_Dia === 'Evento') eventosCount++;
        if (e.Tipo_Dia === 'Sábado Letivo') sabados++;
    });

    const elLetivos = document.getElementById('count-letivos');
    const elFeriados = document.getElementById('count-feriados');
    const elEventos = document.getElementById('count-eventos');
    const elSabados = document.getElementById('count-sabados');

    if (elLetivos) elLetivos.innerText = letivos;
    if (elFeriados) elFeriados.innerText = feriados;
    if (elEventos) elEventos.innerText = eventosCount;
    if (elSabados) elSabados.innerText = sabados;
}

// --- Rede e Fila Offline (Queue) ---
let isOnline = navigator.onLine;

function initNetworkMonitor() {
    const statusEl = document.getElementById('sync-status');
    
    const updateStatus = () => {
        isOnline = navigator.onLine;
        if (isOnline) {
            statusEl.className = 'status online';
            statusEl.innerHTML = '<span class="material-icons">cloud_done</span> Online';
            syncQueue();
        } else {
            statusEl.className = 'status offline';
            statusEl.innerHTML = '<span class="material-icons">cloud_off</span> Offline';
        }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbwyAv3A6IpKhATtFQIADIOnsvHbXGXGZVhHz4DXShf6KtDKQRgnlZ1vKfr31YBF5NyCVg/exec";

function postData(url, data) {
    // Vincula a ação do App à aba correta da sua Planilha
    if (url.includes('alunos')) data.aba = "Alunos";
    else if (url.includes('frequencia')) data.aba = "Frequencia_Aulas";
    else if (url.includes('ocorrencias')) data.aba = "Ocorrencias";
    else if (url.includes('turmas')) data.aba = "Turmas";
    else if (url.includes('calendario')) data.aba = "Calendario_Aulas";

    if (navigator.onLine) {
        fetch(GOOGLE_API_URL, {
            method: 'POST',
            mode: 'no-cors', // Essencial para scripts do Google
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(() => {
            console.log("Sucesso: Dados enviados para a aba " + data.aba);
        })
        .catch(err => {
            console.error("Erro ao enviar: ", err);
            enfileirarOffline(url, data);
        });
    } else {
        enfileirarOffline(url, data);
    }
}

// Função auxiliar para gerenciar a fila offline
function enfileirarOffline(url, data) {
    const queue = JSON.parse(localStorage.getItem('requestQueue') || '[]');
    queue.push({ url, data, timestamp: new Date().toISOString() });
    localStorage.setItem('requestQueue', JSON.stringify(queue));
    console.warn("Modo Offline: Registro guardado no navegador.");
}

function syncQueue() {
    const queue = JSON.parse(localStorage.getItem('requestQueue') || '[]');
    if (queue.length === 0) return;

    console.log(`[SYNC] Sincronizando ${queue.length} requisições pendentes...`);
    
    queue.forEach(req => {
        console.log(`[SYNC] Disparando POST ${req.url}`, req.data);
        fetch(GOOGLE_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.data)
        }).then(() => console.log('Sincronizado: ', req.url)).catch(err => console.error('Erro na sync:', err));
    });

    localStorage.removeItem('requestQueue');
    alert(`Sincronizado ${queue.length} registros que estavam offline.`);
}

// --- Módulo Diário de Frequência ---
let frequenciaDiaria = JSON.parse(localStorage.getItem('frequenciaDiaria') || '[]');

function buscarFrequenciaDaPlanilha() {
    if (navigator.onLine) {
        fetch(GOOGLE_API_URL + "?action=getFrequencia")
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    frequenciaDiaria = (data.dados || []).map(f => {
                        if(f.Data) f.Data = formatarDataComparacao(f.Data);
                        return f;
                    });
                    localStorage.setItem('frequenciaDiaria', JSON.stringify(frequenciaDiaria));
                    renderizarListaFrequencia();
                }
            })
            .catch(err => console.error("Erro ao buscar frequência:", err));
    }
}

function initFrequenciaModule() {
    const selectTurno = document.getElementById('Freq_Turno');
    const selectTurma = document.getElementById('Freq_Turma');
    const inputData = document.getElementById('Freq_Data');
    
    // Set default date to today
    if (inputData && !inputData.value) {
        inputData.valueAsDate = new Date();
    }

    // Busca as frequências salvas no Google Sheets
    buscarFrequenciaDaPlanilha();

    const popularTurmas = () => {
        const turno = selectTurno ? selectTurno.value : '';
        if(selectTurma) selectTurma.innerHTML = '<option value="">Selecione a turma...</option>';
        let filtradas = turmasCadastradas;
        if (turno) filtradas = turmasCadastradas.filter(t => t.Turno === turno);
        filtradas.forEach(t => {
            if(selectTurma) selectTurma.innerHTML += `<option value="${t.Nome_Turma}">${t.Nome_Turma}</option>`;
        });
    };

    if (turmasCadastradas.length === 0 || alunosCadastrados.length === 0) {
         if(selectTurma) selectTurma.innerHTML = '<option value="">Carregando...</option>';
         if (navigator.onLine) {
             Promise.all([
                 fetch(GOOGLE_API_URL + "?action=getTurmas").then(res => res.json()),
                 fetch(GOOGLE_API_URL + "?action=getAlunos").then(res => res.json())
             ]).then(([resTurmas, resAlunos]) => {
                 if (resTurmas.status === "success") turmasCadastradas = resTurmas.dados;
                 if (resAlunos.status === "success") alunosCadastrados = resAlunos.dados;
                 popularTurmas();
             }).catch(err => {
                 console.error(err);
                 if(selectTurma) selectTurma.innerHTML = '<option value="">Erro</option>';
             });
         } else {
             popularTurmas();
         }
    } else {
        popularTurmas();
    }

    if (selectTurno) {
        selectTurno.addEventListener('change', (e) => {
            popularTurmas();
            renderizarListaFrequencia();
        });
    }

    if (selectTurma) selectTurma.addEventListener('change', renderizarListaFrequencia);
    if (inputData) inputData.addEventListener('change', renderizarListaFrequencia);

    document.getElementById('btn-consolidar-entrada').addEventListener('click', consolidarEntrada);
    document.getElementById('btn-consolidar-saida').addEventListener('click', consolidarSaida);
    
    document.getElementById('btn-presenca-todos').addEventListener('click', () => {
        const radEntradasP = document.querySelectorAll('.rad-entrada[value="P"]');
        const radSaidasP = document.querySelectorAll('.rad-saida[value="P"]');
        radEntradasP.forEach(r => { r.checked = true; r.dispatchEvent(new Event('change')); });
        radSaidasP.forEach(r => { r.checked = true; r.dispatchEvent(new Event('change')); });
    });
}

function renderizarListaFrequencia() {
    const turno = document.getElementById('Freq_Turno').value;
    const turma = document.getElementById('Freq_Turma').value;
    const data = document.getElementById('Freq_Data').value;
    const lista = document.getElementById('lista-frequencia');

    const btnPresencaTodos = document.getElementById('btn-presenca-todos');

    if (!turno || !turma || !data) {
        lista.innerHTML = '<p class="empty-state">Preencha Turno, Turma e Data para carregar os alunos.</p>';
        if (btnPresencaTodos) btnPresencaTodos.style.display = 'none';
        return;
    }

    const alunosTurma = alunosCadastrados.filter(a => a.Turma === turma);
    
    if (alunosTurma.length === 0) {
        lista.innerHTML = `<p class="empty-state">Nenhum aluno encontrado na turma ${turma}.</p>`;
        if (btnPresencaTodos) btnPresencaTodos.style.display = 'none';
        return;
    }

    if (btnPresencaTodos) btnPresencaTodos.style.display = 'flex';

    const registrosDia = frequenciaDiaria.filter(f => f.Data === data && f.Turma === turma);

    let html = `
        <div class="table-container" style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table class="tabela-frequencia" style="width: 100%; border-collapse: collapse; min-width: 700px;">
                <thead>
                    <tr style="background-color: #f8fafc; text-align: left; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 12px; font-weight: 600; color: #475569; width: 40%;">Aluno</th>
                        <th style="padding: 12px; font-weight: 600; color: #475569; text-align: center;">Entrada</th>
                        <th style="padding: 12px; font-weight: 600; color: #475569; text-align: center;">Saída</th>
                        <th style="padding: 12px; font-weight: 600; color: #475569; text-align: center;">Freq. Consolidada</th>
                    </tr>
                </thead>
                <tbody>
    `;

    alunosTurma.forEach((aluno, index) => {
        const registro = registrosDia.find(r => r.Nome_Aluno === aluno.Nome) || {};
        const entradaP = registro.Chamada_Entrada === 'P' ? 'checked' : '';
        const entradaF = registro.Chamada_Entrada === 'F' ? 'checked' : '';
        const entradaFJ = registro.Chamada_Entrada === 'FJ' ? 'checked' : '';
        
        const saidaP = registro.Chamada_Saida === 'P' ? 'checked' : '';
        const saidaF = registro.Chamada_Saida === 'F' ? 'checked' : '';
        const saidaFJ = registro.Chamada_Saida === 'FJ' ? 'checked' : '';

        const justificativa = registro.Justificativa_Falta || '';
        const freqConsolidada = calcularResultadoFrequencia(registro.Chamada_Entrada, registro.Chamada_Saida) || '-';
        let colorConsolidada = 'inherit';
        if (freqConsolidada === 'P') colorConsolidada = '#10b981';
        if (freqConsolidada === 'F') colorConsolidada = '#ef4444';

        html += `
            <tr class="frequencia-card" data-aluno="${aluno.Nome}" style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px;">
                    <div style="font-weight: 500; color: #1e293b;">${index + 1}. ${aluno.Nome}</div>
                    <div class="justificativa-box" style="margin-top: 8px; display: ${(entradaFJ || saidaFJ) ? 'block' : 'none'};">
                        <select class="sel-justificativa form-control" style="width: 100%; padding: 6px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 4px;">
                            <option value="">Motivo da FJ...</option>
                            <option value="Atestado Médico" ${justificativa === 'Atestado Médico' ? 'selected' : ''}>Atestado Médico</option>
                            <option value="Saída Antecipada" ${justificativa === 'Saída Antecipada' ? 'selected' : ''}>Saída Antecipada</option>
                            <option value="Motivos Pessoais" ${justificativa === 'Motivos Pessoais' ? 'selected' : ''}>Motivos Pessoais</option>
                        </select>
                    </div>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <label style="cursor:pointer;"><input type="radio" name="ent_${index}" value="P" class="rad-entrada" ${entradaP}> P</label>
                        <label style="cursor:pointer;"><input type="radio" name="ent_${index}" value="F" class="rad-entrada" ${entradaF}> F</label>
                        <label style="cursor:pointer;"><input type="radio" name="ent_${index}" value="FJ" class="rad-entrada" ${entradaFJ}> FJ</label>
                    </div>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <label style="cursor:pointer;"><input type="radio" name="sai_${index}" value="P" class="rad-saida" ${saidaP}> P</label>
                        <label style="cursor:pointer;"><input type="radio" name="sai_${index}" value="F" class="rad-saida" ${saidaF}> F</label>
                        <label style="cursor:pointer;"><input type="radio" name="sai_${index}" value="FJ" class="rad-saida" ${saidaFJ}> FJ</label>
                    </div>
                </td>
                <td style="padding: 12px; text-align: center; font-weight: bold; font-size: 16px; color: ${colorConsolidada};" class="lbl-consolidada">
                    ${freqConsolidada}
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    lista.innerHTML = html;

    const cards = lista.querySelectorAll('.frequencia-card');
    cards.forEach(card => {
        const radios = card.querySelectorAll('input[type="radio"]');
        const box = card.querySelector('.justificativa-box');
        const lblConsolidada = card.querySelector('.lbl-consolidada');

        radios.forEach(r => {
            r.addEventListener('change', () => {
                const rEnt = card.querySelector('.rad-entrada:checked');
                const rSai = card.querySelector('.rad-saida:checked');
                
                const valEnt = rEnt ? rEnt.value : '';
                const valSai = rSai ? rSai.value : '';

                if (valEnt === 'FJ' || valSai === 'FJ') {
                    box.style.display = 'block';
                } else {
                    box.style.display = 'none';
                }
            });
        });
    });
}

function calcularResultadoFrequencia(entrada, saida) {
    if (!entrada || !saida) return ''; 
    
    if (entrada === 'P' && saida === 'P') return 'P';
    if (entrada === 'FJ' && saida === 'FJ') return 'P';
    if (entrada === 'P' && saida === 'FJ') return 'P';
    if (entrada === 'FJ' && saida === 'P') return 'P';
    
    return 'F'; // F+FJ, FJ+F, F+F, P+F, F+P resultam em Falta
}

function consolidarEntrada() {
    coletarESalvarFrequencia(false);
}

function consolidarSaida() {
    coletarESalvarFrequencia(true);
}

function coletarESalvarFrequencia(isSaida) {
    const turno = document.getElementById('Freq_Turno').value;
    const turma = document.getElementById('Freq_Turma').value;
    const data = document.getElementById('Freq_Data').value;
    
    if (!turno || !turma || !data) {
        alert("Preencha Data, Turno e Turma antes de consolidar.");
        return;
    }

    const cards = document.querySelectorAll('.frequencia-card');
    let concluidos = 0;
    let registrosLote = [];

    cards.forEach(card => {
        const nome = card.getAttribute('data-aluno');
        const radEntrada = card.querySelector('.rad-entrada:checked');
        const radSaida = card.querySelector('.rad-saida:checked');
        const justSelect = card.querySelector('.sel-justificativa');
        
        const valEntrada = radEntrada ? radEntrada.value : '';
        const valSaida = radSaida ? radSaida.value : '';
        const valJust = justSelect ? justSelect.value : '';

        if (!valEntrada) return; // Pula alunos que nem receberam entrada ainda

        let frequenciaDia = '';
        if (isSaida) {
            frequenciaDia = calcularResultadoFrequencia(valEntrada, valSaida);
            const lblConsolidada = card.querySelector('.lbl-consolidada');
            if (lblConsolidada) {
                lblConsolidada.innerText = frequenciaDia || '-';
                if (frequenciaDia === 'P') lblConsolidada.style.color = '#10b981';
                else if (frequenciaDia === 'F') lblConsolidada.style.color = '#ef4444';
                else lblConsolidada.style.color = 'inherit';
            }
        }

        const registro = {
            Data: data,
            Turno: turno,
            Turma: turma,
            Nome_Aluno: nome,
            Chamada_Entrada: valEntrada,
            Chamada_Saida: valSaida,
            Justificativa_Falta: valJust,
            Frequencia_Dia: frequenciaDia,
            aba: 'Frequencia_Aulas'
        };

        const indexLocal = frequenciaDiaria.findIndex(f => f.Data === data && f.Nome_Aluno === nome);
        if (indexLocal > -1) {
            frequenciaDiaria[indexLocal] = registro;
        } else {
            frequenciaDiaria.push(registro);
        }
        
        registrosLote.push(registro);
        concluidos++;
    });

    localStorage.setItem('frequenciaDiaria', JSON.stringify(frequenciaDiaria));

    if (concluidos > 0) {
        postData('/api/frequencia', { isBatch: true, registros: registrosLote });
        if (isSaida) {
            alert(`Saída e Frequência Diária de ${concluidos} alunos consolidadas com sucesso!`);
        } else {
            alert(`Entrada de ${concluidos} alunos consolidada com sucesso!`);
        }
    } else {
        alert("Nenhum dado marcado para consolidação.");
    }
}

// --- Módulo Ocorrências ---
let ocorrenciasSalvas = JSON.parse(localStorage.getItem('ocorrenciasSalvas') || '[]');

function initOcorrenciasModule() {
    const viewLista = document.getElementById('ocorrencias-lista-view');
    const viewForm = document.getElementById('ocorrencias-form-view');
    
    const selectTurno = document.getElementById('Ocorrencia_Turno');
    const selectTurma = document.getElementById('Ocorrencia_Turma');
    const listaAlunosContainer = document.getElementById('lista-alunos-ocorrencia');
    const btnVoltar = document.getElementById('btn-voltar-ocorrencia');
    const alunoNomeDisplay = document.getElementById('ocorrencia-aluno-nome');
    const inputOcorrenciaNomeAluno = document.getElementById('Ocorrencia_Nome_Aluno');
    const inputDataOcorrencia = document.getElementById('Data_Ocorrencia');
    
    // Envolvidos
    const radioEnvolvidos = document.querySelectorAll('input[name="Tem_Envolvidos"]');
    const containerEnvolvidos = document.getElementById('envolvidos-container');
    const selectEnvolvidoTurma = document.getElementById('Envolvido_Turma');
    const selectEnvolvidoAluno = document.getElementById('Envolvido_Aluno');
    const btnAddEnvolvido = document.getElementById('btn-add-envolvido');
    const ulListaEnvolvidos = document.getElementById('lista-envolvidos');
    let listaEnvolvidosArray = [];

    const popularTurmasFiltro = () => {
        const turno = selectTurno ? selectTurno.value : '';
        if(selectTurma) selectTurma.innerHTML = '<option value="">Selecione a turma...</option>';
        if(selectEnvolvidoTurma) selectEnvolvidoTurma.innerHTML = '<option value="">Selecione a turma...</option>';
        
        let filtradas = turmasCadastradas;
        if (turno) filtradas = turmasCadastradas.filter(t => t.Turno === turno);
        
        filtradas.forEach(t => {
            if(selectTurma) selectTurma.innerHTML += `<option value="${t.Nome_Turma}">${t.Nome_Turma}</option>`;
        });
        
        turmasCadastradas.forEach(t => {
            if(selectEnvolvidoTurma) selectEnvolvidoTurma.innerHTML += `<option value="${t.Nome_Turma}">${t.Nome_Turma}</option>`;
        });
    };

    if (turmasCadastradas.length === 0 || alunosCadastrados.length === 0) {
        if(selectTurma) selectTurma.innerHTML = '<option value="">Carregando...</option>';
        if (navigator.onLine) {
             Promise.all([
                 fetch(GOOGLE_API_URL + "?action=getTurmas").then(res => res.json()),
                 fetch(GOOGLE_API_URL + "?action=getAlunos").then(res => res.json())
             ]).then(([resTurmas, resAlunos]) => {
                 if (resTurmas.status === "success") turmasCadastradas = resTurmas.dados;
                 if (resAlunos.status === "success") alunosCadastrados = resAlunos.dados;
                 popularTurmasFiltro();
             }).catch(err => console.error(err));
        } else {
             popularTurmasFiltro();
        }
    } else {
        popularTurmasFiltro();
    }

    if (selectTurno) selectTurno.addEventListener('change', popularTurmasFiltro);
    if (selectTurma) selectTurma.addEventListener('change', () => {
        const turmaSelecionada = selectTurma.value;
        if (!turmaSelecionada) {
            listaAlunosContainer.innerHTML = '<p class="empty-state">Selecione uma turma para carregar os alunos.</p>';
            return;
        }

        const alunosTurma = alunosCadastrados.filter(a => a.Turma === turmaSelecionada);
        if (alunosTurma.length === 0) {
            listaAlunosContainer.innerHTML = `<p class="empty-state">Nenhum aluno encontrado na turma ${turmaSelecionada}.</p>`;
            return;
        }

        let html = '';
        alunosTurma.forEach((aluno, index) => {
            html += `
                <div class="aluno-ocorrencia-card" data-nome="${aluno.Nome}" style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                    <span style="font-weight: 500; color: #1e293b;">${index + 1}. ${aluno.Nome}</span>
                    <button class="btn btn-sm" style="background: #ef4444; color: white; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer;"><span class="material-icons" style="font-size: 16px; vertical-align: middle;">gavel</span> Registrar</button>
                </div>
            `;
        });
        listaAlunosContainer.innerHTML = html;

        document.querySelectorAll('.aluno-ocorrencia-card').forEach(card => {
            card.addEventListener('click', () => {
                const nome = card.getAttribute('data-nome');
                abrirFormularioOcorrencia(nome);
            });
        });
    });

    function abrirFormularioOcorrencia(nomeAluno) {
        viewLista.style.display = 'none';
        viewForm.style.display = 'block';
        alunoNomeDisplay.innerText = nomeAluno;
        inputOcorrenciaNomeAluno.value = nomeAluno;
        inputDataOcorrencia.valueAsDate = new Date();
        
        document.getElementById('ocorrencias-form').reset();
        document.getElementById('Responsavel_Cadastro').value = "Administrador (Login Pendente)";
        listaEnvolvidosArray = [];
        renderizarEnvolvidos();
        containerEnvolvidos.style.display = 'none';
        document.querySelector('input[name="Tem_Envolvidos"][value="Não"]').checked = true;
    }

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            viewForm.style.display = 'none';
            viewLista.style.display = 'block';
        });
    }

    radioEnvolvidos.forEach(r => {
        r.addEventListener('change', (e) => {
            if (e.target.value === 'Sim') {
                containerEnvolvidos.style.display = 'block';
            } else {
                containerEnvolvidos.style.display = 'none';
                listaEnvolvidosArray = [];
                renderizarEnvolvidos();
            }
        });
    });

    if (selectEnvolvidoTurma) {
        selectEnvolvidoTurma.addEventListener('change', () => {
            const turmaSelecionada = selectEnvolvidoTurma.value;
            selectEnvolvidoAluno.innerHTML = '<option value="">Selecione o aluno...</option>';
            if (!turmaSelecionada) return;
            
            const alunosTurma = alunosCadastrados.filter(a => a.Turma === turmaSelecionada);
            alunosTurma.forEach(a => {
                selectEnvolvidoAluno.innerHTML += `<option value="${a.Nome}">${a.Nome}</option>`;
            });
        });
    }

    if (btnAddEnvolvido) {
        btnAddEnvolvido.addEventListener('click', () => {
            const t = selectEnvolvidoTurma.value;
            const a = selectEnvolvidoAluno.value;
            if (t && a) {
                if (!listaEnvolvidosArray.some(env => env.aluno === a && env.turma === t)) {
                    if (a === inputOcorrenciaNomeAluno.value) {
                        alert('O aluno principal não pode ser incluído como envolvido.');
                        return;
                    }
                    listaEnvolvidosArray.push({ turma: t, aluno: a });
                    renderizarEnvolvidos();
                    selectEnvolvidoTurma.value = '';
                    selectEnvolvidoAluno.innerHTML = '<option value="">Selecione a turma primeiro...</option>';
                } else {
                    alert('Este aluno já está na lista de envolvidos.');
                }
            } else {
                alert('Selecione Turma e Aluno para adicionar.');
            }
        });
    }

    function renderizarEnvolvidos() {
        ulListaEnvolvidos.innerHTML = '';
        listaEnvolvidosArray.forEach((env, index) => {
            ulListaEnvolvidos.innerHTML += `
                <li style="background: white; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #475569;"><strong>${env.turma}</strong> - ${env.aluno}</span>
                    <button type="button" class="btn-rm-envolvido" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0;"><span class="material-icons" style="font-size: 18px;">delete</span></button>
                </li>
            `;
        });
        
        document.querySelectorAll('.btn-rm-envolvido').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                listaEnvolvidosArray.splice(idx, 1);
                renderizarEnvolvidos();
            });
        });
    }

    const formOcorrencia = document.getElementById('ocorrencias-form');
    if (formOcorrencia) {
        formOcorrencia.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(formOcorrencia);
            const data = Object.fromEntries(formData.entries());
            
            let strEnvolvidos = '';
            if (data.Tem_Envolvidos === 'Sim' && listaEnvolvidosArray.length > 0) {
                strEnvolvidos = listaEnvolvidosArray.map(env => `${env.turma}: ${env.aluno}`).join(' | ');
            }
            data.Envolvidos = strEnvolvidos;
            
            data.aba = "Ocorrencias";
            data.Data_Cadastro = new Date().toLocaleString('pt-BR');
            data.Turno = document.getElementById('Ocorrencia_Turno').value;
            data.Turma = document.getElementById('Ocorrencia_Turma').value;
            data.Nome_Aluno = document.getElementById('Ocorrencia_Nome_Aluno').value;

            delete data.Tem_Envolvidos;
            
            postData('/api/ocorrencias', data);

            ocorrenciasSalvas.push(data);
            localStorage.setItem('ocorrenciasSalvas', JSON.stringify(ocorrenciasSalvas));

            alert('Ocorrência registrada com sucesso!');
            
            viewForm.style.display = 'none';
            viewLista.style.display = 'block';
            formOcorrencia.reset();
        });
    }
}

// --- Lógica do Modal de Evasão ---
let evasaoAtiva = null;

window.abrirModalEvasao = function(nome, dataFreq, turma) {
    evasaoAtiva = { nome, dataFreq, turma };
    document.getElementById('evasao-aluno-nome').innerText = nome;
    
    let dataFormatada = dataFreq;
    try {
        let dArr = dataFreq.split('-');
        if(dArr.length === 3) dataFormatada = `${dArr[2]}/${dArr[1]}/${dArr[0]}`;
    } catch(e) {}
    document.getElementById('evasao-data').innerText = dataFormatada;
    
    document.getElementById('div-evasao-justificativa').style.display = 'none';
    document.getElementById('evasao-motivo').value = '';
    
    document.getElementById('modal-evasao').style.display = 'flex';
};

document.addEventListener('DOMContentLoaded', () => {
    const btnFechar = document.getElementById('btn-fechar-modal-evasao');
    const btnSim = document.getElementById('btn-evasao-sim');
    const btnNao = document.getElementById('btn-evasao-nao');
    const divJustificativa = document.getElementById('div-evasao-justificativa');
    const btnSalvarFj = document.getElementById('btn-salvar-fj-evasao');

    if (btnFechar) btnFechar.addEventListener('click', () => {
        document.getElementById('modal-evasao').style.display = 'none';
        evasaoAtiva = null;
    });

    if (btnSim) btnSim.addEventListener('click', () => {
        if (!evasaoAtiva) return;
        
        // 1. Gera Ocorrência Silenciosa
        const registroOcorrencia = {
            Data: evasaoAtiva.dataFreq,
            Turno: '', 
            Turma: evasaoAtiva.turma,
            Nome_Aluno: evasaoAtiva.nome,
            Tipo_Ocorrencia: 'Evasão Escolar',
            Descricao: 'Evasão confirmada pela coordenação através do Alerta na Timeline.',
            Envolvidos: '',
            Notificar_Responsaveis: 'Sim',
            Responsavel_Cadastro: 'Administrador (Timeline)',
            aba: 'Ocorrencias'
        };
        postData('/api/ocorrencias', registroOcorrencia);
        ocorrenciasSalvas.push(registroOcorrencia);
        localStorage.setItem('ocorrenciasSalvas', JSON.stringify(ocorrenciasSalvas));

        // 2. Atualiza a falta na Frequência para justificar
        atualizarFrequenciaEvasao(evasaoAtiva.nome, evasaoAtiva.dataFreq, 'F', 'Evasão Confirmada');

        alert('Ocorrência de Evasão Escolar gerada automaticamente com sucesso!');
        document.getElementById('modal-evasao').style.display = 'none';
        
        // Atualiza a view
        const alunoObj = alunosCadastrados.find(a => a.Nome === evasaoAtiva.nome);
        if (alunoObj) window.renderizarDetalhesAluno(alunoObj);
    });

    if (btnNao) btnNao.addEventListener('click', () => {
        divJustificativa.style.display = 'block';
    });

    if (btnSalvarFj) btnSalvarFj.addEventListener('click', () => {
        if (!evasaoAtiva) return;
        const motivo = document.getElementById('evasao-motivo').value.trim();
        if (!motivo) {
            alert('Por favor, informe o motivo para justificar a falta na saída.');
            return;
        }

        // Atualiza a falta na Frequência para FJ
        atualizarFrequenciaEvasao(evasaoAtiva.nome, evasaoAtiva.dataFreq, 'FJ', motivo);

        alert('Falta justificada com sucesso!');
        document.getElementById('modal-evasao').style.display = 'none';
        
        // Atualiza a view
        const alunoObj = alunosCadastrados.find(a => a.Nome === evasaoAtiva.nome);
        if (alunoObj) window.renderizarDetalhesAluno(alunoObj);
    });

    function atualizarFrequenciaEvasao(nome, dataFreq, novaFreqDia, justificativa) {
        // Atualiza Cache Local
        const idx = frequenciaDiaria.findIndex(f => f.Nome_Aluno === nome && f.Data === dataFreq);
        let registroAtualizado = null;
        if (idx > -1) {
            frequenciaDiaria[idx].Frequencia_Dia = novaFreqDia;
            frequenciaDiaria[idx].Justificativa_Falta = justificativa;
            registroAtualizado = frequenciaDiaria[idx];
            localStorage.setItem('frequenciaDiaria', JSON.stringify(frequenciaDiaria));
        }

        // Envia comando de UPDATE para a planilha
        if (registroAtualizado) {
            const payloadUpdate = {
                ...registroAtualizado,
                aba: 'Frequencia_Aulas',
                isUpdate: true // Flag nova para o Apps Script
            };
            postData('/api/frequencia_update', payloadUpdate);
        }
    }
});

// --- Lógica de Estatísticas Globais de Frequência ---
window.calcularEstatisticasGlobais = function(alunoNome) {
    if (!alunoNome) return;

    // Elementos DOM
    const elSemP = document.getElementById('resumo-sem-p');
    const elSemF = document.getElementById('resumo-sem-f');
    const elSemFJ = document.getElementById('resumo-sem-fj');

    const elMesP = document.getElementById('resumo-mes-p');
    const elMesF = document.getElementById('resumo-mes-f');
    const elMesFJ = document.getElementById('resumo-mes-fj');

    const elBimP = document.getElementById('resumo-bim-p');
    const elBimF = document.getElementById('resumo-bim-f');
    const elBimFJ = document.getElementById('resumo-bim-fj');
    const elBimDates = document.getElementById('resumo-bim-dates');

    const selectMes = document.getElementById('select-resumo-mes');
    const selectBimestre = document.getElementById('select-resumo-bimestre');

    // Filtra os registros apenas do aluno atual
    const freqAluno = frequenciaDiaria.filter(f => f.Nome_Aluno === alunoNome && f.Data);

    // --- 1. Cálculo Semanal ---
    const hoje = new Date();
    // Encontrar Segunda-feira (1) e Sexta-feira (5) da semana atual
    const diaSemana = hoje.getDay(); // 0=Dom, 1=Seg...
    const diffSegunda = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    
    const dataSegunda = new Date(hoje.setDate(diffSegunda));
    dataSegunda.setHours(0,0,0,0);
    const dataSexta = new Date(dataSegunda);
    dataSexta.setDate(dataSegunda.getDate() + 4);
    dataSexta.setHours(23,59,59,999);

    let semP = 0, semF = 0, semFJ = 0;
    freqAluno.forEach(f => {
        const d = new Date(f.Data + 'T12:00:00');
        if (d >= dataSegunda && d <= dataSexta) {
            if (f.Frequencia_Dia === 'P') semP++;
            else if (f.Frequencia_Dia === 'FJ') semFJ++;
            else if (f.Frequencia_Dia === 'F') semF++;
        }
    });
    if(elSemP) elSemP.innerText = semP;
    if(elSemF) elSemF.innerText = semF;
    if(elSemFJ) elSemFJ.innerText = semFJ;

    // --- 2. Cálculo Mensal ---
    const calcularMensal = () => {
        const mesSelecionado = selectMes.value;
        const anoAtual = new Date().getFullYear().toString();
        const yyyyMM = `${anoAtual}-${mesSelecionado}`; // ex: 2026-03

        let mesP = 0, mesF = 0, mesFJ = 0;
        freqAluno.forEach(f => {
            if (f.Data.startsWith(yyyyMM)) {
                if (f.Frequencia_Dia === 'P') mesP++;
                else if (f.Frequencia_Dia === 'FJ') mesFJ++;
                else if (f.Frequencia_Dia === 'F') mesF++;
            }
        });
        if(elMesP) elMesP.innerText = mesP;
        if(elMesF) elMesF.innerText = mesF;
        if(elMesFJ) elMesFJ.innerText = mesFJ;
    };
    
    // Auto-selecionar o mês atual na primeira vez
    if (!selectMes.hasAttribute('data-initialized')) {
        const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
        selectMes.value = mesAtual;
        selectMes.setAttribute('data-initialized', 'true');
        selectMes.addEventListener('change', calcularMensal);
    }
    calcularMensal();

    // --- 3. Cálculo Bimestral ---
    const calcularBimestral = () => {
        const bimSelecionado = selectBimestre.value; // ex: "1º"
        
        let dataInicioStr = null;
        let dataFimStr = null;

        eventosCalendario.forEach(ev => {
            if (ev.Bimestre === bimSelecionado) {
                if (ev.Tipo_Dia === 'Início do Bimestre') dataInicioStr = ev.Data;
                if (ev.Tipo_Dia === 'Fim do Bimestre') dataFimStr = ev.Data;
            }
        });

        if (dataInicioStr && dataFimStr) {
            const dataInicio = new Date(dataInicioStr + 'T00:00:00');
            const dataFim = new Date(dataFimStr + 'T23:59:59');

            let formatInicio = dataInicioStr.split('-').reverse().join('/');
            let formatFim = dataFimStr.split('-').reverse().join('/');
            if(elBimDates) elBimDates.innerText = `${formatInicio} a ${formatFim}`;

            let bimP = 0, bimF = 0, bimFJ = 0;
            freqAluno.forEach(f => {
                const d = new Date(f.Data + 'T12:00:00');
                if (d >= dataInicio && d <= dataFim) {
                    if (f.Frequencia_Dia === 'P') bimP++;
                    else if (f.Frequencia_Dia === 'FJ') bimFJ++;
                    else if (f.Frequencia_Dia === 'F') bimF++;
                }
            });
            if(elBimP) elBimP.innerText = bimP;
            if(elBimF) elBimF.innerText = bimF;
            if(elBimFJ) elBimFJ.innerText = bimFJ;
        } else {
            if(elBimDates) elBimDates.innerText = "Defina datas no Calendário";
            if(elBimP) elBimP.innerText = "-";
            if(elBimF) elBimF.innerText = "-";
            if(elBimFJ) elBimFJ.innerText = "-";
        }
    };

    if (!selectBimestre.hasAttribute('data-initialized')) {
        selectBimestre.setAttribute('data-initialized', 'true');
        selectBimestre.addEventListener('change', calcularBimestral);
    }
    calcularBimestral();
};

// --- Lógica do Modal de Transferência de Turma ---
let transferenciaAtiva = null;

window.abrirModalTransferencia = function(nome, turmaAtual) {
    transferenciaAtiva = { nome, turmaAtual };
    document.getElementById('transf-aluno-nome').innerText = nome;
    document.getElementById('transf-turma-atual').innerText = turmaAtual;
    
    document.getElementById('transf-novo-turno').value = '';
    document.getElementById('transf-nova-turma').innerHTML = '<option value="">Selecione primeiro o turno...</option>';
    document.getElementById('transf-nova-turma').disabled = true;
    document.getElementById('transf-justificativa').value = '';
    
    document.getElementById('modal-transferencia').style.display = 'flex';
};

document.addEventListener('DOMContentLoaded', () => {
    const btnFechar = document.getElementById('btn-fechar-modal-transf');
    const btnSalvar = document.getElementById('btn-salvar-transferencia');
    const selectTurno = document.getElementById('transf-novo-turno');
    const selectTurma = document.getElementById('transf-nova-turma');

    if (btnFechar) btnFechar.addEventListener('click', () => {
        document.getElementById('modal-transferencia').style.display = 'none';
        transferenciaAtiva = null;
    });

    if (selectTurno) selectTurno.addEventListener('change', (e) => {
        const turno = e.target.value;
        selectTurma.innerHTML = '<option value="">Selecione a turma...</option>';
        if (!turno) {
            selectTurma.disabled = true;
            return;
        }
        
        const turmasFiltradas = turmasCadastradas.filter(t => t.Turno === turno);
        turmasFiltradas.forEach(t => {
            if (t.Nome_Turma !== transferenciaAtiva?.turmaAtual) {
                const opt = document.createElement('option');
                opt.value = t.Nome_Turma;
                opt.textContent = t.Nome_Turma;
                selectTurma.appendChild(opt);
            }
        });
        selectTurma.disabled = false;
    });

    if (btnSalvar) btnSalvar.addEventListener('click', () => {
        if (!transferenciaAtiva) return;
        
        const novaTurma = selectTurma.value;
        const justificativa = document.getElementById('transf-justificativa').value.trim();
        const responsavel = document.getElementById('transf-responsavel').value;

        if (!novaTurma) {
            alert('Por favor, selecione a nova turma.');
            return;
        }
        if (!justificativa) {
            alert('Por favor, informe a justificativa da transferência.');
            return;
        }

        // 1. Atualiza Cadastro do Aluno na Planilha
        const indexAluno = alunosCadastrados.findIndex(a => a.Nome === transferenciaAtiva.nome);
        if (indexAluno > -1) {
            alunosCadastrados[indexAluno].Turma = novaTurma;
            localStorage.setItem('alunosCadastrados', JSON.stringify(alunosCadastrados));
        }

        // Envia para o Apps Script um pedido de Update na aba Alunos
        const payloadUpdateAluno = {
            Nome: transferenciaAtiva.nome,
            Turma: novaTurma,
            aba: 'Alunos',
            isUpdate: true
        };
        postData('/api/alunos_update', payloadUpdateAluno);

        // 2. Gera Ocorrência no Histórico
        // Precisamos formatar a data para o padrão 'yyyy-mm-dd' igual à frequência para agrupar na timeline
        const hoje = new Date();
        const yyyy = hoje.getFullYear();
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const dd = String(hoje.getDate()).padStart(2, '0');
        const dataFreqFormat = `${yyyy}-${mm}-${dd}`;

        const registroOcorrencia = {
            Data: dataFreqFormat,
            Turno: document.getElementById('transf-novo-turno').value,
            Turma: novaTurma,
            Nome_Aluno: transferenciaAtiva.nome,
            Tipo_Ocorrencia: 'Transferência de Turma',
            Descricao: `Transferido da Turma: ${transferenciaAtiva.turmaAtual} para Turma: ${novaTurma}. Justificativa: ${justificativa}`,
            Envolvidos: '',
            Notificar_Responsaveis: 'Sim',
            Responsavel_Cadastro: responsavel,
            aba: 'Ocorrencias'
        };
        postData('/api/ocorrencias', registroOcorrencia);
        ocorrenciasSalvas.push(registroOcorrencia);
        localStorage.setItem('ocorrenciasSalvas', JSON.stringify(ocorrenciasSalvas));

        alert('Transferência realizada com sucesso!');
        document.getElementById('modal-transferencia').style.display = 'none';
        
        // Atualiza a tabela na tela para sumir o aluno da visão atual
        const turmaContainerTitulo = document.getElementById('turma-selecionada-titulo')?.innerText;
        if (turmaContainerTitulo === transferenciaAtiva.turmaAtual) {
             if(typeof renderizarTabelaAlunos === 'function') {
                 renderizarTabelaAlunos(turmaContainerTitulo);
             }
        }
        transferenciaAtiva = null;
    });
});

// --- Módulo Dashboard ---
function initDashboardModule() {
    const inputData = document.getElementById('dash-data');
    const selectTurno = document.getElementById('dash-turno');
    if (!inputData || !selectTurno) return;

    // Seta data atual se estiver vazio
    if (!inputData.value) {
        const hoje = new Date();
        const yyyy = hoje.getFullYear();
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const dd = String(hoje.getDate()).padStart(2, '0');
        inputData.value = `${yyyy}-${mm}-${dd}`;
    }

    function calcularDashboard() {
        const dataSelecionada = inputData.value;
        const turnoSelecionado = selectTurno.value;

        if (!dataSelecionada) return;

        // 1. Filtrar Turmas
        let turmasDoTurno = turmasCadastradas;
        if (turnoSelecionado !== "Todos") {
            turmasDoTurno = turmasCadastradas.filter(t => t.Turno === turnoSelecionado);
        }

        if (turmasDoTurno.length === 0) {
            limparDashboard();
            return;
        }

        // 2. Variáveis de Agrupamento
        let totalAlunos = 0;
        let totalPresentes = 0;
        let totalAusentes = 0;
        let totalPresentesFinais = 0; // Para a porcentagem da Consolidada
        
        const frequenciaDoDia = frequenciaDiaria.filter(f => f.Data === dataSelecionada && (turnoSelecionado === "Todos" || f.Turno === turnoSelecionado));
        const ocorrenciasDoDia = ocorrenciasSalvas.filter(o => o.Data === dataSelecionada && (turnoSelecionado === "Todos" || o.Turno === turnoSelecionado));

        const tbodyTurmas = document.getElementById('dash-tabela-turmas');
        tbodyTurmas.innerHTML = '';
        
        const listaAlertas = document.getElementById('lista-alertas-pendencia');
        listaAlertas.innerHTML = '';
        let temAlerta = false;

        // 3. Varredura por Turma
        turmasDoTurno.forEach(turma => {
            const alunosDaTurma = alunosCadastrados.filter(a => a.Turma === turma.Nome_Turma);
            totalAlunos += alunosDaTurma.length;

            if (alunosDaTurma.length === 0) return; // Turma sem alunos

            const frequenciaDestaTurma = frequenciaDoDia.filter(f => alunosDaTurma.some(a => a.Nome === f.Nome_Aluno));

            let statusEntrada = false;
            let statusSaida = false;
            let presentesTurmaFinais = 0;

            if (frequenciaDestaTurma.length > 0) {
                statusEntrada = frequenciaDestaTurma.some(f => f.Chamada_Entrada !== '');
                statusSaida = frequenciaDestaTurma.some(f => f.Chamada_Saida !== '');

                frequenciaDestaTurma.forEach(f => {
                    // Contagem de Entrada para os KPIs absolutos
                    if (f.Chamada_Entrada === 'P') {
                        totalPresentes++;
                    } else if (f.Chamada_Entrada === 'F') {
                        totalAusentes++;
                    }
                    
                    // Contagem Frequência Final Consolidada para % da turma e global
                    if (f.Frequencia_Dia === 'P' || f.Frequencia_Dia === 'FJ') {
                        presentesTurmaFinais++;
                        totalPresentesFinais++;
                    }
                });
            }

            // Gerar Alertas (Baseado em pendência em relação à turma)
            if (!statusEntrada) {
                const li = document.createElement('li');
                li.innerHTML = `Turma <strong>${turma.Nome_Turma}</strong>: Frequência de <strong>Entrada</strong> pendente.`;
                listaAlertas.appendChild(li);
                temAlerta = true;
            } 
            if (!statusSaida && statusEntrada) { // Se nem a entrada fez, foca no alerta da entrada primeiro ou mostra ambos. Vamos mostrar se estiver pendente.
                const li = document.createElement('li');
                li.innerHTML = `Turma <strong>${turma.Nome_Turma}</strong>: Frequência de <strong>Saída</strong> pendente.`;
                listaAlertas.appendChild(li);
                temAlerta = true;
            }

            // Alimentar Tabela da Turma
            const porcentagemTurma = alunosDaTurma.length > 0 ? Math.round((presentesTurmaFinais / alunosDaTurma.length) * 100) : 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${turma.Nome_Turma}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${statusEntrada ? '<span class="material-icons" style="color: #10b981;">check_circle</span>' : '<span class="material-icons" style="color: #ef4444;">pending</span>'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${statusSaida ? '<span class="material-icons" style="color: #10b981;">check_circle</span>' : '<span class="material-icons" style="color: #ef4444;">pending</span>'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${porcentagemTurma >= 75 ? '#10b981' : '#ef4444'};">${porcentagemTurma}%</td>
            `;
            tbodyTurmas.appendChild(tr);
        });

        // 4. Renderizar UI
        document.getElementById('dash-alertas').style.display = temAlerta ? 'block' : 'none';

        document.getElementById('kpi-total').innerText = totalAlunos;
        document.getElementById('kpi-presentes').innerText = totalPresentes;
        document.getElementById('kpi-ausentes').innerText = totalAusentes;
        
        let freqFinalGlobal = totalAlunos > 0 ? Math.round((totalPresentesFinais / totalAlunos) * 100) : 0;
        document.getElementById('kpi-porcentagem').innerText = `${freqFinalGlobal}%`;
        
        document.getElementById('kpi-ocorrencias').innerText = ocorrenciasDoDia.length;

        // Lista Resumo de Ocorrências
        const listaOcorrencias = document.getElementById('dash-lista-ocorrencias');
        listaOcorrencias.innerHTML = '';
        if (ocorrenciasDoDia.length === 0) {
            listaOcorrencias.innerHTML = '<p style="color: #64748b; padding: 10px;">Nenhuma ocorrência registrada neste dia/turno.</p>';
        } else {
            ocorrenciasDoDia.slice().reverse().forEach(oc => {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #e2e8f0';
                div.innerHTML = `
                    <strong>${oc.Nome_Aluno}</strong> <span style="color: #64748b; font-size: 12px;">(${oc.Turma})</span><br>
                    <span style="color: #b91c1c; font-size: 14px; display: inline-flex; align-items: center; gap: 4px;">
                        <span class="material-icons" style="font-size: 16px;">${oc.Tipo_Ocorrencia === 'Atraso' ? 'schedule' : (oc.Tipo_Ocorrencia === 'Transferência de Turma' ? 'swap_horiz' : 'gavel')}</span>
                        ${oc.Tipo_Ocorrencia}
                    </span>
                `;
                listaOcorrencias.appendChild(div);
            });
        }
    }

    function limparDashboard() {
        document.getElementById('kpi-total').innerText = '0';
        document.getElementById('kpi-presentes').innerText = '0';
        document.getElementById('kpi-ausentes').innerText = '0';
        document.getElementById('kpi-porcentagem').innerText = '0%';
        document.getElementById('kpi-ocorrencias').innerText = '0';
        document.getElementById('dash-tabela-turmas').innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhuma turma encontrada.</td></tr>';
        document.getElementById('dash-alertas').style.display = 'none';
        document.getElementById('dash-lista-ocorrencias').innerHTML = '';
    }

    inputData.addEventListener('change', calcularDashboard);
    selectTurno.addEventListener('change', calcularDashboard);

    // Timeout para dar tempo de carregar os dados se for a primeira tela
    setTimeout(calcularDashboard, 300);
}

// --- Funções Auxiliares de Foto (Drive) ---

/**
 * Converte a URL padrão de visualização do Google Drive para o formato compatível com a tag <img>
 * @param {string} url - URL do Drive ou Base64
 * @returns {string} URL compatível ou a própria Base64
 */
window.formatarURLDrive = function(url) {
    if (!url) return '';
    // Se for um link do Google Drive (ex: https://drive.google.com/file/d/ID/view)
    if (url.includes('drive.google.com/file/d/')) {
        const id = url.split('/d/')[1].split('/')[0];
        return `https://drive.google.com/uc?id=${id}`;
    }
    // Se já for base64 ou link direto
    return url;
};

/**
 * Comprime um arquivo de imagem no cliente usando Canvas
 * @param {File} file Arquivo original
 * @param {number} maxWidth Largura máxima
 * @param {number} quality Qualidade (0 a 1)
 * @returns {Promise<string>} Base64 comprimido
 */
window.compressImage = function(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Reduz qualidade para webp ou jpeg
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

// --- WebRTC Camera Customizada ---
let webrtcStream = null;
let alunoCameraAtual = null;

window.abrirCameraWebRTC = async function(nomeAluno) {
    alunoCameraAtual = nomeAluno;
    const modal = document.getElementById('modal-camera-webrtc');
    const video = document.getElementById('video-webrtc');
    
    try {
        webrtcStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        });
        video.srcObject = webrtcStream;
        modal.style.display = 'flex';
    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        alert("Não foi possível acessar a câmera do seu dispositivo. Verifique as permissões do navegador.");
    }
};

window.fecharCameraWebRTC = function() {
    const modal = document.getElementById('modal-camera-webrtc');
    const video = document.getElementById('video-webrtc');
    if (webrtcStream) {
        webrtcStream.getTracks().forEach(track => track.stop());
        webrtcStream = null;
    }
    video.srcObject = null;
    modal.style.display = 'none';
};

// Listeners do Modal
setTimeout(() => {
    const btnFechar = document.getElementById('fechar-camera-webrtc');
    if(btnFechar) btnFechar.addEventListener('click', window.fecharCameraWebRTC);

    const btnCapturar = document.getElementById('btn-capturar-webrtc');
    if(btnCapturar) {
        btnCapturar.addEventListener('click', () => {
            const video = document.getElementById('video-webrtc');
            if (!webrtcStream || !video) return;

            // Criar um canvas para tirar um 'snapshot'
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Gerar base64 JPG (já com compressão ~0.7)
            const base64Foto = canvas.toDataURL('image/jpeg', 0.7);
            
            window.fecharCameraWebRTC();
            
            // Processa o Upload
            const statusDiv = document.getElementById('status-upload-foto');
            if(statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.innerText = 'Enviando foto da câmera...';
            }
            
            const displayFoto = document.getElementById('display-foto-aluno');
            if(displayFoto) {
                displayFoto.innerHTML = `<img src="${base64Foto}" style="width: 100%; height: 100%; object-fit: cover;">`;
            }

            const payloadUpdateFoto = {
                Nome: alunoCameraAtual,
                fotoBase64: base64Foto,
                aba: 'Alunos',
                isUpdate: true,
                isPhotoUpload: true
            };

            if (navigator.onLine) {
                fetch(GOOGLE_API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadUpdateFoto)
                });
                
                const idx = alunosCadastrados.findIndex(a => a.Nome === alunoCameraAtual);
                if(idx > -1) {
                    alunosCadastrados[idx].URL_Foto = base64Foto; 
                    localStorage.setItem('alunosCadastrados', JSON.stringify(alunosCadastrados));
                }
                
                if(statusDiv) {
                    statusDiv.innerText = 'Foto da câmera atualizada!';
                    statusDiv.style.color = '#10b981';
                    setTimeout(() => statusDiv.style.display = 'none', 3000);
                }
            } else {
                alert('Você está offline. Conecte-se para enviar a foto.');
                if(statusDiv) statusDiv.style.display = 'none';
            }
        });
    }
}, 500);

// --- Módulo Relatórios de Frequência ---
function initRelatoriosModule() {
    const selTurno = document.getElementById('relatorio-turno');
    const selTurma = document.getElementById('relatorio-turma');
    const selMes = document.getElementById('relatorio-mes');
    const btnGerar = document.getElementById('btn-gerar-relatorio');

    // Inicializa mês atual
    selMes.value = new Date().getMonth();

    const popularTurmas = () => {
        const turno = selTurno.value;
        selTurma.innerHTML = '<option value="">Selecione a Turma</option>';
        if (!turno) {
            selTurma.disabled = true;
            return;
        }

        const turmasDoTurno = turmasCadastradas.filter(t => t.Turno === turno);
        if (turmasDoTurno.length === 0) {
            selTurma.innerHTML = '<option value="">Nenhuma turma encontrada</option>';
            selTurma.disabled = true;
            return;
        }

        turmasDoTurno.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.Nome_Turma; // CORREÇÃO AQUI
            opt.textContent = t.Nome_Turma; // CORREÇÃO AQUI
            selTurma.appendChild(opt);
        });
        selTurma.disabled = false;
    };

    selTurno.addEventListener('change', popularTurmas);

    // Garante que os arrays não estejam vazios se o usuário vier direto para a aba
    if (turmasCadastradas.length === 0 || alunosCadastrados.length === 0) {
        selTurma.innerHTML = '<option value="">Carregando turmas...</option>';
        if (navigator.onLine) {
             Promise.all([
                 fetch(GOOGLE_API_URL + "?action=getTurmas").then(res => res.json()),
                 fetch(GOOGLE_API_URL + "?action=getAlunos").then(res => res.json()),
                 fetch(GOOGLE_API_URL + "?action=getFrequencia").then(res => res.json()),
                 fetch(GOOGLE_API_URL + "?action=getCalendario").then(res => res.json())
             ]).then(([resTurmas, resAlunos, resFreq, resCal]) => {
                 if (resTurmas.status === "success") turmasCadastradas = resTurmas.dados;
                 if (resAlunos.status === "success") alunosCadastrados = resAlunos.dados;
                 if (resFreq.status === "success") frequenciaDiaria = resFreq.dados || [];
                 if (resCal.status === "success") {
                     eventosCalendario = (resCal.dados || []).map(e => {
                         e.Data = formatarDataComparacao(e.Data);
                         return e;
                     });
                 }
                 popularTurmas();
             }).catch(err => console.error("Erro ao carregar dados", err));
        }
    } else {
        popularTurmas();
    }

    // Remove event listener antigo se houver
    btnGerar.removeEventListener('click', gerarRelatorioFrequenciaMensal);
    btnGerar.addEventListener('click', gerarRelatorioFrequenciaMensal);
}

function gerarRelatorioFrequenciaMensal() {
    const turno = document.getElementById('relatorio-turno').value;
    const turma = document.getElementById('relatorio-turma').value;
    const mesIdx = parseInt(document.getElementById('relatorio-mes').value);
    const ano = new Date().getFullYear();

    if (!turno || !turma) {
        alert("Por favor, selecione Turno e Turma para gerar o relatório.");
        return;
    }

    const alunosTurma = alunosCadastrados.filter(a => a.Turma === turma);
    if (alunosTurma.length === 0) {
        alert("Nenhum aluno encontrado nesta turma.");
        return;
    }

    // 1. Calcular Dias Letivos do Mês
    const diasLetivos = [];
    const diasNoMes = new Date(ano, mesIdx + 1, 0).getDate(); // Último dia do mês

    for (let d = 1; d <= diasNoMes; d++) {
        // formatar para YYYY-MM-DD
        const dataStr = `${ano}-${String(mesIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dataObj = new Date(ano, mesIdx, d); // Evita fuso horário com T12:00
        const diaSemana = dataObj.getDay(); // 0=Dom, 6=Sáb

        const eventoCalendario = eventosCalendario.find(e => e.Data === dataStr);
        let isLetivo = false;

        if (diaSemana === 0) {
            // Domingo nunca é letivo
            isLetivo = false;
        } else if (diaSemana === 6) {
            // Sábado só é letivo se estiver no calendário como 'Sábado Letivo'
            if (eventoCalendario && eventoCalendario.Tipo_Dia === 'Sábado Letivo') {
                isLetivo = true;
            }
        } else {
            // Segunda a Sexta são letivos por padrão, a não ser que seja Feriado/Recesso
            isLetivo = true;
            if (eventoCalendario && (eventoCalendario.Tipo_Dia === 'Feriado' || eventoCalendario.Tipo_Dia === 'Recesso Escolar')) {
                isLetivo = false;
            }
        }

        if (isLetivo) {
            diasLetivos.push(dataStr);
        }
    }

    if (diasLetivos.length === 0) {
        alert("Não há dias letivos cadastrados/válidos para este mês.");
        return;
    }

    // 2. Montar Tabela
    const cabecalho = document.getElementById('cabecalho-dias-relatorio');
    const corpo = document.getElementById('corpo-tabela-relatorio');

    // Cabeçalho
    let htmlCabecalho = `<th style="padding: 10px; min-width: 200px; position: sticky; left: 0; background-color: #f8fafc; z-index: 2;">Nome do Aluno</th>`;
    diasLetivos.forEach(dia => {
        const diaFormatado = dia.split('-')[2]; // Pega apenas o 'DD'
        htmlCabecalho += `<th style="padding: 10px; text-align: center; min-width: 35px;" title="${dia.split('-').reverse().join('/')}">${diaFormatado}</th>`;
    });
    htmlCabecalho += `<th style="padding: 10px; text-align: center; background-color: #e2e8f0;">% Mensal</th>`;
    htmlCabecalho += `<th style="padding: 10px; text-align: center; color: #10b981;">P</th>`;
    htmlCabecalho += `<th style="padding: 10px; text-align: center; color: #ef4444;">F</th>`;
    cabecalho.innerHTML = htmlCabecalho;

    // Corpo
    let htmlCorpo = '';
    // Ordenar alunos alfabeticamente
    alunosTurma.sort((a, b) => a.Nome.localeCompare(b.Nome)).forEach(aluno => {
        let totalP = 0;
        let totalF = 0;

        htmlCorpo += `<tr style="border-bottom: 1px solid #e2e8f0;">`;
        htmlCorpo += `<td style="padding: 10px; position: sticky; left: 0; background-color: white; z-index: 1; font-weight: 500;">${aluno.Nome}</td>`;

        diasLetivos.forEach(dia => {
            // Busca a frequência deste aluno neste dia
            const registro = frequenciaDiaria.find(f => f.Data === dia && f.Nome_Aluno === aluno.Nome);
            
            let status = '-';
            let color = '#94a3b8'; // Cinza padrão

            if (registro) {
                // Tenta pegar a Frequência Consolidada, senão calcula
                status = registro.Frequencia_Dia;
                if (!status || status === '-') {
                    status = calcularResultadoFrequencia(registro.Chamada_Entrada, registro.Chamada_Saida);
                }
            }

            if (status === 'P') {
                totalP++;
                color = '#10b981';
            } else if (status === 'F') {
                totalF++;
                color = '#ef4444';
            } else if (status === 'FJ') {
                totalP++; // Falta Justificada conta como PRESENÇA na % (decisão do usuário)
                color = '#f59e0b';
            }

            htmlCorpo += `<td style="padding: 10px; text-align: center; color: ${color}; font-weight: bold;">${status}</td>`;
        });

        // Cálculos Finais
        const totalDiasDoMesCalculo = diasLetivos.length;
        const porcentagemMensal = totalDiasDoMesCalculo > 0 ? Math.round((totalP / totalDiasDoMesCalculo) * 100) : 0;
        
        let colorPorcentagem = '#10b981';
        if (porcentagemMensal < 75) colorPorcentagem = '#ef4444'; // Menos de 75% é vermelho

        htmlCorpo += `<td style="padding: 10px; text-align: center; font-weight: bold; background-color: #f1f5f9; color: ${colorPorcentagem};">${porcentagemMensal}%</td>`;
        htmlCorpo += `<td style="padding: 10px; text-align: center; font-weight: bold; color: #10b981;">${totalP}</td>`;
        htmlCorpo += `<td style="padding: 10px; text-align: center; font-weight: bold; color: #ef4444;">${totalF}</td>`;
        
        htmlCorpo += `</tr>`;
    });

    corpo.innerHTML = htmlCorpo;

    // Atualiza Título
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    document.getElementById('titulo-relatorio-gerado').innerText = `Relatório: ${turma} (${meses[mesIdx]} - ${diasLetivos.length} dias letivos)`;
    
    // Mostra a Tabela
    document.getElementById('area-tabela-relatorio').style.display = 'block';
}

// --- Módulo Permissões ---
function initPermissoesModule() {
    const form = document.getElementById('permissoes-form');
    const selectPerfil = document.getElementById('Perm_Perfil');
    const checkboxes = document.querySelectorAll('#checkboxes-modulos input[type="checkbox"]');
    const tbody = document.getElementById('tabela-usuarios-body');

    // Auto-selecionar módulos dependendo do perfil
    if (selectPerfil) {
        selectPerfil.addEventListener('change', (e) => {
            const perfil = e.target.value;
            // Desmarca todos
            checkboxes.forEach(cb => cb.checked = false);

            if (perfil === 'Manager') {
                checkboxes.forEach(cb => cb.checked = true);
            } else if (perfil === 'Secretaria' || perfil === 'Coordenação') {
                ['dashboard', 'alunos', 'turmas', 'frequencia', 'ocorrencias', 'pedemeia', 'calendario', 'relatorios'].forEach(v => {
                    const cb = document.querySelector(`#checkboxes-modulos input[value="${v}"]`);
                    if(cb) cb.checked = true;
                });
            } else if (perfil === 'Professor') {
                ['frequencia', 'ocorrencias', 'calendario'].forEach(v => {
                    const cb = document.querySelector(`#checkboxes-modulos input[value="${v}"]`);
                    if(cb) cb.checked = true;
                });
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Pega os checkboxes marcados
            const modulosMarcados = Array.from(checkboxes)
                                        .filter(cb => cb.checked)
                                        .map(cb => cb.value)
                                        .join(', ');
            
            data.Modulos = modulosMarcados;
            data.aba = "Usuarios"; // Para a API saber a aba do Google Sheets
            
            postData('/api/usuarios', data);
            alert('Usuário salvo na fila de sincronização (offline/online)!');
            form.reset();
            // Esperar um tempo antes de recarregar a tabela (devido a lentidão do Google)
            setTimeout(carregarUsuariosNaTabela, 3000);
        });
    }

    // Carregar usuários
    carregarUsuariosNaTabela();

    function carregarUsuariosNaTabela() {
        if (!navigator.onLine) {
            if(tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">Você está offline. Conecte-se para ver os usuários.</td></tr>';
            return;
        }

        if(tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">Carregando usuários da planilha...</td></tr>';
        
        fetch(GOOGLE_API_URL + "?action=getUsuarios")
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    const usuarios = data.dados;
                    if(tbody) tbody.innerHTML = '';
                    
                    if (usuarios.length === 0) {
                        if(tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">Nenhum usuário encontrado na aba "Usuarios".</td></tr>';
                        return;
                    }

                    usuarios.forEach(u => {
                        if(tbody) tbody.innerHTML += `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 12px; font-weight: 500;">${u.Email || '-'}</td>
                                <td style="padding: 12px;"><span style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: #334155;">${u.Perfil || '-'}</span></td>
                                <td style="padding: 12px; font-size: 11px; color: #64748b; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${u.Modulos || ''}">${u.Modulos || '-'}</td>
                                <td style="padding: 12px; text-align: center;">
                                    <button onclick="alert('Edição de usuários deve ser feita diretamente na planilha por enquanto.')" style="background: none; border: none; color: #3b82f6; cursor: pointer;" title="Editar"><span class="material-icons">edit</span></button>
                                    <button onclick="excluirUsuario('${u.Email}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px;" title="Excluir"><span class="material-icons">delete</span></button>
                                </td>
                            </tr>
                        `;
                    });
                } else {
                    if(tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">Erro: ${data.message}</td></tr>`;
                }
            })
            .catch(err => {
                console.error(err);
                if(tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">Erro ao buscar usuários (Verifique se a aba Usuarios existe).</td></tr>';
            });
    }

    window.excluirUsuario = function(email) {
        if(confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
            postData('/api/usuarios', { Email: email, Acao: 'Excluir', aba: 'Usuarios' });
            alert('Comando enviado! O usuário será removido da planilha.');
            setTimeout(carregarUsuariosNaTabela, 3000);
        }
    }
}
