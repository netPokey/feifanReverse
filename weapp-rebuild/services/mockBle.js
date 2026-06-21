var n, r = !1,
  t = null,
  e = null,
  a = !1,
  i = A(),
  o = ((n = new Uint8Array(256))[0] = 1, n[1] = 1, n[2] = 2, n[3] = 16, n[4] = 6, n[5] = 21, n),
  u = function() {
    var n = new Uint8Array(256);
    return p(n, 0, 1, 2, 2864434397), p(n, 1, 16, 21, 287454020), n
  }(),
  c = [v(0), v(1)],
  f = 0,
  l = require("./bleHostProtocol"),
  s = !1,
  d = 0,
  y = M(),
  h = [g("左门按钮", "AA:BB:CC:DD:EE:FF", -42, 1, 0), g("后备箱按钮", "12:34:56:78:9A:BC", -61, 0, 0)];

function A() {
  var n = new Uint8Array(76),
    r = "LRW3E7FS0NC000001";
  n.set([19, 35, 1, 52, 2, 16, 50, 84, 118, 152, 186, 220, 17, 34, 51, 68, 170, 187]), n[40] = 1;
  for (var t = 0; t < r.length; t += 1) n[41 + t] = r.charCodeAt(t);
  return n[27] = 0, n[28] = 17, n
}

function m(n) {
  if (i && !(i.length <= 28)) {
    n ? i[28] &= -9 : i[28] |= 8
  }
}

function v(n) {
  var r = new Uint8Array(256);
  return N(r, 0, {
    cmd: n ? 1 : 0,
    run: 1,
    addr: 1,
    color: n ? "33A1FF" : "FFB000",
    bright: 18,
    breathe: n ? 4 : 0,
    blink: 0,
    effect: 1
  }, n), N(r, 1, {
    cmd: 1,
    run: 1,
    addr: n ? 2 : 3,
    color: n ? "FF00FF" : "00D084",
    bright: 24,
    breathe: 2,
    blink: n ? 3 : 0,
    effect: 1
  }, n), r[252] = 82, r[253] = 71, r[254] = 66, r[255] = n, r
}

function U(n, r, t) {
  n[r] = 255 & t, n[r + 1] = t >>> 8 & 255
}

function w(n, r, t) {
  n[r] = 255 & t, n[r + 1] = t >>> 8 & 255, n[r + 2] = t >>> 16 & 255, n[r + 3] = t >>> 24 & 255
}

function T(n, r) {
  return n < 0 ? (1 << r) + n : n
}

function M() {
  return [g("方向盘按钮", "66:55:44:33:22:11", -50, 1, 88)]
}

function g(n, r, t, e, a) {
  return l.decorateItem({
    name: n,
    mac: r,
    rssi: t,
    addrType: e,
    battValue: a
  })
}

function b(n) {
  var r = l.stringToBytes(n),
    t = new Uint8Array(24);
  return t.set(r.slice(0, 24)), t
}

function C(n, r) {
  var t = n || [],
    e = new Uint8Array(3 + 33 * t.length + 4);
  return e[0] = 4, e[1] = r ? 1 : 0, e[2] = t.length, t.forEach((function(n, r) {
    var t = l.decorateItem(n),
      a = 3 + 33 * r;
    e[a] = 255 & t.rssi, e[a + 1] = t.battValue || 0, e[a + 2] = t.addrType, e.set(l.macToBytes(t.mac), a + 3), e.set(b(t.name), a + 9)
  })), e[e.length - 1] = 90, e
}

function I(n) {
  return new Uint8Array([6, s ? 1 : 0, n])
}

function E() {
  if (s) {
    var n = h.filter((function(n) {
      return !y.some((function(r) {
        return r.mac === n.mac
      }))
    }));
    if (n.length) {
      var r = n[d % n.length];
      d += 1, O(240, function(n, r) {
        var t = l.decorateItem(n),
          e = new Uint8Array(34);
        return e[0] = 3, e[1] = r ? 1 : 0, e[2] = 255 & t.rssi, e[3] = t.addrType, e.set(l.macToBytes(t.mac), 4), e.set(b(t.name), 10), e
      }(r, !0))
    } else O(240, C(y, !0))
  }
}

function F(n) {
  var r = function(n) {
      var r = n instanceof Uint8Array ? n : new Uint8Array(n || []);
      return l.stripUidPayload(r)
    }(n),
    t = r[0] || 0;
  if (t === l.ACTION.FIND) s = !0, d = 0, E(), setTimeout(E, 180);
  else if (t === l.ACTION.STOP) s = !1;
  else if (t === l.ACTION.QUERY_BOND) O(240, C(y, s));
  else if (t === l.ACTION.CONNECT) {
    var e = g(l.bytesToString(r.slice(8)) || "外部蓝牙按钮", l.bytesToMac(r.slice(2, 8)), -48, r[1] || 0, 96);
    O(240, I(0)), setTimeout((function() {
      y = y.filter((function(n) {
        return n.mac !== e.mac
      })).concat(e), O(240, I(1)), O(240, C(y, s))
    }), 220)
  } else if (t === l.ACTION.DELETE) {
    var a = l.bytesToMac(r.slice(2, 8));
    y = y.filter((function(n) {
      return n.mac !== a
    })), O(240, I(4)), O(240, C(y, s))
  }
}

function p(n, r, t, e, a) {
  var i = 6 * r;
  n[i] = t, n[i + 1] = e, n[i + 2] = a >>> 24 & 255, n[i + 3] = a >>> 16 & 255, n[i + 4] = a >>> 8 & 255, n[i + 5] = 255 & a
}

function N(n, r, t, e) {
  var a = 7 * r,
    i = (e ? t.addr : t.addr + 1) << 10 | t.run << 9 | t.cmd,
    o = String(t.color).match(/[\da-f]{2}/gi).map((function(n) {
      return parseInt(n, 16)
    })),
    u = t.effect << 15 | t.blink << 10 | t.breathe << 5 | t.bright;
  n[a] = 255 & i, n[a + 1] = i >>> 8 & 255, n[a + 2] = o[0] || 0, n[a + 3] = o[1] || 0, n[a + 4] = o[2] || 0, n[a + 5] = 255 & u, n[a + 6] = u >>> 8 & 255
}

function O(n, e) {
  r && t && t(n, e || new Uint8Array([]))
}

function B() {
  var n = 0;
  e = setInterval((function() {
    O(176, function(n) {
      var r = Math.floor(n / 28) % 4,
        t = n > 22 && n < 82 ? 1 : 0,
        e = n < 8 ? 1 : 0,
        a = 511 & Math.max(0, n) | 2048 | r << 12 | t << 14 | e << 16 | 3 << 20 | 82 << 24,
        i = new Uint8Array(33);
      i[0] = 255 & a, i[1] = a >>> 8 & 255, i[2] = a >>> 16 & 255, i[3] = a >>> 24 & 255, w(i, 4, 8 | (n < 10 ? 1 : 0) << 1 | (n < 14 ? 1 : 0) << 5 | 30868288), i[8] = 94, i[9] = 95, i[10] = 93, i[11] = 96, w(i, 12, Math.min(250, Math.round(2.2 * n)) | T(2 * Math.round(1.2 * n), 11) << 8 | T(2 * Math.round(.7 * n), 11) << 19);
      var o = T(128, 14) << 6 | (n % 40 > 25 ? 1 : 0) << 20 | 1 << 22 | (t && n % 18 > 10 ? 1 : 0) << 23;
      i[15] = 63 & i[15] | 192 & o, i[16] = o >>> 8 & 255, i[17] = o >>> 16 & 255, w(i, 18, -2075056056), i[22] = 17, w(i, 23, 215560 | Math.round(635) << 21), i[27] = Math.round(139);
      var u = Math.round(1990) | Math.round(384 / 1.61) << 12 | Math.round(226) << 22;
      w(i, 28, u);
      var c = t ? 1 : 0,
        f = n > 54 ? 2 : 0;
      return i[31] = u >>> 24 & 127 | 0, i[32] = 12 | c << 4 | f << 6, i
    }(n = (n + 17) % 300))
  }), 900)
}
module.exports = {
  connect: function(n) {
    return r = !0, a = !0, i = A(), c = [v(0), v(1)], f = 0, s = !1, d = 0, y = M(), t = n, B(), Promise.resolve({
      deviceId: "MOCK_TSL_DEVICE"
    })
  },
  disconnect: function() {
    r = !1, a = !1, e && clearInterval(e), e = null, t = null
  },
  isEnabled: function() {
    return r
  },
  tx: function(n, t) {
    if (!r) return Promise.reject(new Error("模拟蓝牙未连接"));
    var e = t ? t.length : 0;
    if (168 === n) {
      var l = String.fromCharCode.apply(String, Array.prototype.slice.call(t || []));
      a = "1234" === l, O(168, new Uint8Array([a ? 1 : 0])), a && setTimeout((function() {
        return O(160, i)
      }), 80)
    } else if ([160, 161, 163].indexOf(n) >= 0) a ? (163 === n && t && t.length >= 18 && (i = new Uint8Array(t)), O(160, i)) : O(168, new Uint8Array([255]));
    else if (171 === n) O(171, 1 === e ? o : o = new Uint8Array(t));
    else if (185 === n) {
      var s = e ? t[0] : 0,
        d = e > 1 && t[1] ? 1 : 0;
      0 === s ? O(185, c[d]) : 1 === s && e >= 258 ? (c[d] = new Uint8Array(t.slice(2, 258)), O(185, c[d])) : 2 === s ? O(185, c[d]) : 3 === s ? (c[d] = new Uint8Array(256), c[d][255] = d, O(185, c[d])) : O(185, c[d])
    } else if (186 === n) 1 === e && 1 === t[0] ? (O(186, new Uint8Array([1])), setTimeout((function() {
      return O(186, new Uint8Array([85, 102, 119, 136, 12, 139]))
    }), 500)) : (1 === e || (u = new Uint8Array(256)).set(t.slice(0, Math.min(t.length, 256))), O(186, u));
    else if (187 === n) {
      var y = e ? 255 & t[0] : 0;
      252 === y ? m(!0) : 251 === y ? m(!1) : 250 === y && m(!(!(i && i.length > 28) || 0 == (i[28] >>> 3 & 1))), O(187, e ? new Uint8Array([y]) : new Uint8Array([]))
    } else 208 === n ? e && 0 === t[0] || O(208, function() {
      var n = new Uint8Array(29),
        r = Math.round(4.012 / .002),
        t = Math.round(1992),
        e = Math.round(750) | Math.round(384 / 1.61) << 10 | 0 | Math.round(226) << 22,
        a = Math.round(482317) << 6;
      return w(n, 0, 12097574), w(n, 4, 148235), w(n, 8, 132480), w(n, 12, 235932415), U(n, 16, 500), n[18] = 255 & r, n[19] = r >>> 8 | (15 & t) << 4, n[20] = t >>> 4, w(n, 21, e), w(n, 25, a), n
    }()) : 209 === n ? (O(209, function(n) {
      var r = new Uint8Array(8),
        t = n % 4,
        e = 39840 + 8 * t;
      return r[0] = t, U(r, 2, e + 6), U(r, 4, e + 14), U(r, 6, e + (2 === t ? 42 : 24)), r
    }(f)), f += 1) : 210 === n ? O(210, function() {
      var n = new Uint8Array(8);
      return w(n, 0, 255264095), w(n, 4, 185), n
    }()) : 240 === n ? F(t) : 192 === n ? O(192, t || new Uint8Array([1])) : O(n, t || new Uint8Array([]));
    return Promise.resolve()
  }
};