var e = require("../../@babel/runtime/helpers/defineProperty"),
  t = require("../../services/pageNav"),
  a = require("../../services/gaugeParser"),
  n = getApp();
Page({
  data: {
    connected: !1,
    seatState: {
      driverMassage: !1,
      passengerMassage: !1
    },
    bodyActivePart: "",
    bodyAnyOpen: !1,
    bodyState: {
      leftFront: !1,
      rightFront: !1,
      leftRear: !1,
      rightRear: !1,
      frunk: !1,
      trunk: !1,
      mirror: !1
    },
    btnval: 0,
    driverSeatButtons: [{
      label: "前移",
      code: 26
    }, {
      label: "后移",
      code: 27
    }, {
      label: "靠背前",
      code: 28
    }, {
      label: "靠背后",
      code: 29
    }],
    passengerSeatButtons: [{
      label: "前移",
      code: 12
    }, {
      label: "后移",
      code: 13
    }, {
      label: "靠背前",
      code: 14
    }, {
      label: "靠背后",
      code: 15
    }],
    driverMemory: [{
      label: "记忆1",
      code: 52
    }, {
      label: "记忆2",
      code: 54
    }, {
      label: "记忆3",
      code: 56
    }, {
      label: "女王",
      code: 60
    }, {
      label: "露营",
      code: 58
    }],
    passengerMemory: [{
      label: "记忆1",
      code: 62
    }, {
      label: "记忆2",
      code: 64
    }, {
      label: "记忆3",
      code: 66
    }, {
      label: "女王",
      code: 70
    }, {
      label: "露营",
      code: 68
    }],
    wheelControls: [{
      label: "上",
      code: 1,
      cls: "up"
    }, {
      label: "左",
      code: 4,
      cls: "left"
    }, {
      label: "确认",
      code: 5,
      cls: "center"
    }, {
      label: "右",
      code: 2,
      cls: "right"
    }, {
      label: "下",
      code: 3,
      cls: "down"
    }]
  },
  onLoad: function() {
    var e = this;
    this.stateHandler = this.syncState.bind(this), this.deviceInfoHandler = this.rxDeviceInfo.bind(this), this.gaugeHandler = this.handleGaugePacket.bind(this), n.onPacket("state", this.stateHandler), n.onPacket(176, this.gaugeHandler), [160, 161, 163].forEach((function(t) {
      return n.onPacket(t, e.deviceInfoHandler)
    }))
  },
  onShow: function() {
    if (this.visible = !0, n.applyThemeToPage && n.applyThemeToPage(this), !n.globalData.connected) return n.msg("请先连接蓝牙", 0), void t.goBack("/pages/index/index");
    this.syncState(), this.syncBodyStateFromGauge(n.globalData.lastGaugeState), n.queryDeviceInfo().catch((function() {}))
  },
  syncState: function() {
    var e = !!n.globalData.connected;
    this.setData({
      connected: e
    }), e && this.visible ? this.startBodyGaugeSnapshot() : this.stopBodyGaugeSnapshot()
  },
  buildBodyStateFromGauge: function(e) {
    var t = this.data.bodyState || {},
      a = e && e.doorList ? e.doorList : [];
    return {
      leftFront: !(!a[0] || !a[0].open),
      rightFront: !(!a[1] || !a[1].open),
      leftRear: !(!a[2] || !a[2].open),
      rightRear: !(!a[3] || !a[3].open),
      frunk: !(!e || !e.frunkIsOpen),
      trunk: !(!e || !e.trunkIsOpen),
      mirror: !!t.mirror
    }
  },
  applyBodyState: function(e) {
    var t = ["leftFront", "rightFront", "leftRear", "rightRear", "frunk", "trunk"].some((function(t) {
      return !!e[t]
    }));
    this.setData({
      bodyState: e,
      bodyAnyOpen: t
    })
  },
  syncBodyStateFromGauge: function(e) {
    e && this.applyBodyState(this.buildBodyStateFromGauge(e))
  },
  startBodyGaugeSnapshot: function() {
    this.visible && n.globalData.connected && (this.requestBodyGaugeSnapshot(), this.scheduleBodyGaugeSnapshot(1500))
  },
  scheduleBodyGaugeSnapshot: function(e) {
    var t = this;
    this.bodyGaugeSnapshotTimer && clearTimeout(this.bodyGaugeSnapshotTimer), this.visible && n.globalData.connected && (this.bodyGaugeSnapshotTimer = setTimeout((function() {
      t.requestBodyGaugeSnapshot(), t.scheduleBodyGaugeSnapshot(1500)
    }), "number" == typeof e ? e : 1500))
  },
  requestBodyGaugeSnapshot: function() {
    this.visible && n.globalData.connected && (this.bodyGaugeSnapshotStarted = !0, n.tx(176, new Uint8Array([1])).catch((function() {})))
  },
  stopBodyGaugeSnapshot: function() {
    this.bodyGaugeSnapshotTimer && (clearTimeout(this.bodyGaugeSnapshotTimer), this.bodyGaugeSnapshotTimer = null), this.bodyGaugeSnapshotStarted && n.globalData.connected && n.tx(176, new Uint8Array([0])).catch((function() {})), this.bodyGaugeSnapshotStarted = !1
  },
  handleGaugePacket: function(e, t) {
    if (176 === e && this.visible) {
      var o = this.vehicleGaugeState || n.globalData.lastGaugeState || a.createEmptyGaugeState();
      this.vehicleGaugeState = a.parseGaugeFrame(t, o, {
        now: Date.now()
      }), n.globalData.lastGaugeState = this.vehicleGaugeState, this.syncBodyStateFromGauge(this.vehicleGaugeState)
    }
  },
  rxDeviceInfo: function(e, t) {
    if (t && t.length > 18) {
      var a = t[18] || 0;
      this.setData({
        seatState: {
          driverMassage: !!(a >>> 3 & 1),
          passengerMassage: !!(a >>> 4 & 1)
        }
      })
    }
    this.syncState()
  },
  goBack: function() {
    t.goBack("/pages/index/index")
  },
  ensureVehicleReady: function() {
    return !!n.globalData.connected || (n.msg("请先连接蓝牙", 0), !1)
  },
  sendControl: function(e, t, a) {
    var o = this;
    if (this.ensureVehicleReady()) {
      var r = function() {
        n.tx(167, new Uint8Array([Number(e)])).then((function() {
          n.msg("".concat(t, "已发送"), 1, 1200)
        })).catch((function(a) {
          o.showVehicleTxError(t, a, 167, [Number(e)])
        }))
      };
      a ? n.modal(a, !0, r) : r()
    }
  },
  sendVehicleControl: function(e) {
    var t = Number(e.currentTarget.dataset.code),
      a = e.currentTarget.dataset.label || "控制";
    this.sendControl(t, a, "确定执行".concat(a, "？"))
  },
  sendBodyPart: function(t) {
    var a = this,
      n = t.currentTarget.dataset.key,
      o = Number(t.currentTarget.dataset.code),
      r = t.currentTarget.dataset.label || "车身部件";
    if (n && this.data.bodyState && "boolean" == typeof this.data.bodyState[n] && this.ensureVehicleReady()) {
      var s = Object.assign({}, this.data.bodyState, e({}, n, !this.data.bodyState[n])),
        i = ["leftFront", "rightFront", "leftRear", "rightRear", "frunk", "trunk"].some((function(e) {
          return !!s[e]
        }));
      clearTimeout(this.bodyPulseTimer), this.setData({
        bodyState: s,
        bodyAnyOpen: i,
        bodyActivePart: n
      }), this.bodyPulseTimer = setTimeout((function() {
        a.setData({
          bodyActivePart: ""
        })
      }), 520), this.sendControl(o, r), this.requestBodyGaugeSnapshot()
    }
  },
  toggleSeatMassage: function(t) {
    if (this.ensureVehicleReady()) {
      var a = t.currentTarget.dataset.field,
        n = Number(t.currentTarget.dataset.base),
        o = t.currentTarget.dataset.label || "座椅按摩",
        r = !!a && !!this.data.seatState[a],
        s = t.detail && "boolean" == typeof t.detail.value ? t.detail.value : !r,
        i = n + (s ? 1 : 0);
      a && this.setData(e({}, "seatState.".concat(a), s)), this.sendControl(i, o)
    }
  },
  sendSeatHoldStart: function(e) {
    var t = Number(e.currentTarget.dataset.code),
      a = e.currentTarget.dataset.label || "座椅调节";
    this.sendControl(t, a)
  },
  sendSeatHoldEnd: function() {
    var e = this;
    n.globalData.connected && n.tx(167, new Uint8Array([16])).catch((function(t) {
      e.showVehicleTxError("座椅停止", t, 167, [16])
    }))
  },
  sendSeatMemory: function(e) {
    var t = Number(e.currentTarget.dataset.code),
      a = e.currentTarget.dataset.label || "座椅记忆";
    if ("longpress" === e.type) return this.lastMemoryLongPressAt = Date.now(), void this.sendControl(t + 1, a, "确定保存".concat(a, "？"));
    Date.now() - Number(this.lastMemoryLongPressAt || 0) < 650 || this.sendControl(t, a, "确定恢复".concat(a, "？"))
  },
  sendWheelStart: function(e) {
    var t = this;
    if (this.ensureVehicleReady()) {
      var a = Number(e.currentTarget.dataset.code);
      this.setData({
        btnval: a
      }), n.tx(162, new Uint8Array([a])).catch((function(e) {
        t.setData({
          btnval: 0
        }), t.showVehicleTxError("滚轮按下", e, 162, [a])
      }))
    }
  },
  sendWheelEnd: function() {
    var e = this;
    n.globalData.connected && (this.setData({
      btnval: 0
    }), n.tx(162, new Uint8Array([6])).catch((function(t) {
      e.showVehicleTxError("滚轮释放", t, 162, [6])
    })))
  },
  formatTxError: function(e, t, a, o) {
    var r = n.globalData.deviceInfo || {},
      s = r.profile || {},
      i = t && (t.message || t.errMsg) ? t.message || t.errMsg : String(t || "未知错误"),
      c = r.hw_ver ? "HW".concat(r.hw_ver) : "HW未知",
      l = s.label ? "/".concat(s.label) : "";
    return "".concat(e, "发送失败：").concat(i, " (").concat(a, ":[").concat(o.join(","), "], ").concat(c).concat(l, ")")
  },
  showVehicleTxError: function(e, t, a, o) {
    n.msg(this.formatTxError(e, t, a, o), 0, 3600)
  },
  onHide: function() {
    this.visible = !1, this.stopBodyGaugeSnapshot()
  },
  onUnload: function() {
    var e = this;
    this.visible = !1, this.stopBodyGaugeSnapshot(), n.offPacket("state", this.stateHandler), n.offPacket(176, this.gaugeHandler), [160, 161, 163].forEach((function(t) {
      return n.offPacket(t, e.deviceInfoHandler)
    })), clearTimeout(this.bodyPulseTimer)
  }
});