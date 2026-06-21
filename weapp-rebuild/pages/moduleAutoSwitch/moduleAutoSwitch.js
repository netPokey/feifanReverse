var e = require("../../@babel/runtime/helpers/defineProperty"),
  t = require("../../services/pageNav"),
  a = require("../../services/moduleAutoSwitch"),
  n = getApp();
Page({
  data: {
    connected: !1,
    config: a.readConfig()
  },
  onLoad: function() {
    this.stateHandler = this.refresh.bind(this), n.onPacket("state", this.stateHandler)
  },
  onShow: function() {
    n.applyThemeToPage && n.applyThemeToPage(this), this.refresh()
  },
  back: function() {
    t.goBack("/pages/set/set")
  },
  refresh: function() {
    var e = a.readConfig();
    this.setData({
      connected: n.globalData.connected,
      config: e
    })
  },
  toggleOption: function(t) {
    var n = t.currentTarget.dataset.key;
    if (n) {
      var i = this.data.config || {},
        o = a.saveConfig(e({}, n, !i[n]));
      this.setData({
        config: o
      })
    }
  },
  onUnload: function() {
    n.offPacket("state", this.stateHandler)
  }
});