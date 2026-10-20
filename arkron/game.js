(() => {
  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = "arkron-web-save-v1";
  const state = { hero: null, sceneIndex: 0, battle: null, waitingForBattle: false };
  const setup = $("setup"), game = $("game"), storyText = $("storyText"), battlePanel = $("battlePanel");
  const statInputs = [...document.querySelectorAll(".stat")];
  const statNames = ["strength", "magic", "intelligence", "audacity"];
  const classes = {
    "Arqueiro": { weapon: "Arco Leve", damage: 10, bonus: "intelligence" },
    "Guerreiro": { weapon: "Machado Leve", damage: 10, bonus: "strength" },
    "Mago": { weapon: "Cajado de Chamas", damage: 10, bonus: "magic" },
    "Assassino": { weapon: "Punhal Serrado", damage: 10, bonus: "audacity" }
  };
  const races = { "Elfo": ["intelligence",20], "Orc": ["strength",20], "Humano": ["audacity",20], "Draconiano": ["magic",20], "Espectro": ["magic",10,"intelligence",10] };

  function pointsUsed() { return statInputs.reduce((n, el) => n + (Number(el.value) || 0), 0); }
  function updatePoints() {
    $("pointsCount").textContent = `${pointsUsed()} / 100`;
    $("pointsCount").style.color = pointsUsed() === 100 ? "var(--gold)" : "var(--red)";
  }
  statInputs.forEach(el => el.addEventListener("input", updatePoints));
  $("heroForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const total = pointsUsed();
    if (total !== 100 || statInputs.some(el => !Number.isInteger(Number(el.value)) || Number(el.value) < 0 || Number(el.value) > 100)) {
      $("formError").textContent = "Distribua exatamente 100 pontos entre os atributos.";
      return;
    }
    const hero = {
      name: $("heroName").value.trim(), race: $("race").value, className: $("class").value,
      strength: Number($("strength").value), magic: Number($("magic").value),
      intelligence: Number($("intelligence").value), audacity: Number($("audacity").value),
      bravery: 5, hp: 100, mana: 100, stamina: 100, arkron: false, created: true,
      sceneIndex: 0, completed: [], potions: { hp: 3, mana: 3, stamina: 3 }
    };
    if (!hero.name) { $("formError").textContent = "Digite o nome do personagem."; return; }
    const cls = classes[hero.className];
    hero.weapon = cls.weapon; hero.damage = cls.damage;
    hero[cls.bonus] += 20;
    const raceBonus = races[hero.race];
    for (let i=0; i<raceBonus.length; i+=2) hero[raceBonus[i]] += raceBonus[i+1];
    state.hero = hero; state.sceneIndex = 0; state.battle = null;
    setup.classList.add("hidden"); game.classList.remove("hidden");
    save(); renderProfile(); renderScene(); window.scrollTo({top:0,behavior:"smooth"});
  });

  function save() {
    if (!state.hero) return;
    state.hero.sceneIndex = state.sceneIndex;
    localStorage.setItem(SAVE_KEY, JSON.stringify({hero:state.hero,sceneIndex:state.sceneIndex,battle:state.battle,waitingForBattle:state.waitingForBattle}));
    $("saveStatus").textContent = "Progresso salvo neste dispositivo";
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (!saved || !saved.hero) return;
      state.hero = saved.hero; state.sceneIndex = Math.min(saved.sceneIndex || 0, window.ARKRON_STORY.length-1);
      state.battle = saved.battle || null; state.waitingForBattle = !!saved.waitingForBattle;
      setup.classList.add("hidden"); game.classList.remove("hidden"); renderProfile(); renderScene();
    } catch (_) { localStorage.removeItem(SAVE_KEY); }
  }
  function renderProfile() {
    const h=state.hero;
    $("profileName").textContent=h.name; $("profileClass").textContent=h.className;
    $("profileRace").textContent=h.race; $("profileWeapon").textContent=h.weapon;
    $("sStrength").textContent=h.strength; $("sMagic").textContent=h.magic;
    $("sIntelligence").textContent=h.intelligence; $("sAudacity").textContent=h.audacity;
    setMeter("hp",h.hp); setMeter("mana",h.mana); setMeter("stamina",h.stamina);
  }
  function setMeter(type,value) {
    const max=100, safe=Math.max(0,Math.min(max,value));
    $(type+"Text").textContent=`${safe} / ${max}`; $(type+"Bar").style.width=`${safe}%`;
  }
  function renderStory(text) {
    storyText.replaceChildren();
    const parts = text.split(/\n\s*\n/).filter(p=>p.trim());
    for (const part of parts) {
      const p=document.createElement("p"); p.textContent=part.trim();
      if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç ]{0,25}:\s/.test(part.trim())) p.classList.add("dialogue");
      storyText.appendChild(p);
    }
  }
  function renderScene() {
    const scene=window.ARKRON_STORY[state.sceneIndex];
    if (!scene) { renderStory("Fim do conteúdo disponível nos arquivos originais. A jornada continua..."); $("nextBtn").textContent="Voltar ao início"; return; }
    $("chapterLabel").textContent = scene.id.startsWith("exp") ? "PRÓLOGO" : `JORNADA • ${scene.id.replace("his","CAPÍTULO ")}`;
    $("progressLabel").textContent=`Cena ${state.sceneIndex+1} de ${window.ARKRON_STORY.length}`;
    renderStory(scene.text.replaceAll("${hero.name}",state.hero.name));
    $("nextBtn").textContent=state.sceneIndex===window.ARKRON_STORY.length-1?"Fim da parte disponível":"Continuar";
    battlePanel.classList.add("hidden");
    if (scene.battle) {
      state.waitingForBattle=true;
      if (!state.battle || state.battle.sceneId!==scene.id) state.battle={...scene.battle,sceneId:scene.id,hp:scene.battle.hp,initialHp:scene.battle.hp,log:"A batalha começou. Escolha sua ação."};
      renderBattle();
    } else {
      state.waitingForBattle=false; state.battle=null;
    }
    save();
  }
  function renderBattle() {
    if (!state.battle) return;
    const b=state.battle;
    battlePanel.classList.remove("hidden");
    battlePanel.innerHTML="";
    const h=document.createElement("h3"); h.textContent=b.enemy; battlePanel.appendChild(h);
    const stats=document.createElement("div"); stats.className="battle-stats";
    stats.innerHTML=`<span>Vida do inimigo</span><b>${Math.max(0,b.hp)} / ${b.initialHp}</b>`; battlePanel.appendChild(stats);
    const bar=document.createElement("div");bar.className="bar";const fill=document.createElement("i");fill.style.width=`${Math.max(0,b.hp)/b.initialHp*100}%`;bar.appendChild(fill);battlePanel.appendChild(bar);
    const actions=document.createElement("div");actions.className="battle-actions";
    const moves=[
      ["Ataque leve","15 de stamina",()=>attack(10,15,"stamina")],
      ["Ataque médio","25 de stamina",()=>attack(20,25,"stamina")],
      ["Ataque pesado","35 de stamina",()=>attack(30,35,"stamina")],
      ["Ataque mágico","45 de mana",()=>attack(30,45,"mana")],
      ["Tomar poção","Recupera recursos",drinkPotion],
      ["Fugir","Recuar da batalha",flee]
    ];
    if(state.hero.arkron) moves.splice(4,0,["Ataque de Arkron","100 de mana",()=>attack(state.hero.damage,100,"mana")]);
    for(const [label,sub,fn] of moves){const btn=document.createElement("button");btn.type="button";btn.innerHTML=`<strong>${label}</strong><br><small>${sub}</small>`;btn.addEventListener("click",fn);if(b.hp<=0||state.hero.hp<=0)btn.disabled=true;actions.appendChild(btn);}
    battlePanel.appendChild(actions);
    const log=document.createElement("p");log.className="battle-log";log.textContent=b.log||"";battlePanel.appendChild(log);
    if(b.hp<=0){const win=document.createElement("p");win.className="battle-log";win.textContent=`Você derrotou ${b.enemy}!`;battlePanel.appendChild(win);const done=document.createElement("button");done.className="primary";done.textContent="Continuar história →";done.addEventListener("click",()=>{state.battle=null;state.waitingForBattle=false;state.sceneIndex++;renderProfile();renderScene();});battlePanel.appendChild(done);$("nextBtn").classList.add("hidden");}
    else if(state.hero.hp<=0){const dead=document.createElement("p");dead.className="error";dead.textContent="Você foi derrotado. Recomece a aventura para tentar novamente.";battlePanel.appendChild(dead);$("nextBtn").classList.add("hidden");}
    else $("nextBtn").classList.remove("hidden");
    renderProfile();save();
  }
  function attack(damage,cost,resource){
    const h=state.hero,b=state.battle;
    if(!b||b.hp<=0||h.hp<=0)return;
    if(h[resource]<cost){b.log=`Você não tem ${resource==="mana"?"mana":"stamina"} suficiente.`;renderBattle();return;}
    h[resource]-=cost;
    let actual=damage;
    if(resource==="stamina"&&h.strength>=30)actual+=5;
    b.hp=Math.max(0,b.hp-actual);
    b.log=`Você atacou ${b.enemy} e causou ${actual} de dano.`;
    if(b.hp>0){h.hp=Math.max(0,h.hp-b.attack);b.log+=` ${b.enemy} contra-atacou e causou ${b.attack} de dano.`;}
    if(b.hp<=0){b.log=`${b.enemy} foi derrotado!`;}
    renderBattle();
  }
  function drinkPotion(){
    const h=state.hero,b=state.battle;const available=[];
    if(h.potions.hp>0)available.push("Vida");
    if(h.potions.mana>0)available.push("Mana");
    if(h.potions.stamina>0)available.push("Stamina");
    if(!available.length){b.log="Você não tem poções disponíveis.";renderBattle();return;}
    const choice=prompt(`Qual poção deseja usar?\\n1) Vida (${h.potions.hp})\\n2) Mana (${h.potions.mana})\\n3) Stamina (${h.potions.stamina})`,"1");
    const key=({"1":"hp","2":"mana","3":"stamina"})[choice];
    if(!key||h.potions[key]<=0){b.log="Poção indisponível.";renderBattle();return;}
    h.potions[key]--;h[key]=Math.min(100,h[key]+20);
    b.log=`Você usou uma poção de ${key==="hp"?"vida":key==="mana"?"mana":"stamina"} e recuperou 20 pontos.`;
    if(b.hp>0){h.hp=Math.max(0,h.hp-b.attack);b.log+=` ${b.enemy} aproveitou e causou ${b.attack} de dano.`;}
    renderBattle();
  }
  function flee(){state.battle.log="Você recuou. A história continua sem registrar vitória.";state.battle.hp=0;renderBattle();}
  $("nextBtn").addEventListener("click",()=>{
    if(state.battle && state.battle.hp>0 && state.hero.hp>0)return;
    if(state.sceneIndex>=window.ARKRON_STORY.length-1){state.sceneIndex=0;state.battle=null;renderScene();return;}
    state.sceneIndex++;state.battle=null;state.waitingForBattle=false;renderScene();window.scrollTo({top:0,behavior:"smooth"});
  });
  $("saveBtn").addEventListener("click",()=>{save();$("saveStatus").textContent="Salvo agora ✓";});
  $("resetBtn").addEventListener("click",()=>{
    if(confirm("Recomeçar a aventura? O progresso salvo neste dispositivo será apagado.")){
      localStorage.removeItem(SAVE_KEY);state.hero=null;state.sceneIndex=0;state.battle=null;state.waitingForBattle=false;
      game.classList.add("hidden");setup.classList.remove("hidden");$("nextBtn").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});
    }
  });
  load();
})();