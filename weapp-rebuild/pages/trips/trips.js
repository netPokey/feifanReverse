var e = require("../../services/pageNav"),
  t = require("../../services/tripStore"),
  a = getApp();
Page({
  data: {
    records: [],
    hasRecords: !1
  },
  onShow: function() {
    a.applyThemeToPage && a.applyThemeToPage(this), this.refresh()
  },
  back: function() {
    e.goBack("/pages/index/index")
  },
  refresh: function() {
    var e = t.buildView(),
      a = (e.active ? [t.formatRecord(null, e.active)] : []).concat((e.records || []).map((function(e) {
        return t.formatRecord(e)
      }))),
      c = a.length,
      r = a.map((function(e, t) {
        return Object.assign({}, e, {
          cardTitle: e.active ? "正在行驶" : "行程 ".concat(c - t),
          timeRangeText: e.active ? "".concat(e.timeText, " · 进行中") : "".concat(e.timeText, " - ").concat(e.endText),
          statusText: e.active ? "进行中" : "已完成"
        })
      }));
    this.setData({
      records: r,
      hasRecords: r.length > 0
    })
  }
});