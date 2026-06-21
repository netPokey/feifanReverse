var e = require("./functionOptions"),
  n = require("./shortcutExecutor"),
  t = require("./superShortcutStore"),
  r = require("./gaugeEvents"),
  u = null,
  a = null;

function o(e, n) {
  e && (e.cancelled = !0, e.cancelReason = n || "已取消", e.timers.forEach((function(e) {
    clearTimeout(e.timer), e.resolve()
  })), e.timers = [], (e.cleanups || []).forEach((function(e) {
    return e()
  })), e.cleanups = [])
}

function c(e) {
  return !!(e && e.globalData && e.globalData.connected)
}

function i(e) {
  return e && e.length ? Number(e[0]) : 0
}

function s(t, r, u, c, s) {
  var l = Number(u && u.command && u.command.value),
    g = e.nameOf("fun", l, s);
  if (!e.canAttempt("fun", l, s)) return Promise.reject(new Error("".concat(g, " 不支持小程序续跑")));
  var m = function(e, n, t, r) {
    return new Promise((function(u, a) {
      var o = !1,
        c = null,
        s = function t() {
          c && clearTimeout(c), e && e.offPacket && e.offPacket(187, g), n.cleanups = n.cleanups.filter((function(e) {
            return e !== t
          }))
        },
        l = function(e) {
          o || (o = !0, s(), e ? a(e) : u())
        },
        g = function(e, n) {
          i(n) === Number(t) && l()
        };
      n.cleanups.push(s), c = setTimeout((function() {
        return l(new Error("".concat(r, " 等待模块确认超时")))
      }), 6e3), e.onPacket(187, g)
    }))
  }(t, r, l, g);
  return n.execute(t, l, g, {
    kind: "fun",
    source: "superShortcut"
  }).then((function() {
    return m
  })).then((function() {
    a = {
      time: Date.now(),
      status: "step_confirmed",
      actionValue: l,
      message: "后续动作 ".concat(c + 1, " 已确认：").concat(g)
    }
  })).catch((function(e) {
    throw o(r, e.message), e
  }))
}

function l(e, n, r) {
  var o = t.normalizeRule(n);
  if (u && !u.cancelled) return a = {
    time: Date.now(),
    status: "ignored",
    actionValue: o.trigger.actionValue,
    gaugeEvent: o.trigger.gaugeEvent,
    message: "已有超级快捷指令正在执行"
  }, Promise.resolve({
    ok: !1,
    message: a.message
  });
  if (! function(e) {
      return !!c(e) && (!e || "function" != typeof e.getAccessMode || "full" === e.getAccessMode())
    }(e)) return a = {
    time: Date.now(),
    status: "blocked",
    actionValue: o.trigger.actionValue,
    gaugeEvent: o.trigger.gaugeEvent,
    message: "蓝牙未连接或未处于完整模式"
  }, Promise.resolve({
    ok: !1,
    message: a.message
  });
  var i = {
    ruleId: o.id,
    cancelled: !1,
    cancelReason: "",
    timers: [],
    cleanups: []
  };
  return u = i, a = {
    time: Date.now(),
    status: "started",
    actionValue: o.trigger.actionValue,
    gaugeEvent: o.trigger.gaugeEvent,
    message: "".concat(o.name, " 已命中").concat(g(o), "，准备执行 ").concat(o.steps.length, " 个后续动作")
  }, o.steps.reduce((function(n, t, a) {
    return n.then((function() {
      if (u !== i || i.cancelled) throw new Error(i.cancelReason || "超级快捷指令已停止");
      if (!c(e)) throw new Error("蓝牙已断开，超级快捷指令已停止");
      return function(e, n) {
        return new Promise((function(t) {
          var r = {
            timer: null,
            resolve: t
          };
          r.timer = setTimeout((function() {
            e.timers = e.timers.filter((function(e) {
              return e !== r
            })), t()
          }), Math.max(0, Number(n) || 0)), e.timers.push(r)
        }))
      }(i, t.delayMs).then((function() {
        if (u !== i || i.cancelled) throw new Error(i.cancelReason || "超级快捷指令已停止");
        return s(e, i, t, a, r)
      }))
    }))
  }), Promise.resolve()).then((function() {
    return a = {
      time: Date.now(),
      status: "finished",
      actionValue: o.trigger.actionValue,
      gaugeEvent: o.trigger.gaugeEvent,
      message: "".concat(o.name, " 后续动作已执行完成")
    }, u === i && (u = null), {
      ok: !0,
      ruleId: o.id
    }
  })).catch((function(e) {
    var n = e && e.message ? e.message : "超级快捷指令执行失败";
    return a = {
      time: Date.now(),
      status: "error",
      actionValue: o.trigger.actionValue,
      gaugeEvent: o.trigger.gaugeEvent,
      message: n
    }, u === i && (u = null), {
      ok: !1,
      ruleId: o.id,
      message: n
    }
  }))
}

function g(n) {
  return "gaugeEvent" === n.trigger.kind ? "车况事件：".concat(r.nameOf(n.trigger.gaugeEvent)) : "动作回馈：".concat(e.nameOf("fun", n.trigger.actionValue || n.listenAction.value))
}
module.exports = {
  cancel: function(e) {
    u && (o(u, e || "已取消"), u = null)
  },
  getState: function() {
    return {
      running: !(!u || u.cancelled),
      lastNotice: a
    }
  },
  handleActionNotice: function(e, n, r) {
    var a = i(n);
    if (!a) return Promise.resolve({
      ok: !1,
      message: "187 回包缺少动作编号"
    });
    var o = function(e) {
      return t.listRules().map(t.normalizeRule).find((function(n) {
        return n.enabled && "armed" === n.writeState && "actionNotice" === n.trigger.kind && Number(n.trigger.actionValue || n.listenAction && n.listenAction.value) === Number(e) && n.steps.length > 0
      })) || null
    }(a);
    return o || !u || u.cancelled ? o && u && !u.cancelled ? Promise.resolve({
      ok: !1,
      message: "超级快捷指令正在执行，忽略外部回馈"
    }) : o ? l(e, o, r || null) : Promise.resolve({
      ok: !1,
      message: "未命中超级快捷指令监听动作"
    }) : Promise.resolve({
      ok: !1,
      message: "当前 187 回包用于队列确认，不作为外部监听触发"
    })
  },
  handleGaugeEvents: function(e, n, r) {
    var u = Array.isArray(n) ? n : [];
    return u.length ? u.reduce((function(n, u) {
      return n.then((function(n) {
        var a, o = (a = u.type, t.listRules().map(t.normalizeRule).filter((function(e) {
          return e.enabled && "armed" === e.writeState && "gaugeEvent" === e.trigger.kind && e.trigger.gaugeEvent === a && e.steps.length > 0
        })));
        return o.length ? o.reduce((function(n, t) {
          return n.then((function(n) {
            return l(e, t, r || null).then((function(e) {
              return n.concat([e])
            }))
          }))
        }), Promise.resolve([])).then((function(e) {
          return n.concat(e)
        })) : n
      }))
    }), Promise.resolve([])) : Promise.resolve([])
  },
  runRule: l
};