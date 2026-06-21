var e = "super_shortcut_rules_v1",
  t = ["actionNotice", "gaugeEvent"],
  n = {};

function a(e) {
  return "".concat(e, "_").concat(Date.now(), "_").concat(Math.floor(1e3 * Math.random()))
}

function r() {
  return {
    id: "module_super_default",
    name: "超级快捷指令",
    enabled: !0,
    listenAction: {
      kind: "fun",
      value: 181,
      label: "播放 滴声1次"
    },
    trigger: {
      kind: "actionNotice",
      actionValue: 181,
      gaugeEvent: "gearD"
    },
    steps: [],
    writeState: "draft",
    lastWrittenAt: 0,
    updatedAt: Date.now()
  }
}

function u(e, t) {
  var n = Number(e);
  return !Number.isInteger(n) || n < 1 || n > 255 ? t : n
}

function i(e, t) {
  var n = e || {},
    r = n.command || {},
    i = Math.max(0, Math.min(6e4, Number(n.delayMs || 0)));
  return {
    id: n.id || a("step_".concat(t + 1)),
    delayMs: i,
    command: {
      kind: "fun",
      value: u(r.value, 181),
      label: r.label || ""
    }
  }
}

function o(e) {
  var n = e || r(),
    o = "module_super_prepare" === n.id,
    l = n.trigger || {},
    d = n.listenAction || {},
    c = t.indexOf(l.kind) >= 0 ? l.kind : "actionNotice",
    s = d.value || l.actionValue || n.listenActionValue || n.firstActionValue || l.firstActionValue || 181,
    f = l.gaugeEvent || "gearD",
    g = (o ? [] : n.steps || []).slice(0, 8).map(i);
  return {
    id: n.id || a("module_super"),
    name: o ? "超级快捷指令" : n.name || "超级快捷指令",
    enabled: !1 !== n.enabled,
    listenAction: {
      kind: "fun",
      value: u(o ? 181 : s, 181),
      label: d.label || ""
    },
    trigger: {
      kind: c,
      actionValue: u(o ? 181 : s, 181),
      gaugeEvent: f
    },
    steps: g,
    writeState: "armed" === n.writeState ? "armed" : "draft",
    lastWrittenAt: Number(n.lastWrittenAt || 0),
    updatedAt: Number(n.updatedAt || Date.now())
  }
}

function l() {
  var t, a = (t = e, "undefined" != typeof wx && wx.getStorageSync ? wx.getStorageSync(t) : n[t]),
    u = Array.isArray(a) ? a : [];
  return u.length ? u.map(o) : [r()]
}

function d(t) {
  var a, r, u = (t || []).map(o);
  return a = e, r = u, "undefined" != typeof wx && wx.setStorageSync ? wx.setStorageSync(a, r) : n[a] = r, u
}

function c() {
  return l()
}

function s(e) {
  var t = o(Object.assign({}, e, {
      updatedAt: Date.now()
    })),
    n = c(),
    a = n.findIndex((function(e) {
      return e.id === t.id
    }));
  return a >= 0 ? n[a] = t : n.push(t), d(n), t
}
module.exports = {
  MAX_STEPS: 8,
  STORAGE_KEY: e,
  TRIGGER_KINDS: t,
  createRule: function() {
    var e = o(Object.assign(r(), {
      id: a("module_super"),
      name: "超级快捷指令 ".concat(c().length + 1),
      steps: []
    }));
    return s(e), e
  },
  defaultRule: r,
  getRule: function(e) {
    return c().find((function(t) {
      return t.id === e
    })) || c()[0]
  },
  listRules: c,
  normalizeRule: o,
  removeRule: function(e) {
    var t = c().filter((function(t) {
      return t.id !== e
    }));
    return d(t.length ? t : [r()])
  },
  saveRule: s
};