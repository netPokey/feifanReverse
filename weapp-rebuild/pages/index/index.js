var e = require("../../services/featureRegistry"),
  t = require("../../services/gaugeParser"),
  a = require("../../services/settingsOptions"),
  n = require("../../services/shortcutExecutor"),
  s = require("../../services/tripStore"),
  o = getApp(),
  i = "/assets/icons/generated/home-lock@48.png",
  c = "/assets/icons/generated/home-unlock@48.png",
  r = "/assets/icons/generated/home-frunk@48.png",
  h = "/assets/icons/generated/home-frunk-active@48.png",
  u = "/assets/icons/generated/home-trunk@48.png",
  d = "/assets/icons/generated/home-trunk-active@48.png",
  l = "/assets/icons/generated/home-fan@48.png",
  g = "/assets/icons/generated/home-fan-active@48.png",
  m = "/assets/icons/generated/home-lightning@48.png",
  b = "/assets/icons/generated/home-lightning-active@48.png",
  f = "/assets/icons/generated/home-battery@48.png",
  p = "/assets/icons/generated/home-range@48.png",
  v = "/assets/icons/generated/home-flame@48.png",
  y = "/assets/icons/generated/home-flame-active@48.png",
  A = "/assets/icons/generated/home-siren@48.png",
  P = "/assets/icons/generated/home-siren-front-active@48.png",
  S = "/assets/icons/generated/home-rear-strobe@48.png",
  k = "/assets/icons/generated/home-rear-strobe-active@48.png",
  H = "/assets/icons/generated/home-pulse-horn@48.png",
  w = "/assets/icons/generated/home-pulse-horn-active@48.png",
  D = "/assets/icons/generated/home-fog@48.png",
  I = "/assets/icons/generated/home-fog-active@48.png";

function B(e) {
  var t = Number(e) || 0;
  return t < 10 ? "0".concat(t) : String(t)
}

function G(e) {
  var t = Number(e || 0);
  if (!t) return "";
  var a = new Date(t);
  return "".concat(B(a.getMonth() + 1), "-").concat(B(a.getDate()), " ").concat(B(a.getHours()), ":").concat(B(a.getMinutes()))
}

function O(e, t) {
  var a = String(e || "").trim(),
    n = /^(-?\d+(?:\.\d+)?)(.*)$/.exec(a);
  if (!n) return {
    value: a || "--",
    unit: ""
  };
  var s = n[1].indexOf(".") >= 0 ? n[1].split(".")[1].length : 0,
    o = Number(n[1]),
    i = String(n[2] || t || "").trim();
  return "km" === i.toLowerCase() && Number.isFinite(o) && Math.abs(o) >= 1e4 ? {
    value: (o / 1e4).toFixed(2),
    unit: "万公里"
  } : {
    value: Number.isFinite(o) ? o.toLocaleString("en-US", {
      minimumFractionDigits: s,
      maximumFractionDigits: s
    }) : n[1],
    unit: i
  }
}
Page({
  data: {
    connected: !1,
    mockConnected: !1,
    connectionStatus: {
      mode: "offline",
      label: "离线",
      desc: "蓝牙未连接",
      tone: "muted"
    },
    authStatus: "idle",
    authMessage: "未连接",
    accessLocked: !1,
    accessPassword: "",
    accessPasswordError: "",
    accessPasswordHint: "",
    accessPasswordMax: 24,
    accessPasswordProgress: [],
    accessPasswordReady: !1,
    accessInputFocus: !1,
    isAutoGauge: !1,
    homeLocked: !0,
    homeFrunkOpen: !1,
    homeTrunkOpen: !1,
    homeAcActive: !1,
    homeChargeOpen: !1,
    homeBatteryHeat: !1,
    homeFrontStrobe: !1,
    homeRearStrobe: !1,
    homePulseHorn: !1,
    homeAirDryMode: 0,
    homeSettingsRawConfig: [],
    homeSettingsState: [],
    homeRearFog: !1,
    advancedBusyId: "",
    healthBusyId: "",
    batteryHeatBusy: !1,
    healthPanel: {
      batteryIconPath: f,
      rangeIconPath: p,
      batteryHeatIconPath: v,
      batteryHeatActive: !1,
      batteryHeatBusy: !1,
      batteryHeatDisabled: !0,
      batteryPercent: "--",
      batteryPercentValue: "--",
      batteryPercentUnit: "",
      batteryValue: 0,
      range: "--",
      rangeValue: "--",
      rangeUnit: "",
      odometer: "----",
      odometerValue: "----",
      odometerUnit: "",
      fromCache: !1,
      cacheNotice: "",
      cacheUpdatedAt: ""
    },
    healthActions: [],
    tripCards: [],
    tripCurrent: 0,
    tripHasRecords: !1,
    tripPanelStyle: "min-height:168rpx;",
    quickPanelActions: [],
    actions: [],
    quickActions: [],
    homeShortcutQuickIcon: "/assets/icons/generated/action-sparkles@72.png",
    homeShortcutQuickBadge: "",
    homeShortcutQuickDisabled: !1,
    homeShortcutApIcon: "/assets/icons/generated/action-eye@72.png",
    homeShortcutApBadge: "",
    homeShortcutApDisabled: !1
  },
  onLoad: function() {
    var e = this;
    this.stateHandler = this.syncState.bind(this), this.homeGaugePacketHandler = this.handleHomeGaugePacket.bind(this), this.homeConfigPacketHandler = this.handleHomeConfigPacket.bind(this), o.onPacket("state", this.stateHandler), [160, 161, 163].forEach((function(t) {
      return o.onPacket(t, e.homeConfigPacketHandler)
    })), this.updateTripPanelLayout(), this.syncAccessLock()
  },
  onResize: function() {
    this.updateTripPanelLayout()
  },
  onShow: function() {
    var e = this,
      t = !!wx.getStorageSync("isAutoGauge");
    this.visible = !0, this.syncAccessLock(), this.startHomeGaugeSnapshot(), o.syncTabBar(this, 0), this.syncState(o.globalData.connected, o.globalData.deviceInfo), this.syncHomeConfigFromDeviceInfo(), this.setData({
      isAutoGauge: t
    }), this.refreshTripCards(), o.globalData.connected ? (o.queryDeviceInfo(), this.requestHomeGaugeSnapshot(), this.tryAutoOpenGauge()) : o.storageDeviceId() && o.autoConnectFromStorage().then((function(t) {
      t && (e.requestHomeGaugeSnapshot(), e.tryAutoOpenGauge())
    })).catch((function() {}))
  },
  onHide: function() {
    this.visible = !1, this.stopHomeGaugeSnapshot()
  },
  syncAccessLock: function() {
    var e = o.getAccessPasswordMeta ? o.getAccessPasswordMeta() : {
      minLength: 0,
      maxLength: 32,
      hint: "访问密码"
    };
    this.setData({
      accessLocked: !1,
      accessPassword: "",
      accessPasswordError: "",
      accessPasswordHint: e.hint,
      accessPasswordMax: e.maxLength,
      accessPasswordProgress: this.buildAccessPasswordProgress(0, e),
      accessPasswordReady: !1,
      accessInputFocus: !1
    })
  },
  buildAccessPasswordProgress: function(e, t) {
    var a = Math.max(Number(t && t.minLength) || 0, 1),
      n = Math.max(0, Number(e) || 0);
    return Array.from({
      length: a
    }).map((function(e, t) {
      return {
        active: n > t
      }
    }))
  },
  inputAccessPassword: function(e) {
    var t = o.getAccessPasswordMeta ? o.getAccessPasswordMeta() : {
        minLength: 0,
        maxLength: 32,
        hint: "访问密码"
      },
      a = e && e.detail ? e.detail.value : "",
      n = String(a || "").slice(0, t.maxLength);
    this.setData({
      accessPassword: n,
      accessPasswordError: "",
      accessPasswordProgress: this.buildAccessPasswordProgress(n.length, t),
      accessPasswordReady: n.length >= Number(t.minLength || 0),
      accessInputFocus: !0
    })
  },
  submitAccessPassword: function() {
    var e = o.getAccessPasswordMeta ? o.getAccessPasswordMeta() : {
        minLength: 0,
        hint: "访问密码"
      },
      t = String(this.data.accessPassword || "").trim();
    if (t.length < Number(e.minLength || 0)) this.setData({
      accessPasswordError: "请输入".concat(e.hint),
      accessInputFocus: !0
    });
    else {
      var a = o.applyAccessPassword(t);
      a.ok ? (this.setData({
        accessLocked: !1,
        accessPassword: "",
        accessPasswordError: "",
        accessPasswordProgress: this.buildAccessPasswordProgress(0, e),
        accessPasswordReady: !1,
        accessInputFocus: !1
      }), o.syncTabBar(this, 0), this.syncState(o.globalData.connected, o.globalData.deviceInfo), o.msg(a.message, 1)) : this.setData({
        accessPassword: "",
        accessPasswordError: a.message,
        accessPasswordProgress: this.buildAccessPasswordProgress(0, e),
        accessPasswordReady: !1,
        accessInputFocus: !0
      })
    }
  },
  focusAccessPassword: function() {
    this.data.accessLocked && this.setData({
      accessInputFocus: !0
    })
  },
  noop: function() {},
  tryAutoOpenGauge: function() {
    var e = this;
    wx.getStorageSync("isAutoGauge") && o.globalData.connected && !this.autoGaugeNavigated && !this.autoGaugeNavigating && (this.autoGaugeNavigating = !0, this.autoGaugeNavigated = !0, this.prepareGaugeEntry(), wx.navigateTo({
      url: "/pages/gauge/gauge",
      complete: function() {
        e.autoGaugeNavigating = !1
      }
    }))
  },
  buildQuickStateFromGauge: function(e, t) {
    return e ? {
      homeFrunkOpen: !!t.frunkIsOpen,
      homeTrunkOpen: !!t.trunkIsOpen,
      homeAcActive: Number(t.hvacBlowerSpeedRPM || 0) > 0,
      homeBatteryHeat: !!t.battHeat
    } : {
      homeLocked: !0,
      homeFrunkOpen: !1,
      homeTrunkOpen: !1,
      homeAcActive: !1,
      homeChargeOpen: !1,
      homeBatteryHeat: !1,
      homeFrontStrobe: !1,
      homeRearStrobe: !1,
      homePulseHorn: !1,
      homeAirDryMode: 0,
      homeRearFog: !1,
      advancedBusyId: "",
      healthBusyId: "",
      batteryHeatBusy: !1
    }
  },
  syncHomeConfigFromDeviceInfo: function() {
    var e = o.globalData.deviceInfo || {};
    o.globalData.connected && e.buf && e.buf.length >= 35 && this.handleHomeConfigPacket(160, e.buf)
  },
  handleHomeConfigPacket: function(e, t) {
    if (!([160, 161, 163].indexOf(e) < 0 || !t || t.length < 35)) {
      var n = a.buildState(t, this.data.homeSettingsState, o.globalData.connected),
        s = n.find((function(e) {
          return "airAutoArid" === e.id
        })),
        i = s ? Number(s.value || 0) : 0,
        c = Object.assign({}, this.data, {
          homeAirDryMode: i,
          homeSettingsRawConfig: Array.prototype.slice.call(t),
          homeSettingsState: n
        });
      this.setData({
        homeAirDryMode: i,
        homeSettingsRawConfig: c.homeSettingsRawConfig,
        homeSettingsState: n,
        quickPanelActions: this.buildQuickPanelActions(o.globalData.connected, c)
      })
    }
  },
  formatHealthOdometer: function(e, t) {
    return e && t && t.odometer && ("0.0km" !== t.odometer || t.hasFullFrame) ? t.odometer : "----"
  },
  syncState: function(e, a) {
    var n, s, i = !!e,
      c = !!o.globalData.mockConnected,
      r = o.globalData.lastGaugeState || t.createEmptyGaugeState(),
      h = this.buildQuickStateFromGauge(i, r),
      u = Object.assign({}, this.data, h),
      d = (n = o.getLastConnectionAt ? o.getLastConnectionAt() : 0, (s = G(n)) ? "最近一次连接 ".concat(s) : "暂无连接记录"),
      l = i ? c ? {
        mode: "mock",
        label: "模拟连接",
        desc: d,
        tone: "amber"
      } : {
        mode: "online",
        label: "实时在线",
        desc: d,
        tone: "ready"
      } : {
        mode: "offline",
        label: "离线",
        desc: d,
        tone: "muted"
      };
    this.setData({
      connected: i,
      mockConnected: c,
      connectionStatus: l,
      authStatus: o.globalData.authStatus,
      authMessage: o.globalData.authMessage,
      homeLocked: u.homeLocked,
      homeFrunkOpen: u.homeFrunkOpen,
      homeTrunkOpen: u.homeTrunkOpen,
      homeAcActive: u.homeAcActive,
      homeChargeOpen: u.homeChargeOpen,
      homeBatteryHeat: u.homeBatteryHeat,
      homeFrontStrobe: u.homeFrontStrobe,
      homeRearStrobe: u.homeRearStrobe,
      homePulseHorn: u.homePulseHorn,
      homeAirDryMode: u.homeAirDryMode,
      homeSettingsRawConfig: u.homeSettingsRawConfig,
      homeSettingsState: u.homeSettingsState,
      homeRearFog: u.homeRearFog,
      advancedBusyId: u.advancedBusyId,
      healthBusyId: u.healthBusyId,
      batteryHeatBusy: u.batteryHeatBusy,
      healthPanel: this.buildHealthPanel(i, u),
      healthActions: this.buildHealthActions(i, u),
      quickPanelActions: this.buildQuickPanelActions(i, u),
      actions: this.getPageActions(i),
      quickActions: this.getHomeQuickActions(i),
      homeShortcutQuickDisabled: !i,
      homeShortcutQuickBadge: i ? "在线" : "离线",
      homeShortcutApDisabled: !i,
      homeShortcutApBadge: i ? "在线" : "离线"
    }), i && this.visible ? this.startHomeGaugeSnapshot() : this.stopHomeGaugeSnapshot()
  },
  buildQuickPanelActions: function(e, t) {
    var a = t || this.data;
    return this.buildAdvancedActions(e, a)
  },
  buildHealthPanel: function(e, a) {
    var n = o.globalData.lastGaugeState || t.createEmptyGaugeState(),
      s = a || this.data,
      i = e && !!s.homeBatteryHeat,
      c = !!s.batteryHeatBusy || !!s.healthBusyId,
      r = o.getHomeHealthCache ? o.getHomeHealthCache() : null,
      h = r ? G(r.updatedAt) : "",
      u = function(e) {
        return !(!e || !e.hasFullFrame) && "0.0km" !== String(e.odometer || "")
      }(n),
      d = e ? u ? n.batteryPercent : "--" : r ? r.batteryPercent : "--",
      l = e ? u ? n.remainRange : "--" : r ? r.range : "--",
      g = e ? u ? this.formatHealthOdometer(e, n) : "--" : r ? r.odometer : "----",
      m = O(d, "%"),
      b = O(l, "km"),
      A = O(g, "km"),
      P = e && u ? Number.parseFloat(n.batteryPercent) || 0 : r ? r.batteryValue : 0,
      S = e && u ? Number.parseFloat(n.remainRange) || 0 : r && Number.parseFloat(r.range) || 0,
      k = Math.min(S / 433, 1);
    return {
      batteryIconPath: f,
      rangeIconPath: p,
      batteryIconColor: P <= 20 ? "#ef4444" : P <= 50 ? "#f59e0b" : "#00f0ff",
      rangeIconColor: k <= .2 ? "#ef4444" : k <= .5 ? "#f59e0b" : "#0df2a3",
      batteryHeatIconPath: i ? y : v,
      batteryHeatActive: i,
      batteryHeatBusy: c,
      batteryHeatDisabled: !e || c,
      batteryPercent: d,
      batteryPercentValue: m.value,
      batteryPercentUnit: m.unit,
      batteryValue: P,
      range: l,
      rangeValue: b.value,
      rangeUnit: b.unit,
      odometer: g,
      odometerValue: A.value,
      odometerUnit: A.unit,
      fromCache: !!r && !e,
      cacheUpdatedAt: h,
      cacheNotice: r && !e ? "最近一次".concat(r.mockConnected ? "模拟" : "", "连接缓存 · ").concat(h) : ""
    }
  },
  buildHealthActions: function(e, t) {
    var a = t || this.data,
      n = !1 !== a.homeLocked,
      s = !!a.homeFrunkOpen,
      o = !!a.homeTrunkOpen,
      f = !!a.homeAcActive,
      p = !!a.homeChargeOpen,
      v = a.healthBusyId || "";
    return [{
      id: "lock",
      label: n ? "解锁车辆" : "锁定车辆",
      iconPath: n ? i : c,
      active: e && n
    }, {
      id: "frunk",
      label: s ? "关闭前备箱" : "打开前备箱",
      iconPath: s ? h : r,
      active: e && s
    }, {
      id: "trunk",
      label: o ? "关闭后备箱" : "打开后备箱",
      iconPath: o ? d : u,
      active: e && o
    }, {
      id: "hvac",
      label: f ? "空调状态运行中" : "空调状态已关闭",
      iconPath: f ? g : l,
      active: e && f
    }, {
      id: "charge",
      label: p ? "关闭充电口" : "打开充电口",
      iconPath: p ? b : m,
      active: e && p
    }].map((function(t) {
      return Object.assign({}, t, {
        busy: v === t.id,
        disabled: !e
      })
    }))
  },
  refreshTripCards: function(e) {
    var t = e || s.buildView();
    this.setData({
      tripCards: t.cards,
      tripHasRecords: t.cards.length > 0,
      tripCurrent: Math.min(this.data.tripCurrent || 0, Math.max(t.cards.length - 1, 0))
    })
  },
  updateTripPanelLayout: function() {
    var e = this.getWindowInfoSafe(),
      t = Number(e.windowWidth || 0),
      a = Number(e.windowHeight || 0),
      n = t > 0 ? 750 * a / t : 1334,
      s = Math.max(0, n - 1334),
      o = Math.max(0, 1334 - n),
      i = Math.max(88, 96 - Math.round(.24 * o)),
      c = Math.min(108, i + Math.round(.035 * s));
    this.setData({
      tripPanelStyle: "height:".concat(c, "rpx;min-height:").concat(88, "rpx;")
    })
  },
  getWindowInfoSafe: function() {
    return "undefined" != typeof wx && wx.getWindowInfo ? wx.getWindowInfo() : "undefined" != typeof wx && wx.getSystemInfoSync ? wx.getSystemInfoSync() : {
      windowWidth: 375,
      windowHeight: 667
    }
  },
  changeTripCard: function(e) {
    var t = e && e.detail ? Number(e.detail.current || 0) : 0;
    this.setData({
      tripCurrent: t
    })
  },
  openTrips: function() {
    wx.navigateTo({
      url: "/pages/trips/trips"
    })
  },
  handleStatusBarTap: function() {
    this.data.connected ? wx.navigateTo({
      url: "/pages/deviceInfo/deviceInfo"
    }) : wx.switchTab({
      url: "/pages/ble/ble"
    })
  },
  buildAdvancedActions: function(e, t) {
    var a = t || this.data,
      n = a.advancedBusyId || "";
    return [{
      id: "frontStrobe",
      label: "前爆闪",
      toastOn: "前爆闪已开启",
      toastOff: "前爆闪已关闭",
      command: 91,
      active: !!a.homeFrontStrobe,
      iconPath: a.homeFrontStrobe ? P : A,
      tone: "indigo"
    }, {
      id: "rearStrobe",
      label: "后爆闪",
      toastOn: "后爆闪已开启",
      toastOff: "后爆闪已关闭",
      command: 94,
      active: !!a.homeRearStrobe,
      iconPath: a.homeRearStrobe ? k : S,
      tone: "rose"
    }, {
      id: "pulseHorn",
      label: "脉冲鸣笛",
      toastOn: "脉冲鸣笛已开启",
      toastOff: "脉冲鸣笛已关闭",
      command: 90,
      active: !!a.homePulseHorn,
      iconPath: a.homePulseHorn ? w : H,
      tone: "amber"
    }, {
      id: "airDry",
      label: "空调烘干",
      toastOn: "空调烘干已设为5分钟",
      toastOff: "空调烘干已关闭",
      active: Number(a.homeAirDryMode || 0) > 0,
      iconPath: Number(a.homeAirDryMode || 0) > 0 ? g : l,
      tone: "cyan"
    }, {
      id: "rearFog",
      label: "后雾灯",
      toastOn: "后雾灯领航已开启",
      toastOff: "后雾灯领航已关闭",
      command: 95,
      active: !!a.homeRearFog,
      iconPath: a.homeRearFog ? I : D,
      tone: "fuchsia"
    }].map((function(t) {
      return Object.assign({}, t, {
        busy: n === t.id,
        disabled: !(e && !n && !a.healthBusyId && !a.batteryHeatBusy),
        compact: !1
      })
    }))
  },
  getPageActions: function(t) {
    return e.list("status", {
      connected: t,
      accessMode: o.getAccessMode(),
      adminLevel: o.isAdmin(),
      mockConnected: o.globalData.mockConnected,
      deviceInfo: o.globalData.deviceInfo
    })
  },
  getHomeQuickActions: function(e) {
    var t = {};
    this.getPageActions(e).forEach((function(e) {
      t[e.id] = e
    }));
    return ["gauge", "vehicleControl", "btn"].map((function(a) {
      var n = Object.assign({}, t[a]);
      if (!n.id) return n;
      var s = {
        gauge: {
          name: "仪表盘",
          desc: "实时车速、电量与车况 HUD",
          homeBadge: e ? "在线" : "离线"
        },
        vehicleControl: {
          desc: "车门、前后备箱与座椅控制",
          homeBadge: e ? "在线" : "离线"
        },
        btn: {
          desc: "绑定方向盘与模块按键",
          homeBadge: e ? "在线" : "离线"
        }
      };
      return Object.assign(n, s[a])
    })).filter((function(e) {
      return e.id
    }))
  },
  autoGauge: function(e) {
    var t = e && e.detail && "boolean" == typeof e.detail.value ? e.detail.value : !this.data.isAutoGauge;
    wx.setStorageSync("isAutoGauge", t), this.setData({
      isAutoGauge: t
    }), t || (this.autoGaugeNavigated = !1)
  },
  startHomeGaugeSnapshot: function() {
    this.homeGaugeSnapshotActive || (this.homeGaugeSnapshotActive = !0, o.onPacket(176, this.homeGaugePacketHandler), this.scheduleHomeGaugeSnapshot(0))
  },
  stopHomeGaugeSnapshot: function() {
    this.homeGaugeSnapshotTimer && (clearTimeout(this.homeGaugeSnapshotTimer), this.homeGaugeSnapshotTimer = null), this.homeGaugeSnapshotActive && (o.cacheHomeHealthSnapshot && o.cacheHomeHealthSnapshot("homeHide"), this.homeGaugeSnapshotActive = !1, o.offPacket(176, this.homeGaugePacketHandler), o.globalData.connected && this.homeGaugeSnapshotStarted && o.tx(176, new Uint8Array([0]), {
      source: "homeGauge"
    }).catch((function() {})), this.homeGaugeSnapshotStarted = !1)
  },
  scheduleHomeGaugeSnapshot: function(e) {
    var t = this;
    this.visible && this.homeGaugeSnapshotActive && (this.homeGaugeSnapshotTimer && clearTimeout(this.homeGaugeSnapshotTimer), this.homeGaugeSnapshotTimer = setTimeout((function() {
      t.requestHomeGaugeSnapshot(), t.scheduleHomeGaugeSnapshot(1500)
    }), "number" == typeof e ? e : 1500))
  },
  requestHomeGaugeSnapshot: function() {
    this.visible && o.globalData.connected && (this.homeGaugeSnapshotStarted = !0, o.tx(176, new Uint8Array([1]), {
      source: "homeGauge"
    }).catch((function() {})))
  },
  handleHomeGaugePacket: function(e, a) {
    if (176 === e && this.visible) {
      var n = this.homeGaugeState || o.globalData.lastGaugeState || t.createEmptyGaugeState();
      this.homeGaugeState = t.parseGaugeFrame(a, n, {
        now: Date.now()
      }), o.globalData.lastGaugeState = this.homeGaugeState, this.refreshTripCards(s.updateFromGauge(this.homeGaugeState, Date.now())), o.cacheHomeHealthSnapshot && o.cacheHomeHealthSnapshot("homeGauge"), this.syncState(o.globalData.connected, o.globalData.deviceInfo)
    }
  },
  handleAction: function(e) {
    this.openAction(e.detail.id)
  },
  handleFeatureTap: function(e) {
    var t = e.currentTarget.dataset.disabled,
      a = !0 === t || "true" === t,
      n = e.currentTarget.dataset.id;
    a ? this.handleDisabled() : this.openAction(n)
  },
  handleHealthAction: function(e) {
    var t = e.currentTarget.dataset.id;
    this.handleBasicQuickAction(t)
  },
  handleBasicQuickAction: function(e) {
    var t = (this.data.quickPanelActions || []).find((function(t) {
      return t.id === e
    })) || (this.data.healthActions || []).find((function(t) {
      return t.id === e
    }));
    if (t)
      if (o.globalData.connected) {
        if (!this.data.healthBusyId && !this.data.batteryHeatBusy) {
          var a = this.resolveHealthCommand(e);
          if (!a) return "hvac" === e ? (this.requestHomeGaugeSnapshot(), void o.msg("已刷新空调运行状态", -1, 1800)) : void o.msg("当前快捷控制未恢复", 0);
          this.runHealthCommand(e, t.label, a)
        }
      } else o.msg("请先连接蓝牙", 0);
    else o.msg("功能入口暂未恢复", 0)
  },
  handleQuickPanelAction: function(e) {
    var t = e && e.currentTarget && e.currentTarget.dataset || {},
      a = this.resolveQuickPanelAction(t),
      n = a ? a.id : "";
    this.isAdvancedAction(n) ? this.handleAdvancedAction(n) : this.handleBasicQuickAction(n)
  },
  resolveQuickPanelAction: function(e) {
    var t = e || {},
      a = t.id || t.actionId || "";
    if (a) return {
      id: a
    };
    var n = Number(t.index),
      s = this.data.quickPanelActions || [];
    return Number.isInteger(n) && s[n] ? s[n] : null
  },
  isAdvancedAction: function(e) {
    return ["frontStrobe", "rearStrobe", "pulseHorn", "airDry", "rearFog"].indexOf(e) >= 0
  },
  handleAdvancedAction: function(e) {
    var t = (this.data.quickPanelActions || []).find((function(t) {
      return t.id === e
    }));
    if (t)
      if (o.globalData.connected) {
        if (!(this.data.advancedBusyId || this.data.healthBusyId || this.data.batteryHeatBusy))
          if ("airDry" !== e) {
            var a = this.resolveAdvancedPatch(e, !t.active);
            a ? this.runAdvancedCommand(t, a) : o.msg("高级快捷入口暂未恢复", 0)
          } else this.handleAirDryAction(t)
      } else o.msg("请先连接蓝牙", 0);
    else o.msg("高级快捷入口暂未恢复", 0)
  },
  resolveAdvancedPatch: function(e, t) {
    return {
      frontStrobe: {
        homeFrontStrobe: t
      },
      rearStrobe: {
        homeRearStrobe: t
      },
      pulseHorn: {
        homePulseHorn: t
      },
      rearFog: {
        homeRearFog: t
      }
    } [e] || null
  },
  resolveHomeSettingsPayload: function() {
    var e = this.data.homeSettingsRawConfig || [];
    if (e.length >= 35) return new Uint8Array(e);
    var t = o.globalData.deviceInfo || {};
    return t.buf && t.buf.length >= 35 ? new Uint8Array(t.buf) : null
  },
  handleAirDryAction: function(e) {
    var t = this,
      n = this.resolveHomeSettingsPayload();
    if (!n) return o.msg("请先读取模块设置", 0), void o.queryDeviceInfo().catch((function() {}));
    var s = o.globalData.connected,
      i = this.data.homeSettingsState && this.data.homeSettingsState.length ? this.data.homeSettingsState : a.buildState(n, null, s),
      c = Number(this.data.homeAirDryMode || 0) > 0 ? 0 : 2,
      r = a.updateState(i, "airAutoArid", c, s),
      h = a.writeBytes(n, r, {
        deviceInfo: o.globalData.deviceInfo
      }),
      u = Object.assign({}, this.data, {
        advancedBusyId: e.id
      });
    this.setData({
      advancedBusyId: e.id,
      quickPanelActions: this.buildQuickPanelActions(!0, u)
    }), o.setCheckData && o.setCheckData(163, h), o.tx(163, h, {
      source: "homeAirDry"
    }).then((function() {
      var a = Object.assign({}, t.data, {
        homeAirDryMode: c,
        homeSettingsRawConfig: Array.prototype.slice.call(h),
        homeSettingsState: r,
        advancedBusyId: ""
      });
      t.setData({
        homeAirDryMode: c,
        homeSettingsRawConfig: a.homeSettingsRawConfig,
        homeSettingsState: r,
        advancedBusyId: "",
        quickPanelActions: t.buildQuickPanelActions(!0, a)
      }), o.msg(c > 0 ? e.toastOn : e.toastOff, 1, 1200)
    })).catch((function(e) {
      var a = Object.assign({}, t.data, {
        advancedBusyId: ""
      });
      t.setData({
        advancedBusyId: "",
        quickPanelActions: t.buildQuickPanelActions(!0, a)
      }), o.msg(e && e.message || "空调烘干发送失败", 0, 2200)
    }))
  },
  runAdvancedCommand: function(e, t) {
    var a = this,
      s = Object.assign({}, this.data, {
        advancedBusyId: e.id
      });
    this.setData({
      advancedBusyId: e.id,
      quickPanelActions: this.buildQuickPanelActions(!0, s)
    }), n.execute(o, e.command, e.label, {
      kind: "fun",
      source: "homeQuick"
    }).then((function() {
      var n = Object.assign({}, a.data, t, {
        advancedBusyId: ""
      });
      a.setData(Object.assign({}, t, {
        advancedBusyId: "",
        quickPanelActions: a.buildQuickPanelActions(!0, n)
      })), o.msg(e.active ? e.toastOff : e.toastOn, 1, 1200)
    })).catch((function(t) {
      var n = Object.assign({}, a.data, {
        advancedBusyId: ""
      });
      a.setData({
        advancedBusyId: "",
        quickPanelActions: a.buildQuickPanelActions(!0, n)
      }), o.msg(t && t.message || "".concat(e.label, "发送失败"), 0, 2200)
    }))
  },
  handleBatteryHeat: function() {
    var e = this;
    if (o.globalData.connected) {
      if (!this.data.batteryHeatBusy && !this.data.healthBusyId) {
        var t = !this.data.homeBatteryHeat,
          a = t ? 5 : 4,
          n = Object.assign({}, this.data, {
            batteryHeatBusy: !0
          });
        this.setData({
          batteryHeatBusy: !0,
          healthPanel: this.buildHealthPanel(!0, n),
          quickPanelActions: this.buildQuickPanelActions(!0, n)
        }), o.tx(167, new Uint8Array([a])).then((function() {
          var a = Object.assign({}, e.data, {
            homeBatteryHeat: t,
            batteryHeatBusy: !1
          });
          e.setData({
            homeBatteryHeat: t,
            batteryHeatBusy: !1,
            healthPanel: e.buildHealthPanel(!0, a),
            quickPanelActions: e.buildQuickPanelActions(!0, a)
          }), o.msg(t ? "电池加热已开启" : "电池加热已关闭", !1, 1200)
        })).catch((function(t) {
          var a = Object.assign({}, e.data, {
            batteryHeatBusy: !1
          });
          e.setData({
            batteryHeatBusy: !1,
            healthPanel: e.buildHealthPanel(!0, a),
            quickPanelActions: e.buildQuickPanelActions(!0, a)
          }), o.msg(t && t.message || "电池加热发送失败", 0, 2200)
        }))
      }
    } else o.msg("请先连接蓝牙", 0)
  },
  resolveHealthCommand: function(e) {
    switch (e) {
      case "lock":
        return {
          code: this.data.homeLocked ? 23 : 22,
            patch: {
              homeLocked: !this.data.homeLocked
            }
        };
      case "frunk":
        return {
          code: 8,
            patch: {
              homeFrunkOpen: !this.data.homeFrunkOpen
            }
        };
      case "trunk":
        return {
          code: 9,
            patch: {
              homeTrunkOpen: !this.data.homeTrunkOpen
            }
        };
      case "hvac":
        return null;
      case "charge":
        return {
          code: this.data.homeChargeOpen ? 6 : 7,
            patch: {
              homeChargeOpen: !this.data.homeChargeOpen
            }
        };
      default:
        return null
    }
  },
  runHealthCommand: function(e, t, a) {
    var n = this,
      s = Object.assign({}, this.data, {
        healthBusyId: e
      });
    this.setData({
      healthBusyId: e,
      healthActions: this.buildHealthActions(!0, s),
      quickPanelActions: this.buildQuickPanelActions(!0, s)
    }), o.tx(167, new Uint8Array([a.code])).then((function() {
      var e = Object.assign({}, n.data, a.patch, {
        healthBusyId: ""
      });
      n.setData(Object.assign({}, a.patch, {
        healthBusyId: "",
        healthActions: n.buildHealthActions(!0, e),
        quickPanelActions: n.buildQuickPanelActions(!0, e)
      })), n.requestHomeGaugeSnapshot(), o.msg("".concat(t, "已发送"), 1, 1200)
    })).catch((function(e) {
      var a = Object.assign({}, n.data, {
        healthBusyId: ""
      });
      n.setData({
        healthBusyId: "",
        healthActions: n.buildHealthActions(!0, a),
        quickPanelActions: n.buildQuickPanelActions(!0, a)
      }), o.msg(e && e.message || "".concat(t, "发送失败"), 0, 2200)
    }))
  },
  openAction: function(t) {
    var a = {
      ble: "/pages/ble/ble",
      gauge: "/pages/gauge/gauge",
      btn: "/pages/btn/btn",
      vehicleControl: "/pages/vehicleControl/vehicleControl",
      settingsQuick: "/pages/advancedSettings/advancedSettings?scope=quick",
      settingsAp: "/pages/advancedSettings/advancedSettings?scope=ap"
    } [t];
    if (a) {
      var n = e.getEntry(t);
      !n || !n.requiresConnection || n.allowsOfflineView || o.globalData.connected ? "ble" === t ? wx.switchTab({
        url: a
      }) : ("gauge" === t && this.prepareGaugeEntry(), wx.navigateTo({
        url: a
      })) : o.msg("请先连接蓝牙", 0)
    }
  },
  prepareGaugeEntry: function() {
    wx.setStorageSync("gaugeEntryTransition", {
      source: "home",
      ts: Date.now()
    })
  },
  handleDisabled: function() {
    o.msg("请先连接蓝牙", 0)
  },
  handleShortcutTap: function(t) {
    var a = t.currentTarget.dataset.id,
      n = e.getEntry(a);
    n && n.requiresConnection && !o.globalData.connected ? o.msg("请先连接蓝牙", 0) : this.openAction(a)
  },
  onUnload: function() {
    var e = this;
    this.stopHomeGaugeSnapshot(), o.offPacket("state", this.stateHandler), [160, 161, 163].forEach((function(t) {
      return o.offPacket(t, e.homeConfigPacketHandler)
    }))
  }
});