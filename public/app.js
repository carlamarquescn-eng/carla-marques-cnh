/* Carla Marques CNH: interações do site */
(function () {
  "use strict";
  var C = window.CM_CONFIG || { whatsapp: "5531990999539" };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function waUrl(msg) {
    return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg || "Olá, Carla! Vim pelo site e quero informações sobre a minha CNH.");
  }
  function track(name, params, custom) {
    try {
      if (window.fbq) custom ? fbq("trackCustom", name, params || {}) : fbq("track", name, params || {});
      if (window.gtag) gtag("event", name, params || {});
    } catch (e) {}
  }

  /* ---------- Links de WhatsApp com mensagem e rastreio ---------- */
  document.querySelectorAll(".js-wa").forEach(function (a) {
    a.href = waUrl(a.getAttribute("data-msg"));
    a.addEventListener("click", function () {
      track("Contact", { content_name: "WhatsApp", origem: a.getAttribute("data-origem") || "site" });
    });
  });

  /* ---------- Topo fica sólido ao rolar ---------- */
  var top = document.getElementById("top");
  function onScroll() { top.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Entrada suave (conteúdo sempre visível) ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rise").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".rise").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Cards com inclinação 3D ---------- */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".svc").forEach(function (card) {
      card.addEventListener("pointermove", function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        card.style.transform = "rotateX(" + ((0.5 - y) * 10).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 12).toFixed(2) + "deg) translateZ(0)";
        card.style.setProperty("--mx", (x * 100) + "%"); card.style.setProperty("--my", (y * 100) + "%");
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Etapas interativas ---------- */
  var STEPS = [
    { t: "Abertura do processo", s: "Cadastro e documentos", d: "Você abre o processo de forma online ou no Detran do seu estado, com documento com foto, CPF e comprovante de residência.", h: "Eu confiro seus documentos e te digo exatamente onde e como abrir, para não travar logo no começo." },
    { t: "Curso teórico", s: "Online e gratuito", d: "Pelas regras novas, o curso teórico pode ser feito online, no seu ritmo, com o conteúdo oficial de legislação, direção defensiva e primeiros socorros.", h: "Eu te mostro o caminho oficial e como organizar o estudo para a prova." },
    { t: "Biometria e exames", s: "Médico e psicológico", d: "Coleta de biometria e os exames médico e psicológico, que continuam obrigatórios.", h: "Eu explico o que levar, como funcionam os exames e como agendar sem perder tempo." },
    { t: "Prova teórica", s: "No Detran", d: "Prova sobre o conteúdo do curso, feita no Detran.", h: "Eu acompanho os prazos e te passo o que mais cai para você chegar seguro." },
    { t: "Aulas práticas", s: "A partir de 2 horas", d: "Aulas de direção com autoescola ou instrutor autônomo credenciado. A carga mínima ficou menor; você faz mais só se precisar.", h: "Eu te ajudo a escolher o formato e a montar um cronograma que caiba no seu bolso." },
    { t: "Prova prática e CNH", s: "Aprovação e emissão", d: "Exame de direção no Detran. Aprovado, você recebe a Permissão para Dirigir e, depois de um ano sem infração grave, a CNH definitiva.", h: "Eu te oriento sobre o dia da prova e sigo com você até o documento sair." }
  ];
  var list = document.getElementById("steps"), panel = document.getElementById("step-panel");
  function showStep(i) {
    var st = STEPS[i];
    list.querySelectorAll("button").forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; });
    panel.innerHTML =
      '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(((i + 1) / STEPS.length) * 100) + '%"></i></div>' +
      '<div class="k">0' + (i + 1) + '</div><h3>' + st.t + '</h3><p>' + st.d + '</p>' +
      '<div class="help"><span>✦</span><div><b>Onde eu entro:</b> ' + st.h + '</div></div>' +
      '<a class="btn btn-wa" data-origem="etapa-' + (i + 1) + '" target="_blank" rel="noopener" href="' +
      waUrl("Olá, Carla! Vim pelo site. Estou na etapa \"" + st.t + "\" e quero ajuda.") + '">Estou nessa etapa</a>';
    panel.querySelector("a").addEventListener("click", function () { track("Contact", { content_name: "WhatsApp", origem: "etapa-" + (i + 1) }); });
  }
  STEPS.forEach(function (st, i) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button" role="tab" id="tab-' + i + '"><span class="n">' + (i + 1) + '</span><span><strong>' + st.t + '</strong><small>' + st.s + '</small></span></button>';
    li.firstChild.addEventListener("click", function () { showStep(i); });
    li.firstChild.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var n = (i + (e.key === "ArrowDown" ? 1 : -1) + STEPS.length) % STEPS.length;
        showStep(n); document.getElementById("tab-" + n).focus();
      }
    });
    list.appendChild(li);
  });
  showStep(0);

  /* ---------- Assistente de IA ---------- */
  var log = document.getElementById("log"), form = document.getElementById("compose"), input = document.getElementById("q");
  var chatWa = document.getElementById("chat-wa"), history = [], started = false, busy = false;
  var LOCAL = [
    [["preço","preco","valor","custa","quanto é","pagar","parcel"], "O valor depende do seu caso (categoria, estado e etapa). A Carla passa tudo certinho no WhatsApp, sem compromisso. É só tocar no botão verde abaixo."],
    [["autoescola","auto escola","regra","mudou","contran"], "Com as regras aprovadas pelo Contran em dezembro de 2025, a autoescola deixou de ser obrigatória: o curso teórico pode ser online e gratuito e as aulas práticas mínimas caíram. Exames e provas no Detran continuam. A Carla explica como fica no seu estado."],
    [["tempo","demora","prazo","rápido","rapido"], "O prazo depende da agenda do Detran do seu estado. Com tudo organizado desde o começo você evita atraso. Me conta seu estado no WhatsApp da Carla que ela passa a média atual."],
    [["moto","carro"," ab ","categoria"], "Dá para tirar moto (A), carro (B) ou as duas juntas (AB) no mesmo processo. A Carla te mostra o caminho mais prático para a categoria que você quer."],
    [["parado","travado","pendência","pendencia","reprov"], "Processo parado ou reprovação acontecem mais do que parece. A Carla vê em que ponto você está e mostra o próximo passo. Toca no botão do WhatsApp e conta para ela."],
    [["renov","vencid","venc"], "A Carla também orienta renovação: o que precisa, como agendar o exame e os prazos do seu estado. Chama ela no WhatsApp pelo botão abaixo."],
    [["documento","rg","cpf","comprovante"], "Em geral são documento com foto, CPF e comprovante de residência, mas pode mudar por estado. Não envie documentos por aqui: a Carla confere com você no WhatsApp."],
    [[" oi "," oi,","olá","ola ","bom dia","boa tarde","boa noite"], "Oi! Você quer tirar a primeira habilitação, adicionar uma categoria ou resolver outra situação da sua CNH?"]
  ];
  function localAnswer(t) {
    t = " " + t.toLowerCase() + " ";
    for (var i = 0; i < LOCAL.length; i++) if (LOCAL[i][0].some(function (k) { return t.indexOf(k) > -1; })) return LOCAL[i][1];
    return "Para te responder certinho no seu caso, a Carla atende você direto no WhatsApp " + (C.whatsappDisplay || "") + ". É só tocar no botão verde logo abaixo.";
  }
  function bubble(text, who) {
    var d = document.createElement("div");
    d.className = "msg " + who; d.textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function updateWa() {
    var asks = history.filter(function (m) { return m.role === "user"; }).map(function (m) { return m.content; });
    var msg = "Olá, Carla! Vim pelo site e conversei com a assistente.";
    if (asks.length) msg += " Minha dúvida: " + asks.slice(-2).join(" / ");
    chatWa.href = waUrl(msg);
  }
  bubble("Oi! Eu sou a assistente da Carla Marques. Posso tirar suas dúvidas sobre a CNH agora mesmo. O que você precisa?", "bot");
  updateWa();
  chatWa.addEventListener("click", function () { track("Lead", { content_name: "WhatsApp pelo chat", origem: "chat" }); });

  function ask(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    if (!started) { started = true; track("ChatIniciado", { origem: "assistente" }, true); }
    bubble(text, "me");
    history.push({ role: "user", content: text });
    updateWa();
    var t = bubble("", "bot"); t.innerHTML = '<span class="typing" aria-label="Digitando"><i></i><i></i><i></i></span>';
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { if (!r.ok && r.status !== 429) throw 0; return r.json(); })
      .then(function (j) { return j && j.reply ? j.reply : localAnswer(text); })
      .catch(function () { return localAnswer(text); })
      .then(function (reply) {
        clearTimeout(timer);
        t.textContent = reply;
        history.push({ role: "assistant", content: reply });
        log.scrollTop = log.scrollHeight; busy = false;
      });
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value; input.value = ""; ask(v); });
  document.querySelectorAll("#sugg button").forEach(function (b) { b.addEventListener("click", function () { ask(b.textContent); }); });

  /* ---------- Montador de atendimento ---------- */
  var caseForm = document.getElementById("case"), caseWa = document.getElementById("case-wa");
  function caseData() {
    var fd = new FormData(caseForm);
    return { objetivo: fd.get("objetivo") || "", categoria: fd.get("categoria") || "", uf: fd.get("uf") || "", quando: fd.get("quando") || "" };
  }
  function renderCase() {
    var d = caseData();
    ["objetivo", "categoria", "uf", "quando"].forEach(function (k) {
      var el = document.getElementById("t-" + k);
      el.textContent = d[k] || "a escolher"; el.classList.toggle("empty", !d[k]);
    });
    var parts = ["Olá, Carla! Vim pelo site e montei meu atendimento:"];
    if (d.objetivo) parts.push("• Preciso de: " + d.objetivo);
    if (d.categoria) parts.push("• Categoria: " + d.categoria);
    if (d.uf) parts.push("• Estado: " + d.uf);
    if (d.quando) parts.push("• Quando: " + d.quando);
    caseWa.href = waUrl(parts.join("\n"));
  }
  caseForm.addEventListener("change", renderCase); renderCase();
  caseWa.addEventListener("click", function () {
    var d = caseData();
    track("Lead", { content_name: "Montador de atendimento", objetivo: d.objetivo, categoria: d.categoria, estado: d.uf });
  });

  var ano = document.getElementById("ano"); if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Cena 3D do topo ---------- */
  function start3D() {
    var canvas = document.getElementById("scene");
    if (!window.THREE || !canvas) return;
    var T = window.THREE, renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    var scene = new T.Scene();
    scene.fog = new T.Fog(0x0b1d21, 9, 26);
    var cam = new T.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.set(0, 0.6, 9);

    // Ambiente para reflexos metálicos (estúdio dourado feito à mão)
    var pm = new T.PMREMGenerator(renderer);
    var env = new T.Scene();
    var envGeo = new T.SphereGeometry(20, 32, 16);
    var ec = document.createElement("canvas"); ec.width = 512; ec.height = 256;
    var ex = ec.getContext("2d");
    var eg = ex.createLinearGradient(0, 0, 0, 256);
    eg.addColorStop(0, "#fff3cf"); eg.addColorStop(0.35, "#6f5a2c"); eg.addColorStop(0.6, "#10282c"); eg.addColorStop(1, "#050d0f");
    ex.fillStyle = eg; ex.fillRect(0, 0, 512, 256);
    ex.fillStyle = "rgba(255,255,255,.9)"; ex.fillRect(60, 40, 120, 18); ex.fillRect(330, 60, 140, 14);
    ex.fillStyle = "rgba(127,224,194,.6)"; ex.fillRect(0, 150, 512, 6);
    var envTex = new T.CanvasTexture(ec);
    env.add(new T.Mesh(envGeo, new T.MeshBasicMaterial({ map: envTex, side: T.BackSide })));
    scene.environment = pm.fromScene(env, 0.02).texture;

    scene.add(new T.AmbientLight(0xffffff, 0.25));
    var key = new T.DirectionalLight(0xfff0c8, 1.1); key.position.set(4, 6, 6); scene.add(key);
    var rim = new T.PointLight(0x7fe0c2, 2.2, 20); rim.position.set(-5, 1, 2); scene.add(rim);
    var warm = new T.PointLight(0xd8b25a, 1.6, 18); warm.position.set(3, -2, 4); scene.add(warm);

    var rig = new T.Group(); scene.add(rig);

    // Selo dourado CM
    function faceTex() {
      var c = document.createElement("canvas"); c.width = c.height = 512;
      var x = c.getContext("2d");
      var g = x.createRadialGradient(190, 170, 40, 256, 256, 260);
      g.addColorStop(0, "#fbecbe"); g.addColorStop(0.55, "#d3a443"); g.addColorStop(1, "#7d5813");
      x.fillStyle = g; x.fillRect(0, 0, 512, 512);
      x.strokeStyle = "rgba(255,248,224,.85)"; x.lineWidth = 10;
      x.beginPath(); x.arc(256, 256, 214, 0, Math.PI * 2); x.stroke();
      x.lineWidth = 3; x.beginPath(); x.arc(256, 256, 190, 0, Math.PI * 2); x.stroke();
      x.fillStyle = "#fff6dc"; x.textAlign = "center"; x.textBaseline = "middle";
      x.font = "400 170px Marcellus, Georgia, serif"; x.fillText("CM", 256, 236);
      x.font = "600 34px Marcellus, Georgia, serif"; x.fillText("CARLA MARQUES", 256, 352);
      x.font = "700 22px Figtree, sans-serif"; x.fillStyle = "rgba(255,246,220,.85)"; x.fillText("FACILITAÇÃO DE CNH", 256, 392);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t;
    }
    var faceMat = new T.MeshStandardMaterial({ map: faceTex(), metalness: 0.55, roughness: 0.38, envMapIntensity: 0.6 });
    var edgeMat = new T.MeshStandardMaterial({ color: 0xc9972e, metalness: 1, roughness: 0.3, envMapIntensity: 0.75 });
    var coin = new T.Mesh(new T.CylinderGeometry(1.55, 1.55, 0.22, 96, 1), [edgeMat, faceMat, faceMat]);
    coin.rotation.x = Math.PI / 2;
    var coinG = new T.Group(); coinG.add(coin); coinG.position.set(2.5, 0.75, 0); rig.add(coinG);
    // Aro externo
    var ring = new T.Mesh(new T.TorusGeometry(2.05, 0.035, 16, 140), edgeMat);
    coinG.add(ring);

    // Carteira estilizada (ilustração, não é documento oficial)
    function cardTex() {
      var c = document.createElement("canvas"); c.width = 1024; c.height = 640;
      var x = c.getContext("2d");
      var g = x.createLinearGradient(0, 0, 1024, 640);
      g.addColorStop(0, "#e9f4ef"); g.addColorStop(0.5, "#c8e6d8"); g.addColorStop(1, "#a6d4c0");
      x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(0, 0, 1024, 640, 48) : x.rect(0, 0, 1024, 640); x.fill();
      x.fillStyle = "#0f2f34"; x.fillRect(0, 0, 1024, 110);
      x.fillStyle = "#f3dc9a"; x.font = "700 46px Figtree, sans-serif"; x.textBaseline = "middle"; x.fillText("SUA CNH", 56, 56);
      x.fillStyle = "rgba(243,220,154,.85)"; x.font = "600 26px Figtree, sans-serif"; x.textAlign = "right"; x.fillText("2027", 968, 56); x.textAlign = "left";
      x.fillStyle = "#8fb8a8"; x.beginPath(); x.roundRect ? x.roundRect(56, 160, 250, 310, 22) : x.rect(56, 160, 250, 310); x.fill();
      x.fillStyle = "#e9f4ef"; x.beginPath(); x.arc(181, 270, 62, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(181, 430, 100, 70, 0, Math.PI, 0); x.fill();
      x.fillStyle = "#0f2f34";
      [["NOME", "VOCÊ, HABILITADO"], ["CATEGORIA", "AB"], ["SITUAÇÃO", "APROVADO ✓"]].forEach(function (r, i) {
        x.font = "600 22px Figtree, sans-serif"; x.globalAlpha = .55; x.fillText(r[0], 350, 190 + i * 100);
        x.font = "800 40px Figtree, sans-serif"; x.globalAlpha = 1; x.fillText(r[1], 350, 232 + i * 100);
      });
      x.fillStyle = "#d8b25a"; x.beginPath(); x.arc(900, 540, 48, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#fff6dc"; x.font = "400 40px Marcellus, serif"; x.textAlign = "center"; x.fillText("CM", 900, 542);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t;
    }
    var cardMat = new T.MeshPhysicalMaterial({ map: cardTex(), roughness: 0.35, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15 });
    var sideMat = new T.MeshStandardMaterial({ color: 0x0f2f34, roughness: 0.4 });
    var card = new T.Mesh(new T.BoxGeometry(2.7, 1.69, 0.05), [sideMat, sideMat, sideMat, sideMat, cardMat, sideMat]);
    var cardG = new T.Group(); cardG.add(card); cardG.position.set(1.7, -1.35, 0.9); cardG.rotation.set(-0.28, -0.55, 0.12); rig.add(cardG);

    // Pista em perspectiva com faixas
    var road = new T.Group(); road.position.set(2.6, -2.6, 0); scene.add(road);
    var asphalt = new T.Mesh(new T.PlaneGeometry(5, 60), new T.MeshBasicMaterial({ color: 0x0a1a1d }));
    asphalt.rotation.x = -Math.PI / 2; asphalt.position.z = -20; road.add(asphalt);
    var dashMat = new T.MeshBasicMaterial({ color: 0xf3dc9a });
    var dashes = [];
    for (var i = 0; i < 18; i++) {
      var dsh = new T.Mesh(new T.PlaneGeometry(0.12, 1.1), dashMat);
      dsh.rotation.x = -Math.PI / 2; dsh.position.set(0, 0.01, 6 - i * 3.2); road.add(dsh); dashes.push(dsh);
    }
    var edgeL = new T.Mesh(new T.PlaneGeometry(0.06, 60), new T.MeshBasicMaterial({ color: 0x7fe0c2 }));
    edgeL.rotation.x = -Math.PI / 2; edgeL.position.set(-2.4, 0.01, -20); road.add(edgeL);
    var edgeR = edgeL.clone(); edgeR.position.x = 2.4; road.add(edgeR);

    // Partículas douradas
    var pg = new T.BufferGeometry(), N = 260, pos = new Float32Array(N * 3);
    for (var k = 0; k < N; k++) { pos[k * 3] = (Math.random() - 0.5) * 18; pos[k * 3 + 1] = (Math.random() - 0.2) * 8; pos[k * 3 + 2] = (Math.random() - 0.7) * 14; }
    pg.setAttribute("position", new T.BufferAttribute(pos, 3));
    var dust = new T.Points(pg, new T.PointsMaterial({ color: 0xf3dc9a, size: 0.035, transparent: true, opacity: 0.7 }));
    scene.add(dust);

    var mx = 0, my = 0, tx = 0, ty = 0, scrollY0 = 0;
    window.addEventListener("pointermove", function (e) { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
    window.addEventListener("scroll", function () { scrollY0 = window.scrollY; }, { passive: true });

    function size() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      var narrow = w < 900;
      rig.position.set(narrow ? -1.7 : 1.0, narrow ? 1.5 : 0.1, narrow ? -2.4 : -0.4);
      rig.scale.setScalar(narrow ? 0.78 : 0.9);
      road.position.x = narrow ? 0 : 2.6;
    }
    size(); window.addEventListener("resize", size);

    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(canvas);

    var clock = new T.Clock();
    function frame() {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      var t = clock.getElapsedTime();
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      var sp = Math.min(scrollY0 / 700, 1);
      coinG.rotation.y = reduce ? -0.25 : Math.sin(t * 0.7) * 0.55 - 0.2 + mx * 0.6;
      coinG.rotation.x = my * 0.4;
      coinG.position.y = 0.75 + (reduce ? 0 : Math.sin(t * 1.2) * 0.12);
      cardG.rotation.y = -0.55 + mx * 0.5 + sp * 0.6;
      cardG.rotation.x = -0.28 + my * 0.3 - sp * 0.2;
      cardG.position.y = -1.25 + (reduce ? 0 : Math.sin(t * 1.4 + 1) * 0.1) - sp * 0.6;
      if (!reduce) dashes.forEach(function (d) { d.position.z += 0.06; if (d.position.z > 7) d.position.z -= 18 * 3.2; });
      dust.rotation.y = t * 0.02;
      cam.position.x = mx * 0.6; cam.position.y = 0.6 - my * 0.3;
      cam.lookAt(0.6, 0, 0);
      renderer.render(scene, cam);
    }
    frame();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start3D); else start3D();
})();
