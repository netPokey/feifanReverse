var e = require("../../services/functionOptions"),
  t = require("../../services/gaugeEvents"),
  a = require("../../services/pageNav"),
  n = require("../../services/superShortcutStore"),
  i = getApp();
Page({
  data: {
    connected: !1,
    currentIndex: 0,
    rules: [],
    current: null,
    delayOptions: ["立即", "3秒", "5秒", "10秒", "15秒", "30秒"],
    delayValues: [0, 3e3, 5e3, 1e4, 15e3, 3e4],
    triggerTypeOptions: ["动作回馈", "车况事件"],
    triggerTypeValues: ["actionNotice", "gaugeEvent"],
    gaugeEventOptions: t.EVENT_OPTIONS.map((function(e) {
      return e.label
    })),
    gaugeEventValues: t.EVENT_OPTIONS.map((function(e) {
      return e.value
    })),
    funList: null,
    rawBytes: [],
    moduleConfigState: "idle",
    moduleConfigMessage: "监听动作不需要写入 171，请先确保原快捷指令或车机动作会触发该动作",
    continuationState: "idle",
    continuationMessage: "等待模块回馈监听动作",
    selector: {
      show: !1,
      target: "",
      stepIndex: -1,
      kind: "fun",
      mode: "groups",
      title: "",
      groups: [],
      options: [],
      selectedVal: 0,
      selectedName: "",
      saveEnabled: !1
    }
  },
  onLoad: function() {
    this.stateHandler = this.syncConnection.bind(this), this.actionNoticeHandler = this.rxActionNotice.bind(this), i.onPacket("state", this.stateHandler), i.onPacket(187, this.actionNoticeHandler)
  },
  onShow: function() {
    var t = this;
    if (this.visible = !0, i.applyThemeToPage && i.applyThemeToPage(this), i.getAccessMode && "full" !== i.getAccessMode()) return i.msg("超级快捷指令仅完整模式可用", 0), void this.back();
    this.syncConnection(i.globalData.connected), i.api.getFunList().catch((function() {
      return null
    })).then((function(a) {
      var n = e.mergeServerList(a);
      t.setData({
        funList: n
      }), t.reloadRules(t.data.current && t.data.current.id)
    }))
  },
  onHide: function() {
    this.visible = !1, this.stopGaugeTriggerPolling(!0)
  },
  back: function() {
    a.goBack("/pages/index/index")
  },
  syncConnection: function(e) {
    this.setData({
      connected: !!e
    }), this.refreshRuntimeState(), this.syncGaugeTriggerPolling()
  },
  reloadRules: function(e) {
    var t = this,
      a = n.listRules().map((function(e) {
        return t.decorateRule(e)
      })),
      i = Math.max(0, a.findIndex((function(t) {
        return t.id === e
      })));
    this.setData({
      rules: a,
      currentIndex: i,
      current: a[i] || null
    }), this.syncGaugeTriggerPolling()
  },
  decorateRule: function(a) {
    var i = this,
      r = n.normalizeRule(a),
      s = e.nameOf("fun", r.listenAction.value, this.data.funList),
      u = Math.max(0, this.data.triggerTypeValues.indexOf(r.trigger.kind)),
      g = Math.max(0, this.data.gaugeEventValues.indexOf(r.trigger.gaugeEvent)),
      o = "gaugeEvent" === r.trigger.kind ? t.nameOf(r.trigger.gaugeEvent) : s,
      l = r.steps.map((function(t) {
        var a = Number(t.command.value || 0),
          n = i.data.delayValues.indexOf(Number(t.delayMs || 0));
        return Object.assign({}, t, {
          delayIndex: n >= 0 ? n : 0,
          delayText: i.delayText(t.delayMs),
          command: Object.assign({}, t.command, {
            label: e.nameOf("fun", a, i.data.funList)
          })
        })
      }));
    return Object.assign({}, r, {
      listenActionName: s,
      triggerName: o,
      triggerTypeIndex: u,
      gaugeEventIndex: g,
      steps: l,
      stepCount: l.length,
      stateText: r.enabled ? "监听中" : "已停用"
    })
  },
  delayText: function(e) {
    var t = Math.round(Number(e || 0) / 1e3);
    return t ? "".concat(t, "秒后") : "立即"
  },
  saveCurrent: function(e, t) {
    if (!e) return null;
    var a = n.saveRule(e);
    return this.reloadRules(a.id), t && i.msg("已保存超级快捷指令", 1), a
  },
  markDraft: function(e) {
    return e ? Object.assign({}, e, {
      writeState: "draft",
      lastWrittenAt: 0
    }) : e
  },
  selectRule: function(e) {
    var t = Number(e.currentTarget.dataset.idx),
      a = this.data.rules[t];
    a && this.setData({
      currentIndex: t,
      current: a
    })
  },
  addRule: function() {
    var e = n.createRule();
    this.reloadRules(e.id), i.msg("已新增超级快捷指令", 1)
  },
  removeCurrent: function() {
    var e = this,
      t = this.data.current;
    t && i.modal("确定删除当前超级快捷指令？", !0, (function() {
      var a = n.removeRule(t.id);
      e.reloadRules(a[0] && a[0].id), i.msg("已删除", 1)
    }))
  },
  renameCurrent: function() {
    var e = this,
      t = this.data.current;
    t && i.input(t.name || "超级快捷指令", (function(a) {
      var n = String(a.content || "").trim();
      n ? e.saveCurrent(Object.assign({}, t, {
        name: n
      }), !0) : i.msg("名称不能为空", 0)
    }))
  },
  toggleEnabled: function(e) {
    var t = this.data.current;
    if (t) {
      var a = e.detail && "boolean" == typeof e.detail.value ? e.detail.value : !t.enabled;
      this.saveCurrent(Object.assign({}, t, {
        enabled: a
      }), !1)
    }
  },
  addStep: function() {
    var t = this.data.current;
    if (t)
      if (t.steps.length >= n.MAX_STEPS) i.msg("最多 ".concat(n.MAX_STEPS, " 个动作"), 0);
      else {
        var a = t.steps.concat([{
          id: "step_".concat(Date.now()),
          delayMs: t.steps.length ? 5e3 : 0,
          command: {
            kind: "fun",
            value: 181,
            label: e.nameOf("fun", 181, this.data.funList)
          }
        }]);
        this.saveCurrent(this.markDraft(Object.assign({}, t, {
          steps: a
        })), !0)
      }
  },
  removeStep: function(e) {
    var t = Number(e.currentTarget.dataset.idx),
      a = this.data.current;
    if (a && a.steps[t]) {
      var n = a.steps.filter((function(e, a) {
        return a !== t
      }));
      this.saveCurrent(this.markDraft(Object.assign({}, a, {
        steps: n
      })), !0)
    }
  },
  changeStepDelay: function(e) {
    var t = this,
      a = Number(e.currentTarget.dataset.idx),
      n = Number(e.detail.value),
      i = this.data.current;
    if (i && i.steps[a]) {
      var r = i.steps.map((function(e, i) {
        return i === a ? Object.assign({}, e, {
          delayMs: t.data.delayValues[n] || 0
        }) : e
      }));
      this.saveCurrent(this.markDraft(Object.assign({}, i, {
        steps: r
      })), !1)
    }
  },
  changeTriggerType: function(e) {
    var a = Number(e.detail.value),
      n = this.data.current;
    if (n) {
      var i = this.data.triggerTypeValues[a] || "actionNotice",
        r = Object.assign({}, n.trigger || {}, {
          kind: i,
          actionValue: n.listenAction && n.listenAction.value || 181,
          gaugeEvent: n.trigger && n.trigger.gaugeEvent || t.DEFAULT_EVENT
        });
      this.saveCurrent(this.markDraft(Object.assign({}, n, {
        trigger: r
      })), !1)
    }
  },
  changeGaugeEvent: function(e) {
    var a = Number(e.detail.value),
      n = this.data.current;
    if (n) {
      var i = Object.assign({}, n.trigger || {}, {
        kind: "gaugeEvent",
        gaugeEvent: this.data.gaugeEventValues[a] || t.DEFAULT_EVENT
      });
      this.saveCurrent(this.markDraft(Object.assign({}, n, {
        trigger: i
      })), !1)
    }
  },
  openListenSelector: function() {
    this.openSelector("fun", "listen", -1, this.data.current && this.data.current.listenAction.value)
  },
  openActionSelector: function(e) {
    var t = Number(e.currentTarget.dataset.idx),
      a = this.data.current && this.data.current.steps[t];
    a && this.openSelector("fun", "step", t, a.command.value)
  },
  openSelector: function(t, a, n, i) {
    var r = Number(i || 0),
      s = e.groups(t, this.data.funList).map((function(e, t) {
        var a = (e.data || []).some((function(e) {
          return Number(e.val) === r
        }));
        return Object.assign({}, e, {
          index: t,
          count: (e.data || []).length,
          hasSelected: a
        })
      }));
    this.setData({
      selector: {
        show: !0,
        target: a,
        stepIndex: n,
        kind: t,
        mode: "groups",
        title: "listen" === a ? "选择监听动作" : "选择后续动作",
        groups: s,
        options: [],
        selectedVal: r,
        selectedName: e.nameOf(t, r, this.data.funList),
        saveEnabled: !1
      }
    })
  },
  openSelectorGroup: function(e) {
    var t = this.data.selector,
      a = t.groups[Number(e.currentTarget.dataset.idx)];
    a && this.setData({
      selector: Object.assign({}, t, {
        mode: "options",
        title: a.name || "选择项目",
        options: (a.data || []).map((function(e) {
          return Object.assign({}, e, {
            selected: Number(e.val) === Number(t.selectedVal)
          })
        }))
      })
    })
  },
  chooseSelectorOption: function(t) {
    var a = Number(t.currentTarget.dataset.val),
      n = this.data.selector;
    this.setData({
      selector: Object.assign({}, n, {
        selectedVal: a,
        selectedName: e.nameOf(n.kind, a, this.data.funList),
        saveEnabled: Number(n.selectedVal) !== a,
        options: n.options.map((function(e) {
          return Object.assign({}, e, {
            selected: Number(e.val) === a
          })
        }))
      })
    })
  },
  saveSelector: function() {
    var e = this.data.selector,
      t = this.data.current;
    if (t && e.show && e.saveEnabled) {
      var a = t;
      if ("listen" === e.target) {
        var n = Object.assign({}, t.trigger || {}, {
          kind: "actionNotice",
          actionValue: e.selectedVal
        });
        a = this.markDraft(Object.assign({}, t, {
          listenAction: {
            kind: "fun",
            value: e.selectedVal,
            label: e.selectedName
          },
          trigger: n
        }))
      } else "step" === e.target && (a = this.markDraft(Object.assign({}, t, {
        steps: t.steps.map((function(t, a) {
          return a === e.stepIndex ? Object.assign({}, t, {
            command: {
              kind: "fun",
              value: e.selectedVal,
              label: e.selectedName
            }
          }) : t
        }))
      })));
      this.setData({
        selector: {
          show: !1,
          target: "",
          stepIndex: -1,
          kind: "fun",
          mode: "groups",
          title: "",
          groups: [],
          options: [],
          selectedVal: 0,
          selectedName: "",
          saveEnabled: !1
        }
      }), this.saveCurrent(a, !0)
    }
  },
  backSelector: function() {
    var e = this.data.selector;
    "options" !== e.mode ? this.closeSelector() : this.setData({
      selector: Object.assign({}, e, {
        mode: "groups",
        title: "listen" === e.target ? "选择监听动作" : "选择后续动作",
        options: []
      })
    })
  },
  closeSelector: function() {
    this.setData({
      selector: {
        show: !1,
        target: "",
        stepIndex: -1,
        kind: "fun",
        mode: "groups",
        title: "",
        groups: [],
        options: [],
        selectedVal: 0,
        selectedName: "",
        saveEnabled: !1
      }
    })
  },
  armCurrent: function() {
    var e = this.data.current;
    e && (e.enabled ? "actionNotice" !== e.trigger.kind || e.listenAction && e.listenAction.value ? "gaugeEvent" !== e.trigger.kind || e.trigger.gaugeEvent ? e.steps.length ? (this.saveCurrent(Object.assign({}, e, {
      writeState: "armed",
      lastWrittenAt: Date.now()
    }), !1), this.setData({
      moduleConfigState: "loaded",
      moduleConfigMessage: "已启用监听：".concat(e.triggerName)
    }), i.msg("已启用监听", 1), this.syncGaugeTriggerPolling()) : i.msg("请先添加后续动作", 0) : i.msg("请先选择车况事件", 0) : i.msg("请先选择监听动作", 0) : i.msg("请先启用当前规则", 0))
  },
  hasArmedGaugeTriggerRule: function() {
    return n.listRules().map(n.normalizeRule).some((function(e) {
      return e.enabled && "armed" === e.writeState && "gaugeEvent" === e.trigger.kind && e.trigger.gaugeEvent && e.steps.length > 0
    }))
  },
  syncGaugeTriggerPolling: function() {
    this.visible && this.data.connected && this.hasArmedGaugeTriggerRule() ? this.startGaugeTriggerPolling() : this.stopGaugeTriggerPolling(!0)
  },
  startGaugeTriggerPolling: function() {
    this.gaugeTriggerPollingActive || (this.gaugeTriggerPollingActive = !0, this.scheduleGaugeTriggerPolling(0))
  },
  scheduleGaugeTriggerPolling: function(e) {
    var t = this;
    this.visible && this.gaugeTriggerPollingActive && (this.gaugeTriggerPollingTimer && clearTimeout(this.gaugeTriggerPollingTimer), this.gaugeTriggerPollingTimer = setTimeout((function() {
      t.requestGaugeTriggerSnapshot(), t.scheduleGaugeTriggerPolling(1200)
    }), "number" == typeof e ? e : 1200))
  },
  requestGaugeTriggerSnapshot: function() {
    this.visible && i.globalData.connected && (this.gaugeTriggerPollingStarted = !0, i.tx(176, new Uint8Array([1]), {
      source: "superShortcutGauge"
    }).catch((function() {})))
  },
  stopGaugeTriggerPolling: function(e) {
    this.gaugeTriggerPollingTimer && (clearTimeout(this.gaugeTriggerPollingTimer), this.gaugeTriggerPollingTimer = null), (this.gaugeTriggerPollingActive || this.gaugeTriggerPollingStarted) && (this.gaugeTriggerPollingActive = !1, e && i.globalData.connected && this.gaugeTriggerPollingStarted && i.tx(176, new Uint8Array([0]), {
      source: "superShortcutGauge"
    }).catch((function() {})), this.gaugeTriggerPollingStarted = !1)
  },
  findNoticeRule: function(e) {
    var t = Number(e || 0),
      a = n.listRules().map(n.normalizeRule).filter((function(e) {
        return e.enabled && "armed" === e.writeState && "actionNotice" === e.trigger.kind && e.steps.length > 0 && Number(e.trigger.actionValue) === t
      }));
    if (!a.length) return null;
    var i = this.data.current && this.data.current.id;
    return a.find((function(e) {
      return e.id === i
    })) || a[0]
  },
  rxActionNotice: function(t, a) {
    if (a && a.length) {
      var n = this.findNoticeRule(a[0]);
      this.refreshRuntimeState(), n && this.setData({
        continuationState: "running",
        continuationMessage: "已收到监听动作：".concat(e.nameOf("fun", a[0], this.data.funList))
      })
    }
  },
  refreshRuntimeState: function() {
    if (i.getSuperShortcutRuntimeState) {
      var e = i.getSuperShortcutRuntimeState();
      e && e.lastNotice && this.setData({
        continuationState: e.lastNotice.status || "idle",
        continuationMessage: e.lastNotice.message || "等待模块回馈监听动作"
      })
    }
  },
  onUnload: function() {
    this.visible = !1, this.stopGaugeTriggerPolling(!0), i.offPacket("state", this.stateHandler), i.offPacket(187, this.actionNoticeHandler)
  },
  catchTouchMove: function() {
    return !1
  }
});