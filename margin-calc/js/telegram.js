(function () {
  "use strict";

  var tg = window.Telegram && window.Telegram.WebApp;
  var root = document.documentElement;

  function parseColor(value) {
    if (!value) return null;
    var v = String(value).trim();
    if (v.charAt(0) === "#") {
      if (v.length === 4) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      if (v.length === 7) {
        return [
          parseInt(v.slice(1, 3), 16),
          parseInt(v.slice(3, 5), 16),
          parseInt(v.slice(5, 7), 16)
        ];
      }
    }
    var m = v.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
    return null;
  }

  function cssColor(c) {
    return "rgb(" + c.map(function (n) { return Math.max(0, Math.min(255, Math.round(n))); }).join(", ") + ")";
  }

  function hexColor(c) {
    return "#" + c.map(function (n) {
      var h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return h.length === 1 ? "0" + h : h;
    }).join("");
  }

  function mix(a, b, t) {
    if (!a || !b) return null;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  function isDark(c) {
    if (!c) return false;
    var l = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
    return l < 0.5;
  }

  function setVar(name, value) {
    if (value) root.style.setProperty(name, value);
  }

  function haptic(style) {
    if (tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred) {
      tg.HapticFeedback.impactOccurred(style || "light");
    }
  }

  function notify(type) {
    if (tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred) {
      tg.HapticFeedback.notificationOccurred(type || "success");
    }
  }

  window.tgHaptic = haptic;
  window.tgNotify = notify;

  if (!tg) return;

  document.body.classList.add("is-telegram");

  var mainButton = tg.MainButton;
  var brandColor = "#2563eb";
  var buttonTextColor = "#ffffff";

  function applyTheme() {
    var p = tg.themeParams || {};
    var bg = parseColor(p.bg_color || p.secondary_bg_color) || [245, 247, 250];
    var surface = parseColor(p.secondary_bg_color) || (isDark(bg) ? [28, 28, 30] : [255, 255, 255]);
    var text = parseColor(p.text_color) || (isDark(bg) ? [241, 241, 243] : [31, 41, 55]);
    var muted = parseColor(p.hint_color || p.subtitle_text_color) || (isDark(bg) ? [142, 142, 147] : [107, 114, 128]);
    var brand = parseColor(p.button_color || p.link_color) || (isDark(bg) ? [96, 165, 250] : [37, 99, 235]);
    var dark = isDark(bg);
    var white = [255, 255, 255];
    var black = [0, 0, 0];

    brandColor = p.button_color || hexColor(brand);
    buttonTextColor = p.button_text_color || "#ffffff";

    var vars = {
      "--bg": cssColor(bg),
      "--surface": cssColor(surface),
      "--text": cssColor(text),
      "--muted": cssColor(muted),
      "--brand": cssColor(brand),
      "--brand-dark": cssColor(mix(brand, dark ? white : black, 0.18)),
      "--brand-soft": cssColor(mix(brand, dark ? bg : white, dark ? 0.78 : 0.92)),
      "--line": dark ? "rgba(255,255,255,.12)" : "#e5e7eb",
      "--line-strong": dark ? "rgba(255,255,255,.22)" : "#d1d5db",
      "--good": dark ? "#4ade80" : "#15803d",
      "--good-soft": dark ? "rgba(74,222,128,.14)" : "#ecfdf3",
      "--warn": dark ? "#fbbf24" : "#b45309",
      "--warn-soft": dark ? "rgba(251,191,36,.14)" : "#fffbeb",
      "--bad": dark ? "#f87171" : "#b91c1c",
      "--bad-soft": dark ? "rgba(248,113,113,.14)" : "#fef2f2",
      "--shadow": dark ? "none" : "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.04)"
    };

    Object.keys(vars).forEach(function (key) { setVar(key, vars[key]); });

    if (tg.setHeaderColor) {
      tg.setHeaderColor(p.header_bg_color || p.secondary_bg_color || hexColor(bg));
    }
    if (tg.setBackgroundColor) tg.setBackgroundColor(hexColor(bg));
    if (mainButton && mainButton.setParams) {
      mainButton.setParams({ color: brandColor, text_color: buttonTextColor });
    }
  }

  applyTheme();
  if (tg.onEvent) tg.onEvent("themeChanged", applyTheme);

  if (tg.expand) tg.expand();
  if (tg.ready) tg.ready();

  window.tgShare = function (url, text) {
    var shareUrl = "https://t.me/share/url?url=" + encodeURIComponent(url) +
      "&text=" + encodeURIComponent(text || "Калькулятор маржи для Wildberries и Ozon");
    if (tg.openTelegramLink) tg.openTelegramLink(shareUrl);
    else window.open(shareUrl, "_blank", "noopener");
  };

  if (mainButton) {
    var onMain = function () {
      var copy = document.querySelector("margin-calculator [data-copy]");
      if (copy) copy.click();
      else if (tg.close) tg.close();
    };
    if (mainButton.onClick) mainButton.onClick(onMain);
    if (mainButton.setParams) {
      mainButton.setParams({
        text: document.querySelector("margin-calculator") ? "Скопировать расчёт" : "На главную",
        color: brandColor,
        text_color: buttonTextColor,
        is_active: true
      });
    }
    if (mainButton.show) mainButton.show();
  }

  document.addEventListener("margin-calc:change", function (event) {
    if (!mainButton || !mainButton.setText || !event.detail) return;
    mainButton.setText(event.detail.profit > 0 ? "Скопировать расчёт" : "Проверить расчёт");
  });

  if (tg.BackButton && location.pathname.replace(/\/+$/, "") !== "") {
    tg.BackButton.show();
    tg.BackButton.onClick(function () {
      if (history.length > 1) history.back();
      else if (tg.close) tg.close();
    });
  }

  var start = tg.initDataUnsafe && tg.initDataUnsafe.start_param;
  if (start && /^(wb|ozon|own)$/.test(start)) {
    var tab = document.querySelector('margin-calculator [data-market="' + start + '"]');
    if (tab) tab.click();
  }

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href^="http"]') : null;
    if (!link || !tg.openLink) return;
    event.preventDefault();
    tg.openLink(link.href);
  });
})();
