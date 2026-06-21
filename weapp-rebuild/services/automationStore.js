var e = require("./functionOptions"),
  n = require("./gaugeEvents"),
  t = "automation_logs_v1",
  r = ["bleAuthSuccess", "appShowConnected", "gaugeStateChanged"];

function a(e) {
  if (!e) return "从未执行";
  var n = new Date(e),
    t = function(e) {
      return String(e).padStart(2, "0")
    };
  return "".concat(n.getMonth() + 1, "-").concat(t(n.getDate()), " ").concat(t(n.getHours()), ":").concat(t(n.getMinutes()))
}

function o() {
  return "undefined" != typeof wx ? wx : null
}

function i() {
  return {
    id: "auto_prepare_drive",
    name: "上车准备",
    enabled: !1,
    trigger: {
      type: "bleAuthSuccess",
      deviceScope: "currentDevice",
      confirmBeforeRun: !0,
      cooldownSeconds: 300,
      gaugeEvent: n.DEFAULT_EVENT
    },
    conditions: {
      mode: "all",
      rules: [{
        type: "connected",
        value: !0,
        enabled: !0
      }, {
        type: "deviceMatched",
        value: !0,
        enabled: !0
      }, {
        type: "timeRange",
        start: "06:00",
        end: "23:30",
        enabled: !0
      }, {
        type: "weekday",
        values: [1, 2, 3, 4, 5, 6, 7],
        enabled: !1
      }]
    },
    steps: [],
    runtime: {
      lastRunAt: 0,
      lastTriggerSession: ""
    }
  }
}

function u(e) {
  var n = o();
  return n && n.setStorageSync("automation_flows_v1", e.map(g)), e
}

function c(e, n) {
  var t = String(e || "");
  return /^\d{2}:\d{2}$/.test(t) ? t : n
}

function s(n, t) {
  var r = n && n.command ? n.command : {},
    a = Number(r.value || n && n.value || 0),
    o = r.label || e.nameOf("fun", a);
  return {
    id: n && n.id ? String(n.id) : "step_".concat(Date.now(), "_").concat(t),
    delayMs: Math.max(0, Math.min(6e5, Number(n && n.delayMs) || 0)),
    command: {
      kind: "fun",
      value: Number.isInteger(a) ? a : 0,
      label: o
    },
    onError: n && "continue" === n.onError ? "continue" : "stop"
  }
}

function d(e) {
  var n = Array.isArray(e) ? e : i().conditions.rules,
    t = {};
  return n.forEach((function(e) {
    e && e.type && (t[e.type] = e)
  })), i().conditions.rules.map((function(e) {
    var n = t[e.type] || {};
    return Object.assign({}, e, n, {
      enabled: void 0 === n.enabled ? e.enabled : !!n.enabled,
      start: "timeRange" === e.type ? c(n.start, e.start) : n.start,
      end: "timeRange" === e.type ? c(n.end, e.end) : n.end,
      values: "weekday" === e.type && Array.isArray(n.values) && n.values.length ? n.values : e.values
    })
  }))
}

function g(e) {
  var t = i(),
    a = e || {},
    o = Object.assign({}, t.trigger, a.trigger || {}),
    u = Object.assign({}, t.runtime, a.runtime || {});
  return {
    id: a.id || t.id,
    name: a.name || t.name,
    enabled: !!a.enabled,
    trigger: {
      type: r.indexOf(o.type) >= 0 ? o.type : t.trigger.type,
      deviceScope: "anyDevice" === o.deviceScope ? "anyDevice" : "currentDevice",
      confirmBeforeRun: !1 !== o.confirmBeforeRun,
      cooldownSeconds: Math.max(0, Math.min(86400, Number(o.cooldownSeconds) || 0)),
      gaugeEvent: n.isKnownEvent(o.gaugeEvent) ? o.gaugeEvent : n.DEFAULT_EVENT
    },
    conditions: {
      mode: a.conditions && "any" === a.conditions.mode ? "any" : "all",
      rules: d(a.conditions && a.conditions.rules)
    },
    steps: (a.steps || []).map(s).filter((function(e) {
      return e.command.value >= 1 && e.command.value <= 255
    })),
    runtime: {
      lastRunAt: Number(u.lastRunAt || 0),
      lastTriggerSession: u.lastTriggerSession || ""
    }
  }
}

function l() {
  var e = function() {
    var e = o();
    if (!e) return [i()];
    var n = e.getStorageSync("automation_flows_v1");
    if (!n) return [i()];
    try {
      var t = Array.isArray(n) ? n : JSON.parse(n);
      return Array.isArray(t) && t.length ? t.map(g) : [i()]
    } catch (e) {
      return [i()]
    }
  }().map(g);
  return u(e), e
}

function m(e) {
  return l().find((function(n) {
    return n.id === e
  })) || g(i())
}

function v(e) {
  var n = g(e),
    t = l(),
    r = t.findIndex((function(e) {
      return e.id === n.id
    }));
  return r >= 0 ? t[r] = n : t.push(n), u(t), n
}
module.exports = {
  STORAGE_KEY: "automation_flows_v1",
  LOG_KEY: t,
  TRIGGER_TYPES: r,
  appendLog: function(e) {
    var n = o();
    if (!n) return [];
    var r = [];
    try {
      var a = n.getStorageSync(t);
      r = Array.isArray(a) ? a : a ? JSON.parse(a) : []
    } catch (e) {
      r = []
    }
    var i = [Object.assign({
      time: Date.now()
    }, e || {})].concat(r).slice(0, 30);
    return n.setStorageSync(t, i), i
  },
  defaultFlow: i,
  getFlow: m,
  listFlows: l,
  listLogs: function() {
    var e = o();
    if (!e) return [];
    try {
      var n = e.getStorageSync(t);
      return Array.isArray(n) ? n : n ? JSON.parse(n) : []
    } catch (e) {
      return []
    }
  },
  normalizeFlow: g,
  saveFlow: v,
  setEnabled: function(e, n) {
    var t = m(e);
    return t.enabled = !!n, v(t)
  },
  summary: function(e) {
    var t = g(e);
    return {
      triggerName: "appShowConnected" === t.trigger.type ? "回到前台且已连接" : "gaugeStateChanged" === t.trigger.type ? "仪表车况：".concat(n.nameOf(t.trigger.gaugeEvent)) : "蓝牙鉴权成功",
      stepCount: t.steps.length,
      lastRunText: a(t.runtime.lastRunAt),
      confirmText: t.trigger.confirmBeforeRun ? "执行前确认" : "自动执行",
      cooldownText: t.trigger.cooldownSeconds ? "".concat(Math.round(t.trigger.cooldownSeconds / 60), " 分钟冷却") : "无冷却"
    }
  },
  updateRuntime: function(e, n) {
    var t = m(e);
    return t.runtime = Object.assign({}, t.runtime || {}, n || {}), v(t)
  }
};