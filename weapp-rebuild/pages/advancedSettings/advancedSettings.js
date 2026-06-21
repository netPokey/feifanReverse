var e = require("../../services/pageNav"),
  t = require("../../services/settingsOptions"),
  a = getApp();
Page({
  data: {
    connected: !1,
    rawConfig: [],
    configState: "idle",
    configMessage: "连接后会自动读取模块设置",
    pageTitle: "快捷功能",
    pageDesc: "灯光提醒、门盖联动、座舱便利和驾驶偏好",
    scopeKey: "quick",
    settingsState: [],
    settingGroups: [],
    hardwareMessage: ""
  },
  onLoad: function(s) {
    var i, n = this.normalizeScope(s && s.scope);
    if ("lab" === n && !((i = Number(wx.getStorageSync("labAccessGrantedAt") || 0)) > 0 && Date.now() - i <= 3e5)) return this.labAccessDenied = !0, a.msg("请先输入实验室密码", 0, 2200), void e.goBack("/pages/my/my");
    var o = t.scopeInfo(n),
      r = a.globalData.connected,
      c = t.buildState(null, null, r),
      g = this.visibleGroups(c, o);
    this.setData({
      pageTitle: o.title,
      pageDesc: o.desc,
      scopeKey: n,
      settingsState: c,
      settingGroups: g,
      hardwareMessage: this.hardwareMessage(g, o)
    })
  },
  onShow: function() {
    var e = this;
    this.labAccessDenied || (a.applyThemeToPage && a.applyThemeToPage(this), this.handler || (this.handler = this.rxConfig.bind(this), [160, 161, 163].forEach((function(t) {
      return a.onPacket(t, e.handler)
    }))), this.syncSettings(), a.globalData.connected && a.queryDeviceInfo().catch((function() {})))
  },
  syncSettings: function() {
    var e = a.globalData.connected,
      s = t.scopeInfo(this.data.scopeKey),
      i = (this.data.settingsState.length ? this.data.settingsState : t.buildState(null, null, e)).map((function(t) {
        return Object.assign({}, t, {
          disabled: !e && !t.localOnly
        })
      })),
      n = this.visibleGroups(i, s);
    this.setData({
      connected: e,
      settingsState: i,
      settingGroups: n,
      hardwareMessage: this.hardwareMessage(n, s)
    })
  },
  normalizeScope: function(e) {
    return ["quick", "basic", "ap", "lab"].indexOf(e) >= 0 ? e : "quick"
  },
  visibleGroups: function(e, s) {
    return t.visibleGroups(e, a.getAccessMode(), {
      groupName: s.groupName,
      deviceInfo: a.globalData.deviceInfo
    })
  },
  hardwareMessage: function(e, t) {
    var s = a.globalData.deviceInfo || {};
    return a.globalData.connected && s.hw_ver && !e.length ? "当前 HW ".concat(s.hw_ver, " 固件不支持").concat(t.title, "，已隐藏不兼容配置。") : ""
  },
  changeSetting: function(e) {
    var s = e.detail.id,
      i = Number(e.detail.value),
      n = a.globalData.connected,
      o = this.data.settingsState.find((function(e) {
        return e.id === s
      }));
    if (o)
      if (o.disabled) a.msg("请先连接蓝牙", 0);
      else {
        var r = t.updateState(this.data.settingsState, s, i, n),
          c = t.scopeInfo(this.data.scopeKey),
          g = this.visibleGroups(r, c);
        this.setData({
          settingsState: r,
          settingGroups: g,
          hardwareMessage: this.hardwareMessage(g, c)
        }), n && this.writeConfig(r)
      }
  },
  rxConfig: function(e, s) {
    if (s && !(s.length < 35)) {
      var i = t.buildState(s, this.data.settingsState, a.globalData.connected),
        n = t.scopeInfo(this.data.scopeKey),
        o = this.visibleGroups(i, n);
      this.setData({
        settingsState: i,
        settingGroups: o,
        hardwareMessage: this.hardwareMessage(o, n),
        rawConfig: Array.prototype.slice.call(s),
        configState: "loaded",
        configMessage: "已加载当前模块设置"
      })
    }
  },
  writeConfig: function(e) {
    var s = this;
    if (!this.data.rawConfig || this.data.rawConfig.length < 35) return a.msg("请先读取模块设置", 0), void a.queryDeviceInfo().catch((function() {}));
    var i = t.writeBytes(this.data.rawConfig, e, {
      deviceInfo: a.globalData.deviceInfo
    });
    a.setCheckData(163, i), a.tx(163, i).then((function() {
      var n = t.scopeInfo(s.data.scopeKey),
        o = s.visibleGroups(e, n);
      s.setData({
        settingsState: e,
        settingGroups: o,
        hardwareMessage: s.hardwareMessage(o, n),
        rawConfig: Array.prototype.slice.call(i),
        configState: "saved",
        configMessage: "设置已写入模块，等待设备回读确认"
      }), a.msg("已发送设置", 1)
    })).catch((function() {}))
  },
  goBack: function() {
    e.goBack("/pages/set/set")
  },
  onHide: function() {
    var e = this;
    [160, 161, 163].forEach((function(t) {
      return e.handler && a.offPacket(t, e.handler)
    })), this.handler = null
  }
});