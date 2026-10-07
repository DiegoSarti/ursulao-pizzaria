/* =========================================================
   Ursulão Pizzas — interações
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Ano no rodapé ---------- */
  $("#ano").textContent = new Date().getFullYear();

  /* ---------- Total de sabores ---------- */
  const total = CARDAPIO.salgadas.length + CARDAPIO.doces.length;
  $("#totalSabores").textContent = total;

  /* ---------- Header com sombra ao rolar ---------- */
  const header = $(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = $("#menuToggle");
  const nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Link ativo no menu conforme a seção ---------- */
  const links = $$(".nav a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Animação de entrada ---------- */
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revealer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealer.observe(el));

  /* =========================================================
     CARDÁPIO
     ========================================================= */
  const state = { cat: "salgadas", q: "" };
  const grid = $("#menuGrid");
  const empty = $("#menuEmpty");
  const count = $("#menuCount");

  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Destaca o termo buscado (ignorando acentos)
  const highlight = (text, q) => {
    if (!q) return esc(text);
    const n = norm(text);
    const i = n.indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  };

  function render() {
    const q = norm(state.q.trim());
    const items = CARDAPIO[state.cat].filter(([nome, ing]) => !q || norm(nome + " " + ing).includes(q));

    grid.innerHTML = items
      .map(([nome, ing, grande, broto], i) => {
        const selo = SELOS[nome];
        const tag = selo ? `<span class="tag ${selo === "Veggie" ? "tag--veggie" : ""}">${selo}</span>` : "";
        return `
          <article class="item" style="animation-delay:${Math.min(i, 20) * 18}ms">
            <h3>${highlight(nome, q)} ${tag}</h3>
            <p>${highlight(ing, q)}</p>
            <div class="item__sizes">
              <span class="size size--grande"><small>Grande · 8 ped.</small><strong>${brl(grande)}</strong></span>
              <span class="size"><small>Broto · 4 ped.</small><strong>${brl(broto)}</strong></span>
            </div>
          </article>`;
      })
      .join("");

    empty.hidden = items.length > 0;
    count.textContent = `${items.length} ${items.length === 1 ? "sabor" : "sabores"}`;
  }

  $$(".tab").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$(".tab").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      state.cat = btn.dataset.cat;
      render();
    })
  );

  let t;
  $("#busca").addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.q = e.target.value;
      // Se não achar na aba atual, mas achar na outra, troca automaticamente
      const q = norm(state.q.trim());
      const has = (cat) => CARDAPIO[cat].some(([n, i]) => norm(n + " " + i).includes(q));
      if (q && !has(state.cat)) {
        const other = state.cat === "salgadas" ? "doces" : "salgadas";
        if (has(other)) $(`.tab[data-cat="${other}"]`).click();
      }
      render();
    }, 120);
  });

  render();

  /* =========================================================
     ABERTO AGORA? (horário de São Paulo)
     Ter–Qui e Dom: 18h–23h | Sex e Sáb: 18h–24h | Seg: fechado
     Fechado no último domingo do mês. (Feriados não são considerados.)
     ========================================================= */
  function nowInSaoPaulo() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", hourCycle: "h23", weekday: "short",
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get("weekday")];
    return { y: +get("year"), m: +get("month"), d: +get("day"), h: +get("hour"), min: +get("minute"), wd };
  }

  function isLastSunday({ y, m, d, wd }) {
    if (wd !== 0) return false;
    const daysInMonth = new Date(y, m, 0).getDate();
    return d + 7 > daysInMonth;
  }

  function updateStatus() {
    const now = nowInSaoPaulo();
    const pill = $("#statusPill");
    const txt = $("#statusText");
    const closeHour = [23, null, 23, 23, 23, 24, 24][now.wd]; // null = segunda (fechado)
    const closedToday = closeHour === null || isLastSunday(now);
    const minutes = now.h * 60 + now.min;
    const open = !closedToday && minutes >= 18 * 60 && minutes < closeHour * 60;

    pill.classList.toggle("is-open", open);
    pill.classList.toggle("is-closed", !open);

    if (open) {
      txt.textContent = `Aberto agora · até ${closeHour === 24 ? "meia-noite" : closeHour + "h"}`;
    } else if (!closedToday && minutes < 18 * 60) {
      txt.textContent = "Fechado · abre hoje às 18h";
    } else if (isLastSunday(now)) {
      txt.textContent = "Fechado hoje (último domingo do mês)";
    } else {
      txt.textContent = now.wd === 1 ? "Fechado · abre terça às 18h" : nextOpenText(now);
    }

    // Destaca o dia de hoje na lista de horários
    $$("#hoursList li").forEach((li) => {
      li.classList.toggle("is-today", li.dataset.days.split(",").map(Number).includes(now.wd));
    });
  }

  function nextOpenText(now) {
    // Depois do fechamento: próximo dia aberto
    const tomorrow = (now.wd + 1) % 7;
    if (tomorrow === 1) return "Fechado · abre terça às 18h";
    return "Fechado · abre amanhã às 18h";
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000);
})();
