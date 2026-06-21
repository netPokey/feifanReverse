var t = require("../utils/format"),
  e = t.decToHex,
  n = t.hexToDec,
  r = {
    FIND: 1,
    STOP: 2,
    QUERY_BOND: 4,
    CONNECT: 5,
    DELETE: 7
  },
  a = [{
    text: "连接中...",
    ok: -1
  }, {
    text: "连接成功",
    ok: 1
  }, {
    text: "连接失败",
    ok: 0
  }, {
    text: "连接超时",
    ok: 0
  }, {
    text: "删除成功",
    ok: 1
  }, {
    text: "配对数已最大",
    ok: 0
  }, {
    text: "连接数已最大",
    ok: 0
  }];

function i(t) {
  return t instanceof Uint8Array ? t : new Uint8Array(t || [])
}

function o(t) {
  return new Int8Array([t || 0])[0]
}

function u(t) {
  for (var e = encodeURIComponent(String(t || "")), n = [], r = 0; r < e.length; r += 1) "%" === e.substr(r, 1) ? (n.push(parseInt(e.substr(r + 1, 2), 16)), r += 2) : n.push(e.charCodeAt(r));
  return new Uint8Array(n)
}

function c(t) {
  var n = function(t) {
    for (var e = t.length; e > 0 && 0 === t[e - 1];) e -= 1;
    return t.slice(0, e)
  }(i(t));
  try {
    var r = Array.prototype.map.call(n, (function(t) {
      return "%".concat(e(t))
    })).join("");
    return decodeURIComponent(r)
  } catch (t) {
    return ""
  }
}

function l(t) {
  var e = String(t || "").replace(/[^\da-f]/gi, "");
  return 12 !== e.length ? new Uint8Array(6) : n(e)
}

function s(t) {
  return e(i(t).slice(0, 6), ":")
}

function d(t) {
  var e = Object.assign({}, t || {}),
    n = "number" == typeof e.rssi ? e.rssi : 0,
    r = "number" == typeof e.battValue ? e.battValue : 0;
  return e.name = e.name || "未命名蓝牙设备", e.mac = e.mac || "00:00:00:00:00:00", e.addrType = "number" == typeof e.addrType ? e.addrType : 0, e.addrTypeText = 1 === e.addrType ? "随机地址" : "公共地址", e.rssiText = "".concat(n, " dBm"), e.signalLevel = n >= -55 ? "强" : n >= -75 ? "中" : "弱", e.battText = r > 0 ? "".concat(Math.min(99, r), "%") : "未知", e
}

function f(t) {
  var e = i(t && t.buf ? t.buf : []);
  return e.length >= 18 ? e.slice(4, 18) : new Uint8Array(14)
}

function y(t, e) {
  var n = f(t),
    r = i(e),
    a = new Uint8Array(n.length + r.length);
  return a.set(n, 0), a.set(r, n.length), a
}

function m(t, e) {
  return y(t, new Uint8Array([e]))
}

function p(t) {
  var e = i(t);
  if (e.length < 10 || 3 !== e[0]) return null;
  var n = e.slice(2),
    r = d({
      rssi: o(n[0]),
      addrType: n[1] || 0,
      mac: s(n.slice(2, 8)),
      name: c(n.slice(8, 32))
    });
  return {
    type: "search",
    loading: 0 !== e[1],
    item: r
  }
}

function T(t) {
  var e = i(t);
  if (e.length < 7 || 4 !== e[0]) return null;
  var n = e.slice(2);
  if (!n.length || 90 !== n[n.length - 1]) return null;
  var r = n[0] || 0;
  if (!r) return {
    type: "bond",
    loading: 0 !== e[1],
    list: []
  };
  var a = n.length - 5,
    u = a > 0 ? Math.floor(a / r) : 33;
  if (u <= 0) return {
    type: "bond",
    loading: 0 !== e[1],
    list: []
  };
  for (var l = n.slice(1), f = [], y = 0; y < a; y += u) {
    var m = l.slice(y, y + u);
    if (!(m.length < 33)) {
      var p = s(m.slice(3, 9));
      "00:00:00:00:00:00" !== p && f.push(d({
        rssi: o(m[0]),
        battValue: m[1] || 0,
        addrType: m[2] || 0,
        mac: p,
        name: c(m.slice(9, 33))
      }))
    }
  }
  return {
    type: "bond",
    loading: 0 !== e[1],
    list: f
  }
}

function g(t) {
  var e = i(t);
  if (e.length < 3 || 6 !== e[0]) return null;
  var n = e[2] || 0,
    r = a[n] || {
      text: "未知蓝牙配对状态",
      ok: 0
    };
  return {
    type: "status",
    loading: 0 !== e[1],
    code: n,
    text: r.text,
    ok: r.ok
  }
}
module.exports = {
  ACTION: r,
  UID_LENGTH: 14,
  STATUS: a,
  stringToBytes: u,
  bytesToString: c,
  macToBytes: l,
  bytesToMac: s,
  decorateItem: d,
  getUid: f,
  createCommand: y,
  buildFindCommand: function(t) {
    return m(t, r.FIND)
  },
  buildStopCommand: function(t) {
    return m(t, r.STOP)
  },
  buildBondQueryCommand: function(t) {
    return m(t, r.QUERY_BOND)
  },
  buildConnectCommand: function(t, e) {
    var n = d(e),
      a = u(n.name),
      i = new Uint8Array(8 + a.length);
    return i[0] = r.CONNECT, i[1] = n.addrType, i.set(l(n.mac), 2), i.set(a, 8), y(t, i)
  },
  buildDeleteCommand: function(t, e) {
    var n = d(e),
      a = new Uint8Array(8);
    return a[0] = r.DELETE, a[1] = n.addrType, a.set(l(n.mac), 2), y(t, a)
  },
  parseSearchPacket: p,
  parseBondListPacket: T,
  parseStatusPacket: g,
  parsePacket: function(t) {
    var e = i(t);
    return e.length ? 3 === e[0] ? p(e) : 4 === e[0] ? T(e) : 6 === e[0] ? g(e) : {
      type: "unknown",
      loading: !1,
      rawType: e[0]
    } : null
  },
  stripUidPayload: function(t) {
    var e, n = i(t);
    return n.length > 14 && (e = n[14], [r.FIND, r.STOP, r.QUERY_BOND, r.CONNECT, r.DELETE].indexOf(e) >= 0) ? n.slice(14) : n
  }
};