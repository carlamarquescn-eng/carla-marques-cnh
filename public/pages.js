/* Páginas de serviço: links de WhatsApp com mensagem pronta e rastreio do Pixel */
(function () {
  "use strict";
  var C = window.CM_CONFIG || { whatsapp: "5531990999539" };
  var servico = document.body.getAttribute("data-servico") || "site";

  function track(name, params, custom) {
    try {
      if (window.fbq) custom ? fbq("trackCustom", name, params || {}) : fbq("track", name, params || {});
      if (window.gtag) gtag("event", name, params || {});
    } catch (e) {}
  }

  // Conteúdo visto: ajuda o Meta a entender qual serviço a pessoa procurou.
  track("ViewContent", { content_name: servico, content_category: "servico" });

  document.querySelectorAll(".js-wa").forEach(function (a) {
    var msg = a.getAttribute("data-msg") || document.body.getAttribute("data-msg") || "Olá, Carla! Vim pelo site e quero informações sobre a minha CNH.";
    a.href = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg);
    a.addEventListener("click", function () {
      track("Contact", { content_name: "WhatsApp", content_category: servico, origem: a.getAttribute("data-origem") || "pagina" });
    });
  });

  // Barra do WhatsApp aparece depois do primeiro botão sair da tela.
  var bar = document.querySelector(".sticky-wa");
  var hero = document.querySelector(".hero .btn-wa");
  if (bar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      bar.classList.toggle("show", !es[0].isIntersecting);
    }).observe(hero);
  } else if (bar) bar.classList.add("show");

  // Cartão do roteiro acompanha o dedo ou o mouse.
  var route = document.querySelector(".route");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (route && !reduce && matchMedia("(hover:hover)").matches) {
    var stage = route.parentElement;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      route.style.transform = "rotateY(" + (x * 18 - 6) + "deg) rotateX(" + (-y * 14 + 4) + "deg)";
    });
    stage.addEventListener("pointerleave", function () { route.style.transform = ""; });
  }
})();
