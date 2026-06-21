var e = getApp(),
  t = require("../../services/featureRegistry");
Page({
  data: {
    connected: !1,
    themePreference: {
      currentMode: "midnight",
      currentLabel: "深夜模式",
      autoDark: !1,
      autoDarkStart: "18:00",
      autoDarkEnd: "06:00",
      autoDarkText: "18:00 - 06:00",
      nextManualLabel: "白天"
    },
    fontPreference: {
      value: 50,
      label: "默认",
      percentText: "100%"
    },
    entryGroups: []
  },
  onShow: function() {
    e.syncTabBar(this, 2), this.syncThemePreference(), this.syncFontPreference(), this.syncEntries()
  },
  syncEntries: function() {
    var n = e.globalData.connected,
      r = e.getAccessMode();
    this.setData({
      connected: n,
      entryGroups: t.groups("settings", {
        connected: n,
        accessMode: r,
        adminLevel: e.isAdmin(),
        mockConnected: e.globalData.mockConnected,
        deviceInfo: e.globalData.deviceInfo
      })
    })
  },
  buildThemePreference: function() {
    var t = e.getThemePreference ? e.getThemePreference() : {},
      n = e.getThemeMode ? e.getThemeMode() : "midnight",
      r = e.getThemeMeta ? e.getThemeMeta(n) : {
        label: "day" === n ? "白天模式" : "深夜模式"
      },
      a = t.autoDarkStart || "18:00",
      c = t.autoDarkEnd || "06:00";
    return {
      currentMode: n,
      currentLabel: r.label,
      autoDark: !!t.autoDark,
      autoDarkStart: a,
      autoDarkEnd: c,
      autoDarkText: "".concat(a, " - ").concat(c),
      nextManualLabel: "day" === n ? "深夜" : "白天"
    }
  },
  syncThemePreference: function() {
    this.setData({
      themePreference: this.buildThemePreference()
    })
  },
  buildFontPreference: function() {
    var t = e.getFontSizePreference ? e.getFontSizePreference() : {
      value: 50,
      label: "默认",
      scale: 1
    };
    return Object.assign({}, t, {
      percentText: "".concat(Math.round(100 * Number(t.scale || 1)), "%")
    })
  },
  syncFontPreference: function() {
    this.setData({
      fontPreference: this.buildFontPreference()
    })
  },
  toggleManualTheme: function() {
    e.toggleThemeMode && e.toggleThemeMode(), this.syncThemePreference()
  },
  toggleAutoDark: function() {
    var t = this.data.themePreference || {};
    e.applyThemePreference && e.applyThemePreference({
      autoDark: !t.autoDark
    }), this.syncThemePreference()
  },
  changeAutoDarkStart: function(t) {
    var n = t && t.detail ? t.detail.value : "";
    e.applyThemePreference && e.applyThemePreference({
      autoDark: !0,
      autoDarkStart: n
    }), this.syncThemePreference()
  },
  stopAutoDark: function(t) {
    t && "function" == typeof t.stopPropagation && t.stopPropagation(), e.applyThemePreference && e.applyThemePreference({
      autoDark: !1
    }), this.syncThemePreference()
  },
  changeFontSize: function(t) {
    var n = t && t.detail && Object.prototype.hasOwnProperty.call(t.detail, "value") ? t.detail.value : 50;
    e.applyFontSizePreference && e.applyFontSizePreference(n), this.syncFontPreference()
  },
  openEntry: function(n) {
    var r = t.getEntry(n.detail.id),
      a = r && r.route;
    a ? wx.navigateTo({
      url: a
    }) : e.msg("功能暂未开放", 0)
  },
  handleDisabled: function() {
    e.msg("请先连接蓝牙", 0)
  }
});