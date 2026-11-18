(() => {
  "use strict";

  const MARKETS = {
    wb:   { label: "Wildberries", commission: 15, logistics: 350, returns: 8, returnCost: 320, other: 80 },
    ozon: { label: "Ozon",        commission: 18, logistics: 420, returns: 7, returnCost: 340, other: 80 },
    own:  { label: "Свои условия", commission: 15, logistics: 350, returns: 8, returnCost: 320, other: 80 }
  };

  const EXAMPLES = [
    { price: 9990,  cost: 4200, commission: 15, logistics: 350, discount: 10, returns: 8,  returnCost: 320, other: 80 },
    { price: 6490,  cost: 2400, commission: 15, logistics: 290, discount: 5,  returns: 12, returnCost: 300, other: 60 },
    { price: 12990, cost: 6100, commission: 15, logistics: 390, discount: 20, returns: 15, returnCost: 380, other: 100 }
  ];

  const IDS = ["price", "cost", "commission", "logistics", "discount", "returns", "returnCost", "other"];

  const TEMPLATE = `
    <div class="market-tabs" role="group" aria-label="Маркетплейс">
      <button type="button" class="tab" data-market="wb" aria-pressed="false">Wildberries</button>
      <button type="button" class="tab" data-market="ozon" aria-pressed="false">Ozon</button>
      <button type="button" class="tab" data-market="own" aria-pressed="false">Свои условия</button>
    </div>

    <section class="layout" id="calc">
      <div class="card form-card">
        <div class="card-head">
          <div>
            <h2>Параметры товара</h2>
            <p>Можно менять любые значения — результат обновится сразу.</p>
          </div>
          <button type="button" class="link-btn" data-reset>Сбросить</button>
        </div>

        <div class="examples" aria-label="Примеры товаров">
          <span class="examples__label">Быстрый пример:</span>
          <button type="button" class="chip" data-example="0">Кофемашина</button>
          <button type="button" class="chip" data-example="1">Кроссовки</button>
          <button type="button" class="chip" data-example="2">Куртка</button>
        </div>

        <div class="grid-2">
          <label class="field"><span class="field__label">Цена продажи, ₽</span><span class="field__control"><input type="number" id="price" min="1" step="10" value="9990" inputmode="decimal"><span class="suffix">₽</span></span></label>
          <label class="field"><span class="field__label">Себестоимость товара, ₽</span><span class="field__control"><input type="number" id="cost" min="0" step="10" value="4200" inputmode="decimal"><span class="suffix">₽</span></span></label>
          <label class="field"><span class="field__label">Комиссия маркетплейса, %</span><span class="field__control"><input type="number" id="commission" min="0" max="99" step="1" value="15" inputmode="decimal"><span class="suffix">%</span></span></label>
          <label class="field"><span class="field__label">Логистика и последняя миля, ₽</span><span class="field__control"><input type="number" id="logistics" min="0" step="10" value="350" inputmode="decimal"><span class="suffix">₽</span></span></label>
          <label class="field"><span class="field__label">Акционная скидка, %</span><span class="field__control"><input type="number" id="discount" min="0" max="99" step="1" value="10" inputmode="decimal"><span class="suffix">%</span></span></label>
          <label class="field"><span class="field__label">Доля возвратов, %</span><span class="field__control"><input type="number" id="returns" min="0" max="100" step="1" value="8" inputmode="decimal"><span class="suffix">%</span></span></label>
          <label class="field"><span class="field__label">Потери на один возврат, ₽</span><span class="field__control"><input type="number" id="returnCost" min="0" step="10" value="320" inputmode="decimal"><span class="suffix">₽</span></span></label>
          <label class="field"><span class="field__label">Прочие расходы, ₽</span><span class="field__control"><input type="number" id="other" min="0" step="10" value="80" inputmode="decimal"><span class="suffix">₽</span></span><span class="field__hint">упаковка, хранение, комиссия эквайринга</span></label>
        </div>

        <p class="form-note">Тарифы задаются вручную — поставьте свои актуальные условия, чтобы расчёт совпадал с реальностью.</p>
      </div>

      <aside class="card result-card" aria-live="polite">
        <div class="card-head">
          <div><h2>Результат</h2><p data-market-label>—</p></div>
          <span class="badge" data-badge>—</span>
        </div>
        <div class="result-main">
          <span class="result-main__label">Прибыль с одного заказа</span>
          <strong class="result-main__value" data-profit>—</strong>
          <span class="result-main__margin" data-margin>—</span>
        </div>
        <div class="bars" data-bars></div>
        <div class="result-foot">
          <div class="result-foot__row"><span>Цена безубыточности</span><strong class="mono" data-breakeven>—</strong></div>
          <div class="result-foot__row"><span>Цена после скидки</span><strong class="mono" data-net>—</strong></div>
          <p class="result-foot__hint" data-advice>—</p>
        </div>
        <div class="result-actions">
          <button type="button" class="btn btn--primary" data-copy>Скопировать расчёт</button>
          <button type="button" class="btn" data-share>Поделиться ссылкой</button>
        </div>
      </aside>
    </section>
  `;

  class MarginCalculator extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";
      this.innerHTML = TEMPLATE;

      this.fields = {};
      IDS.forEach((id) => { this.fields[id] = this.querySelector(`#${id}`); });
      this.ui = {
        marketLabel: this.querySelector("[data-market-label]"),
        profit: this.querySelector("[data-profit]"),
        margin: this.querySelector("[data-margin]"),
        badge: this.querySelector("[data-badge]"),
        bars: this.querySelector("[data-bars]"),
        breakeven: this.querySelector("[data-breakeven]"),
        net: this.querySelector("[data-net]"),
        advice: this.querySelector("[data-advice]"),
        copy: this.querySelector("[data-copy]"),
        share: this.querySelector("[data-share]"),
        reset: this.querySelector("[data-reset]"),
        toast: document.getElementById("toast")
      };

      this.market = this.getAttribute("market") || "wb";
      this.lastResult = null;
      this.toastTimer = null;
      this.syncTabs();

      this.bind();
      if (!this.readUrl()) this.applyValues({ ...EXAMPLES[0], ...MARKETS[this.market] });
      else this.update();
    }

    val(id) { return Number(this.fields[id].value) || 0; }

    syncTabs() {
      this.querySelectorAll("[data-market]").forEach((btn) => {
        const active = btn.dataset.market === this.market;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    }

    toast(text) {
      const node = this.ui.toast;
      if (!node) return;
      node.textContent = text;
      node.classList.add("is-visible");
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2400);
    }

    bind() {
      IDS.forEach((id) => {
        this.fields[id].addEventListener("input", () => this.update());
        this.fields[id].addEventListener("change", () => this.update());
      });

      this.querySelectorAll("[data-market]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (window.tgHaptic) window.tgHaptic("light");
          this.applyMarket(btn.dataset.market);
        });
      });
      this.querySelectorAll("[data-example]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (window.tgHaptic) window.tgHaptic("light");
          this.applyValues(EXAMPLES[Number(btn.dataset.example)]);
          this.toast("Пример подставлен");
        });
      });

      this.ui.reset.addEventListener("click", () => {
        if (window.tgHaptic) window.tgHaptic("light");
        this.applyValues({ price: 9990, cost: 4200, discount: 10, ...MARKETS[this.market] });
        this.toast("Значения сброшены");
      });
      this.ui.copy.addEventListener("click", () => {
        if (window.tgHaptic) window.tgHaptic("medium");
        this.copy(this.resultText(), "Расчёт скопирован");
      });
      this.ui.share.addEventListener("click", () => {
        if (window.tgShare) {
          window.tgShare(location.href, "Калькулятор маржи для Wildberries и Ozon");
          if (window.tgHaptic) window.tgHaptic("medium");
          return;
        }
        this.copy(location.href, "Ссылка скопирована");
      });
    }

    applyValues(values) {
      IDS.forEach((id) => {
        if (values[id] !== undefined) this.fields[id].value = values[id];
      });
      this.update();
    }

    applyMarket(key) {
      if (!MARKETS[key]) return;
      this.market = key;
      this.syncTabs();
      const m = MARKETS[key];
      this.applyValues({ commission: m.commission, logistics: m.logistics, returns: m.returns, returnCost: m.returnCost, other: m.other });
    }

    calculate() {
      const price = this.val("price");
      const cost = this.val("cost");
      const commissionRate = Math.min(99, this.val("commission")) / 100;
      const logistics = this.val("logistics");
      const discountRate = Math.min(99, this.val("discount")) / 100;
      const returnRate = this.val("returns") / 100;
      const returnCost = this.val("returnCost");
      const other = this.val("other");

      const netPrice = price * (1 - discountRate);
      const commission = netPrice * commissionRate;
      const returnLoss = returnRate * returnCost;
      const fixed = cost + logistics + returnLoss + other;
      const profit = netPrice - commission - fixed;
      const margin = netPrice > 0 ? (profit / netPrice) * 100 : 0;
      const denominator = (1 - commissionRate) * (1 - discountRate);
      const breakeven = denominator > 0 ? fixed / denominator : 0;

      return { price, cost, commissionRate, commission, logistics, discountRate, returnRate, returnLoss, other, netPrice, profit, margin, breakeven };
    }

    bar(label, value, max, modifier, negative) {
      const pct = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0;
      const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
      return `
        <div class="bar-row ${modifier}">
          <span class="bar-row__label">${label}</span>
          <span class="bar-row__value">${negative ? "−" : ""}${nf.format(Math.round(value))} ₽</span>
          <span class="bar-row__track"><span style="width:${pct}%;${negative ? "background:var(--bad)" : ""}"></span></span>
        </div>`;
    }

    update() {
      const r = this.calculate();
      this.lastResult = r;
      const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
      const money = (v) => `${nf.format(Math.round(v))} ₽`;
      const state = r.profit > 0 ? (r.margin >= 15 ? "good" : "warn") : "bad";

      this.ui.profit.textContent = `${r.profit > 0 ? "" : "−"}${money(Math.abs(r.profit))}`;
      this.ui.profit.className = `result-main__value${state === "good" ? "" : ` is-${state}`}`;
      this.ui.margin.textContent = `Маржа: ${r.margin.toFixed(1).replace(".", ",")}% от цены продажи`;
      this.ui.badge.className = `badge${state === "good" ? "" : ` is-${state}`}`;
      this.ui.badge.textContent = state === "good" ? "Хорошая маржа" : state === "warn" ? "Маржа низкая" : "Продажа в минус";
      this.ui.marketLabel.textContent = `${MARKETS[this.market].label} · комиссия ${Math.round(r.commissionRate * 100)}%`;
      this.ui.net.textContent = money(r.netPrice);
      this.ui.breakeven.textContent = money(r.breakeven);

      this.ui.bars.innerHTML = [
        this.bar("Цена после скидки", r.netPrice, r.netPrice, "bar-row--price", false),
        this.bar("Комиссия", r.commission, r.netPrice, "", true),
        this.bar("Себестоимость", r.cost, r.netPrice, "", true),
        this.bar("Логистика", r.logistics, r.netPrice, "", true),
        this.bar("Возвраты", r.returnLoss, r.netPrice, "", true),
        this.bar("Прочие расходы", r.other, r.netPrice, "", true),
        this.bar("Прибыль", Math.abs(r.profit), r.netPrice, "bar-row--profit", r.profit < 0)
      ].join("");

      if (state === "bad") {
        const need = Math.max(0, r.breakeven - r.price);
        this.ui.advice.textContent = `Чтобы выйти в ноль, поднимите цену минимум на ${money(need)} — до ${money(r.breakeven)} — или снизьте расходы.`;
      } else if (state === "warn") {
        this.ui.advice.textContent = "Маржа ниже 15%. Проверьте логистику и долю возвратов — обычно деньги теряются там.";
      } else {
        this.ui.advice.textContent = "Условия выглядят рабочими. Помните: акционная скидка уже учтена в расчёте.";
      }

      this.writeUrl();
      document.dispatchEvent(new CustomEvent("margin-calc:change", {
        detail: { market: this.market, profit: r.profit, margin: r.margin, state }
      }));
    }

    writeUrl() {
      const params = new URLSearchParams();
      params.set("m", this.market);
      params.set("p", this.val("price"));
      params.set("c", this.val("cost"));
      params.set("k", this.val("commission"));
      params.set("l", this.val("logistics"));
      params.set("d", this.val("discount"));
      params.set("r", this.val("returns"));
      params.set("rc", this.val("returnCost"));
      params.set("o", this.val("other"));
      history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
    }

    readUrl() {
      const params = new URLSearchParams(location.search);
      if (!params.has("p")) return false;
      if (MARKETS[params.get("m")]) this.market = params.get("m");
      this.syncTabs();
      const map = { p: "price", c: "cost", k: "commission", l: "logistics", d: "discount", r: "returns", rc: "returnCost", o: "other" };
      Object.entries(map).forEach(([key, id]) => {
        if (params.has(key)) this.fields[id].value = params.get(key);
      });
      return true;
    }

    resultText() {
      const r = this.lastResult || this.calculate();
      const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
      const money = (v) => `${nf.format(Math.round(v))} ₽`;
      return [
        `Калькулятор маржи · ${MARKETS[this.market].label}`,
        `Цена продажи: ${money(r.price)}`,
        `Цена после скидки ${Math.round(r.discountRate * 100)}%: ${money(r.netPrice)}`,
        `Комиссия ${Math.round(r.commissionRate * 100)}%: −${money(r.commission)}`,
        `Себестоимость: −${money(r.cost)}`,
        `Логистика: −${money(r.logistics)}`,
        `Возвраты ${Math.round(r.returnRate * 100)}%: −${money(r.returnLoss)}`,
        `Прочие расходы: −${money(r.other)}`,
        `Прибыль: ${r.profit > 0 ? "" : "−"}${money(Math.abs(r.profit))} (${r.margin.toFixed(1).replace(".", ",")}%)`,
        `Цена безубыточности: ${money(r.breakeven)}`
      ].join("\n");
    }

    async copy(text, message) {
      try {
        await navigator.clipboard.writeText(text);
        this.toast(message);
      } catch (_) {
        this.toast("Не удалось скопировать — проверьте доступ к буферу");
      }
    }
  }

  customElements.define("margin-calculator", MarginCalculator);
})();
