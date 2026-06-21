var e = {
    "tsl@admin0826": "full"
  },
  r = Object.keys(e).reduce((function(e, r) {
    var t = r.length;
    return e.indexOf(t) >= 0 ? e : e.concat(t)
  }), []).sort((function(e, r) {
    return e - r
  }));

function t() {
  return Date.now()
}

function n(e) {
  return "full" === e ? "full" : "normal"
}

function o() {
  var e = function() {
    var e = wx.getStorageSync("TSLAccessMode");
    if (!e) return null;
    if ("string" == typeof e) try {
      return JSON.parse(e)
    } catch (e) {
      return null
    }
    return e
  }();
  return e && e.mode && e.expiresAt ? Number(e.expiresAt) <= t() ? (wx.removeStorageSync("TSLAccessMode"), "") : n(e.mode) : ""
}

function c() {
  return o() || "normal"
}

function u(e) {
  var r = n(e);
  return wx.setStorageSync("TSLAccessMode", {
    mode: r,
    updatedAt: t(),
    expiresAt: t() + 6048e5
  }), r
}
module.exports = {
  STORAGE_KEY: "TSLAccessMode",
  PASSWORD_LENGTHS: r,
  getCachedMode: o,
  getMode: c,
  applyPassword: function(r) {
    var t = String(r || "").trim(),
      n = e[t];
    return n ? {
      ok: !0,
      mode: u(n),
      message: "full" === n ? "已进入完整模式" : "已进入普通模式"
    } : {
      ok: !1,
      mode: c(),
      message: "访问密码错误"
    }
  },
  clear: function() {
    wx.removeStorageSync("TSLAccessMode")
  }
};