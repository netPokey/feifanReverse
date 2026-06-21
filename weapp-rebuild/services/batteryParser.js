function t(t, e) {
  return !t || t.length <= e ? 0 : 255 & Number(t[e])
}

function e(t, e) {
  return !!t && t.length >= e
}

function n(e, n) {
  return t(e, n + 3) << 24 | t(e, n + 2) << 16 | t(e, n + 1) << 8 | t(e, n)
}

function r(t, e, n) {
  return "".concat(Number(t).toFixed(e)).concat(n ? " ".concat(n) : "")
}

function u(t, e, n) {
  return Object.assign({
    name: t,
    val: e
  }, n || {})
}

function l() {
  return [u("总电压", "- - -"), u("总电流", "- - -"), u("总功率", "- - -"), u("车机SOC", "- - -"), u("电池健康", "- - -"), u("剩余里程", "- - -")]
}

function o() {
  return [u("输入电压", "- - -"), u("输出电压", "- - -"), u("输出电流", "- - -"), u("输出功率", "- - -")]
}

function a() {
  return {
    maxVol: 0,
    minVol: 255,
    cells: []
  }
}

function i(t) {
  return Number.isFinite(t) ? t > 100 ? 100 : t < 0 ? 0 : t : 0
}
module.exports = {
  createCellState: a,
  getEmptyOverviewList: l,
  getEmptyDcdcList: o,
  parseOverview: function(o) {
    var a = [],
      s = "- - -";
    if (!e(o, 4)) return {
      list: l(),
      odometer: s,
      totalVoltage: "- - -",
      totalCurrent: "- - -",
      soc: "- - -",
      health: "- - -"
    };
    var c = n(o, 0),
      m = .01 * (c >>> 0 & 65535),
      h = -.1 * (c >>> 16 & 65535);
    if (h < -3276.7 && (h += 6553.6), a.push(u("总电压", r(m, 2, "V"))), a.push(u("总电流", r(h, 1, "A"))), a.push(u("总功率", r(m * h / 1e3, 2, "KW"))), e(o, 12) && (a.push(u("总充电量", r(.001 * n(o, 8), 2, "KWH"))), a.push(u("总放电量", r(.001 * n(o, 4), 2, "KWH")))), e(o, 21)) {
      var p = .002 * ((c = t(o, 20) << 16 | t(o, 19) << 8 | t(o, 18)) >>> 0 & 4095),
        f = .002 * (c >>> 12 & 4095);
      a.push(u("单体最高", r(p, 3, "V"), {
        max: !0
      })), a.push(u("单体最低", r(f, 3, "V"), {
        min: !0
      })), a.push(u("电池压差", r(1e3 * (p - f), 0, "mV")))
    }
    var V = 0,
      v = 0,
      x = 0,
      d = null,
      g = null;
    if (e(o, 25)) {
      (x = .02 * ((c = n(o, 12)) >>> 0 & 65535)) > (V = .02 * (c >>> 16 & 65535)) && (x = 0);
      var K = .01 * (65535 & function(e, n) {
          return t(e, n + 1) << 8 | t(e, n)
        }(o, 16)),
        b = 1.61 * ((c = n(o, 21)) >>> 10 & 1023);
      V > (v = .1 * (c >>> 0 & 1023)) && (V = v), d = i((x - K) / (V - K) * 100), a.push(u("出厂容量", r(v, 2, "KWH"))), a.push(u("当前容量", r(V, 2, "KWH"))), x > 0 && a.push(u("剩余电量", r(x, 2, "KWH"))), a.push(u("保留电量", r(K, 2, "KWH"))), a.push(u("剩余里程", r(b, 2, "KM"))), 0 === x && (d = (t(o, 25) << 8 | t(o, 24)) >>> 7 & 127), a.push(u("车机SOC", r(d, 2, "%"))), x > 0 && a.push(u("实际SOC", r(i(x / V * 100), 2, "%"))), g = V / (0 === V && 0 === v ? 1 : v) * 100, a.push(u("电池健康", r(g, 2, "%"))), a.push(u("电池温度", r(.25 * (c >>> 22 & 511) - 25, 1, "℃")));
      var C = 2 == (c >>> 20 & 3);
      a.push(u("正在预热", C ? "是" : "否", {
        max: C
      }))
    }
    return e(o, 29) && (s = r(((c = n(o, 25)) >>> 6 & 67108863) / 10, 1, "KM")), {
      list: a,
      odometer: s,
      totalVoltage: r(m, 2, "V"),
      totalCurrent: r(h, 1, "A"),
      soc: null === d ? "- - -" : r(d, 2, "%"),
      health: null === g ? "- - -" : r(g, 2, "%")
    }
  },
  parseCellFrame: function(n, l) {
    for (var o = l || {
        maxVol: 0,
        minVol: 255,
        cells: []
      }, a = o.cells.slice(), i = 3 * t(n, 0), s = Number(o.maxVol) || 0, c = Number(o.minVol) || 255, m = 0, h = i; m < 6; m += 2, h += 1)
      if (e(n, m + 4)) {
        var p = 1e-4 * (t(n, m + 3) << 8 | t(n, m + 2));
        p <= 0 || (p > s && (s = p), p < c && (c = p), a[h] = u("Cell ".concat(h + 1), r(p, 3, "V"), {
          voltage: p
        }))
      }
    var f = 0,
      V = 0;
    a.forEach((function(t) {
      if (t) {
        var e = Number(t.voltage || parseFloat(t.val));
        t.max = e === s, t.min = e === c, f += e, V += 1
      }
    }));
    var v = V > 0 && s > 0 && c < 255;
    return {
      state: {
        cells: a,
        maxVol: s,
        minVol: c
      },
      list: a.filter(Boolean),
      index: i,
      maxVol: v ? s.toFixed(3) : "- - -",
      minVol: v ? c.toFixed(3) : "- - -",
      avgVol: v ? (f / V).toFixed(3) : "- - -",
      imbVol: v ? (1e3 * (s - c)).toFixed(0) : "- - -"
    }
  },
  parseDcdc: function(t) {
    if (!e(t, 8)) return {
      list: o()
    };
    var l = n(t, 0),
      a = .01 * (l >>> 0 & 65535),
      i = .1 * (l >>> 16 & 65535),
      s = .1 * ((l = n(t, 4)) >>> 0 & 65535);
    return {
      list: [u("输入电压", r(i, 1, "V")), u("输出电压", r(a, 1, "V")), u("输出电流", r(s, 1, "A")), u("输出功率", r(a * s, 0, "W"))]
    }
  }
};