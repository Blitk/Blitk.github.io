
"use strict";

/*
 * ROOT ACCESS — GHOST PROTOCOL
 * Jogo narrativo de cybersecurity em ambiente inteiramente simulado.
 * Sem rede, sem execução de comandos do sistema operacional.
 */

(() => {
  const $ = (selector) => document.querySelector(selector);

  const screens = {
    title: $("#screen-title"),
    intro: $("#screen-intro"),
    game: $("#screen-game"),
    ending: $("#screen-ending")
  };

  const STORAGE_KEY = "root-access-ghost-protocol-v1";
  const SETTINGS_KEY = "root-access-settings-v1";

  const DEFAULT_SETTINGS = {
    effects: true,
    typing: true,
    contrast: false,
    reducedMotion: false
  };

  const MISSIONS = [
    {
      id: "signal",
      title: "Sinal Fantasma",
      type: "INVESTIGAÇÃO",
      brief: "Um servidor abandonado emitiu um sinal que não deveria existir.",
      objective: [
        "Investigue o ambiente simulado e descubra qual arquivo contém a mensagem deixada pelo remetente.",
        "Objetivo: localizar e ler o arquivo <code>signal.log</code>."
      ],
      hint: "Comece examinando os arquivos disponíveis. Depois, leia o registro relacionado ao sinal.",
      required: ["read:signal.log"],
      reward: 100,
      trace: 3,
      intel: [
        {
          id: "signal-origin",
          title: "Origem do sinal",
          text: "O sinal foi retransmitido por um nó identificado como NODE-07."
        }
      ]
    },
    {
      id: "recon",
      title: "Mapa de Ecos",
      type: "RECONHECIMENTO",
      brief: "Reconstrua o inventário de um laboratório fictício.",
      objective: [
        "Analise os serviços fictícios listados no ambiente.",
        "Objetivo: executar uma varredura simulada e inspecionar o serviço <code>web-01</code>."
      ],
      hint: "A varredura mostra os serviços de demonstração. Use inspect no alvo indicado.",
      required: ["scan", "inspect:web-01"],
      reward: 125,
      trace: 5,
      intel: [
        {
          id: "web-01",
          title: "Serviço web-01",
          text: "O serviço é um componente fictício do laboratório, sem conexão com sistemas reais."
        }
      ]
    },
    {
      id: "cipher",
      title: "Chave Quebrada",
      type: "CRIPTOGRAFIA",
      brief: "Uma mensagem foi codificada antes de o sistema ser desligado.",
      objective: [
        "Recupere o conteúdo de <code>cipher.txt</code> e resolva o desafio de decodificação.",
        "Objetivo: identificar a palavra-chave da mensagem."
      ],
      hint: "O arquivo informa que a mensagem foi deslocada três posições no alfabeto. O minigame apresenta a pista necessária.",
      required: ["read:cipher.txt", "minigame"],
      reward: 150,
      trace: 4,
      minigame: "cipher",
      intel: [
        {
          id: "cipher-note",
          title: "Bilhete criptografado",
          text: "A mensagem menciona um projeto que foi retirado dos registros públicos."
        }
      ]
    },
    {
      id: "memory",
      title: "Memória Residual",
      type: "ANÁLISE FORENSE",
      brief: "Fragmentos de logs revelam que alguém esteve no sistema.",
      objective: [
        "Leia <code>access.log</code> e reconstrua a sequência dos eventos.",
        "Objetivo: ordenar corretamente os três eventos apresentados no desafio."
      ],
      hint: "Procure os horários dos registros. A sequência deve seguir do mais antigo para o mais recente.",
      required: ["read:access.log", "minigame"],
      reward: 150,
      trace: 5,
      minigame: "sequence",
      intel: [
        {
          id: "access-pattern",
          title: "Padrão de acesso",
          text: "Os registros sugerem uma atividade automatizada em horários incomuns."
        }
      ]
    },
    {
      id: "firewall",
      title: "Porta Silenciosa",
      type: "LÓGICA",
      brief: "Um filtro fictício está bloqueando a comunicação entre dois módulos.",
      objective: [
        "Inspecione <code>firewall.rules</code> e resolva o quebra-cabeça de regras.",
        "Objetivo: selecionar a regra que permite comunicação legítima sem liberar tráfego indiscriminado."
      ],
      hint: "A melhor regra é específica para o serviço autorizado e não abre todos os acessos.",
      required: ["read:firewall.rules", "minigame"],
      reward: 175,
      trace: 4,
      minigame: "firewall",
      intel: [
        {
          id: "firewall-rule",
          title: "Regra de filtragem",
          text: "A configuração anterior era excessivamente permissiva. O princípio de menor privilégio é mais seguro."
        }
      ]
    },
    {
      id: "identity",
      title: "Identidade Fantasma",
      type: "ANÁLISE",
      brief: "Uma conta desconhecida aparece nos registros de auditoria.",
      objective: [
        "Leia <code>identity.json</code> e compare os indicadores de identidade.",
        "Objetivo: identificar a conta que apresenta uma inconsistência no registro."
      ],
      hint: "Compare o identificador da conta com o registro de auditoria apresentado pelo arquivo.",
      required: ["read:identity.json", "minigame"],
      reward: 175,
      trace: 6,
      minigame: "identity",
      intel: [
        {
          id: "identity-clue",
          title: "Inconsistência de identidade",
          text: "Um identificador não corresponde ao inventário de contas esperado."
        }
      ]
    },
    {
      id: "dead-drop",
      title: "Caixa Morta",
      type: "INVESTIGAÇÃO",
      brief: "Uma mensagem escondida indica o próximo ponto da investigação.",
      objective: [
        "Examine <code>dead-drop.txt</code> e encontre a palavra que abre a próxima etapa.",
        "Objetivo: resolver o enigma textual."
      ],
      hint: "A resposta é algo que preserva informação e também pode guardar memórias.",
      required: ["read:dead-drop.txt", "minigame"],
      reward: 175,
      trace: 5,
      minigame: "riddle",
      intel: [
        {
          id: "dead-drop",
          title: "Mensagem recuperada",
          text: "O remetente pede que as evidências sejam preservadas antes de qualquer divulgação."
        }
      ]
    },
    {
      id: "integrity",
      title: "Integridade Zero",
      type: "VALIDAÇÃO",
      brief: "Os arquivos do projeto foram alterados depois do último backup.",
      objective: [
        "Compare os valores fictícios em <code>checksums.txt</code>.",
        "Objetivo: identificar qual registro apresenta divergência."
      ],
      hint: "Uma soma de verificação diferente não prova sozinha uma invasão, mas indica que o conteúdo precisa ser investigado.",
      required: ["read:checksums.txt", "minigame"],
      reward: 200,
      trace: 4,
      minigame: "integrity",
      intel: [
        {
          id: "integrity-check",
          title: "Divergência confirmada",
          text: "Um arquivo não corresponde ao valor de referência registrado."
        }
      ]
    },
    {
      id: "blackout",
      title: "Protocolo Blackout",
      type: "DECISÃO",
      brief: "Você encontrou provas de um programa clandestino. O tempo está acabando.",
      objective: [
        "Leia <code>blackout.txt</code> e avalie as alternativas.",
        "Objetivo: escolher como preservar as evidências e lidar com a descoberta."
      ],
      hint: "Considere a integridade das provas, o impacto sobre pessoas inocentes e a necessidade de uma resposta responsável.",
      required: ["read:blackout.txt", "minigame"],
      reward: 225,
      trace: 5,
      minigame: "blackout",
      intel: [
        {
          id: "blackout-evidence",
          title: "Projeto Blackout",
          text: "O programa coletava dados sem transparência. A origem e a extensão precisam ser confirmadas."
        }
      ]
    },
    {
      id: "ghost-protocol",
      title: "Ghost Protocol",
      type: "DESFECHO",
      brief: "A última mensagem contém a identidade do remetente e uma decisão final.",
      objective: [
        "Recupere <code>final-message.txt</code>, reúna as evidências e escolha o destino dos registros.",
        "Objetivo: concluir a campanha e definir o desfecho."
      ],
      hint: "A campanha considera suas evidências, o rastro deixado e suas escolhas anteriores.",
      required: ["read:final-message.txt", "minigame"],
      reward: 300,
      trace: 3,
      minigame: "ending",
      intel: [
        {
          id: "ghost-reveal",
          title: "Última revelação",
          text: "O remetente deixou pistas para que outra pessoa pudesse decidir o que fazer com a verdade."
        }
      ]
    }
  ];

  const FILES = {
    "signal.log": {
      mission: 0,
      content: [
        "03:17:39 [RELAY] Sinal recebido pelo NODE-07.",
        "03:17:40 [WARN] Origem não identificada.",
        "03:17:42 [MSG] SE VOCÊ ESTÁ LENDO ISTO, AINDA HÁ TEMPO.",
        "03:17:43 [MSG] PROCURE O MAPA DE ECOS."
      ]
    },
    "cipher.txt": {
      mission: 2,
      content: [
        "ARQUIVO RECUPERADO: CIPHER-03",
        "Método declarado: deslocamento de César.",
        "Texto codificado: SURMHWR SKDHWRQ",
        "Pista: cada letra foi deslocada três posições para frente."
      ]
    },
    "access.log": {
      mission: 3,
      content: [
        "00:01:12 [SYSTEM] Inicialização do nó.",
        "00:03:45 [AUDIT] Conta desconhecida consultou o índice.",
        "00:04:09 [SYSTEM] Registro de integridade criado.",
        "Nota: ordene os três eventos do desafio pelo horário."
      ]
    },
    "firewall.rules": {
      mission: 4,
      content: [
        "AMBIENTE: LABORATÓRIO FICTÍCIO",
        "Objetivo: restringir a comunicação ao serviço autorizado.",
        "Princípio recomendado: menor privilégio.",
        "Não existe conexão com um firewall real."
      ]
    },
    "identity.json": {
      mission: 5,
      content: [
        "{",
        '  "audit_id": "USR-104",',
        '  "registered_account": "USR-104",',
        '  "session_account": "USR-140",',
        '  "status": "REQUIRES_REVIEW"',
        "}",
        "Compare o identificador da sessão com o inventário."
      ]
    },
    "dead-drop.txt": {
      mission: 6,
      content: [
        "PARA QUEM ENCONTROU ESTA CAIXA:",
        "Não destrua os registros.",
        "O que preserva informação e pode guardar memórias?",
        "A resposta aponta para o arquivo seguinte."
      ]
    },
    "checksums.txt": {
      mission: 7,
      content: [
        "REFERÊNCIA: A17C",
        "ARQUIVO A: A17C",
        "ARQUIVO B: A17C",
        "ARQUIVO C: B91D",
        "A divergência é um indicador para investigação."
      ]
    },
    "blackout.txt": {
      mission: 8,
      content: [
        "PROJETO BLACKOUT // RASCUNHO RECUPERADO",
        "O programa armazenou dados sem autorização transparente.",
        "A origem dos registros ainda não foi validada.",
        "Preserve as evidências antes de divulgar conclusões."
      ]
    },
    "final-message.txt": {
      mission: 9,
      content: [
        "VOCÊ CHEGOU ATÉ AQUI.",
        "Meu nome não importa tanto quanto as provas.",
        "A rede pode esconder arquivos, mas não pode decidir por você.",
        "Escolha o que acontecerá com o arquivo Ghost Protocol."
      ]
    }
  };

  const HELP_TEXT = [
    "COMANDOS DISPONÍVEIS NO AMBIENTE SIMULADO",
    "",
    "help                Mostra esta ajuda",
    "ls                  Lista arquivos fictícios",
    "pwd                 Mostra o diretório simulado",
    "cat <arquivo>       Lê um arquivo de demonstração",
    "scan                Executa uma varredura fictícia",
    "inspect <alvo>      Examina um alvo do laboratório",
    "status              Mostra o estado da operação",
    "whoami              Mostra a identidade do operador",
    "history             Exibe comandos desta sessão",
    "clear               Limpa a saída do terminal",
    "",
    "DICA: leia os arquivos e siga o objetivo da missão.",
    "Este terminal não executa comandos do sistema operacional."
  ];

  const INITIAL_STATE = {
    missionIndex: 0,
    completed: [],
    xp: 0,
    trace: 0,
    reputation: 0,
    hintsUsed: 0,
    hintsAvailable: 3,
    intel: [],
    discoveredFiles: [],
    commandHistory: [],
    flags: {
      responsibleDisclosure: false,
      preservedEvidence: false,
      recklessChoice: false
    },
    choices: [],
    ending: null,
    minigamesWon: [],
    started: false,
    ended: false
  };

  let state = structuredCloneSafe(INITIAL_STATE);
  let settings = { ...DEFAULT_SETTINGS };
  let currentChallenge = null;
  let commandCount = 0;
  let pendingConfirmation = null;

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      settings = { ...DEFAULT_SETTINGS, ...saved };
    } catch {
      settings = { ...DEFAULT_SETTINGS };
    }
    applySettings();
  }

  function saveSettings() {
    const mapping = {
      effects: "#setting-effects",
      typing: "#setting-typing",
      contrast: "#setting-contrast",
      reducedMotion: "#setting-reduced-motion"
    };

    for (const [key, selector] of Object.entries(mapping)) {
      settings[key] = $(selector).checked;
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings();
    toast("Preferências salvas localmente.");
    $("#settings-dialog").close();
  }

  function applySettings() {
    document.body.classList.toggle("high-contrast", settings.contrast);
    document.body.classList.toggle("reduced-motion", settings.reducedMotion);

    if (!settings.effects || settings.reducedMotion) {
      document.body.classList.add("reduced-motion");
    }

    const mapping = {
      effects: "#setting-effects",
      typing: "#setting-typing",
      contrast: "#setting-contrast",
      reducedMotion: "#setting-reduced-motion"
    };

    for (const [key, selector] of Object.entries(mapping)) {
      const control = $(selector);
      if (control) control.checked = Boolean(settings[key]);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      toast("Não foi possível salvar o progresso neste navegador.", "warning");
    }
    updateContinueButton();
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return false;

      state = {
        ...structuredCloneSafe(INITIAL_STATE),
        ...saved,
        flags: { ...INITIAL_STATE.flags, ...(saved.flags || {}) }
      };

      state.completed = Array.isArray(state.completed) ? state.completed : [];
      state.intel = Array.isArray(state.intel) ? state.intel : [];
      state.discoveredFiles = Array.isArray(state.discoveredFiles)
        ? state.discoveredFiles
        : [];
      state.commandHistory = Array.isArray(state.commandHistory)
        ? state.commandHistory
        : [];
      state.choices = Array.isArray(state.choices) ? state.choices : [];
      state.minigamesWon = Array.isArray(state.minigamesWon)
        ? state.minigamesWon
        : [];

      state.missionIndex = Math.min(
        Math.max(0, Number(state.missionIndex) || 0),
        MISSIONS.length - 1
      );

      return true;
    } catch {
      return false;
    }
  }

  function updateContinueButton() {
    $("#continue-button").hidden = !state.started || state.ended;
  }

  function showScreen(name) {
    for (const [key, element] of Object.entries(screens)) {
      const active = key === name;
      element.hidden = !active;
      element.classList.toggle("active", active);
    }

    window.scrollTo({ top: 0, behavior: settings.reducedMotion ? "auto" : "smooth" });
  }

  function toast(message, type = "success") {
    const region = $("#toast-region");
    const item = document.createElement("div");
    item.className = `toast ${type === "error" ? "toast-error" : type === "warning" ? "toast-warning" : ""}`;
    item.textContent = message;
    region.appendChild(item);

    window.setTimeout(() => item.remove(), 3400);
  }

  function addTerminalLine(text, type = "system-line") {
    const output = $("#terminal-output");
    const line = document.createElement("p");
    line.className = `terminal-line ${type}`;

    // Usa texto puro para evitar interpretar saídas como HTML.
    line.textContent = text;
    output.appendChild(line);

    while (output.children.length > 150) {
      output.removeChild(output.firstElementChild);
    }

    output.scrollTop = output.scrollHeight;
    $("#terminal-line-count").textContent = `${output.children.length} LINHAS`;
  }

  function printLines(lines, type = "system-line") {
    for (const line of lines) addTerminalLine(line, type);
  }

  function clearTerminal() {
    $("#terminal-output").replaceChildren();
    $("#terminal-line-count").textContent = "0 LINHAS";
  }

  function currentMission() {
    return MISSIONS[state.missionIndex];
  }

  function addIntel(item) {
    if (state.intel.some((entry) => entry.id === item.id)) return;

    state.intel.push(item);
    const list = $("#intel-list");
    list.querySelector(".empty-state")?.remove();

    const entry = document.createElement("article");
    entry.className = "intel-entry";

    const icon = document.createElement("span");
    icon.className = "intel-icon";
    icon.textContent = "◆";

    const body = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const text = document.createElement("p");
    text.textContent = item.text;

    body.append(title, text);
    entry.append(icon, body);
    list.appendChild(entry);

    $("#intel-count").textContent = `${state.intel.length} ENTRADAS`;
  }

  function renderIntel() {
    const list = $("#intel-list");
    list.replaceChildren();

    if (state.intel.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Nenhuma evidência recuperada nesta operação.";
      list.appendChild(empty);
    } else {
      state.intel.forEach((item) => {
        const entry = document.createElement("article");
        entry.className = "intel-entry";

        const icon = document.createElement("span");
        icon.className = "intel-icon";
        icon.textContent = "◆";

        const body = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = item.title;
        const text = document.createElement("p");
        text.textContent = item.text;

        body.append(title, text);
        entry.append(icon, body);
        list.appendChild(entry);
      });
    }

    $("#intel-count").textContent = `${state.intel.length} ENTRADAS`;
  }

  function renderMissionList() {
    const list = $("#mission-list");
    list.replaceChildren();

    MISSIONS.forEach((mission, index) => {
      const completed = state.completed.includes(mission.id);
      const current = index === state.missionIndex;
      const unlocked = index <= state.missionIndex || completed;

      const button = document.createElement("button");
      button.type = "button";
      button.className = [
        "mission-list-item",
        current ? "current" : "",
        completed ? "completed" : ""
      ].filter(Boolean).join(" ");
      button.disabled = !unlocked;
      button.setAttribute("aria-current", current ? "step" : "false");
      button.title = unlocked ? mission.title : "Missão ainda bloqueada";

      const number = document.createElement("span");
      number.className = "mission-number";
      number.textContent = String(index + 1).padStart(2, "0");

      const name = document.createElement("span");
      name.className = "mission-name";
      name.textContent = mission.title;

      const marker = document.createElement("span");
      marker.className = "mission-state";
      marker.textContent = completed ? "✓" : current ? "●" : unlocked ? "○" : "·";

      button.append(number, name, marker);

      button.addEventListener("click", () => {
        if (index === state.missionIndex) return;
        if (state.completed.includes(mission.id)) {
          toast("Esta missão já foi concluída.", "warning");
        }
      });

      list.appendChild(button);
    });
  }

  function renderStats() {
    const level = Math.floor(state.xp / 250) + 1;
    const xpInLevel = state.xp % 250;

    $("#xp-value").textContent = `${state.xp} XP`;
    $("#xp-progress").style.width = `${(xpInLevel / 250) * 100}%`;
    $("#level-label").textContent = `NÍVEL ${level}`;

    $("#trace-value").textContent = `${state.trace}%`;
    $("#trace-progress").style.width = `${Math.min(100, state.trace)}%`;

    const reputation = state.reputation >= 4
      ? "CONFIÁVEL"
      : state.reputation <= -3
        ? "SUSPEITA"
        : "NEUTRA";

    $("#reputation-value").textContent = reputation;
    $("#missions-value").textContent = `${state.completed.length} / ${MISSIONS.length}`;
    $("#operator-rank").textContent = rankForLevel(level);
  }

  function rankForLevel(level) {
    if (level >= 8) return "LENDÁRIO";
    if (level >= 6) return "ESPECIALISTA";
    if (level >= 4) return "ANALISTA";
    if (level >= 2) return "OPERADOR";
    return "NOVATO";
  }

  function renderMission() {
    const mission = currentMission();

    $("#mission-index-label").textContent =
      `${String(state.missionIndex + 1).padStart(2, "0")} / ${MISSIONS.length}`;
    $("#mission-title").textContent = mission.title;
    $("#mission-brief").textContent = mission.brief;
    $("#mission-type-badge").textContent = mission.type;

    // A descrição das missões usa pequenos trechos de HTML estático definidos
    // pelo próprio jogo, nunca entrada digitada pelo jogador.
    $("#mission-objective").innerHTML = mission.objective
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");

    $("#hint-output").hidden = true;
    $("#hint-output").textContent = "";
    $("#hint-counter").textContent =
      `Pistas disponíveis: ${state.hintsAvailable}`;

    $("#minigame-panel").hidden = true;
    $("#minigame-content").replaceChildren();
    $("#mission-complete-panel").hidden = state.completed.includes(mission.id);

    renderMissionList();
    renderStats();
    renderIntel();

    $("#terminal-path").textContent = `ghost@node-${String(state.missionIndex + 7).padStart(2, "0")}:~`;
    clearTerminal();
    printLines([
      "ROOT ACCESS [SIMULADO] — sessão pronta.",
      "Digite help para ver os comandos disponíveis.",
      `OPERAÇÃO ${String(state.missionIndex + 1).padStart(2, "0")}: ${mission.title}`
    ]);

    const previousFiles = Object.keys(FILES)
      .filter((name) => FILES[name].mission <= state.missionIndex);

    if (state.missionIndex === 0) {
      printLines(["Diretório inicial: /ghost/home", "Dica: use ls para listar os arquivos."]);
    } else {
      printLines([`Diretório simulado: /ghost/mission-${state.missionIndex + 1}`]);
    }

    $("#terminal-input").value = "";
    $("#terminal-input").focus({ preventScroll: true });

    if (state.completed.includes(mission.id)) {
      $("#mission-complete-panel").hidden = false;
      $("#completion-heading").textContent = "Operação já concluída.";
      $("#completion-message").textContent = "Seu progresso foi recuperado.";
      $("#completion-rewards").textContent = `${mission.reward} XP registrados`;
      $("#next-mission-button").textContent =
        state.missionIndex === MISSIONS.length - 1 ? "VER DESFECHO →" : "PRÓXIMA OPERAÇÃO →";
    }

    saveProgress();
  }

  function startNewGame() {
    state = structuredCloneSafe(INITIAL_STATE);
    state.started = true;
    commandCount = 0;
    currentChallenge = null;
    saveProgress();

    $("#operator-name").textContent = "GHOST";
    $("#intro-text").textContent =
      "Você não sabe quem enviou a mensagem. Sabe apenas que alguém apagou registros importantes e deixou uma trilha de arquivos fictícios para trás.\n\nSua tarefa é investigar o que aconteceu, preservar as evidências e decidir o destino das informações. Cada escolha pode alterar o resultado.\n\nNão há uma organização real por trás desta operação. Tudo acontece dentro de um laboratório narrativo isolado.";

    showScreen("intro");
  }

  function continueGame() {
    if (!state.started || state.ended) {
      startNewGame();
      return;
    }

    showScreen("game");
    renderMission();
    toast("Sessão recuperada.");
  }

  function beginMissions() {
    state.started = true;
    saveProgress();
    showScreen("game");
    renderMission();
  }

  function commandHelp() {
    printLines(HELP_TEXT);
  }

  function listFiles() {
    const available = Object.keys(FILES).filter((name) => {
      return FILES[name].mission <= state.missionIndex;
    });

    printLines([
      "Diretório simulado: /ghost/mission",
      ...available.map((name) => `${state.discoveredFiles.includes(name) ? "  " : "* "}${name}`),
      "",
      "* = arquivo ainda não lido"
    ]);
  }

  function readFile(filename) {
    const file = FILES[filename];

    if (!file) {
      addTerminalLine(`cat: ${filename || "(arquivo vazio)"}: arquivo não encontrado.`, "error-line");
      return;
    }

    if (file.mission > state.missionIndex) {
      addTerminalLine("Acesso negado: este arquivo ainda não está disponível nesta operação.", "error-line");
      return;
    }

    printLines([`--- ${filename} ---`, ...file.content, `--- FIM DE ${filename} ---`]);

    if (!state.discoveredFiles.includes(filename)) {
      state.discoveredFiles.push(filename);
      saveProgress();
    }

    checkMissionProgress(`read:${filename}`);
  }

  function scanEnvironment() {
    printLines([
      "Iniciando varredura de demonstração...",
      "[SIM] node-07    status: online",
      "[SIM] web-01     serviço: HTTP-DEMO",
      "[SIM] log-02     serviço: AUDIT-DEMO",
      "[SIM] db-01      serviço: DATA-DEMO",
      "Varredura fictícia concluída. Nenhuma rede externa foi consultada."
    ]);
    state.trace = Math.min(100, state.trace + 2);
    renderStats();
    checkMissionProgress("scan");
    saveProgress();
  }

  function inspectTarget(target) {
    if (!target) {
      addTerminalLine("Uso: inspect <alvo>", "warning-line");
      return;
    }

    if (state.missionIndex < 1) {
      addTerminalLine("Nenhum alvo de demonstração disponível nesta etapa.", "warning-line");
      return;
    }

    const known = ["web-01", "log-02", "db-01", "node-07"];

    if (!known.includes(target)) {
      addTerminalLine(`Alvo fictício desconhecido: ${target}`, "error-line");
      return;
    }

    printLines([
      `Inspecionando ${target} [AMBIENTE FICTÍCIO]`,
      `Identificador: LAB-${target.toUpperCase()}`,
      "Estado: isolado",
      "Conexões externas: desabilitadas",
      "Inspeção de demonstração concluída."
    ]);

    if (target === "web-01") checkMissionProgress("inspect:web-01");
  }

  function executeCommand(raw) {
    const input = raw.trim();

    if (!input) return;

    if (input.length > 180) {
      addTerminalLine("Comando muito longo.", "error-line");
      return;
    }

    commandCount++;
    state.commandHistory.push(input);
    state.commandHistory = state.commandHistory.slice(-100);

    addTerminalLine(`ghost@node-${String(state.missionIndex + 7).padStart(2, "0")}:~$ ${input}`, "command-line");

    const parts = input.split(/\s+/);
    const command = parts[0].toLowerCase();
    const argument = parts.slice(1).join(" ");

    switch (command) {
      case "help":
        commandHelp();
        break;

      case "ls":
        listFiles();
        break;

      case "pwd":
        addTerminalLine(`/ghost/mission-${state.missionIndex + 1}`, "info-line");
        break;

      case "cat":
        readFile(argument);
        break;

      case "scan":
        scanEnvironment();
        break;

      case "inspect":
        inspectTarget(argument.toLowerCase());
        break;

      case "status":
        printLines([
          `Operação: ${state.missionIndex + 1}/${MISSIONS.length}`,
          `Experiência: ${state.xp} XP`,
          `Rastro: ${state.trace}%`,
          `Reputação: ${state.reputation}`,
          `Evidências: ${state.intel.length}`,
          `Comandos nesta sessão: ${commandCount}`
        ], "info-line");
        break;

      case "whoami":
        addTerminalLine("ghost — operador de identidade não verificada.", "info-line");
        break;

      case "history":
        printLines(
          state.commandHistory.length
            ? state.commandHistory.map((item, index) => `${index + 1}  ${item}`)
            : ["Nenhum comando registrado."],
          "info-line"
        );
        break;

      case "clear":
        clearTerminal();
        break;

      default:
        addTerminalLine(
          `Comando desconhecido: ${command}. Digite help para consultar os comandos simulados.`,
          "error-line"
        );
    }

    $("#terminal-input").value = "";
    saveProgress();
  }

  function checkMissionProgress(token) {
    const mission = currentMission();

    if (!mission || state.completed.includes(mission.id)) return;

    if (mission.required.includes(token)) {
      if (token === "minigame") return;

      if (!state.flags[`mission-${mission.id}-${token}`]) {
        state.flags[`mission-${mission.id}-${token}`] = true;
      }
    }

    const done = mission.required.every((required) => {
      if (required === "minigame") return state.minigamesWon.includes(mission.id);
      return Boolean(state.flags[`mission-${mission.id}-${required}`]);
    });

    if (done) completeMission();
  }

  function completeMission() {
    const mission = currentMission();
    if (!mission || state.completed.includes(mission.id)) return;

    state.completed.push(mission.id);
    state.xp += mission.reward;

    state.trace = Math.max(0, Math.min(100, state.trace + mission.trace));
    mission.intel.forEach(addIntel);

    $("#mission-complete-panel").hidden = false;
    $("#completion-heading").textContent = "Objetivo alcançado.";
    $("#completion-message").textContent =
      `Você concluiu ${mission.title}. As evidências desta operação foram registradas.`;
    $("#completion-rewards").replaceChildren();

    const rewards = [
      `+${mission.reward} XP`,
      `${state.intel.length} evidências`,
      `Rastro: ${state.trace}%`
    ];

    rewards.forEach((reward) => {
      const chip = document.createElement("span");
      chip.className = "reward-chip";
      chip.textContent = reward;
      $("#completion-rewards").appendChild(chip);
    });

    $("#next-mission-button").textContent =
      state.missionIndex === MISSIONS.length - 1
        ? "DEFINIR DESFECHO →"
        : "PRÓXIMA OPERAÇÃO →";

    printLines([
      "",
      `[SUCESSO] Operação ${mission.title} concluída.`,
      `[RECOMPENSA] +${mission.reward} XP`
    ], "success-line");

    renderStats();
    renderMissionList();
    saveProgress();
    toast(`Missão concluída: ${mission.title}`);
  }

  function nextMission() {
    if (!state.completed.includes(currentMission().id)) {
      toast("Conclua o objetivo antes de avançar.", "warning");
      return;
    }

    if (state.missionIndex >= MISSIONS.length - 1) {
      showEnding();
      return;
    }

    state.missionIndex++;
    currentChallenge = null;
    saveProgress();
    renderMission();
  }

  function requestHint() {
    if (state.hintsAvailable <= 0) {
      toast("Você não tem mais pistas disponíveis.", "warning");
      return;
    }

    state.hintsAvailable--;
    state.hintsUsed++;
    state.trace = Math.min(100, state.trace + 1);

    $("#hint-output").textContent = currentMission().hint;
    $("#hint-output").hidden = false;
    $("#hint-counter").textContent = `Pistas disponíveis: ${state.hintsAvailable}`;

    addTerminalLine("[INFO] Uma pista foi solicitada. Rastro +1%.", "warning-line");
    renderStats();
    saveProgress();
  }

  function showEnding() {
    state.ended = true;

    let ending;

    if (state.flags.preservedEvidence && state.flags.responsibleDisclosure && state.trace < 60) {
      ending = "truth";
    } else if (state.flags.recklessChoice || state.trace >= 75 || state.reputation < -2) {
      ending = "blackout";
    } else {
      ending = "ghost";
    }

    state.ending = ending;
    const endings = {
      truth: {
        symbol: "◇",
        title: "A Verdade Sobrevive",
        description:
          "Você preservou as evidências e encaminhou a descoberta por um canal responsável. A investigação continua fora da sua tela, mas agora existe um registro verificável. A rede não ficou mais simples — ficou mais transparente."
      },
      blackout: {
        symbol: "×",
        title: "Blackout",
        description:
          "O rastro cresceu, as evidências ficaram comprometidas e a investigação perdeu parte de sua credibilidade. Alguém pode ter conseguido apagar a própria trilha. O arquivo Ghost Protocol permanece como um aviso."
      },
      ghost: {
        symbol: "◆",
        title: "O Fantasma Permanece",
        description:
          "Você terminou a investigação sem resolver todas as contradições. Parte das evidências foi preservada, mas a identidade do remetente continua incerta. Uma última mensagem aparece no terminal: 'A próxima pessoa precisa saber onde procurar.'"
      }
    };

    const result = endings[ending];

    $("#ending-symbol").textContent = result.symbol;
    $("#ending-title").textContent = result.title;
    $("#ending-description").textContent = result.description;
    $("#ending-xp").textContent = state.xp;
    $("#ending-missions").textContent = `${state.completed.length} / ${MISSIONS.length}`;
    $("#ending-trace").textContent = `${state.trace}%`;
    $("#ending-reputation").textContent =
      state.reputation >= 4 ? "CONFIÁVEL" : state.reputation <= -3 ? "SUSPEITA" : "NEUTRA";

    saveProgress();
    showScreen("ending");
  }

  // Minigames são implementados na continuação deste arquivo.
  // Cada desafio terá validação própria e marcará a missão como concluída
  // somente depois da resolução ou de uma escolha narrativa válida.

  function openSettings() {
    $("#settings-dialog").showModal();
  }

  function openHelp() {
    $("#help-dialog").showModal();
  }

  function resetProgress() {
    pendingConfirmation = () => {
      localStorage.removeItem(STORAGE_KEY);
      state = structuredCloneSafe(INITIAL_STATE);
      commandCount = 0;
      currentChallenge = null;
      updateContinueButton();
      $("#confirm-dialog").close();
      $("#settings-dialog").close();
      showScreen("title");
      toast("Progresso apagado.");
    };

    $("#confirm-title").textContent = "Apagar todo o progresso?";
    $("#confirm-message").textContent =
      "Esta ação remove a campanha salva neste navegador. As preferências serão mantidas.";
    $("#confirm-dialog").showModal();
  }

  function restartCampaign() {
    pendingConfirmation = () => {
      $("#confirm-dialog").close();
      startNewGame();
    };

    $("#confirm-title").textContent = "Iniciar uma nova campanha?";
    $("#confirm-message").textContent =
      "Seu progresso atual será substituído por uma nova sessão.";
    $("#confirm-dialog").showModal();
  }

  function bindEvents() {
    $("#new-game-button").addEventListener("click", restartCampaign);
    $("#continue-button").addEventListener("click", continueGame);
    $("#begin-missions-button").addEventListener("click", beginMissions);

    $("#settings-button").addEventListener("click", openSettings);
    $("#title-settings-button").addEventListener("click", openSettings);
    $("#help-button").addEventListener("click", openHelp);

    $("#save-settings-button").addEventListener("click", saveSettings);
    $("#reset-progress-button").addEventListener("click", resetProgress);

    $("#confirm-yes-button").addEventListener("click", () => {
      if (typeof pendingConfirmation === "function") {
        const action = pendingConfirmation;
        pendingConfirmation = null;
        action();
      }
    });

    $("#confirm-no-button").addEventListener("click", () => {
      pendingConfirmation = null;
      $("#confirm-dialog").close();
    });

    $("#terminal-form").addEventListener("submit", (event) => {
      event.preventDefault();
      executeCommand($("#terminal-input").value);
    });

    $("#clear-terminal-button").addEventListener("click", clearTerminal);
    $("#hint-button").addEventListener("click", requestHint);
    $("#next-mission-button").addEventListener("click", nextMission);

    $("#ending-restart-button").addEventListener("click", restartCampaign);

    $("#ending-title-button").addEventListener("click", () => {
      showScreen("title");
      updateContinueButton();
    });

    $("#setting-effects").addEventListener("change", (event) => {
      settings.effects = event.target.checked;
    });

    $("#setting-typing").addEventListener("change", (event) => {
      settings.typing = event.target.checked;
    });

    $("#setting-contrast").addEventListener("change", (event) => {
      settings.contrast = event.target.checked;
      applySettings();
    });

    $("#setting-reduced-motion").addEventListener("change", (event) => {
      settings.reducedMotion = event.target.checked;
      applySettings();
    });

    $("#settings-dialog").addEventListener("click", (event) => {
      if (event.target === $("#settings-dialog")) {
        $("#settings-dialog").close();
      }
    });

    $("#help-dialog").addEventListener("click", (event) => {
      if (event.target === $("#help-dialog")) {
        $("#help-dialog").close();
      }
    });
  }

  function init() {
    loadSettings();
    const hasSave = loadProgress();
    bindEvents();
    updateContinueButton();

    if (hasSave) {
      renderStats();
    }

    showScreen("title");
  }

  init();
})();
