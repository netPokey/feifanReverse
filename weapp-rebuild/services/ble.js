var e = require("../utils/format"),
  n = e.toArrayBuffer,
  t = e.fromArrayBuffer,
  i = require("./privacy"),
  r = i.ensurePrivacyAuthorization,
  c = i.formatPrivacyApiBannedMessage,
  o = i.isPrivacyApiBannedError,
  s = {
    mtu: 23,
    deviceId: "",
    serviceId: "",
    characteristicId: "",
    writeNoResponse: !1,
    notify: !1,
    packet: {
      buf: new Uint8Array([0]),
      len: 0,
      index: 0,
      type: 0,
      verify: 0,
      status: 0,
      time: 0
    },
    callbacks: {
      onConnected: null,
      onDisconnected: null,
      onPacket: null
    },
    pendingConnect: {
      resolve: null,
      reject: null,
      timer: null
    }
  };

function a(e) {
  u(), s.mtu = 23, s.deviceId = e || "", s.serviceId = "", s.characteristicId = "", s.writeNoResponse = !1, s.notify = !1
}

function u() {
  s.pendingConnect.timer && clearTimeout(s.pendingConnect.timer), s.pendingConnect.resolve = null, s.pendingConnect.reject = null, s.pendingConnect.timer = null
}

function f(e) {
  var n = s.pendingConnect.reject;
  u(), n && n(new Error(e || "蓝牙服务初始化失败"))
}

function d(e, n) {
  var t = String(e && (e.errMsg || e.message) || "").toLowerCase();
  return [].concat(n).some((function(e) {
    return t.indexOf(e) >= 0
  }))
}

function l() {
  return r().then((function() {
    return new Promise((function(e, n) {
      wx.openBluetoothAdapter({
        success: e,
        fail: function(t) {
          d(t, "already opened") ? e(t) : o(t) ? n(new Error(c(t))) : n(t)
        }
      })
    }))
  }))
}

function v(e) {
  wx.getBLEDeviceServices({
    deviceId: e,
    success: function(n) {
      var t = (n.services || []).find((function(e) {
        return "0000FFF0-0000-1000-8000-00805F9B34FB" === e.uuid.toUpperCase()
      }));
      t ? wx.getBLEDeviceCharacteristics({
        deviceId: e,
        serviceId: t.uuid,
        success: function(n) {
          var i = n.characteristics || [],
            r = !1;
          i.forEach((function(n) {
            "0000FFF1-0000-1000-8000-00805F9B34FB" === n.uuid.toUpperCase() && ((n.properties.write || n.properties.writeNoResponse || n.properties.writeDefault) && (s.serviceId = t.uuid, s.characteristicId = n.uuid, s.writeNoResponse = !!n.properties.writeNoResponse), n.properties.notify && (r = !0, wx.notifyBLECharacteristicValueChange({
              state: !0,
              deviceId: e,
              serviceId: t.uuid,
              characteristicId: n.uuid,
              type: "notification",
              success: function() {
                s.notify = !0,
                  function(e) {
                    var n = s.pendingConnect.resolve;
                    u(), n && n({
                      deviceId: e
                    })
                  }(e), s.callbacks.onConnected && s.callbacks.onConnected(e)
              },
              fail: function() {
                f("开启蓝牙通知失败")
              }
            })))
          })), s.characteristicId ? r || f("未找到 FFF1 通知特征") : f("未找到 FFF1 写入特征")
        },
        fail: function() {
          f("读取蓝牙特征失败")
        }
      }) : f("未找到 FFF0 服务")
    },
    fail: function() {
      f("读取蓝牙服务失败")
    }
  })
}
module.exports = {
  TARGET_SERVICE: "0000FFF0-0000-1000-8000-00805F9B34FB",
  TARGET_CHARACTERISTIC: "0000FFF1-0000-1000-8000-00805F9B34FB",
  init: function(e) {
    s.callbacks = e || s.callbacks, wx.onBLEMTUChange((function(e) {
      s.mtu = e.mtu || s.mtu
    })), wx.onBLEConnectionStateChange((function(e) {
      if (!e.connected) return f("蓝牙连接已断开"), a(""), void(s.callbacks.onDisconnected && s.callbacks.onDisconnected(e));
      v(e.deviceId)
    })), wx.onBLECharacteristicValueChange((function(e) {
      ! function(e) {
        var n = Date.now();
        n - s.packet.time >= 300 && (s.packet.status = 0);
        s.packet.time = n, e.forEach((function(e) {
          var n = s.packet;
          0 === n.status && 85 === e ? n.status = 1 : 1 === n.status && 127 === e ? (n.status = 2, n.verify = 0) : 2 === n.status ? (n.status = 3, n.type = e, n.verify = n.verify + e & 255) : 3 === n.status ? (n.status = 4, n.len = e << 8, n.verify = n.verify + e & 255) : 4 === n.status ? (n.index = 0, n.len |= e, n.verify = n.verify + e & 255, n.buf = new Uint8Array(n.len), n.status = 0 === n.len ? 6 : n.len <= 4096 ? 5 : 0) : 5 === n.status ? (n.buf[n.index] = e, n.index += 1, n.verify = n.verify + e & 255, n.index >= n.len && (n.status = 6)) : 6 === n.status && n.verify === e ? (s.callbacks.onPacket && s.callbacks.onPacket(n.type, n.buf), n.buf = new Uint8Array([0]), n.status = 0) : n.status = 0
        }))
      }(t(e.value))
    }))
  },
  startDiscovery: function(e) {
    var n = e || {};
    return l().then((function() {
      return new Promise((function(e, t) {
        var i = !1 !== n.targetOnly,
          r = {
            allowDuplicatesKey: !0,
            powerLevel: "high",
            success: e,
            fail: function(n) {
              d(n, ["already discovering", "already started"]) ? e(n) : t(n)
            }
          };
        i && (r.services = ["FFF0"]), wx.startBluetoothDevicesDiscovery(r)
      }))
    }))
  },
  getDiscoveredDevices: function() {
    return new Promise((function(e) {
      wx.getBluetoothDevices({
        success: function(n) {
          e(n.devices || [])
        },
        fail: function() {
          e([])
        }
      })
    }))
  },
  stopDiscovery: function() {
    return new Promise((function(e) {
      wx.stopBluetoothDevicesDiscovery({
        complete: e
      })
    }))
  },
  connect: function(e) {
    return e ? (a(e), l().then((function() {
      return new Promise((function(n, t) {
        s.pendingConnect.resolve = n, s.pendingConnect.reject = t, s.pendingConnect.timer = setTimeout((function() {
          f("蓝牙服务发现超时")
        }), 8e3), wx.createBLEConnection({
          deviceId: e,
          timeout: 5e3,
          success: function() {},
          fail: function(n) {
            d(n, "already connected") ? v(e) : (u(), t(n))
          }
        })
      }))
    }))) : Promise.reject(new Error("缺少蓝牙 deviceId"))
  },
  tx: function(e, t) {
    if (!(s.notify && s.deviceId && s.serviceId && s.characteristicId)) {
      var i = getApp();
      return i && i.msg && i.msg("蓝牙未连接", 0), Promise.reject(new Error("蓝牙未连接"))
    }
    for (var r = t ? Array.prototype.slice.call(t) : [], c = [85, 127, e, r.length >>> 8, 255 & r.length].concat(r), o = 0, a = 2; a < c.length; a += 1) o = o + c[a] & 255;
    c.push(o);
    for (var u = Math.max(20, Math.min(s.mtu || 23, 247) - 3), f = []; c.length;) f.push(c.splice(0, u));
    return f.reduce((function(e, t) {
      return e.then((function() {
        return function(e) {
          return new Promise((function(t, i) {
            wx.writeBLECharacteristicValue({
              deviceId: s.deviceId,
              serviceId: s.serviceId,
              characteristicId: s.characteristicId,
              writeType: s.writeNoResponse ? "writeNoResponse" : "write",
              value: n(new Uint8Array(e)),
              success: t,
              fail: i
            })
          }))
        }(t)
      }))
    }), Promise.resolve())
  },
  resetConnection: a
};