var e = require("../../services/ble"),
  t = getApp();
Page({
  data: {
    searching: !1,
    connected: !1,
    mockConnected: !1,
    showVerifier: !1,
    cachedDeviceId: "",
    foundCount: 0,
    targetCount: 0,
    searchSeconds: 0,
    currentDeviceId: "",
    rfChannel: 37,
    rfFrequency: 2402,
    packetRate: 118,
    dutyCycle: "94.2",
    swr: "1.12",
    devices: []
  },
  onLoad: function() {
    var e = this;
    wx.onBluetoothDeviceFound((function(t) {
      e.mergeDevices(t.devices || [])
    }))
  },
  onShow: function() {
    t.syncTabBar(this, 1), this.syncState(), this.startRfTicker(), this.startSearch({
      silent: !0
    })
  },
  syncState: function() {
    this.setData({
      connected: t.globalData.connected,
      mockConnected: t.globalData.mockConnected,
      showVerifier: "full" === t.getAccessMode(),
      cachedDeviceId: t.storageDeviceId(),
      currentDeviceId: t.globalData.currentDeviceId || ""
    })
  },
  toggleSearch: function() {
    this.data.searching ? this.refreshDiscoveredDevices() : this.startSearch({
      silent: !1
    })
  },
  startSearch: function(n) {
    var c = this,
      a = n || {};
    return this.data.searching ? (this.refreshDiscoveredDevices(), Promise.resolve()) : (this.clearSearchTimers(), this.searchStartedAt = Date.now(), this.setData({
      devices: [],
      foundCount: 0,
      targetCount: 0,
      searchSeconds: 0,
      searching: !0
    }), e.startDiscovery({
      targetOnly: !0
    }).then((function() {
      c.snapshotTimer = setInterval((function() {
        return c.refreshDiscoveredDevices()
      }), 1200), c.elapsedTimer = setInterval((function() {
        c.setData({
          searchSeconds: Math.floor((Date.now() - c.searchStartedAt) / 1e3)
        })
      }), 1e3), setTimeout((function() {
        return c.refreshDiscoveredDevices()
      }), 300), a.silent || t.msg("正在搜索 TSL 模块", -1, 1200)
    })).catch((function(e) {
      c.setData({
        searching: !1
      }), t.modal("蓝牙搜索失败：".concat(e.errMsg || e.message || "未知错误"))
    })))
  },
  stopSearch: function(n) {
    var c = this;
    this.clearSearchTimers(), e.stopDiscovery().then((function() {
      c.setData({
        searching: !1
      }), n ? t.msg("搜索结束，发现 ".concat(c.data.foundCount, " 个目标模块"), -1, 2200) : t.msg("已停止搜索，发现 ".concat(c.data.foundCount, " 个目标模块"), -1, 1600)
    }))
  },
  refreshDiscoveredDevices: function() {
    var t = this;
    e.getDiscoveredDevices().then((function(e) {
      t.mergeDevices(e || [])
    }))
  },
  mergeDevices: function(e) {
    var t = this;
    if (e && e.length) {
      var n = {};
      this.data.devices.forEach((function(e) {
        n[e.deviceId] = e
      })), e.forEach((function(e) {
        if (e.deviceId) {
          var c = t.decorateDevice(Object.assign({}, n[e.deviceId] || {}, e));
          c && (n[e.deviceId] = c)
        }
      }));
      var c = Object.keys(n).map((function(e) {
        return t.decorateDevice(n[e])
      })).filter(Boolean).sort((function(e, t) {
        var n = "number" == typeof e.RSSI ? e.RSSI : -999;
        return ("number" == typeof t.RSSI ? t.RSSI : -999) - n
      }));
      this.setData({
        devices: c,
        foundCount: c.length,
        targetCount: c.length
      })
    }
  },
  decorateDevice: function(e) {
    var n = (e.advertisServiceUUIDs || e.serviceData && Object.keys(e.serviceData) || []).map((function(e) {
        return String(e).toUpperCase()
      })),
      c = e.name || e.localName || "";
    if (!c) return null;
    var a = n.some((function(e) {
        return e.indexOf("FFF0") >= 0
      })),
      i = /TSL|IF|FRC|TESLA|MODEL/i.test(c);
    if (n.length && !a && !i) return null;
    var r = "number" == typeof e.RSSI ? e.RSSI : -95,
      s = r > -55 ? 3 : r > -70 ? 2 : r > -90 ? 1 : 0,
      o = !!t.globalData.connected && t.globalData.currentDeviceId === e.deviceId;
    return Object.assign({}, e, {
      displayName: c,
      serviceText: n.length ? n.join(", ") : "通过 FFF0 目标服务发现",
      tag: a ? "FFF0" : "目标模块",
      rssi: r,
      rssiLevel: s,
      secure: !0,
      connected: o,
      connectText: o ? "已完成握手" : "开通连接",
      isTarget: !0
    })
  },
  connectDevice: function(n) {
    var c = this,
      a = n.currentTarget.dataset.id;
    t.globalData.connected && t.globalData.currentDeviceId === a ? t.msg("当前芯片握手已完成", 1, 1200) : e.stopDiscovery().finally((function() {
      c.setData({
        searching: !1
      }), wx.showLoading({
        title: "连接中..."
      }), t.connect(a).then((function() {
        wx.hideLoading(), wx.switchTab({
          url: "/pages/index/index"
        })
      })).catch((function(e) {
        wx.hideLoading(), t.modal("连接失败：".concat(e.errMsg || e.message || "未知错误"))
      }))
    }))
  },
  connectMock: function() {
    var n = this;
    e.stopDiscovery().finally((function() {
      n.setData({
        searching: !1
      }), wx.showLoading({
        title: "连接中..."
      }), t.connectMock().then((function() {
        wx.hideLoading(), n.syncState(), t.msg("已连接验证模块", 1), wx.switchTab({
          url: "/pages/index/index"
        })
      })).catch((function(e) {
        wx.hideLoading(), t.modal("验证连接失败：".concat(e.message || "未知错误"))
      }))
    }))
  },
  disconnectMock: function() {
    t.disconnectMock(), this.syncState(), t.msg("已断开验证模块", 1)
  },
  startRfTicker: function() {
    var e = this;
    if (!this.rfTimer) {
      var t = [{
        channel: 37,
        frequency: 2402
      }, {
        channel: 38,
        frequency: 2426
      }, {
        channel: 39,
        frequency: 2480
      }, {
        channel: 12,
        frequency: 2412
      }, {
        channel: 24,
        frequency: 2436
      }, {
        channel: 15,
        frequency: 2448
      }];
      this.rfTimer = setInterval((function() {
        var n = t[Math.floor(Math.random() * t.length)];
        e.setData({
          rfChannel: n.channel,
          rfFrequency: n.frequency,
          packetRate: Math.floor(45 * Math.random()) + 115,
          dutyCycle: (93.6 + 1.4 * Math.random()).toFixed(1),
          swr: (1.08 + .08 * Math.random()).toFixed(2)
        })
      }), 1600)
    }
  },
  stopRfTicker: function() {
    this.rfTimer && clearInterval(this.rfTimer), this.rfTimer = null
  },
  onHide: function() {
    this.stopRfTicker(), this.clearSearchTimers(), e.stopDiscovery()
  },
  onUnload: function() {
    this.stopRfTicker(), this.clearSearchTimers(), e.stopDiscovery()
  },
  clearSearchTimers: function() {
    this.snapshotTimer && clearInterval(this.snapshotTimer), this.elapsedTimer && clearInterval(this.elapsedTimer), this.autoStopTimer && clearTimeout(this.autoStopTimer), this.snapshotTimer = null, this.elapsedTimer = null, this.autoStopTimer = null
  }
});