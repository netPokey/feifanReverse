var e = require("../../services/functionOptions"),
  t = require("../../services/pageNav"),
  a = require("../../services/automationStore"),
  n = require("../../services/gaugeEvents"),
  s = getApp();
Page({
  data: {
    id: "auto_prepare_drive",
    flow: a.defaultFlow(),
    triggerOptions: ["蓝牙鉴权成功", "回到前台且已连接", "仪表车况变化"],
    triggerIndex: 0,
    gaugeEventOptions: n.EVENT_OPTIONS.map((function(e) {
      return e.label
    })),
    gaugeEventValues: n.EVENT_OPTIONS.map((function(e) {
      return e.value
    })),
    gaugeEventIndex: 0,
    delayOptions: ["0秒", "3秒", "5秒", "10秒", "15秒", "30秒"],
    delayValues: [0, 3e3, 5e3, 1e4, 15e3, 3e4],
    cooldownOptions: ["无冷却", "1分钟", "5分钟", "10分钟", "30分钟"],
    cooldownValues: [0, 60, 300, 600, 1800],
    cooldownIndex: 2,
    conditionRows: [],
    selector: {
      show: !1,
      stepIndex: -1,
      mode: "groups",
      title: "选择动作",
      groups: [],
      options: [],
      selectedVal: 0,
      selectedName: "",
      saveEnabled: !1
    },
    funList: null
  },
  onLoad: function(e) {
    this.setData({
      id: e && e.id || "auto_prepare_drive"
    })
  },
  onShow: function() {
    var t = this;
    s.applyThemeToPage && s.applyThemeToPage(this), s.api.getFunList().catch((function() {
      return null
    })).then((function(a) {
      var n = e.mergeServerList(a);
      t.data.funList = n, t.loadFlow(n)
    }))
  },
  back: function() {
    t.goBack("/pages/automation/automation")
  },
  loadFlow: function(e) {
    var t = a.getFlow(this.data.id),
      n = this.decorateFlow(t, e || this.data.funList),
      s = Math.max(0, this.data.gaugeEventValues.indexOf(n.trigger.gaugeEvent));
    this.setData({
      flow: n,
      triggerIndex: this.triggerIndex(n.trigger.type),
      gaugeEventIndex: s,
      cooldownIndex: Math.max(0, this.data.cooldownValues.indexOf(Number(n.trigger.cooldownSeconds || 0))),
      conditionRows: this.buildConditionRows(n),
      funList: e
    })
  },
  triggerIndex: function(e) {
    return {
      bleAuthSuccess: 0,
      appShowConnected: 1,
      gaugeStateChanged: 2
    } [e] || 0
  },
  decorateFlow: function(t, n) {
    var s = this,
      i = a.normalizeFlow(t);
    return i.steps = i.steps.map((function(t) {
      var a = Number(t.command.value || 0),
        i = s.data.delayValues.indexOf(Number(t.delayMs || 0));
      return Object.assign({}, t, {
        delayText: s.delayText(t.delayMs),
        delayIndex: i >= 0 ? i : 0,
        command: Object.assign({}, t.command, {
          label: e.nameOf("fun", a, n)
        })
      })
    })), i
  },
  buildConditionRows: function(e) {
    return (e.conditions.rules || []).map((function(e) {
      var t = {
        connected: "必须已连接",
        deviceMatched: "仅当前保存设备",
        timeRange: "".concat(e.start, " - ").concat(e.end),
        weekday: "指定星期"
      };
      return Object.assign({}, e, {
        name: {
          connected: "连接状态",
          deviceMatched: "设备范围",
          timeRange: "生效时间",
          weekday: "星期限制"
        } [e.type] || e.type,
        desc: t[e.type] || "条件守卫"
      })
    }))
  },
  delayText: function(e) {
    var t = Math.round(Number(e || 0) / 1e3);
    return t ? "".concat(t, "秒后") : "立即"
  },
  toggleEnabled: function(e) {
    var t = e.detail && "boolean" == typeof e.detail.value ? e.detail.value : !this.data.flow.enabled,
      a = Object.assign({}, this.data.flow, {
        enabled: t
      });
    this.saveFlow(a, !1)
  },
  changeTrigger: function(e) {
    var t = Number(e.detail.value),
      a = Object.assign({}, this.data.flow);
    a.trigger = Object.assign({}, a.trigger, {
      type: ["bleAuthSuccess", "appShowConnected", "gaugeStateChanged"][t] || "bleAuthSuccess",
      gaugeEvent: a.trigger.gaugeEvent || n.DEFAULT_EVENT
    }), this.saveFlow(a, !1)
  },
  changeGaugeEvent: function(e) {
    var t = Number(e.detail.value),
      a = Object.assign({}, this.data.flow);
    a.trigger = Object.assign({}, a.trigger, {
      gaugeEvent: this.data.gaugeEventValues[t] || n.DEFAULT_EVENT
    }), this.saveFlow(a, !1)
  },
  toggleConfirm: function(e) {
    var t = e.detail && "boolean" == typeof e.detail.value ? e.detail.value : !this.data.flow.trigger.confirmBeforeRun,
      a = Object.assign({}, this.data.flow);
    a.trigger = Object.assign({}, a.trigger, {
      confirmBeforeRun: t
    }), this.saveFlow(a, !1)
  },
  changeCooldown: function(e) {
    var t = Number(e.detail.value),
      a = Object.assign({}, this.data.flow);
    a.trigger = Object.assign({}, a.trigger, {
      cooldownSeconds: this.data.cooldownValues[t] || 0
    }), this.saveFlow(a, !1)
  },
  toggleCondition: function(e) {
    var t = e.currentTarget.dataset.type,
      a = (this.data.conditionRows || []).find((function(e) {
        return e.type === t
      })),
      n = e.detail && "boolean" == typeof e.detail.value ? e.detail.value : !(a && a.enabled),
      s = Object.assign({}, this.data.flow);
    s.conditions = Object.assign({}, s.conditions, {
      rules: s.conditions.rules.map((function(e) {
        return e.type === t ? Object.assign({}, e, {
          enabled: n
        }) : e
      }))
    }), this.saveFlow(s, !1)
  },
  handleConditionTap: function(e) {
    "timeRange" === e.currentTarget.dataset.type && this.editTimeRange()
  },
  editTimeRange: function() {
    var e = this,
      t = Object.assign({}, this.data.flow),
      a = t.conditions.rules.find((function(e) {
        return "timeRange" === e.type
      }));
    s.input("生效时间 ".concat(a.start, "-").concat(a.end, "，输入如 06:00-23:30"), (function(a) {
      var n = String(a.content || "").match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      n && e.isValidTime(n[1]) && e.isValidTime(n[2]) ? (t.conditions = Object.assign({}, t.conditions, {
        rules: t.conditions.rules.map((function(e) {
          return "timeRange" === e.type ? Object.assign({}, e, {
            start: n[1],
            end: n[2],
            enabled: !0
          }) : e
        }))
      }), e.saveFlow(t, !0)) : s.msg("时间格式应为 06:00-23:30", 0)
    }))
  },
  isValidTime: function(e) {
    var t = String(e || "").match(/^(\d{2}):(\d{2})$/);
    return !!t && (Number(t[1]) <= 23 && Number(t[2]) <= 59)
  },
  addStep: function() {
    var t = Object.assign({}, this.data.flow),
      a = t.steps.slice();
    a.push({
      id: "step_".concat(Date.now()),
      delayMs: a.length ? 5e3 : 0,
      command: {
        kind: "fun",
        value: 21,
        label: e.nameOf("fun", 21, this.data.funList)
      },
      onError: "stop"
    }), t.steps = a, this.saveFlow(t, !0)
  },
  removeStep: function(e) {
    var t = Number(e.currentTarget.dataset.idx),
      a = Object.assign({}, this.data.flow);
    a.steps = a.steps.filter((function(e, a) {
      return a !== t
    })), this.saveFlow(a, !0)
  },
  changeStepDelay: function(e) {
    var t = this,
      a = Number(e.currentTarget.dataset.idx),
      n = Number(e.detail.value),
      s = Object.assign({}, this.data.flow);
    s.steps = s.steps.map((function(e, s) {
      return s === a ? Object.assign({}, e, {
        delayMs: t.data.delayValues[n] || 0
      }) : e
    })), this.saveFlow(s, !1)
  },
  openActionSelector: function(t) {
    var a = Number(t.currentTarget.dataset.idx),
      n = this.data.flow.steps[a];
    if (n) {
      var s = Number(n.command.value || 0),
        i = e.groups("fun", this.data.funList).map((function(e, t) {
          var a = (e.data || []).some((function(e) {
            return Number(e.val) === s
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
          stepIndex: a,
          mode: "groups",
          title: "选择动作",
          groups: i,
          options: [],
          selectedVal: s,
          selectedName: e.nameOf("fun", s, this.data.funList),
          saveEnabled: !1
        }
      })
    }
  },
  openSelectorGroup: function(e) {
    var t = this,
      a = this.data.selector.groups[Number(e.currentTarget.dataset.idx)];
    a && this.setData({
      selector: Object.assign({}, this.data.selector, {
        mode: "options",
        title: a.name || "选择动作",
        options: (a.data || []).map((function(e) {
          return Object.assign({}, e, {
            selected: Number(e.val) === Number(t.data.selector.selectedVal)
          })
        }))
      })
    })
  },
  chooseSelectorOption: function(t) {
    var a = Number(t.currentTarget.dataset.val);
    this.setData({
      selector: Object.assign({}, this.data.selector, {
        selectedVal: a,
        selectedName: e.nameOf("fun", a, this.data.funList),
        saveEnabled: !0,
        options: this.data.selector.options.map((function(e) {
          return Object.assign({}, e, {
            selected: Number(e.val) === a
          })
        }))
      })
    })
  },
  saveSelector: function() {
    var t = this.data.selector;
    if (t.show && t.saveEnabled)
      if (e.canAttempt("fun", t.selectedVal, this.data.funList)) {
        var a = Object.assign({}, this.data.flow);
        a.steps = a.steps.map((function(e, a) {
          return a === t.stepIndex ? Object.assign({}, e, {
            command: {
              kind: "fun",
              value: t.selectedVal,
              label: t.selectedName
            }
          }) : e
        })), this.setData({
          selector: {
            show: !1,
            stepIndex: -1,
            mode: "groups",
            title: "选择动作",
            groups: [],
            options: [],
            selectedVal: 0,
            selectedName: "",
            saveEnabled: !1
          }
        }), this.saveFlow(a, !0)
      } else s.msg("该动作不支持自动化执行", 0)
  },
  backSelector: function() {
    var e = this.data.selector;
    "options" !== e.mode ? this.setData({
      selector: {
        show: !1,
        stepIndex: -1,
        mode: "groups",
        title: "选择动作",
        groups: [],
        options: [],
        selectedVal: 0,
        selectedName: "",
        saveEnabled: !1
      }
    }) : this.setData({
      selector: Object.assign({}, e, {
        mode: "groups",
        title: "选择动作",
        options: []
      })
    })
  },
  saveFlow: function(e, t) {
    var n = a.saveFlow(e);
    return this.loadFlow(this.data.funList), t && s.msg("已保存", 1), n
  },
  noop: function() {
    return !1
  },
  catchTouchMove: function() {
    return !1
  }
});