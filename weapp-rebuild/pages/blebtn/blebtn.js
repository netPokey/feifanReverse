var e = require("../../@babel/runtime/helpers/defineProperty"),
  t = require("../../services/functionOptions"),
  a = require("../../services/shortcutExecutor"),
  n = require("../../services/pageNav"),
  i = getApp();
Page({
  data: {
    items: [],
    loading: !1,
    loadState: "idle",
    loadMessage: "等待读取蓝牙按钮配置",
    rawBytes: [],
    pendingAdd: {
      id: 0,
      name: ""
    },
    funOptions: t.flatten("fun"),
    funList: null,
    execState: "idle",
    execMessage: "",
    selector: {
      show: !1,
      field: "",
      itemIndex: -1,
      mode: "groups",
      title: "",
      groups: [],
      options: [],
      groupIndex: -1,
      selectedVal: 0,
      originalVal: 0,
      selectedName: "",
      selectedCanAttempt: !1,
      saveEnabled: !1
    }
  },
  onShow: function() {
    var e = this;
    i.applyThemeToPage && i.applyThemeToPage(this), this.handler = this.rx.bind(this), this.execHandler = this.rxExecute.bind(this), i.onPacket(186, this.handler), i.onPacket(187, this.execHandler), i.api.getFunList().catch((function() {
      return null
    })).then((function(a) {
      var n = t.mergeServerList(a),
        i = t.flatten("fun", n);
      e.data.funList = n, e.data.funOptions = i, e.setData({
        funList: n,
        funOptions: i
      }), e.load()
    }))
  },
  load: function() {
    var e = this;
    this.setData({
      loading: !0,
      loadState: "loading",
      loadMessage: "正在读取模块中的蓝牙按钮配置"
    }), clearTimeout(this.loadTimer), this.loadTimer = setTimeout((function() {
      e.data.loading && e.setData({
        loading: !1,
        loadState: "timeout",
        loadMessage: "未收到 256 字节配置回包，请确认蓝牙密码已通过且模块在线"
      })
    }), 6e3), i.tx(186, new Uint8Array([2])).catch((function(t) {
      clearTimeout(e.loadTimer), e.setData({
        loading: !1,
        loadState: "error",
        loadMessage: t.message || "读取蓝牙按钮失败"
      })
    }))
  },
  back: function() {
    n.goBack("/pages/index/index")
  },
  openHost: function() {
    wx.navigateTo({
      url: "/pages/bleHost/bleHost"
    })
  },
  add: function() {
    var e = this;
    i.input("输入要添加的蓝牙按钮名称", (function(t) {
      e.setData({
        pendingAdd: {
          id: 0,
          name: t.content || "蓝牙按钮"
        },
        loadMessage: "请点击实体蓝牙按钮完成添加"
      }), i.tx(186, new Uint8Array([1])).catch((function(t) {
        var a = t.message || "进入蓝牙按钮添加模式失败";
        e.setData({
          pendingAdd: {
            id: 0,
            name: ""
          },
          loadState: "error",
          loadMessage: a
        }), i.msg(a, 0, 2200)
      }))
    }))
  },
  rename: function(e) {
    var t = this,
      a = Number(e.currentTarget.dataset.idx),
      n = this.data.items[a];
    n && i.input(n.name || "修改按钮名称", (function(e) {
      var s = String(e.content || "").trim();
      if (s) {
        var c = t.getStoredMap("blename");
        c["id".concat(n.id)] = s, wx.setStorageSync("blename", c);
        var r = t.data.items.slice();
        r[a] = t.decorateItem(Object.assign({}, n, {
          name: s
        })), t.setData({
          items: r
        }), i.msg("修改成功", 1)
      } else i.msg("按钮名称不能为空", 0)
    }))
  },
  remove: function(e) {
    var t = this,
      a = Number(e.currentTarget.dataset.idx);
    this.data.items[a] && i.modal("确定要删除此蓝牙按钮吗？", !0, (function() {
      var e = t.data.items.slice();
      e.splice(a, 1), t.setData({
        items: e
      }), t.save("删除成功")
    }))
  },
  removeAll: function() {
    var e = this;
    i.modal("确定删除所有蓝牙按钮？", !0, (function() {
      wx.setStorageSync("blename", {}), wx.setStorageSync("blebat", {}), e.setData({
        items: []
      }), e.save("删除成功")
    }))
  },
  test: function(e) {
    var t = Number(e.currentTarget.dataset.idx),
      a = this.data.items[t];
    a && Number(a.id) && this.executeValue(255 & Number(a.id), "蓝牙按钮：".concat(a.name || a.id), {
      kind: "bleButtonId"
    })
  },
  attemptAction: function(e) {
    var a = Number(e.currentTarget.dataset.idx),
      n = e.currentTarget.dataset.field,
      s = this.data.items[a];
    if (s) {
      var c = "dbClick" === n ? s.dbClick : s.Click;
      if (Number(c))
        if (t.canAttempt("fun", c, this.data.funList)) {
          var r = "dbClick" === n ? s.dbClickName : s.ClickName,
            d = "dbClick" === n ? "双击动作" : "单击动作";
          this.executeValue(c, "".concat(s.name || "蓝牙按钮", " ").concat(d, "：").concat(r || c), {
            kind: "fun"
          })
        } else i.msg("当前动作不支持立即尝试", 0);
      else i.msg("当前动作是无操作", 0)
    }
  },
  executeValue: function(e, t, n) {
    var s = this;
    this.pendingExecLabel = t, this.setData({
      execState: "sending",
      execMessage: "正在发送 ".concat(t)
    }), a.execute(i, e, t, n).then((function(e) {
      "confirmed" !== s.data.execState && s.setData({
        execState: "sent",
        execMessage: e.message
      })
    })).catch((function(e) {
      var t = e.message || "执行指令失败";
      s.pendingExecLabel = "", s.setData({
        execState: "error",
        execMessage: t
      }), i.msg(t, 0, 2200)
    }))
  },
  decorateItem: function(e) {
    var a = function(e) {
      if (null == e || "" === e || "null" === e) return {
        value: null,
        hasBattery: !1,
        text: ""
      };
      var t = Number(e);
      if (!Number.isFinite(t)) return {
        value: null,
        hasBattery: !1,
        text: ""
      };
      var a = Math.max(0, Math.min(100, Math.round(t)));
      return {
        value: a,
        hasBattery: !0,
        text: "".concat(a, "%")
      }
    }(e.bat);
    return Object.assign({}, e, {
      bat: a.value,
      hasBattery: a.hasBattery,
      batText: a.text,
      ClickName: t.nameOf("fun", e.Click, this.data.funList),
      dbClickName: t.nameOf("fun", e.dbClick, this.data.funList),
      ClickIndex: this.selectedIndex(e.Click),
      dbClickIndex: this.selectedIndex(e.dbClick),
      ClickAttempt: t.canAttempt("fun", e.Click, this.data.funList),
      dbClickAttempt: t.canAttempt("fun", e.dbClick, this.data.funList)
    })
  },
  openActionSelector: function(e) {
    var a = Number(e.currentTarget.dataset.idx),
      n = e.currentTarget.dataset.field,
      i = this.data.items[a];
    if (i && !(["Click", "dbClick"].indexOf(n) < 0)) {
      var s = Number(i[n] || 0),
        c = t.groups("fun", this.data.funList).map((function(e, t) {
          var a = (e.data || []).some((function(e) {
            return Number(e.val) === s
          }));
          return Object.assign({}, e, {
            index: t,
            count: (e.data || []).length,
            hasSelected: a
          })
        })),
        r = t.optionOf("fun", s, this.data.funList);
      this.setData({
        selector: {
          show: !0,
          field: n,
          itemIndex: a,
          mode: "groups",
          title: "dbClick" === n ? "选择双击动作" : "选择单击动作",
          groups: c,
          options: [],
          groupIndex: -1,
          selectedVal: s,
          originalVal: s,
          selectedName: r ? r.name : t.nameOf("fun", s, this.data.funList),
          selectedCanAttempt: t.canAttempt("fun", s, this.data.funList),
          saveEnabled: !1
        }
      })
    }
  },
  openSelectorGroup: function(e) {
    var a = this,
      n = Number(e.currentTarget.dataset.idx),
      i = this.data.selector,
      s = i.groups[n];
    if (s) {
      var c = (s.data || []).map((function(e) {
        return Object.assign({}, e, {
          selected: Number(e.val) === Number(i.selectedVal),
          canAttempt: t.canAttempt("fun", e.val, a.data.funList)
        })
      }));
      this.setData({
        selector: Object.assign({}, i, {
          mode: "options",
          title: s.name || s.group || "选择项目",
          groupIndex: n,
          options: c
        })
      })
    }
  },
  chooseSelectorOption: function(e) {
    var a = Number(e.currentTarget.dataset.val),
      n = this.data.selector,
      i = t.optionOf("fun", a, this.data.funList),
      s = n.options.map((function(e) {
        return Object.assign({}, e, {
          selected: Number(e.val) === a
        })
      }));
    this.setData({
      selector: Object.assign({}, n, {
        options: s,
        selectedVal: a,
        selectedName: i ? i.name : t.nameOf("fun", a, this.data.funList),
        selectedCanAttempt: t.canAttempt("fun", a, this.data.funList),
        saveEnabled: Number(n.originalVal) !== a
      })
    })
  },
  backSelector: function() {
    var e = this.data.selector;
    "options" !== e.mode ? this.closeSelector() : this.setData({
      selector: Object.assign({}, e, {
        mode: "groups",
        title: "dbClick" === e.field ? "选择双击动作" : "选择单击动作",
        options: [],
        groupIndex: -1
      })
    })
  },
  closeSelector: function() {
    this.setData({
      selector: {
        show: !1,
        field: "",
        itemIndex: -1,
        mode: "groups",
        title: "",
        groups: [],
        options: [],
        groupIndex: -1,
        selectedVal: 0,
        originalVal: 0,
        selectedName: "",
        selectedCanAttempt: !1,
        saveEnabled: !1
      }
    })
  },
  saveSelector: function() {
    var t = this.data.selector,
      a = this.data.items[t.itemIndex];
    if (t.show && a && t.saveEnabled && !(["Click", "dbClick"].indexOf(t.field) < 0)) {
      var n = this.data.items.slice();
      n[t.itemIndex] = this.decorateItem(Object.assign({}, a, e({}, t.field, t.selectedVal))), this.data.items = n, this.setData({
        items: n,
        selector: {
          show: !1,
          field: "",
          itemIndex: -1,
          mode: "groups",
          title: "",
          groups: [],
          options: [],
          groupIndex: -1,
          selectedVal: 0,
          originalVal: 0,
          selectedName: "",
          selectedCanAttempt: !1,
          saveEnabled: !1
        }
      }), this.save("保存成功")
    }
  },
  attemptSelector: function() {
    var e = this.data.selector;
    e.show && e.selectedCanAttempt ? this.executeValue(e.selectedVal, "动作：".concat(e.selectedName || e.selectedVal), {
      kind: "fun"
    }) : i.msg("当前动作不支持立即尝试", 0)
  },
  selectedIndex: function(e) {
    var t = this.data.funOptions.findIndex((function(t) {
      return Number(t.val) === Number(e)
    }));
    return t >= 0 ? t : 0
  },
  changeOption: function(t) {
    var a = Number(t.currentTarget.dataset.idx),
      n = t.currentTarget.dataset.field,
      i = this.data.funOptions[Number(t.detail.value)];
    if (i && this.data.items[a]) {
      var s = this.data.items.slice();
      s[a] = this.decorateItem(Object.assign({}, s[a], e({}, n, i.val))), this.setData({
        items: s
      })
    }
  },
  save: function(e) {
    var t = this,
      a = "string" == typeof e ? e : "已发送",
      n = this.data.rawBytes && 256 === this.data.rawBytes.length ? new Uint8Array(this.data.rawBytes) : new Uint8Array(256);
    this.data.items.slice(0, 42).forEach((function(e, t) {
      var a = 6 * t;
      n[a] = e.Click || 0, n[a + 1] = e.dbClick || 0, n[a + 2] = e.id >>> 24 & 255, n[a + 3] = e.id >>> 16 & 255, n[a + 4] = e.id >>> 8 & 255, n[a + 5] = 255 & e.id
    }));
    for (var s = this.data.items.length; s < 42; s += 1) {
      var c = 6 * s;
      n[c] = 0, n[c + 1] = 0, n[c + 2] = 0, n[c + 3] = 0, n[c + 4] = 0, n[c + 5] = 0
    }
    i.setCheckData(186, n), i.tx(186, n).then((function() {
      return i.msg(a, 1)
    })).catch((function(e) {
      var a = e.message || "写入蓝牙按钮失败";
      t.setData({
        loading: !1,
        loadState: "error",
        loadMessage: a
      }), i.msg(a, 0, 2200)
    }))
  },
  rx: function(e, t) {
    var a = this;
    if (t)
      if (1 === t.length && 1 === t[0] && this.data.pendingAdd.name) wx.showLoading({
        title: "请点击蓝牙按钮",
        mask: !1
      });
      else {
        if (6 === t.length) return wx.hideLoading(), void this.handleAddButton(t);
        if (7 !== t.length) {
          if (256 === t.length) {
            var n = i.getCheckData(t, 186);
            n ? i.tx(n.type, n.buf).catch((function(e) {
              var t = e.message || "蓝牙按钮回读校验重试失败";
              a.setData({
                loading: !1,
                loadState: "error",
                loadMessage: t
              }), i.msg(t, 0, 2200)
            })) : (clearTimeout(this.loadTimer), this.parseConfig(t))
          }
        } else this.handleButtonEvent(t)
      }
  },
  handleAddButton: function(e) {
    var t = new Uint8Array(e),
      a = !!(128 & t[5]);
    t[5] &= 127;
    var n = this.getId(t, 0),
      i = this.getBat(t, 4),
      s = this.decorateItem({
        id: n,
        bat: i,
        name: this.data.pendingAdd.name || "蓝牙按钮",
        Click: a ? 249 : 0,
        dbClick: a ? 248 : 0
      }),
      c = this.getStoredMap("blename"),
      r = this.getStoredMap("blebat");
    c["id".concat(n)] = s.name, r["id".concat(n)] = i, wx.setStorageSync("blename", c), wx.setStorageSync("blebat", r), this.setData({
      items: this.data.items.concat([s]),
      pendingAdd: {
        id: 0,
        name: ""
      },
      loadMessage: "已识别蓝牙按钮，正在写入配置"
    }), this.save()
  },
  handleButtonEvent: function(e) {
    var a = this,
      n = this.getId(e, 0),
      s = this.getBat(e, 4),
      c = e[6],
      r = this.getStoredMap("blename"),
      d = "",
      o = this.data.items.map((function(e) {
        if (Number(e.id) !== Number(n)) return e;
        var i = c ? e.dbClick : e.Click;
        return d = t.nameOf("fun", i, a.data.funList), a.decorateItem(Object.assign({}, e, {
          bat: s
        }))
      }));
    this.setData({
      items: o
    }), i.msg("".concat(r["id".concat(n)] || "蓝牙按钮", " ").concat(c ? "双击" : "单击", "\n").concat(d || "无操作"), -1, 2200)
  },
  parseConfig: function(e) {
    for (var t = this.getStoredMap("blename"), a = this.getStoredMap("blebat"), n = [], i = 0; i < 42; i += 1) {
      var s = 6 * i,
        c = this.getId(e, s + 2);
      c && n.push(this.decorateItem({
        Click: e[s] || 0,
        dbClick: e[s + 1] || 0,
        id: c,
        bat: "number" == typeof a["id".concat(c)] ? a["id".concat(c)] : null,
        name: t["id".concat(c)] || "蓝牙按钮"
      }))
    }
    this.cleanStoredMaps(n, t, a), this.setData({
      items: n,
      loading: !1,
      loadState: n.length ? "loaded" : "empty",
      loadMessage: n.length ? "已加载 ".concat(n.length, " 个蓝牙按钮") : "模块未配置蓝牙按钮",
      rawBytes: Array.prototype.slice.call(e)
    })
  },
  rxExecute: function() {
    this.pendingExecLabel && (this.setData({
      execState: "confirmed",
      execMessage: "".concat(this.pendingExecLabel, " 已收到模块确认")
    }), this.pendingExecLabel = "")
  },
  getId: function(e, t) {
    return (e[t] << 24 | e[t + 1] << 16 | e[t + 2] << 8 | e[t + 3]) >>> 0
  },
  getBat: function(e, t) {
    var a = e[t + 1] << 8 | e[t];
    return a < 2200 && (a = 2200), a > 3200 && (a = 3200), Math.round((a - 2200) / 10)
  },
  getStoredMap: function(e) {
    return wx.getStorageSync(e) || {}
  },
  cleanStoredMaps: function(e, t, a) {
    var n = {};
    e.forEach((function(e) {
      n["id".concat(e.id)] = !0
    })), Object.keys(t).forEach((function(e) {
      n[e] || delete t[e]
    })), Object.keys(a).forEach((function(e) {
      n[e] || delete a[e]
    })), wx.setStorageSync("blename", t), wx.setStorageSync("blebat", a)
  },
  onHide: function() {
    this.handler && i.offPacket(186, this.handler), this.execHandler && i.offPacket(187, this.execHandler), this.pendingExecLabel = "", clearTimeout(this.loadTimer)
  },
  catchTouchMove: function() {
    return !1
  }
});