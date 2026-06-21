var e = require("./deviceCapabilities"),
  a = {
    settings: ["显示与仪表", "参数配置", "指令联动", "数据备份", "高级维护"],
    account: ["账号与权限", "设备与固件", "工具与缓存", "调试与维护"],
    status: ["基础驾驶控制"]
  },
  n = [{
    id: "ble",
    area: "status",
    group: "基础驾驶控制",
    name: "蓝牙连接",
    desc: "搜索并连接模块",
    iconPath: "/assets/icons/generated/action-ble@72.png",
    route: "/pages/ble/ble",
    tab: !0
  }, {
    id: "gauge",
    area: "status",
    group: "基础驾驶控制",
    name: "仪表盘",
    desc: "实时车速、电量与车况",
    iconPath: "/assets/icons/generated/action-gauge@72.png",
    route: "/pages/gauge/gauge",
    requiresConnection: !0,
    capability: "gauge"
  }, {
    id: "vehicleControl",
    area: "status",
    group: "基础驾驶控制",
    name: "车辆控制",
    desc: "车门、前后备箱与座椅",
    iconPath: "/assets/icons/generated/action-vehicle-control@72.png",
    route: "/pages/vehicleControl/vehicleControl",
    requiresConnection: !0,
    capability: "vehicleControl"
  }, {
    id: "btn",
    area: "status",
    group: "基础驾驶控制",
    name: "快捷指令",
    desc: "绑定方向盘与模块按键",
    iconPath: "/assets/icons/generated/action-btn@72.png",
    route: "/pages/btn/btn",
    requiresConnection: !0,
    capability: "shortcut"
  }, {
    id: "superShortcut",
    area: "settings",
    group: "指令联动",
    name: "联动指令",
    desc: "触发后自动执行动作",
    iconPath: "/assets/icons/generated/action-super-shortcut@72.png",
    route: "/pages/superShortcut/superShortcut",
    requiresConnection: !0,
    allowsOfflineView: !0,
    advanced: !0,
    capability: "superShortcut"
  }, {
    id: "automation",
    area: "settings",
    group: "指令联动",
    name: "自动执行",
    desc: "连接后按条件执行",
    iconPath: "/assets/icons/generated/action-workflow@72.png",
    route: "/pages/automation/automation",
    requiresConnection: !0,
    allowsOfflineView: !0,
    advanced: !0,
    capability: "shortcut"
  }, {
    id: "customSwitch",
    area: "settings",
    group: "指令联动",
    name: "场景开关",
    desc: "一键启停快捷指令组",
    iconPath: "/assets/icons/generated/action-btn@72.png",
    route: "/pages/customSwitch/customSwitch",
    requiresConnection: !0,
    allowsOfflineView: !0,
    capability: "shortcut"
  }, {
    id: "blebtn",
    area: "settings",
    group: "指令联动",
    name: "蓝牙按钮",
    desc: "绑定外接按键动作",
    iconPath: "/assets/icons/generated/action-blebtn@72.png",
    route: "/pages/blebtn/blebtn",
    requiresConnection: !0,
    capability: "bleButton"
  }, {
    id: "settingsQuick",
    area: "homeShortcut",
    group: "参数配置",
    name: "快捷功能",
    desc: "灯光、门盖与驾驶偏好",
    iconPath: "/assets/icons/generated/action-sparkles@72.png",
    route: "/pages/advancedSettings/advancedSettings?scope=quick",
    requiresConnection: !0,
    allowsOfflineView: !0,
    capability: "classicSettings"
  }, {
    id: "settingsBasic",
    area: "settings",
    group: "参数配置",
    name: "基础参数",
    desc: "提示音、指示灯与反馈",
    iconPath: "/assets/icons/generated/action-sliders@72.png",
    route: "/pages/advancedSettings/advancedSettings?scope=basic",
    requiresConnection: !0,
    allowsOfflineView: !0,
    capability: "classicSettings"
  }, {
    id: "settingsAp",
    area: "homeShortcut",
    group: "参数配置",
    name: "AP辅助",
    desc: "AP恢复、免打扰与滚轮",
    iconPath: "/assets/icons/generated/action-eye@72.png",
    route: "/pages/advancedSettings/advancedSettings?scope=ap",
    requiresConnection: !0,
    allowsOfflineView: !0,
    capability: "classicSettings"
  }, {
    id: "backup",
    area: "settings",
    group: "数据备份",
    name: "备份恢复",
    desc: "备份和恢复模块配置",
    iconPath: "/assets/icons/generated/action-backup@72.png",
    route: "/pages/backup/backup",
    requiresConnection: !0,
    capability: "backup"
  }, {
    id: "gaugeMenu",
    area: "settings",
    group: "显示与仪表",
    name: "仪表设置",
    desc: "仪表外观、布局和背景",
    iconPath: "/assets/icons/generated/action-gaugemenu@72.png",
    route: "/pages/gaugeMenu/gaugeMenu",
    capability: "gauge"
  }, {
    id: "moduleAutoSwitch",
    area: "settings",
    group: "高级维护",
    name: "模块启停",
    desc: "进入启用，退出停用",
    iconPath: "/assets/icons/generated/action-service@72.png",
    route: "/pages/moduleAutoSwitch/moduleAutoSwitch",
    requiresConnection: !0,
    allowsOfflineView: !0,
    capability: "shortcut"
  }, {
    id: "battery",
    area: "settings",
    group: "高级维护",
    name: "电池状态",
    desc: "BMS 与电芯状态",
    iconPath: "/assets/icons/generated/action-battery@72.png",
    route: "/pages/batteryInfo/batteryInfo",
    requiresConnection: !0,
    advanced: !0,
    capability: "batteryInfo"
  }, {
    id: "rgb",
    area: "settings",
    group: "高级维护",
    name: "氛围灯",
    desc: "颜色和灯效设置",
    iconPath: "/assets/icons/generated/action-rgb@72.png",
    route: "/pages/rgb/rgb",
    requiresConnection: !0,
    advanced: !0,
    capability: "rgb"
  }, {
    id: "access",
    area: "account",
    group: "账号与权限",
    name: "访问模式",
    desc: "输入密码进入高级模式",
    iconPath: "/assets/icons/generated/action-admin@72.png"
  }, {
    id: "deviceInfo",
    area: "account",
    group: "设备与固件",
    name: "设备信息",
    desc: "设备、VIN 与版本",
    iconPath: "/assets/icons/generated/device-harddrive@72.png",
    route: "/pages/deviceInfo/deviceInfo",
    requiresConnection: !0,
    allowsOfflineView: !0
  }, {
    id: "firmware",
    area: "account",
    group: "设备与固件",
    name: "固件管理",
    desc: "查看版本和升级说明",
    iconPath: "/assets/icons/generated/action-service@72.png",
    route: "/pages/firmware/firmware",
    requiresConnection: !0,
    allowsOfflineView: !0
  }, {
    id: "hostset",
    area: "account",
    group: "工具与缓存",
    name: "服务器域名",
    desc: "设置接口域名",
    iconPath: "/assets/icons/generated/action-hostset@72.png",
    advanced: !0
  }, {
    id: "clear",
    area: "account",
    group: "工具与缓存",
    name: "清除缓存",
    desc: "清理本机保存数据",
    iconPath: "/assets/icons/generated/action-clear@72.png"
  }, {
    id: "mock",
    area: "account",
    group: "工具与缓存",
    name: "验证连接",
    desc: "无真机时测试连接",
    iconPath: "/assets/icons/generated/action-mock@72.png",
    advanced: !0
  }, {
    id: "bleHost",
    area: "account",
    group: "设备与固件",
    name: "模块配对",
    desc: "连接外接蓝牙按钮",
    iconPath: "/assets/icons/generated/action-blehost@72.png",
    route: "/pages/bleHost/bleHost",
    advanced: !0,
    capability: "bleHost"
  }, {
    id: "debug",
    area: "account",
    group: "调试与维护",
    name: "数据调试",
    desc: "查看收发原始帧",
    iconPath: "/assets/icons/generated/action-debug@72.png",
    route: "/pages/debug/debug",
    requiresAdmin: !0,
    advanced: !0
  }, {
    id: "labSettings",
    area: "account",
    group: "调试与维护",
    name: "实验室功能",
    desc: "测试中的受控配置",
    iconPath: "/assets/icons/generated/setting-test@72.png",
    route: "/pages/advancedSettings/advancedSettings?scope=lab",
    requiresConnection: !0,
    allowsOfflineView: !0,
    capability: "classicSettings"
  }, {
    id: "admin",
    area: "account",
    group: "账号与权限",
    name: "工厂模式",
    desc: "开启维护权限",
    iconPath: "/assets/icons/generated/action-admin@72.png",
    advanced: !0
  }, {
    id: "reboot",
    area: "account",
    group: "调试与维护",
    name: "重启模块",
    desc: "让模块重新启动",
    iconPath: "/assets/icons/generated/action-reboot@72.png",
    requiresConnection: !0
  }, {
    id: "service",
    area: "account",
    group: "调试与维护",
    name: "维护模式",
    desc: "进入安全维护状态",
    iconPath: "/assets/icons/generated/action-service@72.png",
    requiresConnection: !0
  }];

function t(a, t) {
  var i = t || {},
    s = i.accessMode || "normal";
  return n.filter((function(e) {
    return e.area === a
  })).filter((function(e) {
    return function(e, a) {
      return "full" === a || !e.advanced
    }(e, s)
  })).filter((function(a) {
    return function(a, n) {
      var t = n && n.deviceInfo;
      return !(a.capability && t && n.connected) || e.isFeatureSupported(a.capability, t)
    }(a, i)
  })).map((function(a) {
    return function(a, n) {
      var t = !!n.connected,
        i = Number(n.adminLevel || 0),
        s = e.getHardwareProfile(n.deviceInfo),
        o = Object.assign({}, a);
      return !a.requiresConnection || t || a.allowsOfflineView || (o.disabled = !0, o.badge = "未连接"), a.requiresConnection && !t && a.allowsOfflineView && (o.badge = "未连接"), a.requiresAdmin && !i && (o.disabled = !0, o.badge = "需工厂"), a.capability && t && s.known && !e.isFeatureSupported(a.capability, n.deviceInfo) && (o.disabled = !0, o.badge = "当前固件不支持"), "admin" === a.id && (o.badge = i ? "L".concat(i) : "未开启"), "access" === a.id && (o.badge = "full" === n.accessMode ? "完整" : "普通", o.desc = "full" === n.accessMode ? "当前为完整模式" : "当前为普通模式"), "mock" === a.id && (o.badge = n.mockConnected ? "已连接" : ""), "gaugeMenu" === a.id && (o.badge = "外观"), o
    }(a, i)
  }))
}
module.exports = {
  getEntry: function(e) {
    return n.find((function(a) {
      return a.id === e
    }))
  },
  list: t,
  groups: function(e, n) {
    var i = [];
    t(e, n).forEach((function(e) {
      var a = e.group || (e.advanced ? "高级维护" : "基础驾驶控制"),
        n = i.find((function(e) {
          return e.name === a
        }));
      n || (n = {
        name: a,
        items: []
      }, i.push(n)), n.items.push(e)
    }));
    var s = a[e] || [];
    return i.sort((function(e, a) {
      var n = s.indexOf(e.name),
        t = s.indexOf(a.name);
      return (n >= 0 ? n : s.length) - (t >= 0 ? t : s.length)
    }))
  },
  entries: n
};