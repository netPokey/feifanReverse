var t = require("../../services/functionOptions"),
  e = require("../../services/pageNav"),
  n = require("../../services/shortcutConfig"),
  a = require("../../services/customSwitchStore"),
  r = getApp();
Page({
  data: {
    connected: !1,
    loading: !1,
    loadState: "idle",
    loadMessage: "等待读取模块快捷指令",
    rules: [],
    currentIndex: 0,
    current: null,
    moduleEntries: [],
    rawBytes: [],
    funList: null,
    selector: {
      show: !1,
      entries: [],
      selectedCount: 0
    }
  },
  onLoad: function() {
    this.stateHandler = this.syncConnection.bind(this), this.configHandler = this.rxConfig.bind(this), r.onPacket("state", this.stateHandler), r.onPacket(171, this.configHandler)
  },
  onShow: function() {
    var e = this;
    r.applyThemeToPage && r.applyThemeToPage(this), this.syncConnection(r.globalData.connected), r.api.getFunList().catch((function() {
      return null
    })).then((function(n) {
      var a = t.mergeServerList(n);
      e.setData({
        funList: a
      }), e.reloadRules(e.data.current && e.data.current.id), e.decorateModuleEntries(), r.globalData.connected && e.loadModuleConfig()
    }))
  },
  back: function() {
    e.goBack("/pages/set/set")
  },
  syncConnection: function(t) {
    this.setData({
      connected: !!t
    })
  },
  reloadRules: function(t) {
    var e = this,
      n = a.listRules().map((function(t) {
        return e.decorateRule(t)
      })),
      r = 0;
    t && (r = Math.max(0, n.findIndex((function(e) {
      return e.id === t
    })))), this.setData({
      rules: n,
      currentIndex: r,
      current: n[r] || null
    })
  },
  decorateRule: function(t) {
    var e = this,
      n = a.normalizeRule(t),
      r = n.shortcuts.map((function(t) {
        return e.decorateEntry(t)
      })),
      s = n.cachedShortcuts.map((function(t) {
        return e.decorateEntry(t)
      }));
    return Object.assign({}, n, {
      shortcuts: r,
      cachedShortcuts: s,
      shortcutCount: r.length,
      stateText: n.enabled ? "已启用" : "已禁用",
      summary: r.length ? r.map((function(t) {
        return t.shortName
      })).join("、") : "尚未绑定模块快捷指令"
    })
  },
  decorateEntry: function(e) {
    var a = n.normalizeEntry(e, e && e.index) || {
      index: 0,
      btn: 0,
      fun: 0
    };
    return Object.assign({}, a, {
      btnname: t.nameOf("btn", a.btn, this.data.funList),
      funname: t.nameOf("fun", a.fun, this.data.funList),
      shortName: "".concat(t.nameOf("btn", a.btn, this.data.funList), " -> ").concat(t.nameOf("fun", a.fun, this.data.funList))
    })
  },
  decorateModuleEntries: function() {
    var t = this,
      e = this.data.current,
      a = e ? e.shortcuts : [],
      r = (this.data.moduleEntries || []).map((function(e) {
        var r = t.decorateEntry(e);
        return Object.assign({}, r, {
          selected: a.some((function(t) {
            return n.sameEntry(t, r)
          }))
        })
      }));
    this.setData({
      moduleEntries: r
    })
  },
  findEntryOwner: function(t, e) {
    return (this.data.rules || []).find((function(a) {
      return !(!a || a.id === e) && (a.shortcuts || []).some((function(e) {
        return n.sameEntry(e, t)
      }))
    })) || null
  },
  selectRule: function(t) {
    var e = Number(t.currentTarget.dataset.idx),
      n = this.data.rules[e];
    n && (this.setData({
      currentIndex: e,
      current: n,
      selector: this.emptySelector()
    }), this.decorateModuleEntries())
  },
  addRule: function() {
    var t = a.createRule();
    this.reloadRules(t.id), this.decorateModuleEntries(), r.msg("已新增场景开关", 1)
  },
  getRuleFromEvent: function(t) {
    var e = Number(t && t.currentTarget && t.currentTarget.dataset ? t.currentTarget.dataset.idx : this.data.currentIndex),
      n = this.data.rules[e] || this.data.current;
    return n && this.data.current && n.id === this.data.current.id ? n : (n && (this.setData({
      currentIndex: e,
      current: n,
      selector: this.emptySelector()
    }), this.decorateModuleEntries()), n || null)
  },
  renameCurrent: function(t) {
    var e = this,
      n = this.getRuleFromEvent(t);
    n && r.input(n.name || "场景开关", (function(t) {
      var s = String(t.content || "").trim();
      if (s) {
        var i = a.saveRule(Object.assign({}, n, {
          name: s
        }));
        e.reloadRules(i.id), r.msg("已更新名称", 1)
      } else r.msg("名称不能为空", 0)
    }))
  },
  removeCurrent: function(t) {
    var e = this,
      n = this.getRuleFromEvent(t);
    n && r.modal("确定删除当前场景开关？", !0, (function() {
      var t = a.removeRule(n.id);
      e.reloadRules(t[0] && t[0].id), e.decorateModuleEntries(), r.msg("已删除", 1)
    }))
  },
  toggleCurrent: function(t) {
    var e = this.getRuleFromEvent(t);
    e && (e.enabled ? this.disableCurrent() : this.enableCurrent())
  },
  loadModuleConfig: function() {
    var t = this;
    this.data.connected ? (this.setData({
      loading: !0,
      loadState: "loading",
      loadMessage: "正在读取模块快捷指令"
    }), clearTimeout(this.loadTimer), this.loadTimer = setTimeout((function() {
      t.data.loading && t.setData({
        loading: !1,
        loadState: "timeout",
        loadMessage: "未收到 256 字节配置回包"
      })
    }), 6e3), r.tx(171, new Uint8Array([2])).catch((function(e) {
      clearTimeout(t.loadTimer), t.setData({
        loading: !1,
        loadState: "error",
        loadMessage: e.message || "读取快捷指令失败"
      })
    }))) : r.msg("请先连接蓝牙", 0)
  },
  rxConfig: function(t, e) {
    var a = this;
    if (e && e.length === n.CONFIG_LENGTH) {
      var s = r.getCheckData(e, 171);
      if (s) r.tx(s.type, s.buf).catch((function(t) {
        return r.msg(t.message || "快捷指令回读校验重试失败", 0)
      }));
      else {
        clearTimeout(this.loadTimer);
        var i = n.parseEntries(e).map((function(t) {
          return a.decorateEntry(t)
        }));
        this.setData({
          loading: !1,
          loadState: i.length ? "loaded" : "empty",
          loadMessage: i.length ? "已读取 ".concat(i.length, " 条模块快捷指令") : "模块暂无快捷指令，请先在硬件按键联动中配置",
          moduleEntries: i,
          rawBytes: Array.prototype.slice.call(e)
        }), this.decorateModuleEntries()
      }
    }
  },
  openShortcutSelector: function(t) {
    var e = this.getRuleFromEvent(t);
    if (e) return e.enabled ? (this.closeShortcutSelector(), void r.msg("请先禁用当前开关，再调整绑定指令", 0)) : void(this.data.moduleEntries.length ? this.setData({
      selector: {
        show: !0,
        entries: this.buildSelectorEntries(e),
        selectedCount: e.shortcuts.length
      }
    }) : r.msg("请先读取模块快捷指令", 0));
    r.msg("请先新增场景开关", 0)
  },
  buildSelectorEntries: function(t) {
    var e = this,
      a = t ? t.shortcuts : [];
    return (this.data.moduleEntries || []).map((function(r, s) {
      var i = e.findEntryOwner(r, t && t.id),
        o = a.some((function(t) {
          return n.sameEntry(t, r)
        }));
      return Object.assign({}, r, {
        selectorIndex: s,
        selected: o,
        disabled: !!i,
        ownerName: i ? i.name : "",
        ownerText: i ? "已被“".concat(i.name, "”使用") : r.funname
      })
    }))
  },
  toggleSelectorShortcut: function(t) {
    var e = Number(t.currentTarget.dataset.idx),
      n = this.data.selector || {},
      a = (n.entries || []).slice(),
      s = a[e];
    s && (s.disabled ? r.msg("已被“".concat(s.ownerName, "”使用"), 0) : (a[e] = Object.assign({}, s, {
      selected: !s.selected
    }), this.setData({
      selector: Object.assign({}, n, {
        entries: a,
        selectedCount: a.filter((function(t) {
          return t.selected
        })).length
      })
    })))
  },
  closeShortcutSelector: function() {
    this.setData({
      selector: this.emptySelector()
    })
  },
  emptySelector: function() {
    return {
      show: !1,
      entries: [],
      selectedCount: 0
    }
  },
  saveShortcutSelector: function() {
    var t = this.data.current,
      e = this.data.selector || {};
    if (t && e.show)
      if (t.enabled) r.msg("请先禁用当前开关，再调整绑定指令", 0);
      else {
        var s = n.uniqueEntries((e.entries || []).filter((function(t) {
            return t.selected
          }))),
          i = a.saveRule(Object.assign({}, t, {
            shortcuts: s,
            cachedShortcuts: s,
            enabled: !1
          }));
        this.reloadRules(i.id), this.decorateModuleEntries(), this.closeShortcutSelector(), r.msg("已保存绑定指令", 1)
      }
  },
  enableCurrent: function() {
    var t = this.data.current;
    if (this.ensureWritable(t)) {
      var e = t.shortcuts.length ? t.shortcuts : t.cachedShortcuts;
      if (e.length) {
        var a = n.mergeEntries(n.parseEntries(this.data.rawBytes), e),
          s = n.buildBytes(a, this.data.rawBytes);
        this.writeModuleConfig(s, Object.assign({}, t, {
          enabled: !0,
          shortcuts: e,
          cachedShortcuts: e,
          lastEnabledAt: Date.now()
        }), "已启用并写入模块")
      } else r.msg("请先绑定模块快捷指令", 0)
    }
  },
  disableCurrent: function() {
    var t = this.data.current;
    if (this.ensureWritable(t)) {
      var e = t.shortcuts.length ? t.shortcuts : t.cachedShortcuts;
      if (e.length) {
        var a = Object.assign({}, t, {
            cachedShortcuts: e,
            enabled: !1,
            lastDisabledAt: Date.now()
          }),
          s = n.removeEntries(n.parseEntries(this.data.rawBytes), e),
          i = n.buildBytes(s, this.data.rawBytes);
        this.writeModuleConfig(i, a, "已禁用并从模块移除")
      } else r.msg("当前开关没有可移除的指令组", 0)
    }
  },
  ensureWritable: function(t) {
    return t ? this.data.connected ? !(!this.data.rawBytes || this.data.rawBytes.length !== n.CONFIG_LENGTH) || (r.msg("请先读取模块快捷指令", 0), !1) : (r.msg("请先连接蓝牙", 0), !1) : (r.msg("请先新增场景开关", 0), !1)
  },
  writeModuleConfig: function(t, e, n) {
    var s = this;
    this.setData({
      loading: !0,
      loadState: "writing",
      loadMessage: "正在写入模块快捷指令"
    }), r.setCheckData(171, t), r.tx(171, t).then((function() {
      var t = a.saveRule(e);
      s.reloadRules(t.id), r.msg(n, 1)
    })).catch((function(t) {
      r.msg(t.message || "写入快捷指令失败", 0, 2200)
    })).finally((function() {
      s.setData({
        loading: !1,
        loadState: "loaded",
        loadMessage: "模块快捷指令已更新，等待回读确认"
      })
    }))
  },
  onUnload: function() {
    r.offPacket("state", this.stateHandler), r.offPacket(171, this.configHandler), clearTimeout(this.loadTimer)
  },
  catchTouchMove: function() {
    return !1
  }
});