function n(n) {
  return n && 256 === n.length ? new Uint8Array(n) : new Uint8Array(256)
}

function r(n, r) {
  var e = n || {},
    t = Number(e.btn || 0),
    u = Number(e.fun || 0);
  return !Number.isInteger(t) || !Number.isInteger(u) || t < 1 || t > 255 || u < 0 || u > 255 ? null : {
    index: Number.isInteger(e.index) ? e.index : r,
    btn: t,
    fun: u
  }
}

function e(n, r) {
  return Number(n && n.btn) === Number(r && r.btn) && Number(n && n.fun) === Number(r && r.fun)
}

function t(n) {
  var t = [];
  return (n || []).forEach((function(n, u) {
    var i = r(n, u);
    i && (t.some((function(n) {
      return e(n, i)
    })) || t.push(i))
  })), t
}
module.exports = {
  CONFIG_LENGTH: 256,
  RESERVED_TAIL_LENGTH: 2,
  buildBytes: function(r, e) {
    for (var u = n(e), i = t(r).slice(0, 127), f = 0; f < 254; f += 1) u[f] = 0;
    return i.forEach((function(n, r) {
      var e = 2 * r;
      u[e] = n.btn, u[e + 1] = n.fun
    })), u
  },
  cloneConfigBytes: n,
  mergeEntries: function(n, r) {
    return t([].concat(n || [], r || []))
  },
  normalizeEntry: r,
  parseEntries: function(n) {
    if (!n || 256 !== n.length) return [];
    for (var r = [], e = 0; e < 254; e += 2) {
      var t = Number(n[e] || 0);
      t && r.push({
        index: e / 2,
        btn: t,
        fun: Number(n[e + 1] || 0)
      })
    }
    return r
  },
  removeEntries: function(n, r) {
    var u = t(r);
    return t(n).filter((function(n) {
      return !u.some((function(r) {
        return e(n, r)
      }))
    }))
  },
  sameEntry: e,
  uniqueEntries: t
};