var e = require("../utils/format"),
  a = e.decToHex,
  r = e.hexToDec,
  t = [{
    key: "set",
    name: "设置参数",
    dataId: 0,
    readType: 160,
    readPayload: [0],
    writeType: 163
  }, {
    key: "btn",
    name: "快捷指令",
    dataId: 1,
    readType: 171,
    readPayload: [2],
    writeType: 171
  }, {
    key: "ble",
    name: "蓝牙按钮",
    dataId: 2,
    readType: 186,
    readPayload: [2],
    writeType: 186
  }];

function n(e) {
  return "backup:".concat(e || "local")
}

function c(e) {
  var a = (new Date).toISOString().replace("T", " ").slice(0, 19);
  return t.map((function(r) {
    return {
      id: r.dataId,
      key: r.key,
      name: r.name,
      msg: "本地未备份",
      create_time: a,
      backupData: "",
      deviceId: e || ""
    }
  }))
}

function u(e, a) {
  var r = Array.isArray(a) && a.length ? a : c(e);
  return t.map((function(a) {
    var t = r.find((function(e) {
      return Number(e.id) === a.dataId || e.key === a.key
    })) || {};
    return Object.assign({}, t, {
      id: a.dataId,
      key: a.key,
      name: t.name || a.name,
      msg: t.msg || (t.backupData ? "本地备份" : "本地未备份"),
      backupData: t.backupData || "",
      deviceId: e || ""
    })
  }))
}

function i(e) {
  var a = wx.getStorageSync(n(e));
  if (Array.isArray(a)) return u(e, a);
  if ("string" == typeof a && a) try {
    return u(e, JSON.parse(a))
  } catch (a) {
    wx.removeStorageSync(n(e))
  }
  return u(e, [])
}
module.exports = {
  TYPES: t,
  backup: function(e, r, t) {
    var c = i(e),
      d = c.findIndex((function(e) {
        return Number(e.id) === Number(r)
      }));
    return d < 0 ? c : (c[d].backupData = a(t), c[d].msg = "本地备份成功", c[d].create_time = (new Date).toISOString().replace("T", " ").slice(0, 19), function(e, a) {
      var r = u(e, a);
      return wx.setStorageSync(n(e), r), r
    }(e, c))
  },
  load: i,
  parseBackupData: function(e) {
    var a = String(e || "").replace(/[^\da-fA-F]/g, "");
    return a && a.length % 2 == 0 ? new Uint8Array(r(a)) : new Uint8Array([])
  },
  removeAll: function(e) {
    return wx.removeStorageSync(n(e)), c(e)
  },
  shareMask: function(e) {
    var a = {
      set: 0,
      btn: 0,
      ble: 0
    };
    return (e || []).forEach((function(e) {
      var r = t[Number(e)];
      r && (a[r.key] = 1)
    })), a
  }
};