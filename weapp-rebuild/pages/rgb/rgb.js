var t = require("../../@babel/runtime/helpers/defineProperty"),
  e = require("../../services/functionOptions"),
  a = require("../../services/rgbConfig"),
  i = require("../../services/pageNav"),
  s = getApp();
Page({
  data: {
    select: 0,
    tabs: ["转向联动", "默认效果"],
    items: [],
    rawBytes: [],
    loading: !1,
    loadState: "idle",
    loadMessage: "等待读取氛围灯配置",
    btnOptions: e.flatten("btn"),
    funList: null
  },
  onShow: function() {
    var t = this;
    s.applyThemeToPage && s.applyThemeToPage(this), this.handler = this.rx.bind(this), s.onPacket(185, this.handler), s.api.getFunList().catch((function() {
      return null
    })).then((function(a) {
      var i = e.mergeServerList(a);
      t.setData({
        funList: i,
        btnOptions: e.flatten("btn", i)
      }), t.load()
    }))
  },
  back: function() {
    i.goBack("/pages/index/index")
  },
  switchTab: function(t) {
    var e = Number(t.currentTarget.dataset.select) || 0;
    e !== this.data.select && (this.setData({
      select: e,
      items: [],
      rawBytes: [],
      loadMessage: "正在切换氛围灯配置组"
    }), this.load(e))
  },
  load: function(t) {
    var e = this,
      a = "number" == typeof t ? t : this.data.select;
    this.setData({
      loading: !0,
      loadState: "loading",
      loadMessage: "正在读取".concat(this.data.tabs[a], "配置")
    }), clearTimeout(this.loadTimer), this.loadTimer = setTimeout((function() {
      e.data.loading && e.setData({
        loading: !1,
        loadState: "timeout",
        loadMessage: "未收到 256 字节 RGB 配置回包，请确认模块在线"
      })
    }), 6e3), s.tx(185, new Uint8Array([0, a])).catch((function(t) {
      clearTimeout(e.loadTimer), e.setData({
        loading: !1,
        loadState: "error",
        loadMessage: t.message || "读取氛围灯失败"
      })
    }))
  },
  add: function() {
    var t = a.makeDefaultItem(this.data.select),
      e = this.data.items.concat([this.decorateItem(t)]);
    this.setData({
      items: e,
      loadState: "edited",
      loadMessage: "已添加默认氛围灯指令，写入后才会保存到模块"
    })
  },
  remove: function(t) {
    var e = this,
      a = Number(t.currentTarget.dataset.idx);
    this.data.items[a] && s.modal("确定删除此氛围灯指令吗？", !0, (function() {
      var t = e.data.items.slice();
      t.splice(a, 1), e.setData({
        items: t,
        loadState: "edited",
        loadMessage: "已删除本地条目，写入后才会同步到模块"
      })
    }))
  },
  removeAll: function() {
    var t = this;
    s.modal("确定删除当前组所有氛围灯指令吗？", !0, (function() {
      t.setData({
        loading: !0,
        loadState: "loading",
        loadMessage: "正在请求模块清空当前组配置"
      }), t.waitForResponse("删除氛围灯配置超时，请确认模块是否在线"), s.tx(185, new Uint8Array([3, t.data.select])).catch((function(e) {
        clearTimeout(t.loadTimer), t.setData({
          loading: !1,
          loadState: "error",
          loadMessage: e.message || "删除氛围灯配置失败"
        })
      }))
    }))
  },
  test: function(t) {
    var e = Number(t.currentTarget.dataset.idx);
    this.data.items[e] && s.tx(185, new Uint8Array([2, this.data.select, e])).then((function() {
      return s.msg("测试指令已发送", 1)
    })).catch((function() {}))
  },
  changeCommand: function(t) {
    var e = Number(t.currentTarget.dataset.idx),
      a = this.data.btnOptions[Number(t.detail.value)];
    if (a && this.data.items[e] && 0 !== e) {
      var i = this.data.items.slice();
      i[e] = this.decorateItem(Object.assign({}, i[e], {
        cmd: a.val
      })), this.setEditedItems(i)
    }
  },
  changeField: function(e) {
    var i = Number(e.currentTarget.dataset.idx),
      s = e.currentTarget.dataset.field;
    if (this.data.items[i]) {
      var n = a.clampNumber(e.detail.value, 0, "addr" === s ? 63 : 31),
        r = this.data.items.slice();
      r[i] = this.decorateItem(Object.assign({}, r[i], t({}, s, n))), this.setEditedItems(r)
    }
  },
  changeColor: function(t) {
    var e = Number(t.currentTarget.dataset.idx);
    if (this.data.items[e]) {
      var i = this.data.items.slice();
      i[e] = this.decorateItem(Object.assign({}, i[e], {
        color: a.normalizeColor(t.detail.value)
      })), this.setEditedItems(i)
    }
  },
  toggleField: function(e) {
    var a = Number(e.currentTarget.dataset.idx),
      i = e.currentTarget.dataset.field;
    if (this.data.items[a]) {
      var s = e.detail && "boolean" == typeof e.detail.value ? e.detail.value : 1 !== Number(this.data.items[a][i]),
        n = this.data.items.slice();
      n[a] = this.decorateItem(Object.assign({}, n[a], t({}, i, s ? 1 : 0))), this.setEditedItems(n)
    }
  },
  save: function() {
    var t = this,
      e = a.encodeConfig(this.data.items, this.data.select, this.data.rawBytes),
      i = a.buildWritePayload(this.data.select, e);
    s.setCheckData(185, e), this.setData({
      loading: !0,
      loadState: "loading",
      loadMessage: "正在写入 RGB 配置并等待回读校验"
    }), this.waitForResponse("写入氛围灯配置超时，请重新读取确认模块状态"), s.tx(185, i).then((function() {
      s.msg("已发送", 1)
    })).catch((function(e) {
      clearTimeout(t.loadTimer), t.setData({
        loading: !1,
        loadState: "error",
        loadMessage: e.message || "写入氛围灯失败"
      })
    }))
  },
  rx: function(t, e) {
    if (e) {
      if (1 === e.length && 255 === e[0]) return s.setCheckData(0, null), clearTimeout(this.loadTimer), void this.setData({
        loading: !1,
        loadState: "missing",
        loadMessage: "请先安装氛围灯模块"
      });
      if (e.length === a.CONFIG_LENGTH) {
        var i = s.getCheckData(e, 185);
        if (i) {
          var n = 185 === i.type && i.buf.length === a.CONFIG_LENGTH ? a.buildWritePayload(this.data.select, i.buf) : i.buf;
          s.tx(i.type, n).catch((function() {}))
        } else clearTimeout(this.loadTimer), this.parseConfig(e)
      }
    }
  },
  parseConfig: function(t) {
    var i = this,
      s = a.parseConfig(t, this.data.select, (function(t) {
        return e.nameOf("btn", t, i.data.funList)
      })).map((function(t) {
        return i.decorateItem(t)
      }));
    this.setData({
      items: s,
      loading: !1,
      loadState: s.length ? "loaded" : "empty",
      loadMessage: s.length ? "已加载 ".concat(s.length, " 条 RGB 指令") : "模块未配置当前组氛围灯",
      rawBytes: Array.prototype.slice.call(t)
    })
  },
  decorateItem: function(t) {
    var i = t.btnname || e.nameOf("btn", t.cmd, this.data.funList);
    return Object.assign({}, t, {
      color: a.normalizeColor(t.color),
      bright: a.clampNumber(t.bright, 0, 31),
      breathe: a.clampNumber(t.breathe, 0, 31),
      blink: a.clampNumber(t.blink, 0, 31),
      btnname: i,
      cmdIndex: this.selectedCommandIndex(t.cmd)
    })
  },
  selectedCommandIndex: function(t) {
    var e = this.data.btnOptions.findIndex((function(e) {
      return Number(e.val) === Number(t)
    }));
    return e >= 0 ? e : 0
  },
  setEditedItems: function(t) {
    this.setData({
      items: t,
      loadState: "edited",
      loadMessage: "配置已修改，写入后才会保存到模块"
    })
  },
  waitForResponse: function(t) {
    var e = this;
    clearTimeout(this.loadTimer), this.loadTimer = setTimeout((function() {
      e.data.loading && e.setData({
        loading: !1,
        loadState: "timeout",
        loadMessage: t
      })
    }), 6e3)
  },
  onHide: function() {
    this.handler && s.offPacket(185, this.handler), clearTimeout(this.loadTimer)
  }
});