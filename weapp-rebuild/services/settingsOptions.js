var e = [{
    val: 0,
    name: "关闭(默认)"
  }, {
    val: 1,
    name: "开启"
  }],
  a = require("./deviceCapabilities"),
  n = [3, 5, 6, 7, 8, 19],
  t = [{
    val: 0,
    name: "开启(默认)"
  }, {
    val: 1,
    name: "关闭"
  }],
  i = [{
    id: "mianSwitch",
    group: "快捷功能设置",
    section: "模块状态",
    name: "模块总开关",
    desc: "启用或停用模块主功能",
    primary: !0,
    control: "switch",
    switchOnValue: 0,
    switchOffValue: 1,
    options: t,
    hw_ver: n,
    bit: {
      offset: 28,
      shift: 3,
      mask: 1
    }
  }, {
    id: "apAutoOpenType",
    group: "AP辅助参数设置",
    section: "AP恢复",
    name: "AP恢复",
    desc: "退出后按设定方式恢复 AP",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "双击右滚轮"
    }, {
      val: 2,
      name: "下拉档杆到底"
    }, {
      val: 3,
      name: "跟随AP"
    }],
    hw_ver: n,
    bit: {
      offset: 28,
      shift: 1,
      mask: 3
    }
  }, {
    id: "apAutoOpenTime",
    group: "AP辅助参数设置",
    section: "AP恢复",
    name: "AP恢复延时",
    desc: "AP恢复触发后的等待时间",
    options: [{
      val: 0,
      name: "立即恢复AP(默认)"
    }, {
      val: 1,
      name: "延时1秒后恢复AP"
    }, {
      val: 2,
      name: "延时2秒后恢复AP"
    }, {
      val: 3,
      name: "延时3秒后恢复AP"
    }, {
      val: 4,
      name: "延时4秒后恢复AP"
    }, {
      val: 5,
      name: "延时5秒后恢复AP"
    }, {
      val: 6,
      name: "延时6秒后恢复AP"
    }, {
      val: 7,
      name: "延时7秒后恢复AP"
    }],
    hw_ver: n,
    bit: {
      offset: 30,
      shift: 1,
      mask: 7
    }
  }, {
    id: "oneClickOpenAP",
    group: "AP辅助参数设置",
    section: "AP恢复",
    name: "一键AP",
    desc: "启用一键辅助驾驶入口",
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 31,
      shift: 3,
      mask: 1
    }
  }, {
    id: "fsd",
    group: "AP辅助参数设置",
    section: "AP恢复",
    name: "EAP辅助",
    desc: "辅助增强驾驶相关操作",
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 28,
      shift: 5,
      mask: 1
    }
  }, {
    id: "OffAPAutoWiper",
    group: "AP辅助参数设置",
    section: "AP免打扰",
    name: "关闭自动雨刮",
    desc: "AP 场景下关闭自动雨刮",
    primary: !0,
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 25,
      shift: 7,
      mask: 1
    }
  }, {
    id: "dynamicBrakeLight",
    group: "快捷功能设置",
    section: "灯光提醒",
    name: "动态刹车灯",
    desc: "按刹车力度触发动态灯效",
    primary: !0,
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "轻踩刹车"
    }, {
      val: 2,
      name: "深踩刹车"
    }],
    hw_ver: n,
    bit: {
      offset: 33,
      shift: 6,
      mask: 3
    }
  }, {
    id: "airAutoArid",
    group: "快捷功能设置",
    section: "座舱便利",
    name: "空调烘干",
    desc: "停车后自动干燥空调风道",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "烘干1分钟"
    }, {
      val: 2,
      name: "烘干5分钟"
    }, {
      val: 3,
      name: "烘干10分钟"
    }],
    hw_ver: n,
    bit: {
      offset: 33,
      shift: 4,
      mask: 3
    }
  }, {
    id: "apHighBeam",
    group: "AP辅助参数设置",
    section: "AP免打扰",
    name: "手动远光",
    desc: "恢复原包远光控制模式",
    primary: !0,
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "老-AP手动远光"
    }, {
      val: 2,
      name: "新-随心远光"
    }],
    hw_ver: n,
    bit: {
      offset: 31,
      shift: 4,
      mask: 3
    }
  }, {
    id: "blinkHighBeam",
    group: "快捷功能设置",
    section: "灯光提醒",
    name: "远光闪3次",
    desc: "触发远光闪烁 3 次",
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 30,
      shift: 6,
      mask: 1
    }
  }, {
    id: "pluseHighBeam",
    group: "快捷功能设置",
    section: "灯光提醒",
    name: "远光爆闪速度",
    desc: "配置远光爆闪节奏",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "快"
    }, {
      val: 2,
      name: "中"
    }, {
      val: 3,
      name: "慢"
    }],
    hw_ver: n,
    bit: {
      offset: 25,
      shift: 0,
      mask: 3
    }
  }, {
    id: "openDoorHazardLight",
    group: "快捷功能设置",
    section: "灯光提醒",
    name: "开门双闪灯",
    desc: "开门时联动双闪",
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 30,
      shift: 4,
      mask: 1
    }
  }, {
    id: "backHazardLight",
    group: "快捷功能设置",
    section: "灯光提醒",
    name: "倒车双闪灯",
    desc: "倒车时联动双闪",
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 30,
      shift: 7,
      mask: 1
    }
  }, {
    id: "KERS",
    group: "快捷功能设置",
    section: "驾驶偏好",
    name: "能量回收制动",
    desc: "调整能量回收力度",
    options: [{
      val: 0,
      name: "车机设置(默认)"
    }, {
      val: 1,
      name: "0%"
    }, {
      val: 2,
      name: "25%"
    }, {
      val: 3,
      name: "50%"
    }, {
      val: 4,
      name: "75%"
    }, {
      val: 5,
      name: "100%"
    }],
    hw_ver: n,
    bit: {
      offset: 24,
      shift: 5,
      mask: 7
    }
  }, {
    id: "stoppingMode",
    group: "快捷功能设置",
    section: "驾驶偏好",
    name: "停止模式设置",
    desc: "车辆停止模式偏好",
    options: [{
      val: 0,
      name: "车机设置(默认)"
    }, {
      val: 1,
      name: "保持"
    }, {
      val: 2,
      name: "缓行"
    }, {
      val: 3,
      name: "转动"
    }],
    hw_ver: n,
    bit: {
      offset: 25,
      shift: 5,
      mask: 3
    }
  }, {
    id: "autoSportMode",
    group: "快捷功能设置",
    section: "驾驶偏好",
    name: "自动运动模式",
    desc: "按电门开度自动切换运动模式",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "电门>=20%时"
    }, {
      val: 2,
      name: "电门>=30%时"
    }, {
      val: 3,
      name: "电门>=40%时"
    }, {
      val: 4,
      name: "电门>=50%时"
    }, {
      val: 5,
      name: "电门>=60%时"
    }, {
      val: 6,
      name: "电门>=70%时"
    }, {
      val: 7,
      name: "电门>=80%时"
    }],
    hw_ver: n,
    bit: {
      offset: 24,
      shift: 0,
      mask: 7
    }
  }, {
    id: "autoParkBrake",
    group: "快捷功能设置",
    section: "驾驶偏好",
    name: "自动强驻车",
    desc: "自动触发强驻车制动",
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 24,
      shift: 4,
      mask: 1
    }
  }, {
    id: "frontRightEasyAccess",
    group: "快捷功能设置",
    section: "座舱便利",
    name: "副驾便利进出",
    desc: "副驾座椅便利进出条件",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "副驾安全带解系时"
    }, {
      val: 2,
      name: "副驾车门开关时"
    }],
    hw_ver: n,
    bit: {
      offset: 25,
      shift: 3,
      mask: 3
    }
  }, {
    id: "TimeOpenFrontBox",
    group: "快捷功能设置",
    section: "门盖联动",
    name: "门把手开关前备箱",
    desc: "门把手长拉打开前备箱",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "长拉1秒"
    }, {
      val: 2,
      name: "长拉2秒"
    }, {
      val: 3,
      name: "长拉3秒"
    }, {
      val: 4,
      name: "长拉4秒"
    }, {
      val: 5,
      name: "长拉5秒"
    }, {
      val: 6,
      name: "长拉6秒"
    }, {
      val: 7,
      name: "长拉7秒"
    }],
    hw_ver: n,
    bit: {
      offset: 29,
      shift: 2,
      mask: 7
    }
  }, {
    id: "TimeOpenChargeDoor",
    group: "快捷功能设置",
    section: "门盖联动",
    name: "门把手开关充电口",
    desc: "门把手长拉打开充电口",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "长拉1秒"
    }, {
      val: 2,
      name: "长拉2秒"
    }, {
      val: 3,
      name: "长拉3秒"
    }, {
      val: 4,
      name: "长拉4秒"
    }, {
      val: 5,
      name: "长拉5秒"
    }, {
      val: 6,
      name: "长拉6秒"
    }, {
      val: 7,
      name: "长拉7秒"
    }],
    hw_ver: n,
    bit: {
      offset: 29,
      shift: 5,
      mask: 7
    }
  }, {
    id: "automdr",
    group: "AP辅助参数设置",
    section: "AP免打扰",
    name: "AP自动免打扰",
    desc: "跟随 AP 自动进入免打扰",
    primary: !0,
    control: "switch",
    options: [{
      val: 0,
      name: "关闭(默认)"
    }, {
      val: 1,
      name: "跟随AP"
    }],
    hw_ver: [6, 7, 8, 19],
    bit: {
      offset: 28,
      shift: 4,
      mask: 1
    }
  }, {
    id: "ModeMDR",
    group: "AP辅助参数设置",
    section: "AP免打扰",
    name: "AP免打扰方式",
    desc: "免打扰执行方式",
    options: [{
      val: 0,
      name: "滚轮免打扰(默认)"
    }, {
      val: 1,
      name: "无感免打扰"
    }, {
      val: 2,
      name: "滚轮+无感"
    }],
    hw_ver: [19],
    bit: {
      offset: 29,
      shift: 0,
      mask: 3
    }
  }, {
    id: "beep",
    group: "基础参数设置",
    section: "反馈提示",
    name: "提示音音量",
    desc: "模块提示音音量",
    options: [{
      val: 0,
      name: "0%"
    }, {
      val: 1,
      name: "5%"
    }, {
      val: 2,
      name: "10%"
    }, {
      val: 3,
      name: "15%"
    }, {
      val: 4,
      name: "20%"
    }, {
      val: 5,
      name: "25%"
    }, {
      val: 6,
      name: "30%"
    }, {
      val: 7,
      name: "35%"
    }, {
      val: 8,
      name: "40%"
    }, {
      val: 9,
      name: "45%"
    }, {
      val: 10,
      name: "50%"
    }, {
      val: 20,
      name: "55%"
    }, {
      val: 30,
      name: "60%"
    }, {
      val: 50,
      name: "65%"
    }, {
      val: 70,
      name: "70%"
    }, {
      val: 90,
      name: "75%"
    }, {
      val: 110,
      name: "80%"
    }, {
      val: 130,
      name: "85%"
    }, {
      val: 150,
      name: "90%"
    }, {
      val: 170,
      name: "95%"
    }, {
      val: 255,
      name: "100%(默认)"
    }],
    hw_ver: n,
    bit: {
      offset: 26,
      shift: 0,
      mask: 255
    },
    defaultValue: 255
  }, {
    id: "led",
    group: "基础参数设置",
    section: "反馈提示",
    name: "LED灯开关",
    desc: "模块指示灯控制",
    primary: !0,
    control: "switch",
    switchOnValue: 0,
    switchOffValue: 1,
    options: t,
    hw_ver: n,
    bit: {
      offset: 27,
      shift: 4,
      mask: 1
    }
  }, {
    id: "time",
    group: "AP辅助参数设置",
    section: "滚轮策略",
    name: "滚轮操作时间",
    desc: "模块模拟滚轮动作间隔",
    options: [{
      val: 1,
      name: "每2-3秒随机(默认)"
    }, {
      val: 2,
      name: "每3-5秒随机"
    }, {
      val: 3,
      name: "每5-10秒随机"
    }, {
      val: 4,
      name: "每10-15秒随机"
    }, {
      val: 5,
      name: "每15-20秒随机"
    }, {
      val: 6,
      name: "每20-25秒随机"
    }, {
      val: 7,
      name: "每25-30秒随机"
    }, {
      val: 8,
      name: "每30-35秒随机"
    }, {
      val: 15,
      name: "定点免打扰"
    }],
    hw_ver: n,
    bit: {
      offset: 27,
      shift: 0,
      mask: 15
    },
    defaultValue: 1
  }, {
    id: "rand",
    group: "AP辅助参数设置",
    section: "滚轮策略",
    name: "滚轮随机时间",
    desc: "滚轮操作间隔随机化",
    primary: !0,
    control: "switch",
    options: [{
      val: 0,
      name: "关闭"
    }, {
      val: 1,
      name: "开启(默认)"
    }],
    hw_ver: n,
    bit: {
      offset: 28,
      shift: 0,
      mask: 1
    },
    defaultValue: 1
  }, {
    id: "lr",
    group: "AP辅助参数设置",
    section: "滚轮策略",
    name: "模块自动操作",
    desc: "选择模块自动操作的滚轮",
    options: [{
      val: 0,
      name: "左滚轮(默认)"
    }, {
      val: 1,
      name: "右滚轮"
    }, {
      val: 2,
      name: "左右滚轮交替"
    }, {
      val: 3,
      name: "左右滚轮随机"
    }],
    hw_ver: [5, 6, 7, 8, 19],
    bit: {
      offset: 28,
      shift: 6,
      mask: 3
    }
  }, {
    id: "jg",
    group: "AP辅助参数设置",
    section: "加减策略",
    name: "加减时间间隔",
    desc: "自动加减动作之间的间隔",
    options: [{
      val: 1,
      name: "0.1秒(默认)"
    }, {
      val: 2,
      name: "0.2秒"
    }, {
      val: 3,
      name: "0.3秒"
    }, {
      val: 4,
      name: "0.4秒"
    }, {
      val: 5,
      name: "0.5秒"
    }, {
      val: 6,
      name: "0.6秒"
    }, {
      val: 7,
      name: "0.7秒"
    }, {
      val: 8,
      name: "0.8秒"
    }, {
      val: 9,
      name: "0.9秒"
    }, {
      val: 10,
      name: "1.0秒"
    }],
    hw_ver: n,
    bit: {
      offset: 32,
      shift: 0,
      mask: 15
    },
    defaultValue: 1
  }, {
    id: "jj",
    group: "AP辅助参数设置",
    section: "加减策略",
    name: "自动加减类型",
    desc: "自动加减的执行顺序",
    options: [{
      val: 0,
      name: "先加后减"
    }, {
      val: 1,
      name: "先减后加(默认)"
    }, {
      val: 2,
      name: "加减交替"
    }, {
      val: 3,
      name: "加减随机"
    }],
    hw_ver: n,
    bit: {
      offset: 33,
      shift: 0,
      mask: 3
    },
    defaultValue: 1
  }, {
    id: "frontLeftBuckle",
    group: "高级维护",
    section: "安全带提醒",
    name: "主驾安全带提醒",
    desc: "控制主驾安全带提醒",
    control: "switch",
    switchOnValue: 0,
    switchOffValue: 1,
    switchLabels: {
      on: "开启",
      off: "关闭提醒"
    },
    options: [{
      val: 0,
      name: "开启(默认)"
    }, {
      val: 1,
      name: "关闭提醒"
    }],
    hw_ver: n,
    bit: {
      offset: 34,
      shift: 1,
      mask: 1
    }
  }, {
    id: "frontRightBuckle",
    group: "高级维护",
    section: "安全带提醒",
    name: "副驾安全带提醒",
    desc: "控制副驾安全带提醒",
    control: "switch",
    switchOnValue: 0,
    switchOffValue: 1,
    switchLabels: {
      on: "开启",
      off: "关闭提醒"
    },
    options: [{
      val: 0,
      name: "开启(默认)"
    }, {
      val: 1,
      name: "关闭提醒"
    }],
    hw_ver: n,
    bit: {
      offset: 34,
      shift: 2,
      mask: 1
    }
  }, {
    id: "rearBuckle",
    group: "高级维护",
    section: "安全带提醒",
    name: "后排安全带提醒",
    desc: "控制后排安全带提醒",
    control: "switch",
    switchOnValue: 0,
    switchOffValue: 1,
    switchLabels: {
      on: "开启",
      off: "关闭提醒"
    },
    options: [{
      val: 0,
      name: "开启(默认)"
    }, {
      val: 1,
      name: "关闭提醒"
    }],
    hw_ver: n,
    bit: {
      offset: 34,
      shift: 3,
      mask: 1
    }
  }, {
    id: "backHazardRearFogLight",
    group: "高级维护",
    section: "灯光实验",
    name: "倒车后雾灯照明",
    desc: "倒车时联动后雾灯照明",
    control: "switch",
    options: e,
    hw_ver: n,
    bit: {
      offset: 24,
      shift: 3,
      mask: 1
    }
  }, {
    id: "steerAssistanceLighting",
    group: "高级维护",
    section: "灯光实验",
    name: "转向辅助照明",
    desc: "转向时联动辅助照明",
    control: "switch",
    options: e,
    hw_ver: [6, 7, 8, 19],
    bit: {
      offset: 31,
      shift: 7,
      mask: 1
    }
  }],
  o = {
    quick: {
      title: "快捷功能",
      desc: "灯光提醒、门盖联动、座舱便利和驾驶偏好",
      groupName: "快捷功能设置"
    },
    basic: {
      title: "基础参数",
      desc: "提示音和模块指示灯参数",
      groupName: "基础参数设置"
    },
    ap: {
      title: "AP辅助参数",
      desc: "AP恢复、免打扰、远光雨刮和滚轮策略",
      groupName: "AP辅助参数设置"
    },
    lab: {
      title: "实验室功能",
      desc: "安全带提醒和灯光实验配置",
      groupName: "高级维护"
    }
  };

function s(e, a, n) {
  var t, i = function(e, a) {
      var n = (e.options || []).findIndex((function(e) {
        return Number(e.val) === Number(a)
      }));
      return n >= 0 ? n : 0
    }(e, a),
    o = e.options && e.options[i] ? e.options[i].name : "- - -",
    s = Object.assign({}, e, {
      options: (t = e.options, (t || []).map((function(e) {
        return Object.assign({}, e)
      }))),
      value: Number(a),
      kind: "switch" === e.control ? "switch" : "select",
      shortName: String(e.name || "").substr(0, 1),
      optionNames: (e.options || []).map((function(e) {
        return e.name
      })),
      disabled: !n
    });
  return s.valueIndex = i, s.valueName = o, s.displayValueName = String(o || "").replace(/\(默认\)/g, ""), s.switchOnValue = "number" == typeof s.switchOnValue ? s.switchOnValue : 1, s.switchOffValue = "number" == typeof s.switchOffValue ? s.switchOffValue : 0, s.checked = Number(s.value) === Number(s.switchOnValue), s.localOnly && (s.disabled = !1), s
}

function m(e, a, n) {
  return a && a.length > e.bit.offset ? a[e.bit.offset] >>> e.bit.shift & e.bit.mask : n && "number" == typeof n[e.id] ? n[e.id] : "number" == typeof e.defaultValue ? e.defaultValue : e.options && e.options[0] ? e.options[0].val : 0
}

function l(e) {
  var a = {};
  return (e || []).forEach((function(e) {
    a[e.id] = Number(e.value)
  })), a
}

function r(e, n) {
  return !(e && !e.localOnly) || (!n || !n.deviceInfo || !!a.isClassicSettingSupported(n.deviceInfo) && a.hardwareAllows(e.hw_ver, n.deviceInfo))
}
module.exports = {
  buildState: function(e, a, n) {
    var t = l(a);
    return i.map((function(a) {
      return s(a, m(a, e, t), n)
    }))
  },
  isSupportedByHardware: r,
  scopeInfo: function(e) {
    return o[e] || o.quick
  },
  updateState: function(e, a, n, t) {
    var o = l(e);
    return o[a] = Number(n), "apAutoOpenType" === a && Number(n) > 0 && (o.fsd = 0), "fsd" === a && Number(n) > 0 && (o.apAutoOpenType = 0), i.map((function(e) {
      var a = "number" == typeof e.defaultValue ? e.defaultValue : e.options[0].val;
      return s(e, "number" == typeof o[e.id] ? o[e.id] : a, t)
    }))
  },
  visibleGroups: function(e, a, n) {
    var t = n || {},
      i = t.groupName ? [t.groupName] : t.groupNames,
      o = [];
    return (e || []).filter((function(e) {
      return "full" === a || !e.advanced
    })).filter((function(e) {
      return !t.primaryOnly || e.primary
    })).filter((function(e) {
      return !i || i.indexOf(e.group) >= 0
    })).filter((function(e) {
      return r(e, t)
    })).forEach((function(e) {
      var a = o.find((function(a) {
        return a.name === e.group
      }));
      a || (a = {
        name: e.group,
        items: [],
        sections: []
      }, o.push(a)), a.items.push(e);
      var n = e.section || e.group,
        t = a.sections.find((function(e) {
          return e.name === n
        }));
      t || (t = {
        name: n,
        items: []
      }, a.sections.push(t)), t.items.push(e)
    })), o
  },
  writeBytes: function(e, a, n) {
    var t = new Uint8Array(e || []),
      o = l(a),
      s = i.filter((function(e) {
        return r(e, n || {})
      }));
    return s.forEach((function(e) {
      !e.bit || e.localOnly || t.length <= e.bit.offset || (t[e.bit.offset] &= ~(e.bit.mask << e.bit.shift))
    })), s.forEach((function(e) {
      if (!(!e.bit || e.localOnly || t.length <= e.bit.offset)) {
        var a = "number" == typeof o[e.id] ? o[e.id] : m(e);
        t[e.bit.offset] |= (a & e.bit.mask) << e.bit.shift
      }
    })), t
  }
};