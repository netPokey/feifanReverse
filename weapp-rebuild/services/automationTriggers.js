var e = require("./automationRunner"),
  n = require("./automationStore"),
  t = require("./gaugeEvents");

function r(e) {
  var n = String(e || "").match(/^(\d{2}):(\d{2})$/);
  if (!n) return 0;
  var t = Number(n[1]),
    r = Number(n[2]);
  return t > 23 || r > 59 ? null : 60 * t + r
}

function o(e, n) {
  var t = n || {},
    o = t.now ? new Date(t.now) : new Date;
  switch (e.type) {
    case "connected":
      return !!t.connected == !!e.value;
    case "deviceMatched":
      return "anyDevice" === t.deviceScope || !!t.currentDeviceId && !!t.cachedDeviceId && t.currentDeviceId === t.cachedDeviceId;
    case "timeRange":
      return function(e, n) {
        var t = 60 * n.getHours() + n.getMinutes(),
          o = r(e.start),
          a = r(e.end);
        return null !== o && null !== a && (o <= a ? t >= o && t <= a : t >= o || t <= a)
      }(e, o);
    case "weekday":
      return (e.values || []).indexOf(function(e) {
        var n = e.getDay();
        return 0 === n ? 7 : n
      }(o)) >= 0;
    default:
      return !0
  }
}

function a(e, n) {
  var t = (e.conditions && e.conditions.rules || []).filter((function(e) {
    return !1 !== e.enabled
  }));
  if (!t.length) return {
    ok: !0,
    message: "未设置额外条件"
  };
  var r = t.map((function(t) {
    return {
      rule: t,
      ok: o(t, Object.assign({}, n, {
        deviceScope: e.trigger.deviceScope
      }))
    }
  }));
  if (e.conditions && "any" === e.conditions.mode ? r.some((function(e) {
      return e.ok
    })) : r.every((function(e) {
      return e.ok
    }))) return {
    ok: !0,
    message: "条件满足"
  };
  var a = r.find((function(e) {
    return !e.ok
  }));
  return {
    ok: !1,
    message: u(a && a.rule)
  }
}

function u(e) {
  if (!e) return "条件不满足";
  return {
    connected: "蓝牙未连接",
    deviceMatched: "当前设备不是保存的模块",
    timeRange: "不在生效时间段",
    weekday: "不在生效星期"
  } [e.type] || "条件不满足"
}

function c(e, n, t) {
  var r = e && e.globalData ? e.globalData : {},
    o = t && t.now ? Number(t.now) : Date.now(),
    a = Math.floor(o / 6e4),
    u = "BLE_AUTH_SUCCESS" === n ? Number(r.automationSessionNo || 0) : a,
    c = t && t.gaugeEvent ? t.gaugeEvent : "";
  return Object.assign({
    eventName: n,
    gaugeEvent: c,
    connected: !!r.connected,
    currentDeviceId: r.currentDeviceId || "",
    cachedDeviceId: e && e.storageDeviceId ? e.storageDeviceId() : "",
    sessionKey: "".concat(n, ":").concat(c, ":").concat(r.currentDeviceId || "", ":").concat(r.authStatus || "", ":").concat(u),
    now: o
  }, t || {})
}

function i(t, r, o) {
  var a = c(t, r, o),
    u = n.listFlows().filter((function(e) {
      return e.enabled && function(e, n, t) {
        return "manual" === n || ("BLE_AUTH_SUCCESS" === n ? "bleAuthSuccess" === e.trigger.type : "APP_SHOW_CONNECTED" === n ? "appShowConnected" === e.trigger.type : "GAUGE_STATE_CHANGED" === n && ("gaugeStateChanged" === e.trigger.type && e.trigger.gaugeEvent === t.gaugeEvent))
      }(e, r, a)
    }));
  return u.length ? u.reduce((function(o, u) {
    return o.then((function(o) {
      var c = s(u, a);
      return c.ok ? function(e, t) {
        return t.trigger.confirmBeforeRun ? new Promise((function(r) {
          var o = n.summary(t),
            a = "".concat(t.name, " 将执行 ").concat(o.stepCount, " 个动作，").concat(o.cooldownText, "。是否现在执行？");
          e && e.modal ? e.modal(a, !0, (function() {
            return r(!0)
          }), (function() {
            return r(!1)
          }), {
            title: "自动化确认"
          }) : r(!1)
        })) : Promise.resolve(!0)
      }(t, u).then((function(c) {
        return c ? (n.updateRuntime(u.id, {
          lastTriggerSession: a.sessionKey
        }), e.start(t, u, {
          reason: r
        }).then((function(e) {
          return o.concat([e])
        })).catch((function(e) {
          var n = e && e.message ? e.message : "自动化执行失败";
          return t && t.msg && t.msg(n, 0, 2400), o.concat([{
            ok: !1,
            flowId: u.id,
            message: n
          }])
        }))) : (n.appendLog({
          flowId: u.id,
          flowName: u.name,
          status: "cancelled",
          message: "用户取消执行"
        }), o.concat([{
          ok: !1,
          flowId: u.id,
          message: "用户取消执行"
        }]))
      })) : (n.appendLog({
        flowId: u.id,
        flowName: u.name,
        status: "skipped",
        message: c.message
      }), o.concat([c]))
    }))
  }), Promise.resolve([])) : Promise.resolve([])
}

function s(e, n) {
  if (!e.steps.length) return {
    ok: !1,
    flowId: e.id,
    message: "请先添加自动化动作"
  };
  var t = a(e, n);
  if (!t.ok) return {
    ok: !1,
    flowId: e.id,
    message: t.message
  };
  var r = function(e, n) {
    var t = Number(n.now || Date.now()),
      r = 1e3 * Number(e.trigger.cooldownSeconds || 0);
    return r > 0 && e.runtime.lastRunAt && t - Number(e.runtime.lastRunAt) < r ? {
      ok: !1,
      message: "冷却时间内不重复执行"
    } : "manual" !== n.eventName && e.runtime.lastTriggerSession && e.runtime.lastTriggerSession === n.sessionKey ? {
      ok: !1,
      message: "本次连接已触发过"
    } : {
      ok: !0
    }
  }(e, n);
  return r.ok ? {
    ok: !0,
    flowId: e.id,
    message: "可执行"
  } : {
    ok: !1,
    flowId: e.id,
    message: r.message
  }
}
module.exports = {
  buildContext: c,
  evaluateConditions: a,
  evaluateFlow: s,
  handleGaugeState: function(e, n, r) {
    var o = t.detectGaugeEvents(n, r);
    return o.length ? o.reduce((function(n, t) {
      return n.then((function(n) {
        return i(e, "GAUGE_STATE_CHANGED", {
          gaugeEvent: t.type,
          gaugeEventLabel: t.label
        }).then((function(e) {
          return n.concat(e)
        }))
      }))
    }), Promise.resolve([])) : Promise.resolve([])
  },
  handleEvent: i,
  runManual: function(t, r) {
    var o = n.getFlow(r || "auto_prepare_drive"),
      u = a(o, c(t, "manual"));
    if (!u.ok) {
      var i = new Error(u.message);
      return n.appendLog({
        flowId: o.id,
        flowName: o.name,
        status: "blocked",
        message: i.message
      }), Promise.reject(i)
    }
    return e.start(t, o, {
      reason: "手动执行"
    })
  }
};