var e = require("../../@babel/runtime/helpers/defineProperty"),
  t = require("../../@babel/runtime/helpers/typeof"),
  i = getApp(),
  a = [5, 10, 15, 20, 25, 30, 35, 40],
  n = [.9, 1, 1.1, 1.22],
  g = [{
    id: "gaugeHudStyle",
    name: "HUD外观",
    index: 0,
    options: ["仪表盘1", "仪表盘2"]
  }, {
    id: "gaugeHudLayout",
    name: "HUD布局",
    index: 0,
    options: ["横屏布局", "竖屏布局"]
  }, {
    id: "gaugeHudFontSize",
    name: "仪表盘字体大小",
    index: 1,
    valueOptions: n,
    options: ["小", "标准", "大", "特大"]
  }, {
    id: "gaugeLeftBottom",
    name: "里程模块快显",
    index: 0,
    options: ["总里程", "海拔高度", "北京时间", "行驶时间", "自动循环显示"]
  }, {
    id: "gaugeRightBottom",
    name: "剩余模块快显",
    index: 0,
    options: ["剩余电量", "剩余里程", "电池电芯电压", "动力电池温度", "自动循环显示"]
  }, {
    id: "gaugeAutoCameraSpeed",
    name: "低速自动摄像头",
    index: 0,
    valueOptions: [0].concat(d()),
    options: ["关闭"].concat(d().map((function(e) {
      return "".concat(e, " km/h")
    })))
  }];

function d() {
  return a.slice()
}

function s(e, t) {
  var i = Number(e || 0);
  return !Number.isFinite(i) || i < 0 || i >= t ? 0 : i
}

function r(e, t) {
  if ("gaugeHudStyle" === e.id) return function(e) {
    var t = Number(e && e.gaugeHudStyle);
    return Number.isFinite(t) && t >= 0 && t <= 1 ? t : 3 === Number(e && e.gaugeHudTheme) ? 1 : 0
  }(t);
  if (e.valueOptions) {
    var i = function(e, t) {
        if ("gaugeAutoCameraSpeed" === e.id) return function(e) {
          var t = Number(e && e.gaugeAutoCameraSpeed);
          if (Number.isFinite(t)) return u(t);
          if (1 === Number(e && e.gaugeAutoCameraEnabled || 0)) {
            var i = Number(e && e.gaugeAutoCameraOpenBelow);
            return Number.isFinite(i) ? u(i) : 10
          }
          return 0
        }(t);
        if ("gaugeHudFontSize" === e.id) return function(e) {
          var t = Number(e);
          if (!Number.isFinite(t)) return 1;
          return n.reduce((function(e, i) {
            return Math.abs(i - t) < Math.abs(e - t) ? i : e
          }), n[1])
        }(t && t.gaugeHudFontSize);
        return Number(t[e.id])
      }(e, t),
      a = e.valueOptions.findIndex((function(e) {
        return Number(e) === i
      }));
    return a >= 0 ? a : s(e.index, e.options.length)
  }
  return s(t[e.id], e.options.length)
}

function u(e) {
  var t = Number(e);
  return !Number.isFinite(t) || t <= 0 ? 0 : a.reduce((function(e, i) {
    return Math.abs(i - t) < Math.abs(e - t) ? i : e
  }), a[0])
}

function o(e) {
  return g.map((function(t) {
    var i = r(t, e || {});
    return Object.assign({}, t, {
      index: i,
      displayText: t.options[i] || t.options[0]
    })
  }))
}

function p(e) {
  var t = Number(e);
  return Number.isFinite(t) ? Math.min(3, Math.max(1, Math.round(20 * t) / 20)) : 1
}

function c(e, t) {
  var i = Number(e);
  if (!Number.isFinite(i)) return 0;
  var a = function(e) {
    var t = 360 / 260 * p(e);
    return t <= 1 ? 0 : Math.floor((t - 1) / (2 * t) * 100)
  }(t);
  return Math.min(a, Math.max(-a, Math.round(i)))
}

function h(e, t) {
  return Math.round(c(e, t) / 100 * 360 - 50)
}

function S(e, t) {
  return c((Number(e || -50) - -50) / 360 * 100, t)
}

function B(e) {
  var t, i, a, n, g = String(e.gaugeSpeedBgPath || ""),
    d = p(e.gaugeSpeedBgScale),
    s = c(e.gaugeSpeedBgX, d),
    r = c(e.gaugeSpeedBgY, d);
  return {
    speedBgPath: g,
    speedBgScale: d,
    speedBgX: s,
    speedBgY: r,
    speedBgScalePercent: Math.round(100 * d),
    speedBgStyle: (t = d, i = s, a = r, n = p(t), "transform:translate(".concat(c(i, n), "%, ").concat(c(a, n), "%) scale(").concat(n.toFixed(2), ");")),
    speedBgText: g ? "已选择相册图片，进入仪表后显示在速度环内" : "未设置，将使用默认速度环背景"
  }
}

function l(e) {
  return String(e || "").trim().slice(0, 24)
}

function f(e) {
  var t = l(e && e.gaugeGreeting),
    i = t || "道路千万条，安全第一条；行车不规范，亲人两行泪";
  return {
    gaugeGreeting: i,
    greetingText: i,
    greetingCustomized: !!t
  }
}
Page({
  data: {
    gauge: {},
    list: o({}),
    gaugeGreeting: "道路千万条，安全第一条；行车不规范，亲人两行泪",
    greetingText: "道路千万条，安全第一条；行车不规范，亲人两行泪",
    greetingCustomized: !1,
    speedBgPath: "",
    speedBgScale: 1,
    speedBgX: 0,
    speedBgY: 0,
    speedBgScalePercent: 100,
    speedBgStyle: "transform:translate(0%, 0%) scale(1);",
    speedBgText: "未设置，将使用默认速度环背景",
    speedBgEditorVisible: !1,
    editingSpeedBgPath: "",
    editingSpeedBgScale: 1,
    editingSpeedBgScalePercent: 100,
    editingSpeedBgX: 0,
    editingSpeedBgY: 0,
    editingSpeedBgViewX: -50,
    editingSpeedBgViewY: -50,
    speedBgChoosing: !1,
    speedBgEntryMode: !1,
    speedBgEditorAreaSize: 260,
    speedBgEditorImageSize: 360
  },
  onLoad: function(e) {
    this.speedBgAutoEdit = e && "1" === e.speedBgEdit, this.fromGaugeSpeedBg = e && "1" === e.fromGauge, this.speedBgAutoEditStarted = !1, this.setData({
      speedBgEntryMode: !!this.fromGaugeSpeedBg
    })
  },
  onShow: function() {
    i.applyThemeToPage && i.applyThemeToPage(this), this.ensurePortrait(), this.loadSettings(), this.tryAutoChooseSpeedBackground()
  },
  ensurePortrait: function() {
    "function" == typeof wx.setPageOrientation && wx.setPageOrientation({
      orientation: "portrait",
      fail: function() {}
    })
  },
  loadSettings: function() {
    var e = wx.getStorageSync("gauge"),
      i = e && "object" === t(e) ? e : {},
      a = o(i);
    this.setData(Object.assign({
      gauge: i,
      list: a
    }, B(i), f(i)))
  },
  tryAutoChooseSpeedBackground: function() {
    var e = this;
    this.speedBgAutoEdit && !this.speedBgAutoEditStarted && (this.speedBgAutoEditStarted = !0, this.setData({
      speedBgChoosing: !0
    }), setTimeout((function() {
      e.chooseSpeedBackground()
    }), 260))
  },
  changeOption: function(t) {
    var a = t.currentTarget.dataset.id,
      n = this.data.list.find((function(e) {
        return e.id === a
      }));
    if (n) {
      var g = s(t.detail.value, n.options.length),
        d = n.valueOptions ? n.valueOptions[g] : g,
        r = Object.assign({}, this.data.gauge, e({}, a, d)),
        u = this.data.list.map((function(e) {
          return e.id !== a ? e : Object.assign({}, e, {
            index: g,
            displayText: e.options[g] || e.options[0]
          })
        }));
      wx.setStorageSync("gauge", r), this.setData({
        gauge: r,
        list: u
      }), i.msg("仪表设置已保存", 1, 1200)
    }
  },
  editGreeting: function() {
    var e = this;
    wx.showModal({
      title: "仪表问候语",
      editable: !0,
      content: this.data.gaugeGreeting || "",
      placeholderText: "道路千万条，安全第一条；行车不规范，亲人两行泪",
      confirmText: "保存",
      cancelText: "取消",
      success: function(t) {
        t && t.confirm && e.saveGreeting(t.content || "")
      }
    })
  },
  saveGreeting: function(e) {
    var t = l(e),
      a = Object.assign({}, this.data.gauge);
    t ? a.gaugeGreeting = t : delete a.gaugeGreeting, wx.setStorageSync("gauge", a), this.setData(Object.assign({
      gauge: a
    }, f(a))), i.msg(t ? "问候语已保存" : "问候语已恢复默认", 1, 1200)
  },
  clearGreeting: function() {
    this.saveGreeting("")
  },
  chooseSpeedBackground: function() {
    var e = this;
    this.setData({
      speedBgChoosing: !0
    }), this.fromGaugeSpeedBg && i.suppressModuleAutoSwitchAppHide && i.suppressModuleAutoSwitchAppHide("gauge-speed-bg-picker", 9e4);
    var t = function(t) {
      t ? (e.setData({
        speedBgChoosing: !1
      }), e.openSpeedBgEditor({
        path: t,
        scale: e.data.speedBgScale || 1,
        x: e.data.speedBgX || 0,
        y: e.data.speedBgY || 0
      })) : e.handleSpeedBgChooseCancel()
    };
    "function" != typeof wx.chooseMedia ? wx.chooseImage({
      count: 1,
      sourceType: ["album"],
      success: function(e) {
        t(e && e.tempFilePaths && e.tempFilePaths[0])
      },
      fail: function() {
        e.handleSpeedBgChooseCancel()
      }
    }) : wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album"],
      success: function(e) {
        var i = e && e.tempFiles && e.tempFiles[0];
        t(i && i.tempFilePath)
      },
      fail: function() {
        e.handleSpeedBgChooseCancel()
      }
    })
  },
  handleSpeedBgChooseCancel: function() {
    var e = this;
    this.setData({
      speedBgChoosing: !1
    }), this.fromGaugeSpeedBg && setTimeout((function() {
      e.back()
    }), 120)
  },
  editSpeedBackground: function() {
    this.data.speedBgPath && this.openSpeedBgEditor({
      path: this.data.speedBgPath,
      scale: this.data.speedBgScale || 1,
      x: this.data.speedBgX || 0,
      y: this.data.speedBgY || 0
    })
  },
  openSpeedBgEditor: function(e) {
    var t = p(e.scale),
      i = c(e.x, t),
      a = c(e.y, t);
    this.setData({
      speedBgEditorVisible: !0,
      editingSpeedBgPath: e.path,
      editingSpeedBgScale: t,
      editingSpeedBgScalePercent: Math.round(100 * t),
      editingSpeedBgX: i,
      editingSpeedBgY: a,
      editingSpeedBgViewX: h(i, t),
      editingSpeedBgViewY: h(a, t)
    })
  },
  changeSpeedBgEditor: function(e) {
    var t = e && e.detail ? e.detail : {},
      i = p(t.scale || this.data.editingSpeedBgScale),
      a = S(t.x, i),
      n = S(t.y, i);
    this.setData({
      editingSpeedBgX: a,
      editingSpeedBgY: n,
      editingSpeedBgViewX: Number(t.x || this.data.editingSpeedBgViewX),
      editingSpeedBgViewY: Number(t.y || this.data.editingSpeedBgViewY),
      editingSpeedBgScale: i,
      editingSpeedBgScalePercent: Math.round(100 * i)
    })
  },
  confirmSpeedBackground: function() {
    var e = this,
      t = p(this.data.editingSpeedBgScale),
      a = function(e) {
        var t = String(e || "").trim();
        if (!t) return "";
        if (!/^\/tmp\//.test(t) && !/^wxfile:\/\//.test(t)) return t;
        if ("function" != typeof wx.saveFile) return t;
        try {
          var i = wx.saveFile({
            tempFilePath: t
          });
          return i && i.savedFilePath ? i.savedFilePath : t
        } catch (e) {
          return t
        }
      }(this.data.editingSpeedBgPath),
      n = Object.assign({}, this.data.gauge, {
        gaugeSpeedBgPath: a,
        gaugeSpeedBgScale: t,
        gaugeSpeedBgX: c(this.data.editingSpeedBgX, t),
        gaugeSpeedBgY: c(this.data.editingSpeedBgY, t)
      });
    wx.setStorageSync("gauge", n), this.setData(Object.assign({
      gauge: n,
      speedBgEditorVisible: !1
    }, B(n))), i.msg("速度环背景已保存", 1, 1200), this.fromGaugeSpeedBg && setTimeout((function() {
      e.back()
    }), 360)
  },
  cancelSpeedBgEditor: function() {
    var e = this;
    this.setData({
      speedBgEditorVisible: !1,
      speedBgChoosing: !1,
      editingSpeedBgPath: "",
      editingSpeedBgViewX: h(this.data.speedBgX || 0, this.data.speedBgScale || 1),
      editingSpeedBgViewY: h(this.data.speedBgY || 0, this.data.speedBgScale || 1)
    }), this.fromGaugeSpeedBg && setTimeout((function() {
      e.back()
    }), 120)
  },
  clearSpeedBackground: function() {
    var e = Object.assign({}, this.data.gauge);
    delete e.gaugeSpeedBgPath, delete e.gaugeSpeedBgScale, delete e.gaugeSpeedBgX, delete e.gaugeSpeedBgY, wx.setStorageSync("gauge", e), this.setData(Object.assign({
      gauge: e
    }, B(e))), i.msg("速度环背景已移除", 1, 1200)
  },
  reset: function() {
    var e = this;
    i.modal('确定要将"仪表设置"恢复默认吗？', !0, (function() {
      wx.removeStorageSync("gauge"), e.loadSettings(), i.msg("仪表设置已恢复默认", 1, 1500)
    }))
  },
  back: function() {
    ("function" == typeof getCurrentPages ? getCurrentPages() : []).length > 1 ? wx.navigateBack() : wx.switchTab({
      url: "/pages/set/set"
    })
  }
});