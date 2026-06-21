var e = require("../utils/format"),
  r = e.decToHex,
  t = e.versionText,
  n = require("./deviceCapabilities");

function i(e) {
  var r = Array.prototype.slice.call(e || []),
    t = r.findIndex((function(e) {
      return 0 === e || 255 === e
    })),
    n = r.slice(0, t >= 0 ? t : r.length);
  if (!n.length) return "";
  try {
    return decodeURIComponent(escape(String.fromCharCode.apply(String, n)))
  } catch (e) {
    return String.fromCharCode.apply(String, n)
  }
}

function a(e, r) {
  return !e || e.length < 58 ? r || "" : 178 === e.length ? 255 === e[46] ? "" : i(e.slice(46, 63)) : 1 === e[40] ? i(e.slice(41, 58)) : r || ""
}

function _() {
  return {
    hw_ver: 0,
    bt_ver: 0,
    fw_ver: 0,
    bt_ver_new: 0,
    fw_ver_new: 0,
    bt_is_new: !1,
    fw_is_new: !1,
    id: "",
    mac: "",
    vin: "",
    name: "未连接",
    auth_time: "",
    isload: !1,
    state: 0,
    profile: n.getHardwareProfile(0),
    buf: new Uint8Array([])
  }
}

function v(e) {
  var r = Number(e || 0);
  return r > 0 && r <= 255 ? r << 8 : r
}
module.exports = {
  createEmptyDeviceInfo: _,
  parseVin: a,
  parseDeviceInfo: function(e, t) {
    var i = Object.assign(_(), t || {});
    return !e || e.length < 18 || (i.buf = e, i.hw_ver = e[0] || i.hw_ver, i.bt_ver = e[1] << 8, i.fw_ver = e[2] << 8, i.id = r(e.slice(4, 16)), i.mac = r(Array.prototype.slice.call(e.slice(12, 18)).reverse(), ":"), i.vin = a(e, i.vin), i.name = i.id ? "TSL电子模块" : "未连接", i.profile = n.getHardwareProfile(i)), i
  },
  mergeRemoteDeviceInfo: function(e, r) {
    var t = Object.assign(_(), e || {}),
      i = r || {};
    return i && !1 !== i.success ? (t.hw_ver = Number(i.hw_ver || t.hw_ver || 0), t.name = i.name || t.name || "TSL电子模块", t.auth_time = i.auth_time || t.auth_time || "", t.state = Number(void 0 === i.state ? t.state : i.state), t.bt_ver_new = v(i.bt_ver_new || t.bt_ver_new), t.fw_ver_new = v(i.fw_ver_new || t.fw_ver_new), Number(i.bt_ver || 0) > 0 && (t.bt_ver = v(i.bt_ver)), Number(i.fw_ver || 0) > 0 && (t.fw_ver = v(i.fw_ver)), t.bt_is_new = t.bt_ver_new > t.bt_ver, t.fw_is_new = t.fw_ver_new > t.fw_ver, t.isload = !0, t.profile = n.getHardwareProfile(t), t) : t
  },
  summaryCards: function(e) {
    var r = n.getHardwareProfile(e);
    return [{
      title: "硬件版本",
      value: e.hw_ver ? "HW ".concat(e.hw_ver) : "- - -"
    }, {
      title: "硬件类型",
      value: r.label || "- - -"
    }, {
      title: "蓝牙固件",
      value: e.bt_ver ? t(e.bt_ver) : "- - -"
    }, {
      title: "主控固件",
      value: e.fw_ver ? t(e.fw_ver) : "- - -"
    }, {
      title: "设备 MAC",
      value: e.mac || "- - -"
    }]
  },
  stopRuntimeTasks: function() {}
};