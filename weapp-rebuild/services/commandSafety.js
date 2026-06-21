var e = require("./deviceCapabilities");

function n(e) {
  return {
    ok: !1,
    message: e
  }
}

function t(e) {
  for (var n = 0; n < e.length; n += 1) {
    var t = e[n];
    if (!Number.isInteger(t) || t < 0 || t > 255) return !1
  }
  return !0
}

function r(e, n, t) {
  for (var r = n; r < t; r += 1)
    if (e[r]) return !1;
  return !0
}

function u(e, n) {
  return !n || n.indexOf(e || "") >= 0
}

function a(e, n) {
  return n.indexOf(e) >= 0
}

function l(t, r, u) {
  var a = t && t.deviceInfo;
  return a && a.hw_ver ? e.isFeatureSupported(r, a) ? null : n(u) : null
}
var s = [0, 1, 2, 3, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 26, 27, 28, 29, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
  c = [4, 5, 6, 7, 8, 9, 22, 23],
  o = ["pages/btn/btn", "pages/customSwitch/customSwitch", "pages/superShortcut/superShortcut", "pages/backup/backup"],
  g = ["pages/blebtn/blebtn", "pages/backup/backup"];

function i(e, t, i) {
  var h = i && i.route,
    p = i && "automation" === i.source,
    f = i && "superShortcut" === i.source,
    b = i && "homeQuick" === i.source,
    d = i && "gaugeAutoCamera" === i.source,
    v = p || f || b;
  switch (e) {
    case 160:
      return function(e, n) {
        return n.indexOf(e.length) >= 0
      }(t, [0]) || 1 === t.length && 0 === t[0] ? null : n("160 设备信息读取指令长度错误");
    case 161:
      return n("161 开关/充放电控制当前未恢复，已禁止直接发送");
    case 162:
      return l(i, "wheelControl", "当前固件不支持模拟滚轮指令") || (u(h, ["pages/vehicleControl/vehicleControl"]) && 1 === t.length && a(t[0], [1, 2, 3, 4, 5, 6]) ? null : n("162 模拟滚轮只能从车辆控制页发送 1-6"));
    case 163:
      var y = "pages/index/index" === h && i && "homeAirDry" === i.source;
      return l(i, "classicSettings", "当前固件不支持经典设置写入") || (u(h, ["pages/set/set", "pages/advancedSettings/advancedSettings", "pages/backup/backup"]) && t.length >= 18 && t.length <= 256 || y && t.length >= 35 && t.length <= 256 ? null : n("163 设置写入只允许设置页/高级设置页/备份页，或首页空调烘干发送受控配置"));
    case 164:
      return n("164 恢复默认参数当前未恢复，已禁止直接发送");
    case 165:
      return function(e, t, r) {
        return u(e, t) ? null : n(r || "当前页面不允许发送该高风险指令")
      }(h, ["pages/my/my"], "165 重启模块只能从我的页发送") || (14 !== t.length || r(t, 0, 14) ? n("165 重启模块必须携带 14 字节 UID") : null);
    case 166:
      return n("166 AP 自动状态开关当前未恢复，已禁止直接发送");
    case 167:
      var m = l(i, "vehicleControl", "当前固件不支持车辆控制 167 指令");
      return m || (u(h, ["pages/index/index", "pages/gauge/gauge", "pages/set/set", "pages/vehicleControl/vehicleControl", "pages/my/my"]) ? 1 !== t.length ? n("167 车控指令长度错误") : "pages/index/index" === h ? a(t[0], c) ? null : n("首页常用入口只允许发送锁车、解锁、门盖、充电口和电池加热 167 指令") : "pages/set/set" === h ? 255 === t[0] ? null : n("维护入口只允许发送 167,255") : "pages/my/my" === h ? 255 === t[0] && "serviceMode" === i.source ? null : n("我的页维护入口只允许二次确认后发送 167,255") : "pages/vehicleControl/vehicleControl" === h ? a(t[0], s) ? null : n("车辆控制页只允许发送原包已确认的座椅、车门和模拟控制 167 指令") : a(t[0], [0, 1, 2, 3, 4, 5, 8, 9]) ? null : n("仪表页只允许发送门控、前后备箱和电池加热 167 指令") : n("167 车控指令只能从首页常用入口、车辆控制页、仪表页或维护入口发送"));
    case 168:
      return i && "auth" === i.source ? 4 === t.length ? null : n("168 蓝牙密码校验必须是 4 字节") : n("168 蓝牙密码校验只能由连接鉴权流程发送");
    case 169:
      return n("169 修改蓝牙密码当前未恢复，已禁止直接发送");
    case 171:
      var A = l(i, "shortcut", "当前固件不支持快捷指令配置");
      return A || (u(h, o) ? 1 === t.length && 2 === t[0] || 256 === t.length ? null : n("171 快捷指令只允许读取 [2] 或写入 256 字节配置") : n("171 快捷指令只能由快捷指令页、自定义开关页、超级快捷指令页或备份页发送"));
    case 176:
      return l(i, "gauge", "当前固件不支持仪表轮询") || ((u(h, ["pages/gauge/gauge", "pages/index/index", "pages/vehicleControl/vehicleControl"]) || i && "homeGauge" === i.source || "pages/advancedSettings/advancedSettings" === h && i && "navigationProbe" === i.source || "pages/superShortcut/superShortcut" === h && i && "superShortcutGauge" === i.source) && 1 === t.length && a(t[0], [0, 1]) ? null : n("176 仪表轮询只能由仪表页、首页快照、车辆控制页、导航实验或超级指令车况触发发送 [0]/[1]"));
    case 185:
      return l(i, "rgb", "当前固件不支持 RGB 配置指令") || (u(h, ["pages/rgb/rgb"]) ? function(e) {
        var t = e[0];
        return a(e[1], [0, 1]) ? 0 === t || 3 === t ? 2 === e.length ? null : n("185 读取/清空指令长度错误") : 1 === t ? 258 === e.length ? null : n("185 写入指令必须携带 256 字节配置体") : 2 === t ? 3 !== e.length ? n("185 测试指令长度错误") : e[2] < 36 ? null : n("185 测试条目序号越界") : n("185 RGB 动作码不在白名单") : n("185 RGB 配置组错误")
      }(t) : n("185 RGB 指令只能从氛围灯页发送"));
    case 186:
      var x = l(i, "bleButton", "当前固件不支持蓝牙按钮配置");
      return x || (u(h, g) ? 1 === t.length && a(t[0], [1, 2]) || 256 === t.length ? null : n("186 蓝牙按钮只允许添加/读取或写入 256 字节配置") : n("186 蓝牙按钮只能由蓝牙按钮页或备份页发送"));
    case 187:
      if (d) return "pages/gauge/gauge" === h && "fun" === i.executeKind && 1 === t.length && a(t[0], [118, 119]) ? null : n("仪表盘低速自动摄像头只允许发送摄像头开启/关闭指令");
      var S = function(e, n) {
          return !n || "automation" !== n.source && "superShortcut" !== n.source && "homeQuick" !== n.source ? "pages/blebtn/blebtn" === e ? "bleButton" : "pages/btn/btn" === e ? "shortcut" : "" : "shortcut"
        }(h, i),
        w = S ? l(i, S, "bleButton" === S ? "当前固件不支持蓝牙按钮执行指令" : "当前固件不支持快捷指令执行") : null;
      return w || (!((u(h, ["pages/btn/btn", "pages/blebtn/blebtn"]) || v) && 1 === t.length && t[0] >= 1) || v && "fun" !== i.executeKind || b && "pages/index/index" !== h ? n("187 执行指令只能从快捷指令/蓝牙按钮页、首页高级快捷入口或受控动作队列发送 1-255") : null);
    case 192:
      var C = "pages/advancedSettings/advancedSettings" === h && i && "navigationProbe" === i.source;
      return (u(h, ["pages/debug/debug"]) || C ? null : n("192 调试监听只能从调试页或导航实验发送")) || function(e, t) {
        return e && e.adminLevel ? null : n(t || "高风险指令需要先开启工厂模式")
      }(i, "192 调试监听需要工厂模式") || (1 === t.length && a(t[0], [0, 1]) ? null : n("192 调试监听只能发送 0/1"));
    case 173:
    case 174:
    case 175:
      return n("".concat(e, " 云端授权/激活链路当前未恢复，已禁止直接发送"));
    case 188:
    case 189:
      return n("".concat(e, " 维护结果类指令当前未恢复，已禁止直接发送"));
    case 193:
      return n("193 车型查询当前未恢复展示入口，已禁止直接发送");
    case 208:
      return l(i, "batteryInfo", "当前固件不支持电池信息 208 指令") || (u(h, ["pages/batteryInfo/batteryInfo"]) && 1 === t.length && a(t[0], [0, 1]) ? null : n("208 电池概览只能由电池页发送 [0]/[1]"));
    case 209:
    case 210:
      return l(i, "batteryInfo", "当前固件不支持电池信息 ".concat(e, " 指令")) || (u(h, ["pages/batteryInfo/batteryInfo"]) && 1 === t.length && 1 === t[0] ? null : n("".concat(e, " 电池轮询只能由电池页发送 [1]")));
    case 240:
      return l(i, "bleHost", "当前固件不支持蓝牙主机配对") || (u(h, ["pages/bleHost/bleHost"]) ? function(e) {
        if (e.length < 15) return n("240 蓝牙主机指令缺少设备 UID");
        if (r(e, 0, 14)) return n("240 蓝牙主机指令缺少有效设备 UID");
        var t = e[14];
        return [1, 2, 4].indexOf(t) >= 0 ? 15 === e.length ? null : n("240 搜索/停止/查询指令长度错误") : 5 === t ? e.length < 22 || e.length > 46 ? n("240 连接指令长度错误") : a(e[15], [0, 1]) ? r(e, 16, 22) ? n("240 连接指令 MAC 为空") : null : n("240 连接指令地址类型错误") : 7 === t ? 22 !== e.length ? n("240 删除指令长度错误") : a(e[15], [0, 1]) ? r(e, 16, 22) ? n("240 删除指令 MAC 为空") : null : n("240 删除指令地址类型错误") : n("240 蓝牙主机动作码不在白名单")
      }(t) : n("240 蓝牙主机指令只能从蓝牙配对页发送"));
    default:
      return n("未在安全白名单中的指令：".concat(e))
  }
}
module.exports = {
  MAX_PAYLOAD_LENGTH: 4096,
  validate: function(e, r, u) {
    var a, l = Number(e);
    if (!Number.isInteger(l) || l < 0 || l > 255) return n("指令号必须是 0-255 的整数");
    try {
      a = function(e) {
        if (!e) return new Uint8Array([]);
        if (e instanceof Uint8Array) return e;
        if (e instanceof ArrayBuffer) return new Uint8Array(e);
        if (ArrayBuffer.isView(e)) throw new Error("指令 payload 只接受 Uint8Array 或 ArrayBuffer");
        if (Array.isArray(e)) {
          if (!t(e)) throw new Error("指令 payload 必须全部是 0-255 字节");
          return new Uint8Array(e)
        }
        throw new Error("指令 payload 类型不合法")
      }(r)
    } catch (e) {
      return n(e.message || "指令 payload 类型不合法")
    }
    return a.length > 4096 ? n("指令 payload 超过 ".concat(4096, " 字节")) : t(a) ? i(l, a, u || {}) || function(e, n) {
      return {
        ok: !0,
        type: e,
        payload: n
      }
    }(l, a) : n("指令 payload 必须全部是 0-255 字节")
  }
};