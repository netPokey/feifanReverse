var t = require("../../services/pageNav"),
  e = getApp();
Page({
  data: {
    text: "",
    inputtx: ""
  },
  onShow: function() {
    e.applyThemeToPage && e.applyThemeToPage(this), this.handler = this.add.bind(this);
    for (var t = 0; t <= 255; t += 1) e.onPacket(t, this.handler)
  },
  back: function() {
    t.goBack("/pages/my/my")
  },
  add: function(t, a) {
    var n = "0x".concat(e.format.decToHex(t), ", ").concat(e.format.decToHex(a, " "), "\n");
    this.setData({
      text: (this.data.text + n).slice(-12e3)
    })
  },
  setTx: function(t) {
    this.setData({
      inputtx: t.detail.value
    })
  },
  sendTx: function() {
    var t = this.data.inputtx.split(",");
    if (2 === t.length) {
      var a = parseInt(t[0], 16),
        n = t[1].replace(/\s+/g, "");
      if (Number.isNaN(a) || a < 0 || a > 255 || n.length % 2 != 0 || /[^\da-fA-F]/.test(n)) e.msg("数据格式错误", 0);
      else {
        var i = n ? e.format.hexToDec(n) : new Uint8Array([]);
        e.tx(a, i).catch((function(t) {
          e.msg(t.message || "调试指令已被拦截", 0, 2400)
        }))
      }
    } else e.msg("数据格式错误", 0)
  },
  listenAll: function() {
    e.tx(192, new Uint8Array([1])).catch((function(t) {
      e.msg(t.message || "监听开启失败", 0, 2400)
    }))
  },
  clearLog: function() {
    this.setData({
      text: ""
    })
  },
  onHide: function() {
    for (var t = 0; t <= 255; t += 1) this.handler && e.offPacket(t, this.handler);
    e.tx(192, new Uint8Array([0])).catch((function() {}))
  }
});