var e = ["pages/index/index", "pages/ble/ble", "pages/set/set", "pages/my/my"];

function t(t) {
  var n = t || "/pages/index/index",
    a = function(e) {
      return String(e || "").replace(/^\//, "")
    }(n);
  e.indexOf(a) >= 0 ? wx.switchTab({
    url: n
  }) : wx.redirectTo({
    url: n
  })
}
module.exports = {
  goBack: function(e) {
    ("function" == typeof getCurrentPages ? getCurrentPages() : []).length > 1 ? wx.navigateBack({
      delta: 1
    }) : t(e)
  }
};