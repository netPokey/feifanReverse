var t = require("../../services/pageNav"),
  e = require("../../services/automationStore"),
  n = require("../../services/automationTriggers"),
  a = require("../../services/automationRunner"),
  i = getApp();
Page({
  data: {
    connected: !1,
    running: null,
    flows: [],
    logs: []
  },
  onLoad: function() {
    this.stateHandler = this.refresh.bind(this), i.onPacket("state", this.stateHandler)
  },
  onShow: function() {
    i.applyThemeToPage && i.applyThemeToPage(this), this.refresh()
  },
  back: function() {
    t.goBack("/pages/set/set")
  },
  refresh: function() {
    var t = this,
      n = e.listFlows().map((function(t) {
        var n = e.summary(t);
        return Object.assign({}, t, {
          triggerName: n.triggerName,
          stepCount: n.stepCount,
          lastRunText: n.lastRunText,
          confirmText: n.confirmText,
          cooldownText: n.cooldownText
        })
      }));
    this.setData({
      connected: i.globalData.connected,
      running: a.getRunning(),
      flows: n,
      logs: e.listLogs().slice(0, 6).map((function(e) {
        return Object.assign({}, e, {
          timeText: t.formatTime(e.time)
        })
      }))
    })
  },
  formatTime: function(t) {
    if (!t) return "- -";
    var e = new Date(t),
      n = function(t) {
        return String(t).padStart(2, "0")
      };
    return "".concat(n(e.getHours()), ":").concat(n(e.getMinutes()))
  },
  toggleFlow: function(t) {
    var n = t.currentTarget.dataset.id,
      a = (this.data.flows || []).find((function(t) {
        return t.id === n
      })),
      i = t.detail && "boolean" == typeof t.detail.value ? t.detail.value : !(a && a.enabled);
    e.setEnabled(n, i), this.refresh()
  },
  openEdit: function(t) {
    var e = t.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/automationEdit/automationEdit?id=".concat(e)
    })
  },
  runNow: function(t) {
    var e = this,
      a = t.currentTarget.dataset.id;
    i.globalData.connected ? (wx.showLoading({
      title: "执行中..."
    }), n.runManual(i, a).then((function() {
      wx.hideLoading(), e.refresh(), i.msg("自动化执行完成", 1)
    })).catch((function(t) {
      wx.hideLoading(), e.refresh(), i.msg(t.message || "自动化执行失败", 0, 2400)
    }))) : i.msg("请先连接蓝牙", 0)
  },
  cancelRunning: function() {
    a.cancel("用户取消自动化"), this.refresh(), i.msg("已取消自动化", 1)
  },
  onUnload: function() {
    i.offPacket("state", this.stateHandler)
  }
});