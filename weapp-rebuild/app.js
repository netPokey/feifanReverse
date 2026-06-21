var e = require("./@babel/runtime/helpers/typeof"),
  t = require("./services/ble"),
  a = require("./services/api"),
  n = require("./services/device"),
  o = require("./utils/format"),
  i = require("./services/mockBle"),
  s = require("./services/commandSafety"),
  r = require("./services/accessMode"),
  c = require("./services/automationRunner"),
  h = require("./services/automationTriggers"),
  l = require("./services/superShortcutRuntime"),
  u = require("./services/moduleAutoSwitch"),
  g = require("./services/gaugeParser"),
  d = require("./services/gaugeEvents"),
  m = require("./services/tripStore");

function f(e, t) {
  var a = String(e || "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(a) ? a : t
}

function S(e) {
  var t = f(e, "18:00").split(":");
  return 60 * Number(t[0]) + Number(t[1])
}

function p(e) {
  if ("" === e || null == e) return 50;
  var t = Number(e);
  return Number.isFinite(t) ? Math.max(50, Math.min(100, Math.round(t))) : 50
}
App({
  globalData: {
    connected: !1,
    transportConnected: !1,
    mockConnected: !1,
    authStatus: "idle",
    authMessage: "未连接",
    accessMode: "normal",
    accessReady: !0,
    automationSessionNo: 0,
    currentDeviceId: "",
    deviceInfo: n.createEmptyDeviceInfo(),
    lastGaugeState: null,
    lastConnectedAt: 0,
    themeMode: "day",
    rxHandlers: {}
  },
  authSession: {
    promise: null,
    resolve: null,
    reject: null,
    timer: null,
    retryTimer: null,
    prompting: !1,
    submittedKey: "",
    deviceInfoCheck: !1
  },
  connectPromise: null,
  autoConnectPromise: null,
  toastTimer: null,
  toastHideTimer: null,
  pendingAckToasts: {},
  modalSession: null,
  onLaunch: function() {
    wx.setEnableDebug({
      enableDebug: !1
    }), this.globalData.accessMode = r.getMode(), this.globalData.accessReady = !0, this.globalData.lastConnectedAt = Number(wx.getStorageSync("lastBleConnectedAt") || 0), this.globalData.themeMode = this.getThemeMode(), this.syncSystemNavigationBar(this.globalData.themeMode), this.ensureAccessMode(), t.init({
      onConnected: this.handleBleConnected.bind(this),
      onDisconnected: this.handleBleDisconnected.bind(this),
      onPacket: this.dispatchPacket.bind(this)
    })
  },
  onShow: function() {
    this.globalData.connected && this.canRunAutomation() && h.handleEvent(this, "APP_SHOW_CONNECTED").catch((function() {})), this.globalData.connected && u.handleAppShowConnected(this).catch((function() {}))
  },
  onHide: function() {
    this.cacheHomeHealthSnapshot("appHide"), u.handleAppHide(this).catch((function() {})), n.stopRuntimeTasks()
  },
  suppressModuleAutoSwitchAppHide: function(e, t) {
    u.suppressNextAppHide(this, e, t)
  },
  handleBleConnected: function(e) {
    var t = this.globalData.currentDeviceId === e;
    t && this.globalData.connected || (t && this.globalData.transportConnected && this.authSession.promise || (this.resetAuthSession(), this.globalData.transportConnected = !0, this.globalData.connected = !1, this.globalData.mockConnected = i.isEnabled(), this.globalData.authStatus = "pending", this.globalData.authMessage = "等待蓝牙密码验证", this.globalData.currentDeviceId = e, this.globalData.mockConnected || this.storageDeviceId(e)), this.emitState())
  },
  handleBleDisconnected: function() {
    this.rejectAuthSession(new Error("蓝牙连接已断开")), c.cancel("蓝牙已断开"), m.finishActive("bleDisconnected"), this.globalData.transportConnected = !1, this.globalData.connected = !1, this.globalData.mockConnected = !1, this.globalData.authStatus = "idle", this.globalData.authMessage = "未连接", this.globalData.deviceInfo = n.createEmptyDeviceInfo(), this.emitState()
  },
  dispatchPacket: function(e, t) {
    if ([160, 161, 163].indexOf(e) >= 0 && (this.globalData.deviceInfo = n.parseDeviceInfo(t, this.globalData.deviceInfo), this.authSession.submittedKey && this.authSession.deviceInfoCheck && "checking" === this.globalData.authStatus && this.completeBleAuth("蓝牙密码正确", !0), this.emitState(), this.loadDeviceMeta(this.globalData.deviceInfo)), 168 === e && this.handleBleKeyResponse(t), 169 === e && t && t.length && this.msg(["原密码错误", "密码修改成功", "密码位数不对"][t[0]] || "密码修改返回未知状态", [0, 1, 0][t[0]] || 0), 167 === e && t && t.length && 1 === t[0] && this.msg(["保存失败，请重新调整座椅", "保存成功"][t[1]] || "座椅记忆返回未知状态", t[1] ? 1 : 0), 187 === e) {
      var a = this.consumePendingAckToast(187) || "指令已发送";
      this.msg(a, 1, 1e3), l.handleActionNotice(this, t).catch((function() {}))
    }
    176 === e && this.handleGaugePacket(t), (this.globalData.rxHandlers[e] || []).forEach((function(a) {
      return a(e, t)
    }))
  },
  handleGaugePacket: function(e) {
    if (e && !(e.length < 33)) {
      var t = Date.now(),
        a = this.globalData.lastGaugeState,
        n = g.parseGaugeFrame(e, a || g.createEmptyGaugeState(), {
          now: t
        });
      if (this.globalData.lastGaugeState = n, m.updateFromGauge(n, t), a && this.canRunAutomation()) {
        var o = d.detectGaugeEvents(a, n);
        o.length && (l.handleGaugeEvents(this, o).catch((function() {})), h.handleGaugeState(this, a, n).catch((function() {})))
      }
    }
  },
  loadDeviceMeta: function(e) {
    var t = this;
    if (e && e.id) {
      var o = "".concat(e.id, ":").concat(e.vin || "", ":").concat(this.isAdmin() ? 1 : 0),
        i = Date.now(),
        s = wx.getStorageSync("deviceinfo");
      s && s.id === e.id && !e.isload && (this.globalData.deviceInfo = n.mergeRemoteDeviceInfo(e, s), this.emitState()), this.deviceMetaKey === o && i - Number(this.deviceMetaTime || 0) < 6e4 || (this.deviceMetaKey = o, this.deviceMetaTime = i, a.getDeviceInfoMeta(e, this.isAdmin(), wx.getStorageSync("moveid")).then((function(a) {
        t.globalData.deviceInfo && t.globalData.deviceInfo.id === e.id && (t.globalData.deviceInfo = n.mergeRemoteDeviceInfo(t.globalData.deviceInfo, a), wx.setStorageSync("deviceinfo", t.globalData.deviceInfo), t.emitState())
      })).catch((function() {})))
    }
  },
  onPacket: function(e, t) {
    this.globalData.rxHandlers[e] || (this.globalData.rxHandlers[e] = []), this.globalData.rxHandlers[e].push(t)
  },
  offPacket: function(e, t) {
    var a = this.globalData.rxHandlers[e] || [];
    this.globalData.rxHandlers[e] = a.filter((function(e) {
      return e !== t
    }))
  },
  tx: function(e, a, n) {
    var o = s.validate(e, a, {
      route: this.getCurrentRoute(),
      adminLevel: this.isAdmin(),
      connected: this.globalData.connected,
      transportConnected: this.globalData.transportConnected,
      mockConnected: this.globalData.mockConnected,
      deviceInfo: this.globalData.deviceInfo,
      source: n && n.source,
      executeKind: n && n.executeKind
    });
    return o.ok ? (this.rememberPendingAckToast(o.type, n && n.ackMessage), this.globalData.mockConnected ? i.tx(o.type, o.payload) : t.tx(o.type, o.payload)) : (this.msg(o.message || "指令已被安全校验拦截", 0, 2400), Promise.reject(new Error(o.message || "指令已被安全校验拦截")))
  },
  rememberPendingAckToast: function(e, t) {
    var a = String(t || "").trim();
    a && (this.pendingAckToasts[e] = {
      title: a,
      expiresAt: Date.now() + 3e3
    })
  },
  consumePendingAckToast: function(e) {
    var t = this.pendingAckToasts && this.pendingAckToasts[e];
    return t ? (delete this.pendingAckToasts[e], Date.now() <= Number(t.expiresAt || 0) ? t.title : "") : ""
  },
  queryDeviceInfo: function() {
    return this.tx(160)
  },
  connect: function(e) {
    var a = this;
    return this.globalData.connected ? Promise.resolve({
      deviceId: this.globalData.currentDeviceId || e || this.storageDeviceId()
    }) : (this.connectPromise || (this.connectPromise = t.connect(e || this.storageDeviceId()).then((function(e) {
      return a.authenticateBleConnection().then((function() {
        return e
      }))
    })).then((function(e) {
      return a.connectPromise = null, e
    })).catch((function(e) {
      return a.connectPromise = null, Promise.reject(e)
    }))), this.connectPromise)
  },
  autoConnectFromStorage: function() {
    var e = this,
      t = this.storageDeviceId();
    return !t || this.globalData.connected || this.globalData.transportConnected ? Promise.resolve(!1) : (this.autoConnectPromise || (this.globalData.authStatus = "pending", this.globalData.authMessage = "正在自动连接上次模块", this.emitState(), this.autoConnectPromise = this.connect(t).then((function(t) {
      return e.autoConnectPromise = null, t
    })).catch((function(t) {
      return e.autoConnectPromise = null, e.globalData.connected || (e.globalData.authStatus = "idle", e.globalData.authMessage = "未连接", e.emitState()), Promise.reject(t)
    }))), this.autoConnectPromise)
  },
  connectMock: function() {
    var e = this;
    return this.globalData.connected && this.globalData.mockConnected ? Promise.resolve({
      deviceId: this.globalData.currentDeviceId || "MOCK_TSL_DEVICE"
    }) : (this.connectPromise || (this.connectPromise = i.connect(this.dispatchPacket.bind(this)).then((function(t) {
      return e.handleBleConnected(t.deviceId), e.completeBleAuth("验证模块已连接", !0), e.queryDeviceInfo().catch((function() {})), t
    })).then((function(t) {
      return e.connectPromise = null, t
    })).catch((function(t) {
      return e.connectPromise = null, Promise.reject(t)
    }))), this.connectPromise)
  },
  disconnectMock: function() {
    i.disconnect(), this.handleBleDisconnected()
  },
  authenticateBleConnection: function() {
    var e = this;
    if (this.globalData.connected) return Promise.resolve();
    if (!this.globalData.transportConnected && !this.globalData.mockConnected) return Promise.reject(new Error("蓝牙链路未就绪"));
    if (this.authSession.promise) return this.authSession.promise;
    var t = new Promise((function(t, a) {
      e.resetAuthSession(), e.authSession.resolve = t, e.authSession.reject = a, e.globalData.authStatus = "checking", e.globalData.authMessage = "正在验证蓝牙密码", e.emitState()
    }));
    return this.authSession.promise = t, this.handleBleKeyResponse(new Uint8Array([255])), this.globalData.connected || this.authSession.promise !== t || (this.authSession.timer = setTimeout((function() {
      e.rejectAuthSession(new Error("蓝牙密码验证超时"))
    }), 2e4)), t
  },
  handleBleKeyResponse: function(e) {
    var t = e && e.length ? e[0] : 255;
    if (this.globalData.transportConnected || this.globalData.mockConnected) {
      if (1 === t) return this.authSession.submittedKey && wx.setStorageSync("ble_key", this.authSession.submittedKey), wx.removeStorageSync("bleKeyErr"), void this.completeBleAuth("蓝牙密码正确");
      if (0 !== t) {
        if (254 !== t && 255 !== t || !this.authSession.submittedKey || "checking" !== this.globalData.authStatus) {
          if (255 === t) {
            var a = wx.getStorageSync("ble_key");
            if (a && 4 === String(a).length && this.getBleKeyRemain().remain > 0) return void this.sendBleKeyCheck(a, !0)
          }
          254 !== t && 255 !== t || this.promptBleKey()
        }
      } else this.handleBleKeyFailed()
    }
  },
  sendBleKeyCheck: function(e, t) {
    var a = this,
      n = String(e || "");
    return 4 !== n.length ? (this.promptBleKey("密码必须是4位字符"), Promise.reject(new Error("密码必须是4位字符"))) : (this.authSession.submittedKey = n, this.globalData.authStatus = "checking", this.globalData.authMessage = t ? "正在使用已保存密码验证" : "正在验证蓝牙密码", this.emitState(), this.tx(168, new Uint8Array([255 & n.charCodeAt(0), 255 & n.charCodeAt(1), 255 & n.charCodeAt(2), 255 & n.charCodeAt(3)]), {
      source: "auth"
    }).then((function() {
      a.authSession.deviceInfoCheck = !0, setTimeout((function() {
        "checking" === a.globalData.authStatus && a.queryDeviceInfo().catch((function() {}))
      }), 350)
    })).catch((function(e) {
      return a.rejectAuthSession(e), Promise.reject(e)
    })))
  },
  promptBleKey: function(e) {
    var t = this;
    if (!(this.authSession.prompting || "ok" === this.globalData.authStatus || this.authSession.submittedKey && "checking" === this.globalData.authStatus)) {
      wx.hideLoading(), e && this.msg(e, 0);
      var a = this.getBleKeyRemain();
      if (a.remain <= 0) return this.msg("密码验证失败次数过多，请 ".concat(a.waitSeconds, " 秒后重试"), 0, 3e3), void this.rejectAuthSession(new Error("密码验证失败次数过多"));
      this.authSession.prompting = !0, this.input("请输入蓝牙密码(默认:1234)", (function(e) {
        t.authSession.prompting = !1;
        var a = String(e.content || "");
        4 === a.length ? t.sendBleKeyCheck(a, !1) : setTimeout((function() {
          return t.promptBleKey("密码必须是4位字符")
        }), 600)
      }), (function() {
        t.authSession.prompting = !1, t.rejectAuthSession(new Error("已取消蓝牙密码验证"))
      }))
    }
  },
  handleBleKeyFailed: function() {
    var e = this,
      t = this.authSession.submittedKey;
    this.authSession.submittedKey = "", t && this.recordBleKeyFailure();
    var a = this.getBleKeyRemain();
    wx.removeStorageSync("ble_key"), this.globalData.authStatus = "failed", this.globalData.authMessage = "蓝牙密码错误", this.emitState(), this.msg("蓝牙密码错误，剩余".concat(Math.max(0, a.remain), "次"), 0, 2200), this.authSession.retryTimer && clearTimeout(this.authSession.retryTimer), this.authSession.retryTimer = setTimeout((function() {
      e.authSession.retryTimer = null, e.promptBleKey()
    }), 1e3)
  },
  completeBleAuth: function(e, t) {
    var a = this.authSession.resolve,
      n = this.authSession.submittedKey,
      o = this.globalData.connected && "ok" === this.globalData.authStatus;
    n && (wx.setStorageSync("ble_key", n), wx.removeStorageSync("bleKeyErr")), this.resetAuthSession(), this.globalData.connected = !0, this.globalData.authStatus = "ok", this.globalData.authMessage = e || "蓝牙已连接", o || (this.globalData.automationSessionNo = Number(this.globalData.automationSessionNo || 0) + 1, this.rememberLastConnectionAt(Date.now())), this.emitState(), t || this.queryDeviceInfo().catch((function() {})), a && a(), !o && this.canRunAutomation() && h.handleEvent(this, "BLE_AUTH_SUCCESS").catch((function() {})), o || u.handleBleAuthSuccess(this).catch((function() {}))
  },
  canRunAutomation: function() {
    return "full" === this.getAccessMode()
  },
  resetAuthSession: function(e) {
    this.authSession.timer && clearTimeout(this.authSession.timer), this.authSession.retryTimer && clearTimeout(this.authSession.retryTimer), this.authSession.timer = null, this.authSession.retryTimer = null, this.authSession.prompting = !1, this.authSession.submittedKey = "", this.authSession.deviceInfoCheck = !1, e || (this.authSession.promise = null, this.authSession.resolve = null, this.authSession.reject = null)
  },
  rejectAuthSession: function(e) {
    var t = this.authSession.reject;
    this.resetAuthSession(), t && t(e)
  },
  getBleKeyRemain: function() {
    var e = Date.now(),
      t = wx.getStorageSync("bleKeyErr");
    return t = t ? JSON.parse(t) : {
      count: 0,
      time: e
    }, e - Number(t.time || e) >= 36e5 && (t = {
      count: 0,
      time: e
    }, wx.setStorageSync("bleKeyErr", JSON.stringify(t))), {
      remain: 3 - Number(t.count || 0),
      waitSeconds: Math.max(0, 3600 - Math.floor((e - Number(t.time || e)) / 1e3))
    }
  },
  recordBleKeyFailure: function() {
    var e = Date.now(),
      t = wx.getStorageSync("bleKeyErr");
    t = t ? JSON.parse(t) : {
      count: 0,
      time: e
    }, e - Number(t.time || e) >= 36e5 && (t = {
      count: 0,
      time: e
    }), t.count = Number(t.count || 0) + 1, t.time = t.time || e, wx.setStorageSync("bleKeyErr", JSON.stringify(t))
  },
  setCheckData: function(e, t) {
    this.checkData = {
      count: 5,
      type: e,
      buf: t
    }
  },
  getCheckData: function(e, t) {
    var a = this.checkData;
    if (!e || !a || !a.buf) return !1;
    if (void 0 !== t && Number(a.type) !== Number(t)) return this.checkData = null, !1;
    if (a.count -= 1, a.count > 0) {
      if (e.length !== a.buf.length) return a;
      for (var n = 0; n < e.length; n += 1)
        if (e[n] !== a.buf[n]) return a
    }
    return this.checkData = null, !1
  },
  storageDeviceId: function(e) {
    return 0 === arguments.length ? wx.getStorageSync("deviceId") || "" : null === e ? (wx.removeStorageSync("deviceId"), "") : (wx.setStorageSync("deviceId", e), e)
  },
  cacheHomeHealthSnapshot: function(e) {
    var t, a, n, o = (t = this.globalData.lastGaugeState, a = {
      source: e,
      mockConnected: this.globalData.mockConnected
    }, n = a || {}, t && t.hasFullFrame && t.batteryPercent && t.remainRange && t.odometer ? {
      batteryPercent: String(t.batteryPercent),
      batteryValue: Number.parseFloat(t.batteryPercent) || 0,
      range: String(t.remainRange),
      odometer: String(t.odometer),
      updatedAt: Date.now(),
      source: n.source || "gauge",
      mockConnected: !!n.mockConnected
    } : null);
    return o ? (wx.setStorageSync("homeHealthSnapshot", o), o) : null
  },
  getHomeHealthCache: function() {
    try {
      return (t = wx.getStorageSync("homeHealthSnapshot")) && "object" === e(t) && t.batteryPercent && t.range && t.odometer && t.updatedAt ? {
        batteryPercent: String(t.batteryPercent),
        batteryValue: Number.parseFloat(t.batteryPercent) || 0,
        range: String(t.range),
        odometer: String(t.odometer),
        updatedAt: Number(t.updatedAt) || Date.now(),
        source: t.source || "gauge",
        mockConnected: !!t.mockConnected
      } : null
    } catch (e) {
      return wx.removeStorageSync("homeHealthSnapshot"), null
    }
    var t
  },
  rememberLastConnectionAt: function(e) {
    var t = Number(e || Date.now());
    return this.globalData.lastConnectedAt = t, wx.setStorageSync("lastBleConnectedAt", t), t
  },
  getLastConnectionAt: function() {
    var e = Number(this.globalData.lastConnectedAt || 0);
    if (e) return e;
    var t = Number(wx.getStorageSync("lastBleConnectedAt") || 0);
    return this.globalData.lastConnectedAt = t, t
  },
  getCurrentRoute: function() {
    var e = getCurrentPages();
    return e.length ? e[e.length - 1].route : ""
  },
  syncTabBar: function(e, t) {
    if (this.applyThemeToPage(e), e && "function" == typeof e.getTabBar) {
      var a = e.getTabBar();
      a && a.setData({
        selected: t,
        themeMode: this.getThemeMode(),
        accessLocked: !1
      })
    }
  },
  getHeaderLayoutMeta: function() {
    var e = this.getPageSafeAreaStyle();
    if (!wx.getMenuButtonBoundingClientRect) return {
      titlebarStyle: "",
      themeToggleStyle: "",
      pageSafeAreaStyle: e
    };
    try {
      var t = wx.getMenuButtonBoundingClientRect(),
        a = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync(),
        n = Number(a && a.windowWidth || 0),
        o = Number(t && t.left || 0),
        i = Number(t && t.top || 0),
        s = Number(t && t.height || 0);
      if (!n || !o || o >= n || !s) return {
        titlebarStyle: "",
        themeToggleStyle: "",
        pageSafeAreaStyle: e
      };
      var r = 750 / n,
        c = Number(a && a.statusBarHeight || 0) + 24 / r,
        h = i + s / 2 - 76 / r / 2,
        l = Math.round((h - c) * r),
        u = Math.max(82, Math.round((n - o) * r + 12 + 64));
      return {
        titlebarStyle: "margin-top:".concat(l, "rpx;min-height:").concat(76, "rpx;"),
        themeToggleStyle: "right:".concat(u, "rpx;"),
        pageSafeAreaStyle: e
      }
    } catch (t) {
      return {
        titlebarStyle: "",
        themeToggleStyle: "",
        pageSafeAreaStyle: e
      }
    }
  },
  getPageSafeAreaStyle: function() {
    try {
      var e = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync(),
        t = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null,
        a = Number(e && e.windowWidth || 0),
        n = Number(e && e.statusBarHeight || 0),
        o = Number(t && t.top || 0),
        i = a ? 750 / a : 1,
        s = Math.max(0, Math.round(Math.max(n, o) * i));
      return ["--page-safe-top:".concat(s, "rpx;"), "--page-shell-top:".concat(s, "rpx;"), "--index-page-shell-top:".concat(s + 56, "rpx;")].join("")
    } catch (e) {
      return "--page-safe-top:0rpx;--page-shell-top:0rpx;--index-page-shell-top:56rpx;"
    }
  },
  syncThemeTabBar: function(e, t) {
    if (e && "function" == typeof e.getTabBar) {
      var a = e.getTabBar();
      if (a && "function" == typeof a.setData) {
        var n = this.getFontSizePreference();
        a.setData({
          themeMode: t || this.getThemeMode(),
          appFontSizeClass: n.level,
          appFontSizeStyle: n.style
        })
      }
    }
  },
  normalizeThemeMode: function(e, t) {
    return "day" === e || "midnight" === e ? e : "day" === t ? "day" : "midnight"
  },
  getThemeMode: function() {
    var e, t, a, n, o, i, s = this.getThemePreference(),
      r = s.autoDark ? (e = s.autoDarkStart, a = t || new Date, n = 60 * a.getHours() + a.getMinutes(), o = S(e), i = S("06:00"), (o <= i ? n >= o && n < i : n >= o || n < i) ? "midnight" : "day") : s.manualMode;
    return this.globalData.themeMode = this.normalizeThemeMode(r, "day"), this.globalData.themeMode
  },
  getThemePreference: function() {
    return {
      manualMode: this.normalizeThemeMode(wx.getStorageSync("appThemeMode"), "day"),
      autoDark: !0 === wx.getStorageSync("appThemeAutoDark"),
      autoDarkStart: f(wx.getStorageSync("appThemeAutoDarkStart"), "18:00"),
      autoDarkEnd: "06:00"
    }
  },
  applyThemePreference: function(e) {
    var t = Object.assign({}, this.getThemePreference(), e || {}),
      a = this.normalizeThemeMode(t.manualMode),
      n = f(t.autoDarkStart, "18:00");
    wx.setStorageSync("appThemeMode", a), wx.setStorageSync("appThemeAutoDark", !!t.autoDark), wx.setStorageSync("appThemeAutoDarkStart", n), this.globalData.themeMode = this.getThemeMode();
    var o = this.applyThemeToCurrentPage(),
      i = "function" == typeof getCurrentPages ? getCurrentPages() : [];
    return this.syncThemeTabBar(i && i.length ? i[i.length - 1] : null, o.mode), Object.assign({}, this.getThemePreference(), {
      currentMode: o.mode
    })
  },
  getFontSizePreference: function() {
    var e = p(wx.getStorageSync("appFontSizeValue")),
      t = 1 + .22 * (Math.max(0, e - 50) / 50),
      a = e > 50 ? "large" : "default",
      n = e > 82 ? "更大" : e > 50 ? "大" : "默认";
    return {
      value: e,
      scale: Number(t.toFixed(3)),
      level: a,
      label: n,
      style: "--app-font-scale:".concat(t.toFixed(3), ";")
    }
  },
  applyFontSizePreference: function(e) {
    var t = p(e);
    wx.setStorageSync("appFontSizeValue", t);
    var a = "function" == typeof getCurrentPages ? getCurrentPages() : [],
      n = a && a.length ? a[a.length - 1] : null;
    return this.applyThemeToPage(n), this.getFontSizePreference()
  },
  getThemeMeta: function(e) {
    return "day" === this.normalizeThemeMode(e) ? {
      mode: "day",
      label: "白天模式",
      nextLabel: "深夜模式",
      iconPath: "/assets/icons/generated/header-theme-day@48.png",
      backIconPath: "/assets/icons/generated/button-back-day@48.png"
    } : {
      mode: "midnight",
      label: "深夜模式",
      nextLabel: "白天模式",
      iconPath: "/assets/icons/generated/header-theme-midnight@48.png",
      backIconPath: "/assets/icons/generated/button-back@48.png"
    }
  },
  syncSystemNavigationBar: function(e) {
    if (wx.setNavigationBarColor) {
      var t = this.normalizeThemeMode(e);
      try {
        wx.setNavigationBarColor({
          frontColor: "day" === t ? "#000000" : "#ffffff",
          backgroundColor: "day" === t ? "#f4f8fc" : "#05070B",
          animation: {
            duration: 180,
            timingFunc: "easeInOut"
          }
        })
      } catch (e) {}
    }
  },
  applyThemeToPage: function(e) {
    var t = this.getThemeMeta(this.getThemeMode());
    if (this.syncSystemNavigationBar(t.mode), !e || "function" != typeof e.setData) return t;
    var a = this.getHeaderLayoutMeta(),
      n = this.getFontSizePreference();
    return e.setData({
      appTheme: t.mode,
      appThemeLabel: t.label,
      appThemeNextLabel: t.nextLabel,
      appThemeIconPath: t.iconPath,
      backIconPath: t.backIconPath,
      titlebarStyle: a.titlebarStyle,
      themeToggleStyle: a.themeToggleStyle,
      appFontSizeClass: n.level,
      appFontSizeLabel: n.label,
      appFontSizeValue: n.value,
      appFontSizeStyle: "".concat(n.style).concat(a.pageSafeAreaStyle || "")
    }), this.syncThemeTabBar(e, t.mode), t
  },
  applyThemeToCurrentPage: function() {
    var e = "function" == typeof getCurrentPages ? getCurrentPages() : [];
    return this.applyThemeToPage(e && e.length ? e[e.length - 1] : null)
  },
  toggleThemeMode: function() {
    var e = "day" === this.getThemeMode() ? "midnight" : "day";
    return this.applyThemePreference({
      manualMode: e,
      autoDark: !1
    }), this.getThemeMeta(this.getThemeMode())
  },
  getAccessMode: function() {
    return this.globalData.accessMode = r.getMode(), this.globalData.accessReady = !0, this.globalData.accessMode
  },
  applyAccessPassword: function(e) {
    var t = r.applyPassword(e);
    return t.ok && (this.globalData.accessMode = t.mode, this.globalData.accessReady = !0, this.emitState()), t
  },
  getAccessPasswordMeta: function() {
    var e = r.PASSWORD_LENGTHS || [],
      t = e.length ? e[0] : 0,
      a = e.length ? e[e.length - 1] : 32;
    return {
      lengths: e,
      minLength: t,
      maxLength: a,
      hint: e.length > 1 ? "".concat(t, "-").concat(a, " 位访问密码") : "".concat(t, " 位访问密码")
    }
  },
  ensureAccessMode: function() {
    return this.globalData.accessMode = r.getMode(), this.globalData.accessReady = !0, Promise.resolve(this.globalData.accessMode)
  },
  emitState: function() {
    var e = this;
    (this.globalData.rxHandlers.state || []).forEach((function(t) {
      return t(e.globalData.connected, e.globalData.deviceInfo)
    }))
  },
  getSuperShortcutRuntimeState: function() {
    return l.getState()
  },
  getToastMeta: function(e) {
    return 1 === e || !0 === e ? {
      type: "success",
      icon: "success",
      iconPath: "/assets/icons/generated/toast-success@48.png"
    } : 0 === e ? {
      type: "error",
      icon: "error",
      iconPath: "/assets/icons/generated/toast-error@48.png"
    } : {
      type: "info",
      icon: "none",
      iconPath: "/assets/icons/generated/toast-info@48.png"
    }
  },
  msg: function(e, t, a) {
    var n = this,
      o = "function" == typeof getCurrentPages ? getCurrentPages() : [],
      i = o && o.length ? o[o.length - 1] : null,
      s = this.getToastMeta(t),
      r = String(e || ""),
      c = Math.max(Number(a) || 1800, 900);
    if (clearTimeout(this.toastTimer), clearTimeout(this.toastHideTimer), i && "function" == typeof i.setData) return i.setData({
      __appToast: {
        visible: !0,
        leaving: !1,
        type: s.type,
        theme: this.getThemeMode(),
        position: "pages/gauge/gauge" === i.route ? "gauge" : "default",
        iconPath: s.iconPath,
        title: r,
        nonce: Date.now()
      }
    }), void(this.toastTimer = setTimeout((function() {
      i && "function" == typeof i.setData && (i.setData({
        "__appToast.leaving": !0
      }), n.toastHideTimer = setTimeout((function() {
        i.setData({
          "__appToast.visible": !1
        })
      }), 180))
    }), c));
    wx.showToast({
      title: r,
      icon: s.icon,
      duration: c
    })
  },
  modal: function(e, t, a, n, o) {
    var i = "function" == typeof getCurrentPages ? getCurrentPages() : [],
      s = i && i.length ? i[i.length - 1] : null,
      r = o || {},
      c = Date.now(),
      h = {
        visible: !0,
        themeMode: this.getThemeMode(),
        fontSizeStyle: this.getFontSizePreference().style,
        title: r.title || "提示",
        content: String(e || ""),
        showCancel: !!t,
        confirmText: r.confirmText || "确定",
        cancelText: r.cancelText || "取消",
        sessionId: c
      };
    this.modalSession = {
      sessionId: c,
      page: s,
      onConfirm: a,
      onCancel: n
    }, s && "function" == typeof s.setData ? s.setData({
      __appModal: h
    }) : wx.showModal({
      title: h.title,
      content: h.content,
      showCancel: h.showCancel,
      confirmText: h.confirmText,
      cancelText: h.cancelText,
      success: function(e) {
        e.confirm && a ? a(e) : !e.confirm && n && n(e)
      },
      fail: function(e) {
        n && n(e)
      }
    })
  },
  resolveAppModal: function(e, t) {
    var a = this.modalSession;
    a && a.sessionId === t && (this.modalSession = null, a.page && "function" == typeof a.page.setData && a.page.setData({
      "__appModal.visible": !1
    }), "confirm" === e && a.onConfirm ? a.onConfirm({
      confirm: !0,
      cancel: !1
    }) : "cancel" === e && a.onCancel && a.onCancel({
      confirm: !1,
      cancel: !0
    }))
  },
  input: function(e, t, a) {
    var n = String(e || "请输入内容");
    wx.showModal({
      title: n,
      placeholderText: n,
      editable: !0,
      success: function(e) {
        e.confirm && t ? t(e) : !e.confirm && a && a(e)
      }
    })
  },
  isAdmin: function() {
    var e = wx.getStorageSync("isAdmin");
    return "number" == typeof e ? e : 0
  },
  isWeChat: function() {
    var e = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {};
    return e.host && "WeChat" === e.host.env
  },
  api: a,
  format: o,
  device: n,
  accessMode: r
});