function r(r, e, n) {
  var t = Number(r);
  return Number.isFinite(t) ? Math.min(n, Math.max(e, Math.round(t))) : e
}

function e(r) {
  return String(r || "").replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase().padEnd(6, "0")
}

function n(r, e) {
  return [0, 1, 2].map((function(n) {
    return "00".concat(Number(r[e + n] || 0).toString(16)).slice(-2)
  })).join("").toUpperCase()
}

function t(r) {
  var e = new Uint8Array(256);
  return r && r.length && e.set(Array.prototype.slice.call(r, 0, 256)), e
}
module.exports = {
  CONFIG_LENGTH: 256,
  ITEM_COUNT: 36,
  ITEM_SIZE: 7,
  buildWritePayload: function(r, e) {
    var n = new Uint8Array(258);
    return n[0] = 1, n[1] = r ? 1 : 0, n.set(t(e), 2), n
  },
  clampNumber: r,
  encodeConfig: function(n, a, i) {
    for (var o = t(i), c = 0; c < 252; c += 1) o[c] = 0;
    return (n || []).slice(0, 36).forEach((function(n, t) {
      var i, c, u = 7 * t,
        f = r(n.cmd, 0, 511),
        l = r(n.run, 0, 1),
        s = r(a ? n.addr : Number(n.addr) + 1, 0, 63) << 10 | l << 9 | f,
        m = (i = n.color, c = e(i), [parseInt(c.slice(0, 2), 16) || 0, parseInt(c.slice(2, 4), 16) || 0, parseInt(c.slice(4, 6), 16) || 0]),
        d = r(n.bright, 0, 31),
        b = r(n.breathe, 0, 31),
        p = r(n.blink, 0, 31),
        h = r(n.effect, 0, 1) << 15 | p << 10 | b << 5 | d;
      o[u] = 255 & s, o[u + 1] = s >>> 8 & 255, o[u + 2] = m[0], o[u + 3] = m[1], o[u + 4] = m[2], o[u + 5] = 255 & h, o[u + 6] = h >>> 8 & 255
    })), o
  },
  makeConfigBytes: t,
  makeDefaultItem: function(r) {
    return {
      cmd: 1,
      run: 1,
      addr: r ? 1 : 2,
      color: "FF00FF",
      bright: 20,
      breathe: 0,
      blink: 0,
      effect: 1
    }
  },
  normalizeColor: e,
  parseConfig: function(r, e, a) {
    for (var i = t(r), o = [], c = 0; c < 36; c += 1) {
      var u = 7 * c,
        f = i[u + 1] << 8 | i[u],
        l = 511 & f;
      if (!(c > 0 && 0 === l)) {
        var s = f >>> 10 & 63,
          m = i[u + 6] << 8 | i[u + 5],
          d = {
            cmd: l,
            run: f >>> 9 & 1,
            addr: e ? s : Math.max(0, s - 1),
            color: n(i, u + 2),
            bright: 31 & m,
            breathe: m >>> 5 & 31,
            blink: m >>> 10 & 31,
            effect: m >>> 15 & 1
          };
        d.btnname = 0 === c ? e ? "默认效果" : "转向灯联动" : a ? a(d.cmd) : "请选择快捷指令", o.push(d)
      }
    }
    return o
  }
};