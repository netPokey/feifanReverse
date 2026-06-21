function r(r, n) {
  if ("number" == typeof r) return "00".concat(r.toString(16)).slice(-2).toUpperCase();
  var t = n || "";
  return Array.prototype.map.call(r || [], (function(r) {
    return "00".concat(r.toString(16)).slice(-2).toUpperCase()
  })).join(t)
}
module.exports = {
  decToHex: r,
  hexToDec: function(r, n) {
    return r.length <= 2 || "number" == typeof n ? parseInt(r.substr(n || 0, 2), 16) : new Uint8Array(r.match(/[\da-f]{2}/gi).map((function(r) {
      return parseInt(r, 16)
    })))
  },
  toArrayBuffer: function(r) {
    if (r instanceof ArrayBuffer) return r;
    var n = r instanceof Uint8Array ? r : new Uint8Array(r || []),
      t = new ArrayBuffer(n.length);
    return new Uint8Array(t).set(n), t
  },
  fromArrayBuffer: function(r) {
    return new Uint8Array(r || [])
  },
  int16LE: function(r, n) {
    return r[n + 1] << 8 | r[n]
  },
  uint32LE: function(r, n) {
    return (r[n + 3] << 24 | r[n + 2] << 16 | r[n + 1] << 8 | r[n]) >>> 0
  },
  versionText: function(n) {
    var t = r(new Uint8Array([n >>> 8, 255 & n]));
    return "V".concat(t.substr(0, 1), ".").concat(t.substr(1, 1), ".").concat(t.substr(-2))
  }
};