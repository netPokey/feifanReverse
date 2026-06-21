var t = require("./shortcutConfig"),
  e = "custom_switch_rules_v1",
  n = {};

function r() {
  return "custom_switch_".concat(Date.now(), "_").concat(Math.floor(1e3 * Math.random()))
}

function u(e) {
  var n = e || {},
    u = t.uniqueEntries(n.shortcuts || n.selectedShortcuts || n.cachedShortcuts || []);
  return {
    id: n.id || r(),
    name: String(n.name || "场景开关").trim() || "场景开关",
    enabled: !0 === n.enabled,
    shortcuts: u,
    cachedShortcuts: t.uniqueEntries(n.cachedShortcuts || u),
    updatedAt: Number(n.updatedAt || Date.now()),
    lastEnabledAt: Number(n.lastEnabledAt || 0),
    lastDisabledAt: Number(n.lastDisabledAt || 0)
  }
}

function a() {
  var t, r = (t = e, "undefined" != typeof wx && wx.getStorageSync ? wx.getStorageSync(t) : n[t]);
  return (Array.isArray(r) ? r : []).map(u)
}

function c(t) {
  var r, a, c = (t || []).map(u);
  return r = e, a = c, "undefined" != typeof wx && wx.setStorageSync ? wx.setStorageSync(r, a) : n[r] = a, c
}

function o(t) {
  var e = u(Object.assign({}, t, {
      updatedAt: Date.now()
    })),
    n = a(),
    r = n.findIndex((function(t) {
      return t.id === e.id
    }));
  return r >= 0 ? n[r] = e : n.push(e), c(n), e
}
module.exports = {
  STORAGE_KEY: e,
  createRule: function(t) {
    var e = u({
      id: r(),
      name: t || "场景开关 ".concat(a().length + 1),
      enabled: !1,
      shortcuts: []
    });
    return o(e), e
  },
  listRules: function() {
    return a()
  },
  normalizeRule: u,
  removeRule: function(t) {
    return c(a().filter((function(e) {
      return e.id !== t
    })))
  },
  saveRule: o
};