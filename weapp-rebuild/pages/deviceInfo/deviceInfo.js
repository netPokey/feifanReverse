var e = require("../../services/pageNav"),
  a = getApp();
Page({
  data: {
    connected: !1,
    device: {},
    infoSections: [],
    miniProgramDate: "2026-03-12"
  },
  onLoad: function() {
    this.stateHandler = this.refresh.bind(this), a.onPacket("state", this.stateHandler)
  },
  onShow: function() {
    a.applyThemeToPage && a.applyThemeToPage(this), this.refresh(), a.globalData.connected && a.queryDeviceInfo().catch((function() {}))
  },
  refresh: function() {
    var e = a.globalData.deviceInfo || {};
    this.setData({
      connected: a.globalData.connected,
      device: e,
      infoSections: this.buildInfoSections(e)
    })
  },
  buildInfoSections: function(e) {
    var a = e || {};
    return [{
      name: "设备身份",
      rows: [{
        label: "设备名称",
        value: a.name || "- - -"
      }, {
        label: "设备ID",
        value: a.id || "- - -"
      }, {
        label: "设备MAC",
        value: a.mac || "- - -"
      }, {
        label: "车辆VIN",
        value: a.vin || "- - -"
      }, {
        label: "激活时间",
        value: this.formatAuthTime(a.auth_time)
      }]
    }, {
      name: "版本状态",
      rows: [{
        label: "蓝牙固件",
        value: this.formatVersion(a.bt_ver)
      }, {
        label: "主控固件",
        value: this.formatVersion(a.fw_ver)
      }, {
        label: "最新蓝牙固件",
        value: this.formatVersion(a.bt_ver_new)
      }, {
        label: "最新主控固件",
        value: this.formatVersion(a.fw_ver_new)
      }]
    }, {
      name: "应用信息",
      rows: [{
        label: "小程序更新日期",
        value: this.data.miniProgramDate
      }]
    }]
  },
  formatVersion: function(e) {
    return e ? a.format.versionText(e) : "- - -"
  },
  formatAuthTime: function(e) {
    return e && "0000-00-00 00:00:00" !== e ? e : "- - -"
  },
  goBack: function() {
    e.goBack("/pages/my/my")
  },
  onUnload: function() {
    this.stateHandler && a.offPacket("state", this.stateHandler)
  }
});