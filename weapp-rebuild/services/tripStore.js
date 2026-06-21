function t(t, e) {
  try {
    return wx.getStorageSync(t) || e
  } catch (r) {
    return wx.removeStorageSync(t), e
  }
}

function e(t) {
  var e = Number.parseFloat(String(t || "").replace(/,/g, ""));
  return Number.isFinite(e) ? e : null
}

function r(t) {
  return Number(t && t.speedRaw || 0) > 0 || (e = t && t.gear, "D" === (r = String(e || "").toUpperCase()) || "R" === r);
  var e, r
}

function a(t) {
  var e = Number(t) || 0;
  return e < 10 ? "0".concat(e) : String(e)
}

function n(t) {
  var e = new Date(Number(t || Date.now()));
  return "".concat(a(e.getMonth() + 1), "-").concat(a(e.getDate()), " ").concat(a(e.getHours()), ":").concat(a(e.getMinutes()))
}

function u(t) {
  var e = Math.max(0, Math.round(Number(t || 0) / 1e3)),
    r = Math.floor(e / 60);
  if (r < 60) return "".concat(Math.max(r, 1), " 分钟");
  var a = Math.floor(r / 60),
    n = r % 60;
  return n ? "".concat(a, " 小时 ").concat(n, " 分钟") : "".concat(a, " 小时")
}

function l(t, e) {
  if (null == t || !Number.isFinite(Number(t))) return "--";
  var r = Number(t);
  return "".concat(r > 0 ? "+" : r < 0 ? "-" : "").concat(Math.abs(r).toFixed("%" === e ? 0 : 1)).concat(e)
}

function i(t, e) {
  var r = Number(t.lastAt || Date.now()),
    a = Math.max(0, Number(t.lastOdometer || 0) - Number(t.startOdometer || 0)),
    n = null !== t.startBattery && null !== t.lastBattery ? Number(t.lastBattery) - Number(t.startBattery) : null,
    u = null !== t.startRange && null !== t.lastRange ? Number(t.lastRange) - Number(t.startRange) : null;
  return {
    id: t.id,
    startAt: t.startAt,
    endAt: r,
    reason: e || "idle",
    distanceKm: Number(a.toFixed(2)),
    durationMs: Math.max(0, r - Number(t.startAt || r)),
    maxSpeed: Math.round(Number(t.maxSpeed || 0)),
    batteryDelta: n,
    rangeDelta: u,
    deltaMode: "signed"
  }
}

function o() {
  var e = t("tripActiveV1", null);
  return e && e.id ? Date.now() - Number(e.lastAt || 0) > 18e5 ? (m(i(e, "stale")), wx.removeStorageSync("tripActiveV1"), null) : e : null
}

function c(t) {
  return t ? (wx.setStorageSync("tripActiveV1", t), t) : (wx.removeStorageSync("tripActiveV1"), null)
}

function s() {
  var e = t("tripRecordsV1", []);
  return Array.isArray(e) ? e : []
}

function m(t) {
  if (! function(t) {
      if (!t || Number(t.durationMs || 0) < 3e4) return !1;
      var e = Number(t.distanceKm || 0),
        r = Number(t.maxSpeed || 0),
        a = null === t.batteryDelta || void 0 === t.batteryDelta ? 0 : Number(t.batteryDelta),
        n = null === t.rangeDelta || void 0 === t.rangeDelta ? 0 : Number(t.rangeDelta);
      return e > 0 || r > 0 || Math.abs(a) > 0 || Math.abs(n) >= .1
    }(t)) return s();
  var e = [t].concat(s().filter((function(e) {
    return e.id !== t.id
  }))).slice(0, 20);
  return wx.setStorageSync("tripRecordsV1", e), e
}

function d(t, e) {
  if (!t) return null;
  var r = t[e];
  return null != r && Number.isFinite(Number(r)) ? "signed" === t.deltaMode ? Number(r) : -Number(r) : null
}

function b(t, e) {
  var r, a, i = t || e || {},
    o = Number(i.startAt || Date.now()),
    c = Number(i.endAt || i.lastAt || Date.now()),
    s = t ? Number(t.distanceKm || 0) : Math.max(0, Number(i.lastOdometer || 0) - Number(i.startOdometer || 0)),
    m = t ? d(t, "batteryDelta") : null !== i.startBattery && null !== i.lastBattery ? Number(i.lastBattery) - Number(i.startBattery) : null,
    b = t ? d(t, "rangeDelta") : null !== i.startRange && null !== i.lastRange ? Number(i.lastRange) - Number(i.startRange) : null;
  return {
    id: i.id || "trip-".concat(o),
    active: !!e && !t,
    title: e && !t ? "正在行驶" : "最近行程",
    timeText: "".concat(n(o)).concat(t ? "" : " 开始"),
    endText: t ? n(c) : "进行中",
    distanceText: (r = s, a = Math.max(0, Number(r || 0)), "".concat(a >= 10 ? a.toFixed(1) : a.toFixed(2), " km")),
    durationText: u(t ? t.durationMs : c - o),
    maxSpeedText: "".concat(Math.round(Number(i.maxSpeed || 0)), " km/h"),
    batteryDeltaText: l(m, "%"),
    rangeDeltaText: l(b, " km")
  }
}

function N(t) {
  var e = t || o(),
    r = s(),
    a = e ? [b(null, e)].concat(r.slice(0, 4).map((function(t) {
      return b(t)
    }))) : r.slice(0, 5).map((function(t) {
      return b(t)
    }));
  return {
    active: e,
    records: r,
    cards: a,
    latest: a[0] || null
  }
}
module.exports = {
  RECORDS_KEY: "tripRecordsV1",
  ACTIVE_KEY: "tripActiveV1",
  updateFromGauge: function(t, a) {
    var n = Number(a || Date.now());
    if (! function(t) {
        return !!t && t.hasFullFrame && null !== e(t.odometer)
      }(t)) return N();
    var u = o();
    if (!u && r(t)) return c(u = function(t, r) {
      var a = e(t.odometer),
        n = e(t.batteryPercent),
        u = e(t.remainRange),
        l = Number(t.speedRaw || 0);
      return {
        id: "trip-".concat(r),
        startAt: r,
        lastAt: r,
        startOdometer: a,
        lastOdometer: a,
        startBattery: n,
        lastBattery: n,
        startRange: u,
        lastRange: u,
        maxSpeed: Math.max(0, l),
        lastMovingAt: r
      }
    }(t, n)), N(u);
    if (!u) return N();
    if (u = function(t, a, n) {
        var u = e(a.odometer),
          l = e(a.batteryPercent),
          i = e(a.remainRange),
          o = Number(a.speedRaw || 0),
          c = r(a),
          s = Object.assign({}, t, {
            lastAt: n,
            lastOdometer: null !== u ? u : t.lastOdometer,
            lastBattery: null !== l ? l : t.lastBattery,
            lastRange: null !== i ? i : t.lastRange,
            maxSpeed: Math.max(Number(t.maxSpeed || 0), o)
          });
        return c && (s.lastMovingAt = n), s
      }(u, t, n), !r(t) && n - Number(u.lastMovingAt || u.lastAt || n) >= 9e4) {
      var l = i(u, "idle");
      return c(null), m(l), N()
    }
    return c(u), N(u)
  },
  finishActive: function(t) {
    var e = o();
    if (!e) return N();
    var r = i(Object.assign({}, e, {
      lastAt: Date.now()
    }), t || "manual");
    return c(null), m(r), N()
  },
  listRecords: s,
  buildView: N,
  formatRecord: b
};