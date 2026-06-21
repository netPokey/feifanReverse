var e = ["0", "P", "R", "N", "D"],
  t = ["关闭", "左转", "右转", "双闪"],
  a = ["none", "left", "right", "both"],
  n = ["未开启", "AP", "AP", "AP"],
  r = ["无", "近距", "中距", "危险"],
  o = ["关闭", "加热", "预热", "保温"],
  i = [{
    name: "左前门",
    bit: 0
  }, {
    name: "右前门",
    bit: 2
  }, {
    name: "左后门",
    bit: 1
  }, {
    name: "右后门",
    bit: 3
  }];

function c(e, t) {
  return !e || e.length <= t ? 0 : 255 & Number(e[t])
}

function l(e, t) {
  return !!e && e.length >= t
}

function m(e, t) {
  return c(e, t + 3) << 24 | c(e, t + 2) << 16 | c(e, t + 1) << 8 | c(e, t)
}

function u(e, t) {
  var a = e & (1 << t) - 1;
  return a >= 1 << t - 1 ? a - (1 << t) : a
}

function p(e) {
  var t = e || new Date,
    a = t.getHours(),
    n = t.getMinutes();
  return "".concat(a < 10 ? "0" : "").concat(a, ":").concat(n < 10 ? "0" : "").concat(n)
}

function s(e) {
  var t = 3 & Number(e || 0);
  return a[t] || a[0]
}

function d() {
  return {
    speed: "0",
    speedRaw: 0,
    speedType: !1,
    unit: "KM/H",
    gear: 0,
    gearLabel: "-",
    turn: 0,
    turnLabel: "关闭",
    turnSignal: a[0],
    turnLeftActive: !1,
    turnRightActive: !1,
    autoPilot: 0,
    autoPilotLabel: "未开启",
    light: 0,
    door: 0,
    doorList: i.map((function(e) {
      return {
        name: e.name,
        open: !1
      }
    })),
    frunkIsOpen: 0,
    trunkIsOpen: 0,
    keepScreenOn: !0,
    aspect: 0,
    sport: 1,
    odometer: "0.0km",
    batteryPercent: "100%",
    pressure: ["0", "0", "0", "0"],
    brakeTemp: ["- -", "- -", "- -", "- -"],
    accelPedalPos: 0,
    rearInverterPower: 0,
    frontInverterPower: 0,
    totalInverterPower: 0,
    altitude: "0m",
    battHeat: 0,
    battHeatLabel: o[0],
    speedUnits: 1,
    handsOn: 0,
    hvacBlowerSpeedRPM: 0,
    wattsDemandEvap: 0,
    hvacCabinTempEst: "- -",
    tempAmbientRaw: "- -",
    cellVoltage: "0.00V",
    remainRange: "0km",
    batteryTemp: "0℃",
    fusedSpeedLimit: 0,
    blindSpotRear: [0, 0],
    blindSpotLabels: [r[0], r[0]],
    leftBottom: ["0.0km", "0m", p(), "00:00"],
    rightBottom: ["100%", "0km", "0.00V", "0℃"],
    hasFullFrame: !1
  }
}
module.exports = {
  createEmptyGaugeState: d,
  formatTime: p,
  parseGaugeFrame: function(a, v, b) {
    var f = Object.assign(d(), v || {}),
      g = b || {},
      P = g.now || Date.now(),
      h = g.date || new Date(P);
    if (!l(a, 4)) return f;
    var L = m(a, 0),
      S = Number(f.autoPilot || 0),
      w = L >>> 0 & 511,
      k = L >>> 9 & 7,
      I = k >= 1 && k <= 4,
      R = I ? 0 === w ? e[k] || "0" : w : p(h);
    f.speedRaw = w, f.speed = String(R), f.speedType = I, f.gear = k, f.gearLabel = e[k] || String(k), f.turn = L >>> 12 & 3, f.turnLabel = t[f.turn] || String(f.turn), f.turnSignal = s(f.turn), f.turnLeftActive = !!(1 & f.turn), f.turnRightActive = !!(2 & f.turn);
    var M, O = L >>> 14 & 3;
    return f.autoPilot = 3 === O && 0 === S ? 0 : O, f.autoPilotLabel = n[f.autoPilot] || String(f.autoPilot), f.door = L >>> 16 & 15, f.doorList = (M = f.door, i.map((function(e) {
      return {
        name: e.name,
        open: !!(M >>> e.bit & 1)
      }
    }))), f.light = L >>> 20 & 15 | L >>> 27 & 16 | c(a, 4) << 1 & 32, f.batteryPercent = "".concat(L >>> 24 & 127, "%"), f.rightBottom[0] = f.batteryPercent, l(a, 8) && (L = m(a, 4), f.frunkIsOpen = L >>> 1 & 1, f.trunkIsOpen = L >>> 5 & 1, f.keepScreenOn = 0 == (L >>> 0 & 1), f.aspect = L >>> 2 & 1, f.sport = L >>> 3 & 1, f.odometer = "".concat(((L >>> 6 & 67108863) / 10).toFixed(1), "km"), f.leftBottom[0] = f.odometer), l(a, 12) && (f.pressure = [8, 9, 10, 11].map((function(e) {
      return 0 === (t = c(a, e)) || 255 === t ? "0" : (.025 * t).toFixed(1);
      var t
    }))), l(a, 16) && (L = m(a, 12), f.accelPedalPos = Math.min(100, Math.round(100 * (L >>> 0 & 255) / 250)), f.rearInverterPower = Math.round(u(L >>> 8 & 2047, 11) / 2), f.frontInverterPower = Math.round(u(L >>> 19 & 2047, 11) / 2), f.totalInverterPower = f.frontInverterPower + f.rearInverterPower), l(a, 33) && (f.hasFullFrame = !0, L = c(a, 17) << 16 | c(a, 16) << 8 | c(a, 15), f.altitude = "".concat(u(L >>> 6 & 16383, 14), "m"), f.leftBottom[1] = f.altitude, f.battHeat = c(a, 17) >>> 4 & 3, f.battHeatLabel = o[f.battHeat] || String(f.battHeat), f.speedUnits = c(a, 17) >>> 6 & 1, f.unit = f.speedUnits ? "KM/H" : "MPH", f.handsOn = c(a, 17) >>> 7 & 1, L = m(a, 18), f.brakeTemp = [(L >>> 0 & 1023) - 40, (L >>> 10 & 1023) - 40, (L >>> 20 & 1023) - 40, (c(a, 22) << 2 | L >>> 30) - 40], L = m(a, 23), f.hvacBlowerSpeedRPM = 5 * (L >>> 0 & 1023), f.wattsDemandEvap = 5 * (L >>> 10 & 2047), f.hvacCabinTempEst = "".concat((.1 * (L >>> 21 & 2047) - 40).toFixed(1), "℃"), f.tempAmbientRaw = "".concat((.5 * c(a, 27) - 40).toFixed(1), "℃"), L = m(a, 28), f.cellVoltage = "".concat((.002 * (L >>> 0 & 4095)).toFixed(2), "V"), f.remainRange = "".concat((1.61 * (L >>> 12 & 1023)).toFixed(0), "km"), f.batteryTemp = "".concat((.25 * (L >>> 22 & 511) - 25).toFixed(1), "℃"), f.rightBottom[1] = f.remainRange, f.rightBottom[2] = f.cellVoltage, f.rightBottom[3] = f.batteryTemp, L = c(a, 32) << 8 | c(a, 31), f.fusedSpeedLimit = k >= 2 && k <= 4 ? 5 * (L >>> 7 & 31) : 0, f.blindSpotRear = [L >>> 12 & 3, L >>> 14 & 3], f.blindSpotLabels = f.blindSpotRear.map((function(e) {
      return r[e] || String(e)
    }))), f.leftBottom[2] = p(h), f.leftBottom[3] = function(e, t) {
      if (!e) return "00:00";
      var a = Math.max(0, Math.floor(((t || Date.now()) - e) / 1e3)),
        n = Math.floor(a / 3600),
        r = Math.floor(a / 60) % 60,
        o = a % 60,
        i = "".concat(r < 10 ? "0" : "").concat(r, ":").concat(o < 10 ? "0" : "").concat(o);
      return n <= 0 ? i : "".concat(n < 10 ? "0" : "").concat(n, ":").concat(i)
    }(g.runStartTime, P), f
  },
  resolveTurnSignal: s,
  toMetricGroups: function(e) {
    var t, a, n = e || d();
    return {
      status: [{
        name: "档位",
        val: n.gearLabel
      }, {
        name: "AP",
        val: n.autoPilotLabel
      }, {
        name: "转向",
        val: n.turnLabel
      }, {
        name: "限速",
        val: n.fusedSpeedLimit ? "".concat(n.fusedSpeedLimit, "km/h") : "- -"
      }, {
        name: "手扶",
        val: n.handsOn ? "提示" : "正常"
      }, {
        name: "运动",
        val: n.sport ? "开启" : "关闭"
      }],
      body: [{
        name: "左前门",
        val: n.doorList[0].open ? "开启" : "关闭",
        active: n.doorList[0].open
      }, {
        name: "右前门",
        val: n.doorList[1].open ? "开启" : "关闭",
        active: n.doorList[1].open
      }, {
        name: "左后门",
        val: n.doorList[2].open ? "开启" : "关闭",
        active: n.doorList[2].open
      }, {
        name: "右后门",
        val: n.doorList[3].open ? "开启" : "关闭",
        active: n.doorList[3].open
      }, {
        name: "前备箱",
        val: n.frunkIsOpen ? "开启" : "关闭",
        active: !!n.frunkIsOpen
      }, {
        name: "后备箱",
        val: n.trunkIsOpen ? "开启" : "关闭",
        active: !!n.trunkIsOpen
      }, {
        name: "灯光位",
        val: "0x".concat((t = n.light, a = t.toString(16).toUpperCase(), a.length >= 2 ? a : "0".concat(a)))
      }, {
        name: "盲区",
        val: "".concat(n.blindSpotLabels[0], " / ").concat(n.blindSpotLabels[1])
      }],
      tires: n.pressure.map((function(e, t) {
        return {
          name: ["左前", "右前", "左后", "右后"][t],
          val: "0" === e ? "- -" : "".concat(e, " Bar"),
          sub: "- -" === n.brakeTemp[t] ? "- -" : "".concat(n.brakeTemp[t], "℃")
        }
      })),
      power: [{
        name: "加速踏板",
        val: "".concat(n.accelPedalPos, "%")
      }, {
        name: "前电机",
        val: "".concat(n.frontInverterPower, " kW")
      }, {
        name: "后电机",
        val: "".concat(n.rearInverterPower, " kW")
      }, {
        name: "合计功率",
        val: "".concat(n.totalInverterPower, " kW")
      }],
      climate: [{
        name: "鼓风机",
        val: "".concat(n.hvacBlowerSpeedRPM, " RPM")
      }, {
        name: "蒸发器",
        val: "".concat(n.wattsDemandEvap, " W")
      }, {
        name: "座舱温度",
        val: n.hvacCabinTempEst
      }, {
        name: "环境温度",
        val: n.tempAmbientRaw
      }, {
        name: "电池加热",
        val: n.battHeatLabel
      }, {
        name: "屏幕常亮",
        val: n.keepScreenOn ? "是" : "否"
      }]
    }
  }
};