var s = require("../../services/featureRegistry"),
  a = getApp();
Page({
  data: {
    connected: !1,
    accessMode: "normal",
    isAdmin: 0,
    accessPasswordModalVisible: !1,
    accessPassword: "",
    accessPasswordError: "",
    accessPasswordHint: "",
    accessPasswordMax: 24,
    accessPasswordProgress: [],
    accessPasswordReady: !1,
    accessInputFocus: !1,
    labPasswordModalVisible: !1,
    labPassword: "",
    labPasswordError: "",
    labPasswordProgress: [],
    labPasswordReady: !1,
    labInputFocus: !1,
    device: {},
    actionGroups: []
  },
  onLoad: function() {
    this.stateHandler = this.refresh.bind(this), a.onPacket("state", this.stateHandler)
  },
  onShow: function() {
    a.syncTabBar(this, 3), this.refresh(), a.globalData.connected && a.queryDeviceInfo().catch((function() {}))
  },
  refresh: function() {
    var e = a.globalData.deviceInfo,
      r = a.isAdmin(),
      o = a.getAccessMode();
    this.setData({
      connected: a.globalData.connected,
      accessMode: o,
      isAdmin: r,
      device: e,
      actionGroups: s.groups("account", {
        connected: a.globalData.connected,
        accessMode: o,
        adminLevel: r,
        mockConnected: a.globalData.mockConnected,
        deviceInfo: e
      })
    })
  },
  handleAction: function(s) {
    var e = this;
    switch (s.detail.id) {
      case "mock":
        a.globalData.mockConnected ? (a.disconnectMock(), this.refresh(), a.msg("已断开验证模块", 1)) : a.connectMock().then((function() {
          e.refresh(), a.msg("已连接验证模块", 1)
        }));
        break;
      case "access":
        this.openAccessInput();
        break;
      case "deviceInfo":
        wx.navigateTo({
          url: "/pages/deviceInfo/deviceInfo"
        });
        break;
      case "bleHost":
        wx.navigateTo({
          url: "/pages/bleHost/bleHost"
        });
        break;
      case "firmware":
        wx.navigateTo({
          url: "/pages/firmware/firmware"
        });
        break;
      case "debug":
        if (!a.isAdmin()) {
          a.msg("请先开启工厂模式", 0);
          break
        }
        wx.navigateTo({
          url: "/pages/debug/debug"
        });
        break;
      case "labSettings":
        this.openLabPasswordInput();
        break;
      case "gaugeMenu":
        wx.navigateTo({
          url: "/pages/gaugeMenu/gaugeMenu"
        });
        break;
      case "hostset":
        a.input(wx.getStorageSync("url") || "服务器域名", (function(s) {
          s.content && (wx.setStorageSync("url", a.api.normalizeHost(s.content)), a.msg("域名已保存", 1))
        }));
        break;
      case "clear":
        a.modal("确定清除小程序缓存吗？", !0, (function() {
          ["deviceId", "ble_key", "hw_id", "deviceinfo", "msgId", "url", "FunListJs", "set", "btn", "isAutoGauge", "TSLServiceMode", "appFontSizeValue", a.accessMode.STORAGE_KEY].forEach((function(s) {
            return wx.removeStorageSync(s)
          })), e.refresh(), a.msg("缓存清除成功", 1)
        }));
        break;
      case "admin":
        this.toggleAdmin();
        break;
      case "reboot":
        if (!a.globalData.connected) {
          a.msg("请先连接蓝牙", 0);
          break
        }
        a.modal("确定要重启模块吗？", !0, (function() {
          var s = a.globalData.deviceInfo.buf.length >= 18 ? a.globalData.deviceInfo.buf.slice(4, 18) : new Uint8Array(14);
          a.tx(165, s).catch((function() {}))
        }));
        break;
      case "service":
        this.openServiceMode()
    }
  },
  handleDisabled: function(s) {
    var e = s.detail.id;
    "debug" === e ? a.msg("请先开启工厂模式", 0) : "reboot" !== e && "service" !== e || a.msg("请先连接蓝牙", 0)
  },
  openServiceMode: function() {
    a.globalData.connected ? a.modal("车辆必须处于安全静止状态。确定进入维护模式吗？", !0, (function() {
      a.tx(167, new Uint8Array([255]), {
        source: "serviceMode"
      }).catch((function(s) {
        a.msg(s.message || "维护模式发送失败", 0, 2400)
      }))
    })) : a.msg("请先连接蓝牙", 0)
  },
  openAccessInput: function() {
    var s = a.getAccessPasswordMeta ? a.getAccessPasswordMeta() : {
      minLength: 0,
      maxLength: 32,
      hint: "访问密码"
    };
    this.setData({
      accessPasswordModalVisible: !0,
      accessPassword: "",
      accessPasswordError: "",
      accessPasswordHint: s.hint,
      accessPasswordMax: s.maxLength,
      accessPasswordProgress: this.buildAccessPasswordProgress(0, s),
      accessPasswordReady: !1,
      accessInputFocus: !0
    })
  },
  buildAccessPasswordProgress: function(s, a) {
    var e = Math.max(Number(a && a.minLength) || 0, 1),
      r = Math.max(0, Number(s) || 0);
    return Array.from({
      length: e
    }).map((function(s, a) {
      return {
        active: r > a
      }
    }))
  },
  inputAccessPassword: function(s) {
    var e = a.getAccessPasswordMeta ? a.getAccessPasswordMeta() : {
        minLength: 0,
        maxLength: 32,
        hint: "访问密码"
      },
      r = s && s.detail ? s.detail.value : "",
      o = String(r || "").slice(0, e.maxLength);
    this.setData({
      accessPassword: o,
      accessPasswordError: "",
      accessPasswordProgress: this.buildAccessPasswordProgress(o.length, e),
      accessPasswordReady: o.length >= Number(e.minLength || 0),
      accessInputFocus: !0
    })
  },
  submitAccessPassword: function() {
    var s = a.getAccessPasswordMeta ? a.getAccessPasswordMeta() : {
        minLength: 0,
        hint: "访问密码"
      },
      e = String(this.data.accessPassword || "").trim();
    if (e.length < Number(s.minLength || 0)) this.setData({
      accessPasswordError: "请输入".concat(s.hint),
      accessInputFocus: !0
    });
    else {
      var r = a.applyAccessPassword(e);
      r.ok ? (this.setData({
        accessPasswordModalVisible: !1,
        accessPassword: "",
        accessPasswordError: "",
        accessPasswordProgress: this.buildAccessPasswordProgress(0, s),
        accessPasswordReady: !1,
        accessInputFocus: !1
      }), this.refresh(), a.syncTabBar(this, 3), a.msg(r.message, 1)) : this.setData({
        accessPassword: "",
        accessPasswordError: r.message,
        accessPasswordProgress: this.buildAccessPasswordProgress(0, s),
        accessPasswordReady: !1,
        accessInputFocus: !0
      })
    }
  },
  closeAccessPasswordModal: function() {
    var s = a.getAccessPasswordMeta ? a.getAccessPasswordMeta() : {
      minLength: 0
    };
    this.setData({
      accessPasswordModalVisible: !1,
      accessPassword: "",
      accessPasswordError: "",
      accessPasswordProgress: this.buildAccessPasswordProgress(0, s),
      accessPasswordReady: !1,
      accessInputFocus: !1
    })
  },
  focusAccessPassword: function() {
    this.data.accessPasswordModalVisible && this.setData({
      accessInputFocus: !0
    })
  },
  noop: function() {},
  openLabPasswordInput: function() {
    this.setData({
      labPasswordModalVisible: !0,
      labPassword: "",
      labPasswordError: "",
      labPasswordProgress: this.buildLabPasswordProgress(0),
      labPasswordReady: !1,
      labInputFocus: !0
    })
  },
  buildLabPasswordProgress: function(s) {
    var a = Math.max(0, Number(s) || 0);
    return Array.from({
      length: 4
    }).map((function(s, e) {
      return {
        active: a > e
      }
    }))
  },
  inputLabPassword: function(s) {
    var a = s && s.detail ? s.detail.value : "",
      e = String(a || "").replace(/\D/g, "").slice(0, 4);
    this.setData({
      labPassword: e,
      labPasswordError: "",
      labPasswordProgress: this.buildLabPasswordProgress(e.length),
      labPasswordReady: 4 === e.length,
      labInputFocus: !0
    })
  },
  submitLabPassword: function() {
    var s = String(this.data.labPassword || "").trim();
    4 === s.length ? "0604" === s ? (this.setData({
      labPasswordModalVisible: !1,
      labPassword: "",
      labPasswordError: "",
      labPasswordProgress: this.buildLabPasswordProgress(0),
      labPasswordReady: !1,
      labInputFocus: !1
    }), wx.setStorageSync("labAccessGrantedAt", Date.now()), wx.navigateTo({
      url: "/pages/advancedSettings/advancedSettings?scope=lab"
    })) : this.setData({
      labPassword: "",
      labPasswordError: "实验室密码错误",
      labPasswordProgress: this.buildLabPasswordProgress(0),
      labPasswordReady: !1,
      labInputFocus: !0
    }) : this.setData({
      labPasswordError: "请输入4位实验室密码",
      labInputFocus: !0
    })
  },
  closeLabPasswordModal: function() {
    this.setData({
      labPasswordModalVisible: !1,
      labPassword: "",
      labPasswordError: "",
      labPasswordProgress: this.buildLabPasswordProgress(0),
      labPasswordReady: !1,
      labInputFocus: !1
    })
  },
  focusLabPassword: function() {
    this.data.labPasswordModalVisible && this.setData({
      labInputFocus: !0
    })
  },
  toggleAdmin: function() {
    var s = this;
    if (a.isAdmin()) return wx.removeStorageSync("isAdmin"), this.refresh(), void a.msg("已退出工厂模式", 1);
    a.modal("工厂模式会解锁调试和维护操作，请确认车辆处于安全状态。", !0, (function() {
      s.openAdminInput()
    }))
  },
  openAdminInput: function() {
    var s = this;
    a.input("工厂模式密码：iffrc / iffrc159 / iffrc123", (function(e) {
      var r = {
        iffrc: 1,
        iffrc159: 2,
        iffrc123: 3
      } [e.content] || 0;
      r ? (wx.setStorageSync("isAdmin", r), s.refresh(), a.msg("进入成功", 1)) : a.msg("密码错误", 0)
    }))
  },
  onUnload: function() {
    this.stateHandler && a.offPacket("state", this.stateHandler)
  }
});