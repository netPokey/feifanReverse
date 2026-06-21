var t = getApp(),
  e = require("../../services/gaugeParser"),
  a = ["总里程", "海拔", "时间", "行驶"],
  n = ["电量", "续航", "电芯", "电池温度"],
  i = [{
    key: "odometer",
    label: "总里程"
  }, {
    key: "altitude",
    label: "海拔高度"
  }, {
    key: "time",
    label: "北京时间"
  }, {
    key: "driveTime",
    label: "行驶时间"
  }],
  r = [{
    key: "battery",
    label: "剩余电量"
  }, {
    key: "range",
    label: "剩余里程"
  }, {
    key: "cellVoltage",
    label: "电池电芯电压"
  }, {
    key: "batteryTemp",
    label: "动力电池温度"
  }],
  o = [{
    key: "cyber",
    label: "未来赛博"
  }, {
    key: "racing",
    label: "竞速烈焰"
  }, {
    key: "minimal",
    label: "极简冰川"
  }],
  s = [{
    key: "classic",
    label: "仪表盘1"
  }, {
    key: "neon",
    label: "仪表盘2"
  }],
  u = [5, 10, 15, 20, 25, 30, 35, 40];

function d(t) {
  var e = Number(t || 0);
  return !Number.isFinite(e) || e < 0 || e >= o.length ? 0 : e
}

function c(t) {
  var e = Number(t && t.gaugeHudStyle);
  return Number.isFinite(e) && e >= 0 && e < s.length ? e : 3 === Number(t && t.gaugeHudTheme) ? 1 : 0
}

function g(t, e) {
  return 1 === t ? "neon" : o[e].key
}

function l(t, e) {
  var a = Number(t && t.gaugeAspect || 0);
  return 1 === a ? 0 : 2 === a || e ? 1 : 0
}

function h(t) {
  return "portrait" === t ? "portrait" : "landscape"
}

function m(t) {
  return "landscape" === t ? "切换竖屏" : "切换横屏"
}

function p(t) {
  var e = Number(t);
  return Number.isFinite(e) ? Math.min(1, Math.max(.7, Math.round(20 * e) / 20)) : 1
}

function f(t) {
  var e = Number(t);
  return !Number.isFinite(e) || e < 1 ? 1 : Math.min(1.3, e)
}

function b() {
  return t && "function" == typeof t.getFontSizePreference ? f(t.getFontSizePreference().scale) : 1
}

function S(t) {
  var e = Number(t);
  return Number.isFinite(e) ? Math.min(1.22, Math.max(.9, Math.round(100 * e) / 100)) : 1
}

function v(t, e, a) {
  var n = p(t),
    i = S(a),
    r = 1.62 * n * f(e) * i,
    o = 1.62 * n * i;
  return ["--hud-scale:".concat(n, ";"), "--hud-font-scale:".concat(i, ";"), "--hud-card-title-font:".concat((2.55 * r).toFixed(2), "vh;"), "--hud-card-label-font:".concat((2.15 * r).toFixed(2), "vh;"), "--hud-card-value-font:".concat((4.05 * r).toFixed(2), "vh;"), "--hud-badge-font:".concat((2.85 * r).toFixed(2), "vh;"), "--hud-gear-font:".concat((3.65 * r).toFixed(2), "vh;"), "--hud-speed-font:".concat((11.6 * o).toFixed(2), "vh;"), "--hud-speed-unit-font:".concat((2.55 * r).toFixed(2), "vh;"), "--hud-action-font:".concat((2 * r).toFixed(2), "vh;"), "--hud-action-tag-font:".concat((1.5 * r).toFixed(2), "vh;"), "--hud-portrait-card-title-font:".concat(Math.round(24 * r), "rpx;"), "--hud-portrait-card-label-font:".concat(Math.round(25 * r), "rpx;"), "--hud-portrait-card-value-font:".concat(Math.round(37 * r), "rpx;"), "--hud-portrait-badge-font:".concat(Math.round(34 * r), "rpx;"), "--hud-portrait-gear-font:".concat(Math.round(37 * r), "rpx;"), "--hud-portrait-speed-font:".concat(Math.round(104 * o), "rpx;"), "--hud-portrait-speed-unit-font:".concat(Math.round(27 * r), "rpx;"), "--hud-portrait-action-font:".concat(Math.round(27 * r), "rpx;")].join("")
}

function y(t) {
  return Math.round(100 * p(t))
}

function T(t) {
  var e = Number(t);
  return Number.isFinite(e) ? Math.min(3, Math.max(1, Math.round(20 * e) / 20)) : 1
}

function w(t, e) {
  var a = Number(t);
  if (!Number.isFinite(a)) return 0;
  var n = function(t) {
    var e = 1.4 * T(t);
    return e <= 1 ? 0 : Math.floor((e - 1) / (2 * e) * 100)
  }(e);
  return Math.min(n, Math.max(-n, Math.round(a)))
}

function C(t) {
  var e = T(t && t.gaugeSpeedBgScale),
    a = w(t && t.gaugeSpeedBgX, e),
    n = w(t && t.gaugeSpeedBgY, e);
  return "transform:translate(".concat(a, "%, ").concat(n, "%) scale(").concat(e.toFixed(2), ");")
}

function x(t) {
  var e = String(t || "").trim();
  return "℃" === e ? "°C" : e
}

function M(t, e) {
  var a = String(t || "").trim(),
    n = /^(-?\d+(?:\.\d+)?)(.*)$/.exec(a);
  if (!n) return {
    value: a || "- -",
    unit: x(e)
  };
  var i = n[1].indexOf(".") >= 0 ? n[1].split(".")[1].length : 0,
    r = Number(n[1]),
    o = x(n[2] || e),
    s = function(t, e) {
      return "km" !== x(e).toLowerCase() || !Number.isFinite(t) || Math.abs(t) < 1e4 ? null : {
        value: (t / 1e4).toFixed(2),
        unit: "万公里"
      }
    }(r, o);
  return s || {
    value: Number.isFinite(r) ? r.toLocaleString("en-US", {
      minimumFractionDigits: i,
      maximumFractionDigits: i
    }) : n[1],
    unit: o
  }
}

function B(t) {
  var a = String(t || "").trim(),
    n = /(\d{1,2})[:：](\d{1,2})/.exec(a);
  if (!n) return {
    value: e.formatTime(),
    unit: ""
  };
  var i = Math.min(23, Math.max(0, Number(n[1]))),
    r = Math.min(59, Math.max(0, Number(n[2])));
  return {
    value: "".concat(i < 10 ? "0" : "").concat(i, ":").concat(r < 10 ? "0" : "").concat(r),
    unit: ""
  }
}

function k(t) {
  var a = t || e.createEmptyGaugeState();
  return {
    odometer: M(a.leftBottom && a.leftBottom[0] || a.odometer, "km"),
    altitude: M(a.leftBottom && a.leftBottom[1] || a.altitude, "m"),
    range: M(a.rightBottom && a.rightBottom[1] || a.remainRange, "km"),
    battery: M(a.rightBottom && a.rightBottom[0] || a.batteryPercent, "%"),
    outsideTemp: M(a.tempAmbientRaw, "°C"),
    cabinTemp: M(a.hvacCabinTempEst, "°C"),
    speedLimit: a.fusedSpeedLimit ? M("".concat(a.fusedSpeedLimit, "km/h"), "km/h") : {
      value: "- -",
      unit: ""
    }
  }
}

function A(t) {
  var a = t || e.createEmptyGaugeState(),
    n = L(a),
    i = Number(a.totalInverterPower || 0),
    r = Array.isArray(a.pressure) ? a.pressure : [];
  return {
    battery: n.battery,
    range: n.range,
    power: M("".concat(Math.abs(i).toFixed(0), "kW"), "kW"),
    altitude: n.altitude,
    time: B(a.leftBottom && a.leftBottom[2]),
    tpms: {
      frontLeft: r[0] || "0",
      frontRight: r[1] || "0",
      rearLeft: r[2] || "0",
      rearRight: r[3] || "0"
    },
    speedUnit: String(a.unit || "KM/H").toLowerCase()
  }
}

function L(t) {
  var a = t || e.createEmptyGaugeState(),
    n = k(a);
  return Object.assign({}, n, {
    time: M(a.leftBottom && a.leftBottom[2] || e.formatTime(), ""),
    driveTime: M(a.leftBottom && a.leftBottom[3] || "00:00", ""),
    cellVoltage: M(a.rightBottom && a.rightBottom[2] || a.cellVoltage, "V"),
    batteryTemp: M(a.rightBottom && a.rightBottom[3] || a.batteryTemp, "°C")
  })
}

function N(t, e) {
  var a = Number(t || 0);
  return !Number.isFinite(a) || a < 0 || a > e ? 0 : a
}

function P(t) {
  var e = Number(t);
  return !Number.isFinite(e) || e <= 0 ? 0 : u.reduce((function(t, a) {
    return Math.abs(a - e) < Math.abs(t - e) ? a : t
  }), u[0])
}

function D(t) {
  var e = Number(t && t.gaugeAutoCameraSpeed);
  if (Number.isFinite(e)) {
    var a = P(e);
    return {
      autoCameraEnabled: a > 0,
      autoCameraSpeed: a
    }
  }
  var n, i, r, o = 1 === Number(t && t.gaugeAutoCameraEnabled || 0),
    s = (n = t && t.gaugeAutoCameraOpenBelow, i = 10, r = Number(n), !Number.isFinite(r) || r < 1 ? i : P(r));
  return {
    autoCameraEnabled: o,
    autoCameraSpeed: o ? s : 0
  }
}

function R(t, e, a) {
  var n = function(t, e) {
      return t >= e ? Math.floor(Date.now() / 3e3) % e : t
    }(N(a, e.length), e.length),
    i = 0 === n ? 1 : 0,
    r = e[n] || e[0],
    o = e[i] || e[1] || e[0];
  return {
    primary: Object.assign({
      label: r.label
    }, t[r.key] || {
      value: "- -",
      unit: ""
    }),
    secondary: Object.assign({
      label: o.label
    }, t[o.key] || {
      value: "- -",
      unit: ""
    })
  }
}

function F(t, e, a) {
  var n = L(t),
    o = R(n, i, e),
    s = R(n, r, a);
  return {
    cardMetrics: n,
    leftQuickMetric: o.primary,
    leftQuickSecondaryMetric: o.secondary,
    rightQuickMetric: s.primary,
    rightQuickSecondaryMetric: s.secondary
  }
}

function O(t, e) {
  return "neon" === t ? "#0b93ee" : "racing" === t ? "#ff2a00" : "minimal" === t ? "#ffffff" : "#00f0ff"
}

function H(t) {
  return "day" === t ? "background:rgba(248, 251, 255, .38);" : "background:rgba(3, 6, 12, .34);"
}

function U(t) {
  return String(t || "道路千万条，安全第一条；行车不规范，亲人两行泪").trim().slice(0, 24)
}
Page({
  data: {
    appTheme: "midnight",
    connected: !1,
    mockConnected: !1,
    statusText: "未连接",
    gauge: {},
    dashboardIcons: {
      speedTest: "/assets/icons/generated/dashboard-test@48.png",
      appearance: "/assets/icons/generated/dashboard-palette@48.png",
      heat: "/assets/icons/generated/dashboard-flame@48.png",
      heatActive: "/assets/icons/generated/dashboard-flame-active@48.png",
      layout: "/assets/icons/generated/dashboard-orientation@48.png",
      neonBattery: "/assets/icons/generated/neon-battery@40.png",
      neonRange: "/assets/icons/generated/home-range@48.png",
      neonPower: "/assets/icons/generated/neon-power@40.png",
      neonAltitude: "/assets/icons/generated/neon-altitude@40.png",
      neonTime: "/assets/icons/generated/neon-time@40.png",
      neonTpms: "/assets/icons/generated/neon-tpms@40.png"
    },
    entryTransitionState: "done",
    hudTheme: o[0].key,
    hudStyle: s[0].key,
    hudColorTheme: o[0].key,
    layoutMode: "landscape",
    layoutActionText: "切换竖屏",
    hudScale: 1,
    hudFontScale: 1,
    hudScalePercent: 100,
    hudScaleStyle: "--hud-scale:1;",
    gaugeGreeting: "道路千万条，安全第一条；行车不规范，亲人两行泪",
    speedBgPath: "",
    speedBgStyle: "transform:translate(0%, 0%) scale(1);",
    speedBgMoving: !1,
    speedBgCoverStyle: H("midnight"),
    autoCameraEnabled: !1,
    autoCameraSpeed: 0,
    turnSignal: "none",
    turnLeftActive: !1,
    turnRightActive: !1,
    topbarStyle: "",
    aspect: 0,
    splitScreen: !1,
    speed: "0",
    speedRaw: 0,
    speedLengthClass: "",
    speedType: !1,
    unit: "KM/H",
    neonSpeedUnit: "km/h",
    gear: 0,
    gearLabel: "-",
    turn: 0,
    autoPilot: 0,
    autoPilotLabel: "未开启",
    light: 0,
    door: 0,
    leftBottomIdx: 0,
    rightBottomIdx: 0,
    leftBottom: ["0.0km", "0m", "00:00", "00:00"],
    rightBottom: ["100%", "0km", "0.00V", "0℃"],
    leftBottomLabel: a[0],
    rightBottomLabel: n[0],
    pressure: ["0", "0", "0", "0"],
    brakeTemp: ["- -", "- -", "- -", "- -"],
    accelPedalPos: 0,
    rearInverterPower: 0,
    frontInverterPower: 0,
    totalInverterPower: 0,
    hvacBlowerSpeedRPM: 0,
    wattsDemandEvap: 0,
    hvacCabinTempEst: "- -",
    tempAmbientRaw: "- -",
    battHeat: 0,
    battHeatLabel: "关闭",
    speedUnits: 1,
    handsOn: 0,
    sport: 1,
    frunkIsOpen: 0,
    trunkIsOpen: 0,
    fusedSpeedLimit: 0,
    isSpeeding: !1,
    blindSpotLabels: ["无", "无"],
    blindSpotLeftLevel: 0,
    blindSpotRightLevel: 0,
    blindLeftActive: !1,
    blindRightActive: !1,
    lightPosition: !1,
    lightLow: !1,
    lightHigh: !1,
    lightFrontFog: !1,
    lightRearFog: !1,
    brakeLight: !1,
    throttleBarWidth: 0,
    throttleBarColor: "#dddddd",
    throttleArcDeg: 0,
    throttleArcOpacity: 0,
    neonMetrics: A(),
    cardMetrics: k(),
    leftQuickMetric: F().leftQuickMetric,
    leftQuickSecondaryMetric: F().leftQuickSecondaryMetric,
    rightQuickMetric: F().rightQuickMetric,
    rightQuickSecondaryMetric: F().rightQuickSecondaryMetric,
    doorList: [],
    statusMetrics: [],
    bodyMetrics: [],
    tireMetrics: [],
    powerMetrics: [],
    climateMetrics: [],
    speedUpTest: 0,
    speedUpText: "百公里测试",
    iphoneBattery: 0,
    isCharging: !1
  },
  onLoad: function() {
    this.gaugeState = e.createEmptyGaugeState(), t.applyThemeToPage && t.applyThemeToPage(this), this.prepareEntryTransition(), this.loadGaugeSettings()
  },
  onShow: function() {
    this.visible = !0, this.gaugeState = e.createEmptyGaugeState(), this.gaugeEventReady = !1, this.autoCameraState = "", this.autoCameraCandidate = "", this.autoCameraConfirmCount = 0, this.autoCameraSamples = [], this.lastAutoCameraTxAt = 0, this.packetHandler = this.rx.bind(this), this.stateHandler = this.handleConnectionState.bind(this), t.onPacket(176, this.packetHandler), t.onPacket("state", this.stateHandler), t.applyThemeToPage && t.applyThemeToPage(this), this.loadGaugeSettings(), this.syncViewportSafeArea(), this.handleConnectionState(t.globalData.connected), this.setKeepScreenOn(!0), this.schedulePoll(0)
  },
  prepareEntryTransition: function() {
    var t = this,
      e = wx.getStorageSync("gaugeEntryTransition");
    e && "home" === e.source && Date.now() - Number(e.ts || 0) < 2600 && ("function" == typeof wx.removeStorageSync && wx.removeStorageSync("gaugeEntryTransition"), this.setData({
      entryTransitionState: "preparing"
    }), setTimeout((function() {
      t.setData({
        entryTransitionState: "active"
      })
    }), 40), setTimeout((function() {
      t.setData({
        entryTransitionState: "done"
      })
    }), 520))
  },
  loadGaugeSettings: function() {
    var t, e = wx.getStorageSync("gauge") || {},
      u = N(e.gaugeLeftBottom, i.length),
      h = N(e.gaugeRightBottom, r.length),
      f = this.gaugeState ? this.gaugeState.aspect : this.data.aspect,
      w = c(e),
      x = d(e.gaugeHudTheme),
      M = g(w, x),
      B = (t = e.gaugeHudLayout, 1 === Number(t || 0) ? "portrait" : "landscape"),
      k = p(e.gaugeHudScale),
      A = S(e.gaugeHudFontSize),
      L = T(e.gaugeSpeedBgScale),
      P = String(e.gaugeSpeedBgPath || ""),
      R = F(this.gaugeState, u, h),
      O = D(e);
    this.applyPageOrientation(B), this.setData(Object.assign({
      gauge: e,
      hudTheme: M,
      hudStyle: s[w].key,
      hudColorTheme: o[x].key,
      layoutMode: B,
      layoutActionText: m(B),
      hudScale: k,
      hudFontScale: A,
      hudScalePercent: y(k),
      hudScaleStyle: v(k, b(), A),
      gaugeGreeting: U(e.gaugeGreeting),
      speedBgPath: P,
      speedBgStyle: C(Object.assign({}, e, {
        gaugeSpeedBgScale: L
      })),
      autoCameraEnabled: O.autoCameraEnabled,
      autoCameraSpeed: O.autoCameraSpeed,
      leftBottomIdx: u,
      rightBottomIdx: h,
      leftBottomLabel: u >= i.length ? "自动" : a[u],
      rightBottomLabel: h >= r.length ? "自动" : n[h],
      aspect: l(e, f)
    }, R))
  },
  applyPageOrientation: function(t) {
    var e = this;
    "function" == typeof wx.setPageOrientation && wx.setPageOrientation({
      orientation: h(t),
      success: function() {
        e.syncViewportSafeArea()
      },
      fail: function() {}
    })
  },
  syncViewportSafeArea: function() {
    var t = function() {
      var t = wx.getWindowInfo ? wx.getWindowInfo() : {
          windowWidth: 0,
          windowHeight: 0
        },
        e = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null,
        a = Number(t.windowWidth || 0),
        n = Number(t.windowHeight || 0),
        i = Math.max(16, Math.round(.03 * a)),
        r = Math.max(16, Math.round(.03 * a)),
        o = Math.max(10, Math.round(.03 * n)),
        s = r,
        u = o;
      if (e && a) {
        var d = Number(e.left),
          c = Number(e.top || 0),
          g = Number(e.width || Number(e.right || 0) - d);
        Number.isFinite(d) && d > .45 * a && d < a && g > 0 && (s = Math.max(r, Math.ceil(a - d + 12)), u = Number.isFinite(c) && c > 0 && c < .3 * n ? Math.max(o, Math.round(c)) : o)
      }
      return "left:".concat(i, "px;right:").concat(s, "px;top:").concat(u, "px;")
    }();
    this.lastTopbarStyle !== t && (this.lastTopbarStyle = t, this.setData({
      topbarStyle: t
    }))
  },
  setKeepScreenOn: function(t) {
    wx.setKeepScreenOn({
      keepScreenOn: t,
      fail: function() {
        wx.setKeepScreenOn({
          keepScreenOn: t
        })
      }
    })
  },
  handleConnectionState: function(e) {
    var a = !!e;
    this.setData({
      connected: a,
      mockConnected: !!t.globalData.mockConnected,
      statusText: a ? t.globalData.mockConnected ? "验证连接" : "已连接" : "未连接"
    })
  },
  schedulePoll: function(t) {
    var e = this;
    this.pollTimer && clearTimeout(this.pollTimer), this.pollTimer = setTimeout((function() {
      e.pollGauge()
    }), "number" == typeof t ? t : 1e3)
  },
  pollGauge: function() {
    this.visible && (t.globalData.connected && t.tx(176, new Uint8Array([1])).catch((function() {})), this.updateRuntimeFields(), this.schedulePoll())
  },
  updateRuntimeFields: function() {
    var t = this,
      a = wx.getWindowInfo ? wx.getWindowInfo() : {
        windowWidth: 1,
        windowHeight: 1
      },
      n = a.windowHeight ? a.windowWidth / a.windowHeight : 1,
      i = this.gaugeState.leftBottom.slice();
    this.syncViewportSafeArea(), i[2] = e.formatTime(), i[3] = this.gaugeState.leftBottom[3];
    var r = Object.assign({}, this.gaugeState, {
        leftBottom: i
      }),
      o = F(r, this.data.leftBottomIdx, this.data.rightBottomIdx),
      s = A(r);
    this.setData(Object.assign({
      splitScreen: n >= .8 && n <= 1.4,
      leftBottom: i,
      neonMetrics: s,
      neonSpeedUnit: s.speedUnit
    }, o)), wx.getBatteryInfo({
      success: function(e) {
        t.setData({
          iphoneBattery: Number(e.level || 0).toFixed(0),
          isCharging: !!e.isCharging
        })
      }
    })
  },
  rx: function(t, a) {
    if (176 === t && this.visible) {
      var n = this.gaugeState ? this.gaugeState.gear : 0,
        i = Date.now();
      if (4 !== n && a && a.length >= 2) 4 == ((a[1] << 8 | a[0]) >>> 9 & 7) && (this.runStartTime = i);
      this.gaugeState = e.parseGaugeFrame(a, this.gaugeState, {
        now: i,
        runStartTime: this.runStartTime
      }), this.gaugeEventReady = !0, this.handleSpeedUpTest(this.gaugeState.speedRaw), this.handleAutoCameraBySpeed(this.gaugeState.speedRaw), this.applyGaugeState(this.gaugeState)
    }
  },
  handleAutoCameraBySpeed: function(e) {
    if (!this.data.autoCameraEnabled || !this.visible || !t.globalData.connected) return this.autoCameraCandidate = "", this.autoCameraConfirmCount = 0, void(this.autoCameraSamples = []);
    var a = function(t, e, a) {
      var n = Number(t.data.autoCameraSpeed || 0);
      if (!n) return "";
      var i = Number(e);
      if (!Number.isFinite(i)) return "";
      if (a - Number(t.lastAutoCameraTxAt || 0) < 3e3) return "";
      t.autoCameraSamples = (t.autoCameraSamples || []).concat(i).slice(-3);
      var r = t.autoCameraSamples.slice().sort((function(t, e) {
          return t - e
        })),
        o = r[Math.floor(r.length / 2)],
        s = n + Math.max(2, Math.round(.12 * n)),
        u = "";
      return o >= 1 && o < n ? u = "open" : o >= s && (u = "closed"), u ? (u !== t.autoCameraCandidate ? (t.autoCameraCandidate = u, t.autoCameraConfirmCount = 1) : t.autoCameraConfirmCount = Number(t.autoCameraConfirmCount || 0) + 1, t.autoCameraConfirmCount < 2 || u === t.autoCameraState ? "" : u) : (t.autoCameraCandidate = "", t.autoCameraConfirmCount = 0, "")
    }(this, e, Date.now());
    "open" !== a ? "closed" === a && this.sendAutoCameraCommand(118, "closed") : this.sendAutoCameraCommand(119, "open")
  },
  sendAutoCameraCommand: function(e, a) {
    var n = this;
    this.lastAutoCameraTxAt = Date.now(), this.autoCameraState = a, t.tx(187, new Uint8Array([e]), {
      source: "gaugeAutoCamera",
      executeKind: "fun",
      ackMessage: 119 === e ? "已发送开启摄像头指令" : "已发送关闭摄像头指令"
    }).catch((function() {
      n.autoCameraState = "", n.autoCameraCandidate = "", n.autoCameraConfirmCount = 0
    }))
  },
  applyGaugeState: function(a) {
    t.applyThemeToPage && t.applyThemeToPage(this);
    var n, i, r, o = e.toMetricGroups(a),
      s = l(this.data.gauge || {}, a.aspect),
      u = Number(a.light || 0),
      d = Math.max(0, Math.min(100, Number(a.accelPedalPos || 0))),
      c = (n = d, {
        throttleArcDeg: (i = Math.max(0, Math.min(100, Number(n || 0)))) > 0 ? Math.max(10, Math.round(2.25 * i)) : 0,
        throttleArcOpacity: i > 0 ? 1 : 0
      }),
      g = a.blindSpotRear ? a.blindSpotRear[0] : 0,
      h = a.blindSpotRear ? a.blindSpotRear[1] : 0,
      m = {
        turnSignal: r = e.resolveTurnSignal(a.turn),
        turnLeftActive: "left" === r || "both" === r,
        turnRightActive: "right" === r || "both" === r
      },
      p = Number(a.speedRaw || 0) > 0,
      f = H(this.data.appTheme),
      b = function(t, e, a) {
        var n = Number(e && e.speedRaw || 0),
          i = Number(e && e.fusedSpeedLimit || 0),
          r = i;
        return i > 0 ? t.lastSpeedLimit = {
          value: i,
          updatedAt: a
        } : t.lastSpeedLimit && a - Number(t.lastSpeedLimit.updatedAt || 0) <= 3e3 && (r = Number(t.lastSpeedLimit.value || 0)), !(r <= 0) && (t.data && t.data.isSpeeding ? n > r + 5 : n > r + 10)
      }(this, a, Date.now()),
      S = A(a);
    t.globalData.lastGaugeState = a, this.setData(Object.assign({
      aspect: s,
      speed: a.speed,
      speedRaw: a.speedRaw,
      speedLengthClass: (a.speed, a.speedType, ""),
      speedBgMoving: p,
      speedBgCoverStyle: f,
      speedType: a.speedType,
      unit: a.unit,
      neonSpeedUnit: S.speedUnit,
      gear: a.gear,
      gearLabel: a.gearLabel,
      turn: a.turn,
      turnSignal: m.turnSignal,
      turnLeftActive: m.turnLeftActive,
      turnRightActive: m.turnRightActive,
      autoPilot: a.autoPilot,
      autoPilotLabel: a.autoPilotLabel,
      light: a.light,
      door: a.door,
      leftBottom: a.leftBottom,
      rightBottom: a.rightBottom,
      pressure: a.pressure,
      brakeTemp: a.brakeTemp,
      accelPedalPos: a.accelPedalPos,
      rearInverterPower: a.rearInverterPower,
      frontInverterPower: a.frontInverterPower,
      totalInverterPower: a.totalInverterPower,
      hvacBlowerSpeedRPM: a.hvacBlowerSpeedRPM,
      wattsDemandEvap: a.wattsDemandEvap,
      hvacCabinTempEst: a.hvacCabinTempEst,
      tempAmbientRaw: a.tempAmbientRaw,
      battHeat: a.battHeat,
      battHeatLabel: a.battHeatLabel,
      speedUnits: a.speedUnits,
      handsOn: a.handsOn,
      sport: a.sport,
      frunkIsOpen: a.frunkIsOpen,
      trunkIsOpen: a.trunkIsOpen,
      fusedSpeedLimit: a.fusedSpeedLimit,
      isSpeeding: b,
      blindSpotLabels: a.blindSpotLabels,
      blindSpotLeftLevel: g,
      blindSpotRightLevel: h,
      blindLeftActive: g > 0,
      blindRightActive: h > 0,
      lightPosition: !!(4 & u),
      lightLow: !!(2 & u),
      lightHigh: !!(1 & u),
      lightFrontFog: !!(8 & u),
      lightRearFog: !!(16 & u),
      brakeLight: !!(32 & u),
      throttleBarWidth: d,
      throttleBarColor: d > 0 ? O(this.data.hudTheme, this.data.hudColorTheme) : "transparent",
      throttleArcDeg: c.throttleArcDeg,
      throttleArcOpacity: c.throttleArcOpacity,
      neonMetrics: S,
      doorList: a.doorList,
      statusMetrics: o.status,
      bodyMetrics: o.body,
      tireMetrics: o.tires,
      powerMetrics: o.power,
      climateMetrics: o.climate
    }, F(a, this.data.leftBottomIdx, this.data.rightBottomIdx)))
  },
  handleSpeedUpTest: function(e) {
    if (1 === this.data.speedUpTest && e > 0) return this.speedUpTestTime = Date.now(), this.setData({
      speedUpTest: 2,
      speedUpText: "测试中"
    }), void t.msg("测试开始", !1, 1800);
    if (2 === this.data.speedUpTest && e >= 100) {
      var a = ((Date.now() - this.speedUpTestTime) / 1e3).toFixed(3);
      this.setData({
        speedUpTest: 0,
        speedUpText: "百公里测试"
      }), t.modal("百公里加速\n本次成绩 ".concat(a, " 秒"))
    }
  },
  toggleLeftBottom: function() {
    var e = Object.assign({}, this.data.gauge),
      n = (Number(e.gaugeLeftBottom || 0) + 1) % 5;
    e.gaugeLeftBottom = n, wx.setStorageSync("gauge", e), this.setData(Object.assign({
      gauge: e,
      leftBottomIdx: n,
      leftBottomLabel: n >= 4 ? "自动" : a[n]
    }, F(this.gaugeState, n, this.data.rightBottomIdx))), t.msg(["显示总里程", "显示海拔高度", "显示北京时间", "显示行驶时间", "自动循环显示"][n], !1, 1600)
  },
  toggleRightBottom: function() {
    var e = Object.assign({}, this.data.gauge),
      a = (Number(e.gaugeRightBottom || 0) + 1) % 5;
    e.gaugeRightBottom = a, wx.setStorageSync("gauge", e), this.setData(Object.assign({
      gauge: e,
      rightBottomIdx: a,
      rightBottomLabel: a >= 4 ? "自动" : n[a]
    }, F(this.gaugeState, this.data.leftBottomIdx, a))), t.msg(["显示剩余电量", "显示剩余里程", "电池电芯电压", "动力电池温度", "自动循环显示"][a], !1, 1600)
  },
  handleSpeedRingTap: function() {
    var t = Date.now();
    t - Number(this.lastSpeedRingTapAt || 0) > 320 ? this.lastSpeedRingTapAt = t : (this.lastSpeedRingTapAt = 0, this.chooseSpeedBackgroundFromGauge())
  },
  chooseSpeedBackgroundFromGauge: function() {
    t.suppressModuleAutoSwitchAppHide && t.suppressModuleAutoSwitchAppHide("gauge-speed-bg", 9e4), wx.navigateTo({
      url: "/pages/gaugeMenu/gaugeMenu?speedBgEdit=1&fromGauge=1",
      fail: function() {
        t.msg("请从设置页调整速度环背景", !1, 1600)
      }
    })
  },
  back: function() {
    wx.navigateBack()
  },
  toggleAspect: function() {
    if ("neon" !== this.data.hudTheme) {
      var e = Object.assign({}, this.data.gauge),
        a = (d(e.gaugeHudTheme) + 1) % o.length,
        n = c(e),
        i = g(n, a);
      e.gaugeHudTheme = a, wx.setStorageSync("gauge", e), this.setData({
        gauge: e,
        hudTheme: i,
        hudStyle: s[n].key,
        hudColorTheme: o[a].key,
        throttleBarColor: this.data.throttleBarWidth > 0 ? O(i) : "transparent"
      }), t.msg("已切换".concat(o[a].label), !1, 1500)
    }
  },
  setHudScale: function(t) {
    var e = p(t),
      a = Object.assign({}, this.data.gauge, {
        gaugeHudScale: e
      });
    wx.setStorageSync("gauge", a), this.setData({
      gauge: a,
      hudScale: e,
      hudScalePercent: y(e),
      hudScaleStyle: v(e, b())
    })
  },
  changeHudScale: function(t) {
    this.setHudScale(t && t.detail ? t.detail.value : this.data.hudScale)
  },
  stepHudScale: function(t) {
    var e = Number(t && t.currentTarget && t.currentTarget.dataset ? t.currentTarget.dataset.step : 0);
    this.setHudScale(this.data.hudScale + e)
  },
  toggleLayoutMode: function() {
    var e = Object.assign({}, this.data.gauge),
      a = "landscape" === this.data.layoutMode ? "portrait" : "landscape";
    e.gaugeHudLayout = "portrait" === a ? 1 : 0, wx.setStorageSync("gauge", e), this.applyPageOrientation(a), this.setData({
      gauge: e,
      layoutMode: a,
      layoutActionText: m(a)
    }), t.msg("portrait" === a ? "已切换竖屏" : "已切换横屏", !1, 1500)
  },
  toggleSpeedUpTest: function() {
    if (t.globalData.connected) {
      if (0 === this.data.speedUpTest) return 4 !== this.data.gear ? void t.msg("必须在 D 档下才能开始测试", !1, 2200) : this.data.speedRaw > 0 ? void t.msg("车速必须为0才能开始测试", !1, 2200) : (this.setData({
        speedUpTest: 1,
        speedUpText: "准备中"
      }), void t.msg("百公里加速测试准备就绪", !1, 2200));
      this.setData({
        speedUpTest: 0,
        speedUpText: "百公里测试"
      }), t.msg("百公里加速测试已退出", !1, 1800)
    } else t.msg("请先连接蓝牙", 0)
  },
  openDoor: function(e) {
    var a = Number(e.currentTarget.dataset.index || 0);
    t.globalData.connected ? this.data.speedRaw > 0 ? t.msg("车速必须为0才能开门", !1, 1800) : (t.msg("打开".concat(["左前", "右前", "左后", "右后"][a], "门"), !1, 1400), t.tx(167, new Uint8Array([a])).catch((function() {}))) : t.msg("请先连接蓝牙", 0)
  },
  controlBtn: function(e) {
    var a = Number(e.currentTarget.dataset.btn || 0);
    t.globalData.connected ? this.data.speedRaw > 0 ? t.msg("车速必须为0才能操作车身", !1, 1800) : t.tx(167, new Uint8Array([a])).catch((function() {})) : t.msg("请先连接蓝牙", 0)
  },
  toggleBattHeat: function() {
    t.globalData.connected ? t.tx(167, new Uint8Array([this.data.battHeat ? 4 : 5])).catch((function() {})) : t.msg("请先连接蓝牙", 0)
  },
  stopGauge: function() {
    this.visible = !1, this.pollTimer && clearTimeout(this.pollTimer), this.pollTimer = null, this.setKeepScreenOn(!1), "function" == typeof wx.setPageOrientation && wx.setPageOrientation({
      orientation: "portrait",
      fail: function() {}
    }), t.globalData.connected && t.tx(176, new Uint8Array([0])).catch((function() {})), this.packetHandler && t.offPacket(176, this.packetHandler), this.stateHandler && t.offPacket("state", this.stateHandler)
  },
  onHide: function() {
    this.stopGauge()
  },
  onUnload: function() {
    this.stopGauge()
  }
});