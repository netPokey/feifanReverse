var e = [{
  value: "doorOpen",
  label: "任意车门打开"
}, {
  value: "frunkOpen",
  label: "前备箱打开"
}, {
  value: "trunkOpen",
  label: "后备箱打开"
}, {
  value: "gearD",
  label: "挂入 D 档"
}, {
  value: "gearP",
  label: "挂入 P 档"
}, {
  value: "apChanged",
  label: "AP 状态变化"
}, {
  value: "lightChanged",
  label: "灯光状态变化"
}, {
  value: "blindSpotActive",
  label: "盲区预警出现"
}, {
  value: "handsOnActive",
  label: "手扶提醒出现"
}];

function n(n) {
  var a = e.find((function(e) {
    return e.value === n
  }));
  return a ? a.label : "车况变化"
}

function a(e, a, r) {
  e.push({
    type: a,
    label: n(a),
    detail: r || {}
  })
}
module.exports = {
  EVENT_OPTIONS: e,
  DEFAULT_EVENT: e[0].value,
  detectGaugeEvents: function(e, n) {
    var r = e || {},
      t = n || {},
      l = [];
    ! function(e, n, r) {
      var t = Number(n.door || 0),
        l = Number(r.door || 0);
      if (t !== l)
        for (var u = 0; u < 4; u += 1) {
          if (!!!(t >>> u & 1) && !!(l >>> u & 1)) return void a(e, "doorOpen", {
            index: u,
            mask: l
          })
        }
    }(l, r, t), !r.frunkIsOpen && t.frunkIsOpen && a(l, "frunkOpen"), !r.trunkIsOpen && t.trunkIsOpen && a(l, "trunkOpen"),
      function(e, n, r) {
        n.gear !== r.gear && (4 === r.gear && a(e, "gearD", {
          from: n.gearLabel,
          to: r.gearLabel
        }), 1 === r.gear && a(e, "gearP", {
          from: n.gearLabel,
          to: r.gearLabel
        }))
      }(l, r, t), r.autoPilot !== t.autoPilot && a(l, "apChanged", {
        from: r.autoPilot,
        to: t.autoPilot
      }), r.light !== t.light && a(l, "lightChanged", {
        from: r.light,
        to: t.light
      });
    var u = (r.blindSpotRear || []).some((function(e) {
        return Number(e) > 0
      })),
      o = (t.blindSpotRear || []).some((function(e) {
        return Number(e) > 0
      }));
    return !u && o && a(l, "blindSpotActive", {
      value: t.blindSpotRear
    }), !r.handsOn && t.handsOn && a(l, "handsOnActive"), l
  },
  isKnownEvent: function(n) {
    return e.some((function(e) {
      return e.value === n
    }))
  },
  nameOf: n
};