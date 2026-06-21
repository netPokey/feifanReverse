var e = require("./shortcutExecutor"),
  r = require("./automationStore"),
  n = null;

function t(e) {
  return !!(e && e.globalData && e.globalData.connected)
}
module.exports = {
  cancel: function(e) {
    var t = n;
    ! function(e, r) {
      e && (e.cancelled = !0, e.cancelReason = r || "已取消", e.timers.forEach((function(e) {
        clearTimeout(e.timer), e.resolve()
      })), e.timers = [])
    }(t, e || "已取消自动化"), n === t && (n = null), t && r.appendLog({
      flowId: t.flowId,
      status: "cancelled",
      message: e || "已取消自动化"
    })
  },
  getRunning: function() {
    return n ? {
      flowId: n.flowId,
      cancelled: n.cancelled
    } : null
  },
  start: function(o, a, l) {
    var u = l || {};
    if (n && !n.cancelled) return Promise.reject(new Error("已有自动化正在执行"));
    var c = r.normalizeFlow(a);
    try {
      ! function(e, r) {
        if (!t(e)) throw new Error("蓝牙未连接，自动化已停止");
        if (!r || !r.steps || !r.steps.length) throw new Error("请先添加自动化动作")
      }(o, c)
    } catch (e) {
      return r.appendLog({
        flowId: c.id,
        flowName: c.name,
        status: "blocked",
        message: e.message
      }), Promise.reject(e)
    }
    var s = {
      flowId: c.id,
      cancelled: !1,
      cancelReason: "",
      timers: []
    };
    return n = s, r.appendLog({
      flowId: c.id,
      flowName: c.name,
      status: "started",
      message: u.reason || "开始执行"
    }), c.steps.reduce((function(a, l, u) {
      return a.then((function() {
        if (n !== s || s.cancelled) throw new Error(s.cancelReason || "自动化已取消");
        if (!t(o)) throw new Error("蓝牙已断开，自动化已停止");
        return function(e, r) {
          return new Promise((function(t) {
            var o = {
              timer: null,
              resolve: t
            };
            o.timer = setTimeout((function() {
              e.timers = e.timers.filter((function(e) {
                return e !== o
              })), t()
            }), Math.max(0, Number(r) || 0)), n === e && e.timers.push(o)
          }))
        }(s, l.delayMs).then((function() {
          if (n !== s || s.cancelled) throw new Error(s.cancelReason || "自动化已取消");
          if (!t(o)) throw new Error("蓝牙已断开，自动化已停止");
          return function(r, n, t, o) {
            var a = t.command || {};
            return "fun" !== a.kind ? Promise.reject(new Error("自动化只允许执行动作，不允许发送触发源")) : !Number.isInteger(Number(a.value)) || Number(a.value) < 1 || Number(a.value) > 255 ? Promise.reject(new Error("第 ".concat(o + 1, " 步动作不合法"))) : e.execute(r, Number(a.value), a.label || "动作 ".concat(a.value), {
              kind: "fun",
              source: "automation"
            })
          }(o, 0, l, u).catch((function(e) {
            if ("continue" === l.onError) return r.appendLog({
              flowId: c.id,
              flowName: c.name,
              status: "step_error",
              message: e.message || "第 ".concat(u + 1, " 步失败")
            }), null;
            throw e
          }))
        }))
      }))
    }), Promise.resolve()).then((function() {
      var e = Date.now();
      return r.updateRuntime(c.id, {
        lastRunAt: e
      }), r.appendLog({
        flowId: c.id,
        flowName: c.name,
        status: "finished",
        message: "执行完成",
        time: e
      }), n === s && (n = null), {
        ok: !0,
        flowId: c.id
      }
    })).catch((function(e) {
      var t = e && e.message ? e.message : "自动化执行失败";
      throw s.cancelled || r.appendLog({
        flowId: c.id,
        flowName: c.name,
        status: "error",
        message: t
      }), n === s && (n = null), new Error(t)
    }))
  }
};