var e = require("../../@babel/runtime/helpers/defineProperty"),
  t = require("../../services/functionOptions"),
  a = require("../../services/shortcutExecutor"),
  n = require("../../services/pageNav"),
  s = getApp();
Page({
  data: {
    items: [],
    loading: !1,
    loadState: "idle",
    loadMessage: "等待读取模块配置",
    rawBytes: [],
    btnOptions: t.flatten("btn"),
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
    s.applyThemeToPage && s.applyThemeToPage(this), this.handler = this.rx.bind(this), this.execHandler = this.rxExecute.bind(this), s.onPacket(171, this.handler), s.onPacket(187, this.execHandler), s.api.getFunList().catch((function() {
      return null
    })).then((function(a) {
      var n = t.mergeServerList(a),
        s = t.flatten("btn", n),
        i = t.flatten("fun", n);
      e.data.funList = n, e.data.btnOptions = s, e.data.funOptions = i, e.setData({
        funList: n,
        btnOptions: s,
        funOptions: i
      }), e.load()
    }))
  },
  back: function() {
    n.goBack("/pages/index/index")
  },
  load: function() {
    var e = this;
    this.setData({
      loading: !0,
      loadState: "loading",
      loadMessage: "正在读取模块中的快捷指令配置"
    }), clearTimeout(this.loadTimer), this.loadTimer = setTimeout((function() {
      e.data.loading && e.setData({
        loading: !1,
        loadState: "timeout",
        loadMessage: "未收到 256 字节配置回包，请确认蓝牙密码已通过且模块在线"
      })
    }), 6e3), s.tx(171, new Uint8Array([2])).catch((function(t) {
      clearTimeout(e.loadTimer), e.setData({
        loading: !1,
        loadState: "error",
        loadMessage: t.message || "读取快捷指令失败"
      })
    }))
  },
  add: function() {
    var e = this.data.items.concat([this.decorateItem({
      btn: 1,
      fun: 0
    })]);
    this.setData({
      items: e
    })
  },
  remove: function(e) {
    var t = this,
      a = Number(e.currentTarget.dataset.idx);
    this.data.items[a] && s.modal("确定要删除此快捷指令吗？", !0, (function() {
      var e = t.data.items.slice();
      e.splice(a, 1), t.setData({
        items: e
      }), t.save("删除成功")
    }))
  },
  removeAll: function() {
    var e = this;
    s.modal("确定删除所有快捷指令？", !0, (function() {
      e.setData({
        items: []
      }), e.save("删除成功")
    }))
  },
  test: function(e) {
    var t = Number(e.currentTarget.dataset.idx),
      a = this.data.items[t];
    a && this.executeAction(a, t)
  },
  attemptField: function(e) {
    var t = Number(e.currentTarget.dataset.idx),
      a = this.data.items[t];
    a && this.executeAction(a, t)
  },
  executeAction: function(e, a) {
    Number(e.fun) ? t.canAttempt("fun", e.fun, this.data.funList) ? this.executeValue(e.fun, "快捷指令 ".concat(a + 1, " 动作：").concat(e.funname || e.fun), {
      kind: "fun"
    }) : s.msg("当前动作不支持立即尝试", 0) : s.msg("当前动作是无操作", 0)
  },
  executeValue: function(e, t, n) {
    var i = this;
    this.pendingExecLabel = t, this.setData({
      execState: "sending",
      execMessage: "正在发送 ".concat(t)
    }), a.execute(s, e, t, n).then((function(e) {
      "confirmed" !== i.data.execState && i.setData({
        execState: "sent",
        execMessage: e.message
      })
    })).catch((function(e) {
      var t = e.message || "执行指令失败";
      i.pendingExecLabel = "", i.setData({
        execState: "error",
        execMessage: t
      }), s.msg(t, 0, 2200)
    }))
  },
  decorateItem: function(e) {
    return Object.assign({}, e, {
      btnname: t.nameOf("btn", e.btn, this.data.funList),
      funname: t.nameOf("fun", e.fun, this.data.funList),
      btnIndex: this.selectedIndex("btn", e.btn),
      funIndex: this.selectedIndex("fun", e.fun),
      funAttempt: t.canAttempt("fun", e.fun, this.data.funList)
    })
  },
  openOptionSelector: function(e) {
    var a = Number(e.currentTarget.dataset.idx),
      n = e.currentTarget.dataset.field,
      s = this.data.items[a];
    if (s && !(["btn", "fun"].indexOf(n) < 0)) {
      var i = Number(s[n] || 0),
        o = t.groups(n, this.data.funList).map((function(e, t) {
          var a = (e.data || []).some((function(e) {
            return Number(e.val) === i
          }));
          return Object.assign({}, e, {
            index: t,
            count: (e.data || []).length,
            hasSelected: a
          })
        })),
        r = t.optionOf(n, i, this.data.funList);
      this.setData({
        selector: {
          show: !0,
          field: n,
          itemIndex: a,
          mode: "groups",
          title: "btn" === n ? "选择指令" : "选择动作",
          groups: o,
          options: [],
          groupIndex: -1,
          selectedVal: i,
          originalVal: i,
          selectedName: r ? r.name : t.nameOf(n, i, this.data.funList),
          selectedCanAttempt: t.canAttempt(n, i, this.data.funList),
          saveEnabled: !1
        }
      })
    }
  },
  openSelectorGroup: function(e) {
    var a = this,
      n = Number(e.currentTarget.dataset.idx),
      s = this.data.selector,
      i = s.groups[n];
    if (i) {
      var o = (i.data || []).map((function(e) {
        return Object.assign({}, e, {
          selected: Number(e.val) === Number(s.selectedVal),
          canAttempt: t.canAttempt(s.field, e.val, a.data.funList)
        })
      }));
      this.setData({
        selector: Object.assign({}, s, {
          mode: "options",
          title: i.name || i.group || "选择项目",
          groupIndex: n,
          options: o
        })
      })
    }
  },
  chooseSelectorOption: function(e) {
    var a = Number(e.currentTarget.dataset.val),
      n = this.data.selector,
      s = t.optionOf(n.field, a, this.data.funList),
      i = n.options.map((function(e) {
        return Object.assign({}, e, {
          selected: Number(e.val) === a
        })
      }));
    this.setData({
      selector: Object.assign({}, n, {
        options: i,
        selectedVal: a,
        selectedName: s ? s.name : t.nameOf(n.field, a, this.data.funList),
        selectedCanAttempt: t.canAttempt(n.field, a, this.data.funList),
        saveEnabled: Number(n.originalVal) !== a
      })
    })
  },
  backSelector: function() {
    var e = this.data.selector;
    "options" !== e.mode ? this.closeSelector() : this.setData({
      selector: Object.assign({}, e, {
        mode: "groups",
        title: "btn" === e.field ? "选择指令" : "选择动作",
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
    if (t.show && a && t.saveEnabled) {
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
    e.show && "fun" === e.field && e.selectedCanAttempt ? this.executeValue(e.selectedVal, "动作：".concat(e.selectedName || e.selectedVal), {
      kind: "fun"
    }) : s.msg("当前动作不支持立即尝试", 0)
  },
  selectedIndex: function(e, t) {
    var a = ("btn" === e ? this.data.btnOptions : this.data.funOptions).findIndex((function(e) {
      return Number(e.val) === Number(t)
    }));
    return a >= 0 ? a : 0
  },
  changeOption: function(t) {
    var a = Number(t.currentTarget.dataset.idx),
      n = t.currentTarget.dataset.field,
      s = ("btn" === n ? this.data.btnOptions : this.data.funOptions)[Number(t.detail.value)];
    if (s && this.data.items[a]) {
      var i = this.data.items.slice();
      i[a] = this.decorateItem(Object.assign({}, i[a], e({}, n, s.val))), this.setData({
        items: i
      })
    }
  },
  save: function(e) {
    var t = this,
      a = "string" == typeof e ? e : "已发送",
      n = this.data.rawBytes && 256 === this.data.rawBytes.length ? new Uint8Array(this.data.rawBytes) : new Uint8Array(256);
    this.data.items.forEach((function(e, t) {
      2 * t < n.length - 2 && (n[2 * t] = Number(e.btn) || 0, n[2 * t + 1] = Number(e.fun) || 0)
    }));
    for (var i = 2 * this.data.items.length; i < n.length - 2; i += 2) n[i] = 0, n[i + 1] = 0;
    s.setCheckData(171, n), s.tx(171, n).then((function() {
      return s.msg(a, 1)
    })).catch((function(e) {
      var a = e.message || "写入快捷指令失败";
      t.setData({
        loading: !1,
        loadState: "error",
        loadMessage: a
      }), s.msg(a, 0, 2200)
    }))
  },
  rx: function(e, t) {
    var a = this;
    if (t && 256 === t.length) {
      var n = s.getCheckData(t, 171);
      if (n) s.tx(n.type, n.buf).catch((function(e) {
        var t = e.message || "快捷指令回读校验重试失败";
        a.setData({
          loading: !1,
          loadState: "error",
          loadMessage: t
        }), s.msg(t, 0, 2200)
      }));
      else {
        clearTimeout(this.loadTimer);
        for (var i = [], o = 0; o < t.length - 2; o += 2) t[o] && i.push(this.decorateItem({
          btn: t[o],
          fun: t[o + 1] || 0
        }));
        this.setData({
          items: i,
          loading: !1,
          loadState: i.length ? "loaded" : "empty",
          loadMessage: i.length ? "已加载 ".concat(i.length, " 条快捷指令") : "模块未配置快捷指令",
          rawBytes: Array.prototype.slice.call(t)
        })
      }
    }
  },
  rxExecute: function() {
    this.pendingExecLabel && (this.setData({
      execState: "confirmed",
      execMessage: "".concat(this.pendingExecLabel, " 已收到模块确认")
    }), this.pendingExecLabel = "")
  },
  onHide: function() {
    this.handler && s.offPacket(171, this.handler), this.execHandler && s.offPacket(187, this.execHandler), this.pendingExecLabel = "", clearTimeout(this.loadTimer)
  },
  catchTouchMove: function() {
    return !1
  }
});