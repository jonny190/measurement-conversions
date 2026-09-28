/* Measurement Conversions — conversion engine + UI. No dependencies. */
(function () {
  "use strict";

  /* ── Unit data ─────────────────────────────────────────────────────── */

  function linear(factor) {
    return { factor: factor, toBase: function (v) { return v * factor; }, fromBase: function (v) { return v / factor; } };
  }

  // spec: { key: [factorToBase, label, symbol?] }
  function units(spec) {
    var out = {};
    Object.keys(spec).forEach(function (key) {
      var e = spec[key];
      var u = linear(e[0]);
      u.label = e[1];
      u.symbol = e[2] || key;
      out[key] = u;
    });
    return out;
  }

  var CATEGORIES = {
    length: {
      label: "Length",
      units: units({
        mm: [0.001, "Millimetre"], cm: [0.01, "Centimetre"], m: [1, "Metre"], km: [1000, "Kilometre"],
        in: [0.0254, "Inch", "in"], ft: [0.3048, "Foot", "ft"], yd: [0.9144, "Yard", "yd"],
        mi: [1609.344, "Mile", "mi"], nmi: [1852, "Nautical mile", "nmi"]
      })
    },
    mass: {
      label: "Mass",
      units: units({
        mg: [1e-6, "Milligram"], g: [0.001, "Gram"], kg: [1, "Kilogram"], t: [1000, "Tonne", "t"],
        oz: [0.028349523125, "Ounce", "oz"], lb: [0.45359237, "Pound", "lb"], st: [6.35029318, "Stone", "st"],
        "ton-us": [907.18474, "US ton"], "ton-uk": [1016.0469088, "Imperial ton"]
      })
    },
    volume: {
      label: "Volume",
      units: units({
        ml: [0.001, "Millilitre"], l: [1, "Litre", "L"], "m3": [1000, "Cubic metre", "m³"],
        "tsp-us": [0.00492892159375, "Teaspoon (US)"], "tbsp-us": [0.01478676478125, "Tablespoon (US)"],
        "floz-us": [0.0295735295625, "Fluid ounce (US)"], "cup-us": [0.2365882365, "Cup (US)"],
        "pt-us": [0.473176473, "Pint (US)"], "qt-us": [0.946352946, "Quart (US)"], "gal-us": [3.785411784, "Gallon (US)"],
        "pt-uk": [0.56826125, "Pint (imperial)"], "gal-uk": [4.54609, "Gallon (imperial)"]
      })
    },
    temperature: {
      label: "Temperature",
      units: {
        C: { label: "Celsius", symbol: "°C", toBase: function (v) { return v; }, fromBase: function (v) { return v; } },
        F: { label: "Fahrenheit", symbol: "°F", toBase: function (v) { return (v - 32) * 5 / 9; }, fromBase: function (v) { return v * 9 / 5 + 32; } },
        K: { label: "Kelvin", symbol: "K", toBase: function (v) { return v - 273.15; }, fromBase: function (v) { return v + 273.15; } },
        R: { label: "Rankine", symbol: "°R", toBase: function (v) { return (v - 491.67) * 5 / 9; }, fromBase: function (v) { return (v + 273.15) * 9 / 5; } }
      }
    },
    area: {
      label: "Area",
      units: units({
        "mm2": [1e-6, "Square millimetre", "mm²"], "cm2": [1e-4, "Square centimetre", "cm²"],
        "m2": [1, "Square metre", "m²"], ha: [10000, "Hectare", "ha"], "km2": [1e6, "Square kilometre", "km²"],
        "in2": [0.00064516, "Square inch", "in²"], "ft2": [0.09290304, "Square foot", "ft²"],
        "yd2": [0.83612736, "Square yard", "yd²"], acre: [4046.8564224, "Acre"], "mi2": [2589988.110336, "Square mile", "mi²"]
      })
    },
    speed: {
      label: "Speed",
      units: units({
        "m/s": [1, "Metre per second", "m/s"], "km/h": [1 / 3.6, "Kilometre per hour", "km/h"],
        mph: [0.44704, "Mile per hour", "mph"], kn: [1852 / 3600, "Knot", "kn"], "ft/s": [0.3048, "Foot per second", "ft/s"]
      })
    },
    time: {
      label: "Time",
      units: units({
        ms: [0.001, "Millisecond"], s: [1, "Second"], min: [60, "Minute"], h: [3600, "Hour"],
        day: [86400, "Day"], wk: [604800, "Week"], yr: [31557600, "Year (365.25 d)"]
      })
    },
    data: {
      label: "Data",
      units: units({
        bit: [0.125, "Bit"], B: [1, "Byte"], kB: [1000, "Kilobyte (1000 B)"], MB: [1e6, "Megabyte"],
        GB: [1e9, "Gigabyte"], TB: [1e12, "Terabyte"], KiB: [1024, "Kibibyte (1024 B)"],
        MiB: [1048576, "Mebibyte"], GiB: [1073741824, "Gibibyte"], TiB: [1099511627776, "Tebibyte"]
      })
    },
    pressure: {
      label: "Pressure",
      units: units({
        Pa: [1, "Pascal"], kPa: [1000, "Kilopascal"], bar: [100000, "Bar"], mbar: [100, "Millibar"],
        psi: [6894.757293168, "Pound per square inch", "psi"], atm: [101325, "Atmosphere", "atm"],
        mmHg: [133.322387415, "Millimetre of mercury", "mmHg"]
      })
    },
    energy: {
      label: "Energy",
      units: units({
        J: [1, "Joule"], kJ: [1000, "Kilojoule"], cal: [4.184, "Calorie"], kcal: [4184, "Kilocalorie", "kcal"],
        Wh: [3600, "Watt hour", "Wh"], kWh: [3.6e6, "Kilowatt hour", "kWh"],
        BTU: [1055.05585262, "British thermal unit", "BTU"]
      })
    },
    power: {
      label: "Power",
      units: units({
        W: [1, "Watt"], kW: [1000, "Kilowatt"], MW: [1e6, "Megawatt"],
        hp: [745.6998715823, "Horsepower (mechanical)", "hp"], PS: [735.49875, "Horsepower (metric)", "PS"],
        "BTU/h": [0.2930710702, "BTU per hour", "BTU/h"]
      })
    },
    angle: {
      label: "Angle",
      units: units({
        deg: [1, "Degree", "°"], rad: [57.29577951308232, "Radian", "rad"], grad: [0.9, "Gradian", "grad"],
        turn: [360, "Turn"], arcmin: [1 / 60, "Arcminute", "′"], arcsec: [1 / 3600, "Arcsecond", "″"]
      })
    },
    frequency: {
      label: "Frequency",
      units: units({
        Hz: [1, "Hertz"], kHz: [1000, "Kilohertz"], MHz: [1e6, "Megahertz"], GHz: [1e9, "Gigahertz"],
        rpm: [1 / 60, "Revolution per minute", "rpm"]
      })
    }
  };

  var ORDER = ["length", "mass", "volume", "temperature", "area", "speed", "time", "data", "pressure", "energy", "power", "angle", "frequency"];

  /* ── Maths and formatting ──────────────────────────────────────────── */

  function convert(categoryKey, from, to, value) {
    var u = CATEGORIES[categoryKey].units;
    if (!u[from] || !u[to]) return NaN;
    return u[to].fromBase(u[from].toBase(value));
  }

  function formatNumber(value) {
    if (!isFinite(value)) return "—";
    if (value === 0) return "0";

    var abs = Math.abs(value);
    if (abs >= 1e15 || abs < 1e-9) {
      return value.toExponential(6).replace(/\.?0+e/, "e");
    }

    var exponent = Math.floor(Math.log10(abs));
    var decimals = Math.min(Math.max(9 - 1 - exponent, 0), 12);
    return value.toLocaleString("en-GB", { maximumFractionDigits: decimals });
  }

  function parseAmount(raw) {
    var cleaned = String(raw).replace(/[\s,_]/g, "");
    if (cleaned === "") return NaN;
    var value = Number(cleaned);
    return isFinite(value) ? value : NaN;
  }

  function label(unitKey, categoryKey) {
    return CATEGORIES[categoryKey].units[unitKey].label;
  }

  function symbol(unitKey, categoryKey) {
    return CATEGORIES[categoryKey].units[unitKey].symbol;
  }

  /* ── State ─────────────────────────────────────────────────────────── */

  var state = { category: "length", from: "m", to: "ft", amount: 1 };

  var el = {
    chips: document.getElementById("categories"),
    amount: document.getElementById("value"),
    from: document.getElementById("from"),
    to: document.getElementById("to"),
    swap: document.getElementById("swap"),
    resultValue: document.getElementById("result-value"),
    resultUnit: document.getElementById("result-unit"),
    resultEquation: document.getElementById("result-equation"),
    copy: document.getElementById("copy"),
    clear: document.getElementById("clear"),
    hint: document.getElementById("hint"),
    referenceLead: document.getElementById("reference-lead"),
    referenceBody: document.querySelector("#reference-table tbody"),
    footerNote: document.getElementById("footer-note")
  };

  function unitKeys(categoryKey) {
    return Object.keys(CATEGORIES[categoryKey].units);
  }

  function fillSelect(select, categoryKey, selected) {
    select.innerHTML = "";
    unitKeys(categoryKey).forEach(function (key) {
      var option = document.createElement("option");
      option.value = key;
      option.textContent = label(key, categoryKey) + " (" + symbol(key, categoryKey) + ")";
      select.appendChild(option);
    });
    select.value = selected;
  }

  function buildChips() {
    el.chips.innerHTML = "";
    ORDER.forEach(function (key) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = CATEGORIES[key].label;
      button.dataset.category = key;
      button.setAttribute("aria-pressed", String(key === state.category));
      button.addEventListener("click", function () { setCategory(key); });
      el.chips.appendChild(button);
    });
  }

  function setCategory(key, keepUnits) {
    state.category = key;
    var keys = unitKeys(key);
    if (!keepUnits || keys.indexOf(state.from) === -1) state.from = keys[0];
    if (!keepUnits || keys.indexOf(state.to) === -1) state.to = keys[1] || keys[0];

    Array.prototype.forEach.call(el.chips.children, function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.category === key));
    });

    fillSelect(el.from, key, state.from);
    fillSelect(el.to, key, state.to);
    render();
  }

  function render() {
    var category = CATEGORIES[state.category];
    var value = parseAmount(el.amount.value);
    var invalid = isNaN(value);

    el.amount.classList.toggle("invalid", invalid);
    el.hint.textContent = invalid ? "Enter a number to convert." : "";

    var result = invalid ? NaN : convert(state.category, state.from, state.to, value);

    el.resultValue.textContent = invalid ? "—" : formatNumber(result);
    el.resultUnit.textContent = invalid ? "" : symbol(state.to, state.category);

    el.resultEquation.textContent = invalid
      ? ""
      : formatNumber(value) + " " + symbol(state.from, state.category) +
        "  =  " + formatNumber(result) + " " + symbol(state.to, state.category);

    el.referenceLead.textContent = invalid
      ? "Enter an amount to see it in every " + category.label.toLowerCase() + " unit."
      : formatNumber(value) + " " + label(state.from, state.category).toLowerCase() + " expressed in every other unit:";

    renderReference(value, invalid);
    syncUrl(value);
  }

  function renderReference(value, invalid) {
    var fragment = document.createDocumentFragment();
    unitKeys(state.category).forEach(function (key) {
      var row = document.createElement("tr");
      var name = document.createElement("th");
      name.scope = "row";
      name.textContent = label(key, state.category) + " (" + symbol(key, state.category) + ")";
      var cell = document.createElement("td");
      cell.textContent = invalid ? "—" : formatNumber(convert(state.category, state.from, key, value));
      if (key === state.to) row.style.fontWeight = "600";
      row.appendChild(name);
      row.appendChild(cell);
      fragment.appendChild(row);
    });
    el.referenceBody.innerHTML = "";
    el.referenceBody.appendChild(fragment);
  }

  function syncUrl(value) {
    if (!window.history || !window.history.replaceState) return;
    var query = "?cat=" + encodeURIComponent(state.category) +
                "&from=" + encodeURIComponent(state.from) +
                "&to=" + encodeURIComponent(state.to) +
                (isNaN(value) ? "" : "&v=" + encodeURIComponent(String(value)));
    window.history.replaceState(null, "", window.location.pathname + query);
  }

  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get("cat");
    if (!category || !CATEGORIES[category]) return false;

    var keys = unitKeys(category);
    state.category = category;
    state.from = keys.indexOf(params.get("from")) !== -1 ? params.get("from") : keys[0];
    state.to = keys.indexOf(params.get("to")) !== -1 ? params.get("to") : keys[1] || keys[0];

    var raw = params.get("v");
    if (raw !== null) {
      var parsed = parseAmount(raw);
      if (!isNaN(parsed)) {
        state.amount = parsed;
        el.amount.value = String(parsed);
      }
    }
    return true;
  }

  /* ── Wiring ────────────────────────────────────────────────────────── */

  el.amount.addEventListener("input", render);

  el.from.addEventListener("change", function () { state.from = el.from.value; render(); });
  el.to.addEventListener("change", function () { state.to = el.to.value; render(); });

  el.swap.addEventListener("click", function () {
    var previousFrom = state.from;
    state.from = state.to;
    state.to = previousFrom;
    fillSelect(el.from, state.category, state.from);
    fillSelect(el.to, state.category, state.to);
    render();
  });

  el.copy.addEventListener("click", function () {
    var value = parseAmount(el.amount.value);
    if (isNaN(value)) { el.hint.textContent = "Nothing to copy yet."; return; }

    var text = formatNumber(convert(state.category, state.from, state.to, value)) +
               " " + symbol(state.to, state.category);
    var done = function () {
      el.hint.textContent = "Copied.";
      window.setTimeout(function () { if (el.hint.textContent === "Copied.") el.hint.textContent = ""; }, 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { el.hint.textContent = text; });
    } else {
      el.hint.textContent = text;
    }
  });

  el.clear.addEventListener("click", function () {
    el.amount.value = "";
    render();
    el.amount.focus();
  });

  /* ── AdSense ───────────────────────────────────────────────────────── */

  function initAds() {
    var ADS = window.ADSENSE_CONFIG || {};
    var slots = Array.prototype.slice.call(document.querySelectorAll("[data-ad-slot]"));
    if (!slots.length) return;

    var configured = ADS.enabled === true &&
                     typeof ADS.client === "string" &&
                     /^ca-pub-\d{6,}$/.test(ADS.client);

    if (!configured) {
      slots.forEach(function (slot) { slot.classList.add("is-placeholder"); });
      return;
    }

    var loader = document.createElement("script");
    loader.async = true;
    loader.crossOrigin = "anonymous";
    // Keep Cloudflare Rocket Loader (active on this zone) away from AdSense.
    loader.setAttribute("data-cfasync", "false");
    loader.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ADS.client);
    document.head.appendChild(loader);

    slots.forEach(function (slot) {
      var name = slot.dataset.adSlot;
      var unitId = (ADS.slots || {})[name];

      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", ADS.client);
      if (unitId) ins.setAttribute("data-ad-slot", unitId);
      ins.setAttribute("data-ad-format", name === "leaderboard" ? "horizontal" : "auto");
      ins.setAttribute("data-full-width-responsive", "true");

      slot.classList.add("is-live");
      slot.innerHTML = "";
      slot.appendChild(ins);

      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  /* ── Start ─────────────────────────────────────────────────────────── */

  readUrl();
  el.amount.value = String(state.amount);
  buildChips();
  setCategory(state.category, true);
  initAds();

  var site = window.SITE_CONFIG || {};
  if (site.siteName) document.title = site.siteName + " — instant unit converter";
  var adsOn = (window.ADSENSE_CONFIG || {}).enabled === true;
  el.footerNote.textContent = adsOn
    ? "This site shows advertising via Google AdSense."
    : "Ad slots are configured but currently disabled (config.js → ADSENSE_CONFIG.enabled).";
})();
