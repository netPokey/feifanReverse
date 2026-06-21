function r(r) {
  var e = String(r && (r.errMsg || r.message) || "");
  return /privacy api banned/i.test(e)
}
module.exports = {
  ensurePrivacyAuthorization: function() {
    var r = "undefined" == typeof wx ? null : wx;
    return r && "function" == typeof r.requirePrivacyAuthorize ? new Promise((function(e, i) {
      r.requirePrivacyAuthorize({
        success: e,
        fail: function() {
          i(new Error("请先同意隐私保护指引后再使用蓝牙搜索"))
        }
      })
    })) : Promise.resolve()
  },
  formatPrivacyApiBannedMessage: function(e) {
    return r(e) ? "蓝牙隐私授权未生效，请先同意隐私指引，并确认微信后台已声明蓝牙用途" : String(e && (e.errMsg || e.message) || "蓝牙权限异常")
  },
  isPrivacyApiBannedError: r
};