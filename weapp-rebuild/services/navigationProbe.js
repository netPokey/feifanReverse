var t = {
    160: "设备信息",
    161: "旧首页/充放电",
    163: "模块设置",
    167: "车控回包",
    168: "蓝牙鉴权",
    169: "改密结果",
    171: "快捷配置",
    176: "仪表车况",
    185: "RGB 配置",
    186: "蓝牙按钮配置",
    187: "快捷执行",
    192: "调试监听",
    208: "电池概览",
    209: "电芯数据",
    210: "DCDC 数据",
    240: "蓝牙主机"
  },
  e = {
    176: "仪表车况"
  },
  n = {
    160: "设置页设备信息",
    161: "旧首页/充放电",
    163: "模块设置",
    167: "车控回包",
    168: "蓝牙鉴权",
    169: "改密结果",
    171: "快捷配置",
    185: "RGB 配置",
    186: "蓝牙按钮配置",
    187: "快捷执行",
    192: "调试监听",
    208: "电池概览",
    209: "电芯数据",
    210: "DCDC 数据",
    240: "蓝牙主机"
  };

function r(t) {
  var e = Number(t || 0).toString(16).toUpperCase();
  return e.length < 2 ? "0".concat(e) : e
}

function a(t) {
  var e = String(Number(t || 0));
  return e.length < 2 ? "0".concat(e) : e
}

function c(t) {
  return t ? t instanceof Uint8Array ? t : t instanceof ArrayBuffer || Array.isArray(t) ? new Uint8Array(t) : ArrayBuffer.isView(t) ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : new Uint8Array([]) : new Uint8Array([])
}

function o(t) {
  return Array.prototype.map.call(c(t), r).join(" ")
}

function s(t) {
  return "0x".concat(r(t))
}

function u(t) {
  var e = new Date(t);
  return [a(e.getHours()), a(e.getMinutes()), a(e.getSeconds())].join(":")
}

function i(t) {
  var e = t || {};
  return {
    startedAt: Date.now(),
    stoppedAt: 0,
    maxFrames: Number(e.maxFrames || 360),
    totalObserved: 0,
    candidateTotal: 0,
    referenceTotal: 0,
    routineTotal: 0,
    frames: [],
    markers: [],
    typeStats: {}
  }
}

function f(t) {
  var e = function(t) {
      return t && t.typeStats ? Object.keys(t.typeStats).map((function(e) {
        return t.typeStats[e]
      })) : []
    }(t).sort((function(t, e) {
      return e.count - t.count
    })),
    n = function(t) {
      return t.filter((function(t) {
        return "candidate" === t.category && (!t.known || t.changed > 0 || t.count > 0)
      })).sort((function(t, e) {
        return t.changed !== e.changed ? e.changed - t.changed : t.known !== e.known ? t.known ? 1 : -1 : e.count - t.count
      })).slice(0, 8)
    }(e),
    r = e.filter((function(t) {
      return "reference" === t.category
    })),
    a = e.filter((function(t) {
      return "routine" === t.category
    }));
  return {
    startedAt: t ? t.startedAt : 0,
    stoppedAt: t ? t.stoppedAt : 0,
    total: t ? t.candidateTotal : 0,
    observedTotal: t ? t.totalObserved : 0,
    referenceTotal: t ? t.referenceTotal : 0,
    routineTotal: t ? t.routineTotal : 0,
    typeCount: e.filter((function(t) {
      return "candidate" === t.category
    })).length,
    unknownTypeCount: e.filter((function(t) {
      return "candidate" === t.category && !t.known
    })).length,
    changedTypeCount: e.filter((function(t) {
      return "candidate" === t.category && t.changed > 0
    })).length,
    topTypes: n.slice(0, 6),
    referenceTypes: r,
    routineTypes: a.slice(0, 6),
    candidates: n,
    markers: t ? t.markers.slice(-8) : [],
    recentFrames: t ? t.frames.filter((function(e) {
      var n = t.typeStats[String(e.type)];
      return n && "routine" !== n.category
    })).slice(-8) : []
  }
}

function l(t) {
  var e = t.lengths.length ? t.lengths.join("/") : "-";
  return "".concat(s(t.type), " ").concat(t.name, " 次数:").concat(t.count, " 变化:").concat(t.changed, " 长度:").concat(e)
}
module.exports = {
  KNOWN_TYPES: t,
  ROUTINE_TYPES: n,
  REFERENCE_TYPES: e,
  createSession: i,
  addFrame: function(r, a, s) {
    if (!r) return null;
    var u = Number(a),
      i = c(s),
      f = o(i),
      l = Date.now(),
      h = {
        type: u,
        hex: f,
        len: i.length,
        ts: l
      };
    r.totalObserved += 1, r.frames.push(h), r.frames.length > r.maxFrames && r.frames.shift();
    var p = String(u),
      d = r.typeStats[p] || function(r) {
        var a = n[r] ? "routine" : e[r] ? "reference" : "candidate";
        return {
          type: Number(r),
          name: t[r] || "未知帧",
          known: !!t[r],
          category: a,
          count: 0,
          changed: 0,
          lengths: [],
          firstAt: 0,
          lastAt: 0,
          firstHex: "",
          lastHex: "",
          samples: []
        }
      }(u);
    ! function(t, e) {
      "candidate" === e ? t.candidateTotal += 1 : "reference" === e ? t.referenceTotal += 1 : t.routineTotal += 1
    }(r, d.category);
    var g = d.count > 0 && d.lastHex !== f;
    return d.count += 1, d.firstAt = d.firstAt || l, d.lastAt = l, d.firstHex = d.firstHex || f, d.lastHex = f, d.lengths.indexOf(i.length) < 0 && (d.lengths.push(i.length), d.lengths.sort((function(t, e) {
      return t - e
    }))), g && (d.changed += 1), (!d.known || g || 0 === d.samples.length) && d.samples.length < 4 && d.samples.push({
      ts: l,
      len: i.length,
      hex: f
    }), r.typeStats[p] = d, h
  },
  addMarker: function(t, e) {
    if (!t) return null;
    var n = {
      ts: Date.now(),
      label: e || "导航事件"
    };
    return t.markers.push(n), t.markers.length > 12 && t.markers.shift(), n
  },
  summarize: f,
  formatReport: function(t) {
    var e = f(t || i()),
      n = [];
    return n.push("导航采集实验报告"), n.push("开始:".concat(e.startedAt ? u(e.startedAt) : "-", " 候选:").concat(e.total, " 对照:").concat(e.referenceTotal, " 噪声:").concat(e.routineTotal, " 变化:").concat(e.changedTypeCount)), n.push(""), n.push("导航候选"), e.candidates.length ? e.candidates.forEach((function(t) {
      return n.push(l(t))
    })) : n.push("暂无非管理类候选帧"), n.push(""), n.push("仪表对照"), e.referenceTypes.length ? e.referenceTypes.forEach((function(t) {
      return n.push(l(t))
    })) : n.push("暂无 176 仪表车况对照帧"), n.push(""), n.push("已过滤噪声"), e.routineTypes.length ? e.routineTypes.forEach((function(t) {
      return n.push(l(t))
    })) : n.push("暂无管理类噪声帧"), n.push(""), n.push("导航标记"), e.markers.length ? e.markers.forEach((function(t) {
      return n.push("".concat(u(t.ts), " ").concat(t.label))
    })) : n.push("暂无标记"), n.push(""), n.push("最近样本"), e.recentFrames.length ? e.recentFrames.forEach((function(t) {
      n.push("".concat(u(t.ts), " ").concat(s(t.type), " len=").concat(t.len, " ").concat(t.hex || "-"))
    })) : n.push("暂无样本"), n.push(""), n.push("候选样本"), e.candidates.forEach((function(t) {
      t.samples.forEach((function(e) {
        n.push("".concat(s(t.type), " ").concat(u(e.ts), " len=").concat(e.len, " ").concat(e.hex || "-"))
      }))
    })), n.join("\n").slice(-12e3)
  },
  payloadToHex: o,
  typeHex: s
};