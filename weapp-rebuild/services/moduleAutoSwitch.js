var e = require("../@babel/runtime/helpers/defineProperty"),
  t = require("../@babel/runtime/helpers/typeof"),
  a = require("./shortcutExecutor"),
  n = "moduleAutoSwitchConfig",
  o = {
    autoEnableOnAuth: !1,
    disableOnAppHide: !1,
    updatedAt: 0,
    lastEnableAt: 0,
    lastDisableAt: 0,
    lastHideDisableAt: 0
  };

function r() {
  var e = wx.getStorageSync(n);
  return e && "object" === t(e) ? Object.assign({}, o, {
    autoEnableOnAuth: !0 === e.autoEnableOnAuth,
    disableOnAppHide: !0 === e.disableOnAppHide,
    updatedAt: Number(e.updatedAt || 0),
    lastEnableAt: Number(e.lastEnableAt || 0),
    lastDisableAt: Number(e.lastDisableAt || 0),
    lastHideDisableAt: Number(e.lastHideDisableAt || 0)
  }) : Object.assign({}, o)
}

function u(e) {
  var t = Object.assign({}, r(), e || {}, {
    updatedAt: Date.now()
  });
  return wx.setStorageSync(n, t), t
}

function i(e) {
  var t = new Date(Number(e || Date.now())),
    a = function(e) {
      return String(e).padStart(2, "0")
    };
  return "".concat(a(t.getMonth() + 1), "-").concat(a(t.getDate()), " ").concat(a(t.getHours()), ":").concat(a(t.getMinutes()))
}

function l(e) {
  if (!e || e.length <= 28) return {
    known: !1,
    enabled: null,
    rawValue: null,
    text: "未知"
  };
  var t = e[28] >>> 3 & 1;
  return {
    known: !0,
    enabled: 0 === t,
    rawValue: t,
    text: 0 === t ? "已启用" : "已停用"
  }
}

function s(e) {
  var t = function(e, t, a, n) {
    return new Promise((function(o, r) {
      var u = !1,
        i = setTimeout((function() {
          u || (u = !0, e.offPacket(t, l), r(new Error("等待模块回包超时")))
        }), n || 5e3),
        l = function n(r, l) {
          u || a && !a(l) || (u = !0, clearTimeout(i), e.offPacket(t, n), o(l))
        };
      e.onPacket(t, l)
    }))
  }(e, 160, (function(e) {
    return !!e
  }), 6e3);
  return e.tx(160).then((function() {
    return t
  }))
}

function c(t, n, o) {
  var r = o || {},
    i = n ? 252 : 251,
    c = n ? "模块总开关启用" : "模块总开关停用";
  return s(t).then((function(o) {
    var s = l(o);
    return s.known ? s.enabled === n ? {
      skipped: !0,
      reason: n ? "already-enabled" : "already-disabled",
      state: s
    } : a.execute(t, i, c, {
      kind: "fun",
      source: r.source || "automation"
    }).then((function() {
      var t = n ? "lastEnableAt" : "lastDisableAt",
        a = e({}, t, Date.now());
      return !n && r.fromAppHide && (a.lastHideDisableAt = a[t]), u(a), {
        skipped: !1,
        reason: "",
        state: s
      }
    })) : {
      skipped: !0,
      reason: "state-unknown",
      state: s
    }
  }))
}
module.exports = {
  STORAGE_KEY: n,
  DISABLE_ACTION: 251,
  ENABLE_ACTION: 252,
  MAIN_SWITCH_OFFSET: 28,
  readMainSwitchState: l,
  readConfig: r,
  saveConfig: u,
  buildSummary: function(e) {
    var t = e || r();
    return {
      autoEnableText: t.autoEnableOnAuth ? "连接后自动启用" : "连接后不自动启用",
      appHideText: t.disableOnAppHide ? "退出时尝试停用" : "退出时不处理",
      lastActionText: t.lastDisableAt ? "上次停用 ".concat(i(t.lastDisableAt)) : t.lastEnableAt ? "上次启用 ".concat(i(t.lastEnableAt)) : "尚未主动触发"
    }
  },
  readDeviceConfig: s,
  suppressNextAppHide: function(e, t, a) {
    e && e.globalData && (e.globalData.moduleAutoSwitchAppHideSuppress = {
      reason: t || "temporary",
      until: Date.now() + Math.max(1e3, Number(a || 9e4))
    })
  },
  handleBleAuthSuccess: function(e) {
    var t = r(),
      a = Number(e && e.globalData && e.globalData.automationSessionNo || 0);
    return t.autoEnableOnAuth && e && e.globalData && e.globalData.connected ? a && Number(wx.getStorageSync("moduleAutoSwitchLastEnableSession") || 0) !== a ? c(e, !0, {
      source: "automation"
    }).then((function(e) {
      return e.skipped && "already-enabled" !== e.reason || wx.setStorageSync("moduleAutoSwitchLastEnableSession", a), e
    })) : Promise.resolve({
      skipped: !0,
      reason: "session"
    }) : Promise.resolve({
      skipped: !0,
      reason: "config"
    })
  },
  handleAppShowConnected: function(e) {
    return r().autoEnableOnAuth && e && e.globalData && e.globalData.connected ? c(e, !0, {
      source: "automation"
    }) : Promise.resolve({
      skipped: !0,
      reason: "config"
    })
  },
  handleAppHide: function(e) {
    var t = r(),
      a = function(e) {
        var t = e && e.globalData && e.globalData.moduleAutoSwitchAppHideSuppress;
        return !t || Date.now() > Number(t.until || 0) ? null : (e.globalData.moduleAutoSwitchAppHideSuppress = null, t.reason || "temporary")
      }(e);
    return a ? Promise.resolve({
      skipped: !0,
      reason: "suppressed:".concat(a)
    }) : t.disableOnAppHide && e && e.globalData && e.globalData.connected ? c(e, !1, {
      source: "automation",
      fromAppHide: !0
    }) : Promise.resolve({
      skipped: !0,
      reason: "config"
    })
  },
  enableNow: function(e) {
    return c(e, !0, {
      source: "automation"
    })
  },
  disableNow: function(e) {
    return c(e, !1, {
      source: "automation"
    })
  }
};