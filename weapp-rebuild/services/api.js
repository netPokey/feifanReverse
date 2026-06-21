function e(e) {
  var t = String(e || "www.iffrc.com").trim().replace(/\/ffkj\/user\/ble\.php.*$/i, "").replace(/\/+$/, "");
  return /^https?:\/\//i.test(t) ? t : "".concat(0 === t.indexOf("www.") ? "https" : "http", "://").concat(t)
}

function t() {
  return "".concat(e(wx.getStorageSync("url")), "/ffkj/user/ble.php")
}

function n(e) {
  var n = require("./firmwareUpdate");
  if (!n.isDomainListError(e)) return e;
  var o = new Error(n.createDomainListErrorMessage(t()));
  return o.originalError = e, o
}

function o(e, o) {
  var r = o || {};
  return r.loading && wx.showLoading({
    title: "网络加载中..."
  }), new Promise((function(o, i) {
    wx.request({
      method: "POST",
      url: t(),
      data: e,
      dataType: "json",
      timeout: r.timeout || 5e3,
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(e) {
        o(e.data)
      },
      fail: function(e) {
        i(n(e))
      },
      complete: function() {
        r.loading && wx.hideLoading()
      }
    })
  }))
}
module.exports = {
  normalizeHost: e,
  normalizeRequestError: n,
  getBaseUrl: t,
  request: o,
  getHelp: function(e) {
    return new Promise((function(o, r) {
      wx.request({
        method: "GET",
        url: "".concat(t(), "?path=wxxcx&id=").concat(e),
        dataType: "其他",
        responseType: "text",
        timeout: 3e3,
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        success: function(e) {
          o(e.data)
        },
        fail: function(e) {
          r(n(e))
        }
      })
    }))
  },
  getFunList: function() {
    var e = wx.getStorageSync("FunListJs");
    if (e) try {
      return Promise.resolve(JSON.parse(e))
    } catch (e) {
      wx.removeStorageSync("FunListJs")
    }
    return o("fun=funlist.js").then((function(e) {
      return e && e.success && wx.setStorageSync("FunListJs", JSON.stringify(e)), e
    }))
  },
  getBetaTestCode: function(e, t) {
    return o("fun=".concat(t ? "getBetaTestCode" : "getExperimentCode", "&id=").concat(e), {
      loading: !0
    }).then((function(e) {
      return e && e.code
    }))
  },
  getDeviceInfoMeta: function(e, t, n) {
    var r = e || {},
      i = encodeURIComponent(r.id || ""),
      c = encodeURIComponent(r.vin || ""),
      a = t ? 1 : 0,
      u = n ? 1 : 0;
    return o("fun=getinfo&id=".concat(i, "&vin=").concat(c, "&isAdmin=").concat(a, "&moveid=").concat(u), {
      timeout: 8e3
    })
  },
  getUpdateHelp: function(e) {
    var t = e || {},
      n = encodeURIComponent(t.id || ""),
      r = encodeURIComponent(t.vin || "");
    return o("fun=updatehelp&id=".concat(n, "&vin=").concat(r), {
      loading: !0,
      timeout: 1e4
    })
  },
  getUpdatePackage: function(e, t) {
    return o(require("./firmwareUpdate").buildUpdateQuery(e, t), {
      loading: !1,
      timeout: 15e3
    })
  },
  getBackup: function(e, t, n, r) {
    return o("fun=getBackup&id=".concat(e, "&local=").concat(t ? 1 : 0, "&msg=").concat(n || "").concat(r || ""), {
      loading: !0,
      timeout: 8e3
    })
  }
};