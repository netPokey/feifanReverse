var t = {
    classicVehicle: [3, 5, 6, 7, 8, 19],
    classicCanRich: [6, 7, 8, 19],
    teslaSubtype: [6, 8, 19],
    simLite: [4, 10],
    rgbLite: [9],
    bleButtonLite: [20],
    fdqPower: [12],
    qdqPower: [13],
    rgbConfig: [6, 7, 8, 9, 10, 19, 20],
    bleButtonConfig: [6, 7, 8, 9, 10, 19, 20]
  },
  e = {
    vehicleControl: "supportsVehicleControl",
    wheelControl: "supportsWheelControl",
    gauge: "supportsGauge",
    shortcut: "supportsShortcut",
    superShortcut: "supportsShortcut",
    classicSettings: "supportsClassicSettings",
    backup: "supportsBackup",
    batteryInfo: "supportsBatteryInfo",
    rgb: "supportsRgb",
    bleButton: "supportsBleButton",
    blePasswordChange: "supportsBlePasswordChange",
    bleHost: "supportsBleHost",
    fdqPanel: "supportsFdqPanel",
    qdqPanel: "supportsQdqPanel",
    powerPanel: "supportsPowerPanel"
  };

function r(t, e) {
  return e.indexOf(Number(t || 0)) >= 0
}

function s(t) {
  return Number("number" == typeof t || "string" == typeof t ? t || 0 : t && t.hw_ver || 0)
}

function o(t) {
  var e = {
    unknown: "未连接",
    unknownHardware: "未知硬件",
    classicVehicle: "车辆控制固件",
    simLite: "SIM精简固件",
    rgbLite: "RGB精简固件",
    bleButtonLite: "蓝牙按钮固件",
    fdqPower: "放电枪固件",
    qdqPower: "充电枪固件"
  };
  return e[t] || e.unknownHardware
}

function n(e) {
  var n = s(e),
    u = function(e) {
      return e ? r(e, t.classicVehicle) ? "classicVehicle" : r(e, t.simLite) ? "simLite" : r(e, t.rgbLite) ? "rgbLite" : r(e, t.bleButtonLite) ? "bleButtonLite" : r(e, t.fdqPower) ? "fdqPower" : r(e, t.qdqPower) ? "qdqPower" : "unknownHardware" : "unknown"
    }(n),
    p = r(n, t.classicVehicle),
    i = r(n, t.fdqPower) || r(n, t.qdqPower);
  return {
    hw_ver: n,
    known: n > 0,
    family: u,
    label: o(u),
    supportsVehicleControl: p,
    supportsWheelControl: p,
    supportsGauge: p,
    supportsShortcut: p,
    supportsClassicSettings: p,
    supportsBackup: p,
    supportsBatteryInfo: p,
    supportsVehicleType: p,
    supportsCanStatus: r(n, t.classicCanRich),
    supportsTeslaSubtype: r(n, t.teslaSubtype),
    supportsRgb: r(n, t.rgbConfig),
    supportsBleButton: r(n, t.bleButtonConfig),
    supportsBlePasswordChange: r(n, t.bleButtonConfig),
    supportsBleHost: r(n, t.bleButtonConfig),
    supportsPowerPanel: i,
    supportsFdqPanel: r(n, t.fdqPower),
    supportsQdqPanel: r(n, t.qdqPower),
    bootUpdatePrecheck: r(n, [3, 5, 6, 7, 8, 19]) ? "quietOff" : r(n, [4, 10]) ? "simOn" : ""
  }
}

function u(t, r) {
  var s = r && r.profile ? r.profile : n(r),
    o = function(t) {
      return e[t] || t
    }(t);
  return !s.known || (!o || !!s[o])
}
module.exports = {
  GROUPS: t,
  FEATURE_CAPABILITIES: e,
  getHardwareProfile: n,
  isFeatureSupported: u,
  isClassicSettingSupported: function(t) {
    return u("classicSettings", t)
  },
  hardwareAllows: function(t, e) {
    var o = s(e);
    return !(o && t && t.length) || r(o, t)
  }
};