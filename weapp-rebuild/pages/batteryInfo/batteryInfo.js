var e = getApp(),
  t = require("../../services/batteryParser"),
  a = require("../../services/pageNav"),
  n = [208, 209, 210];
Page({
  data: {
    select: 0,
    tabs: ["概览", "电芯", "DC-DC"],
    connected: !1,
    mockConnected: !1,
    statusText: "未连接",
    readState: "idle",
    readMessage: "连接后会自动读取当前页签",
    lastCommandText: "- -",
    lastPacketText: "- -",
    odometer: "- - -",
    maxVol: "- - -",
    minVol: "- - -",
    avgVol: "- - -",
    imbVol: "- - -",
    index: -1,
    list: [t.getEmptyOverviewList(), [], t.getEmptyDcdcList()]
  },
  onShow: function() {
    var a = this;
    e.applyThemeToPage && e.applyThemeToPage(this), this.visible = !0, this.cellState = t.createCellState(), this.packetHandler = this.rx.bind(this), this.stateHandler = this.handleConnectionState.bind(this), n.forEach((function(t) {
      return e.onPacket(t, a.packetHandler)
    })), e.onPacket("state", this.stateHandler), this.handleConnectionState(e.globalData.connected, e.globalData.deviceInfo), this.setKeepScreenOn(!0), this.scheduleNextPoll(0)
  },
  back: function() {
    a.goBack("/pages/index/index")
  },
  setKeepScreenOn: function(e) {
    wx.setKeepScreenOn({
      keepScreenOn: e,
      fail: function() {
        wx.setKeepScreenOn({
          keepScreenOn: e
        })
      }
    })
  },
  handleConnectionState: function(t) {
    var a = !!t,
      n = !!this.data.connected;
    this.setData({
      connected: a,
      mockConnected: !!e.globalData.mockConnected,
      statusText: a ? e.globalData.mockConnected ? "验证连接" : "已连接" : "未连接",
      readState: a ? this.data.readState : "idle",
      readMessage: a ? this.data.readMessage : "连接后会自动读取当前页签"
    }), !n && a && this.visible && this.primeBatterySession()
  },
  scheduleNextPoll: function(e) {
    var t = this;
    this.pollTimer && clearTimeout(this.pollTimer), this.pollTimer = setTimeout((function() {
      t.pollBatteryInfo()
    }), "number" == typeof e ? e : this.getPollInterval())
  },
  getPollInterval: function() {
    return 1 === this.data.select ? 1e3 : 500
  },
  pollBatteryInfo: function() {
    this.visible && (e.globalData.connected && this.sendBatteryCommand(n[this.data.select], new Uint8Array([1]), "轮询"), this.scheduleNextPoll())
  },
  primeBatterySession: function() {
    var t = this;
    e.globalData.connected && this.sendBatteryCommand(208, new Uint8Array([1]), "唤醒").then((function() {
      t.visible && 0 !== t.data.select && e.globalData.connected && t.sendBatteryCommand(n[t.data.select], new Uint8Array([1]), "页签")
    })).catch((function() {}))
  },
  sendBatteryCommand: function(t, a, n) {
    var i = this,
      s = Date.now();
    return this.pendingRead = {
      type: t,
      sentAt: s
    }, this.setData({
      readState: "sending",
      readMessage: "".concat(n || "读取", " ").concat(t, "，等待模块回包"),
      lastCommandText: "".concat(t, ",[").concat(Array.prototype.join.call(a || [], ","), "]")
    }), clearTimeout(this.readTimer), this.readTimer = setTimeout((function() {
      i.pendingRead && i.pendingRead.sentAt === s && i.visible && i.setData({
        readState: "timeout",
        readMessage: "".concat(t, " 暂未收到回包，可切换页签或点击立即读取重试")
      })
    }), 209 === t ? 1800 : 1200), e.tx(t, a).catch((function(e) {
      return clearTimeout(i.readTimer), i.setData({
        readState: "error",
        readMessage: e.message || "".concat(t, " 读取失败")
      }), Promise.reject(e)
    }))
  },
  selectTab: function(e) {
    var a = Number(e.currentTarget.dataset.index),
      n = {
        select: a
      };
    1 === a && (this.cellState = t.createCellState(), n.index = -1, n.maxVol = "- - -", n.minVol = "- - -", n.avgVol = "- - -", n.imbVol = "- - -", n["list[1]"] = []), this.setData(n), this.primeBatterySession(), this.scheduleNextPoll(0)
  },
  refreshCurrent: function() {
    e.globalData.connected ? (this.primeBatterySession(), this.scheduleNextPoll(0)) : e.msg("请先连接蓝牙", 0)
  },
  rx: function(e, t) {
    this.pendingRead = null, clearTimeout(this.readTimer), this.setData({
      readState: "loaded",
      readMessage: "已收到 ".concat(e, " 回包"),
      lastPacketText: "".concat(e, ",").concat(t ? t.length : 0, " 字节")
    }), 208 !== e ? 209 !== e ? 210 === e && this.handleDcdc(t) : this.handleCellFrame(t) : this.handleOverview(t)
  },
  handleOverview: function(e) {
    var a = t.parseOverview(e);
    this.setData({
      "list[0]": a.list,
      odometer: a.odometer
    })
  },
  handleCellFrame: function(e) {
    var a = t.parseCellFrame(e, this.cellState);
    this.cellState = a.state, this.setData({
      "list[1]": a.list,
      index: a.index,
      maxVol: a.maxVol,
      minVol: a.minVol,
      avgVol: a.avgVol,
      imbVol: a.imbVol
    })
  },
  handleDcdc: function(e) {
    this.setData({
      "list[2]": t.parseDcdc(e).list
    })
  },
  stopBatteryPage: function() {
    var t = this;
    if (this.visible || this.packetHandler || this.stateHandler) {
      var a = this.visible;
      this.visible = !1, this.pollTimer && clearTimeout(this.pollTimer), this.readTimer && clearTimeout(this.readTimer), this.pollTimer = null, this.readTimer = null, this.pendingRead = null, this.setKeepScreenOn(!1), a && e.globalData.connected && e.tx(208, new Uint8Array([0])).catch((function() {})), n.forEach((function(a) {
        return t.packetHandler && e.offPacket(a, t.packetHandler)
      })), this.stateHandler && e.offPacket("state", this.stateHandler), this.packetHandler = null, this.stateHandler = null
    }
  },
  onHide: function() {
    this.stopBatteryPage()
  },
  onUnload: function() {
    this.stopBatteryPage()
  }
});