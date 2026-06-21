var a = require("../../services/localBackup"),
  t = require("../../services/pageNav"),
  e = getApp();
Page({
  data: {
    UID: "",
    inputId: "",
    items: [],
    shareValues: [],
    loading: !1,
    backupIdx: 255,
    action: "",
    message: "等待读取备份列表",
    useLocalFallback: !1
  },
  onShow: function() {
    var a = this;
    e.applyThemeToPage && e.applyThemeToPage(this), this.packetHandler = this.rx.bind(this), [160, 163, 171, 186].forEach((function(t) {
      return e.onPacket(t, a.packetHandler)
    })), this.setData({
      UID: e.globalData.deviceInfo.id || "",
      inputId: "",
      backupIdx: 255
    }), this.loadBackup("local")
  },
  back: function() {
    t.goBack("/pages/my/my")
  },
  loadBackup: function(a) {
    var t = this,
      i = "string" == typeof a ? a : "local";
    if (!this.targetDeviceId(i)) return this.setLocalItems("请先连接蓝牙"), void e.msg("请先连接蓝牙", 0);
    this.setData({
      loading: !0,
      message: "query" === i ? "正在查询云端备份" : "正在读取本机备份"
    }), this.callBackupApi(i).then((function(a) {
      a && a.success ? (t.setData({
        items: t.normalizeItems(a.data || []),
        loading: !1,
        useLocalFallback: !1,
        message: a.msg || "已读取云端备份列表"
      }), a.msg && e.msg(a.msg, 1)) : t.handleApiFallback(a && a.msg ? a.msg : "云端暂无备份，已使用本地兜底")
    })).catch((function() {
      t.handleApiFallback("网络不可用，已使用本地备份兜底")
    }))
  },
  queryBackup: function() {
    this.loadBackup("query")
  },
  loadSelfBackup: function() {
    this.loadBackup("local")
  },
  inputDeviceId: function(a) {
    this.setData({
      inputId: a.detail.value || ""
    })
  },
  backup: function(t) {
    var i = this,
      c = Number(t.currentTarget.dataset.idx),
      n = a.TYPES[c];
    n && (e.globalData.connected ? e.modal("确定将".concat(n.name, "备份到云端？"), !0, (function() {
      i.startBackupIndex(c)
    })) : e.msg("请先连接蓝牙", 0))
  },
  backupAll: function() {
    var t = this;
    e.globalData.connected ? e.modal("确定全量备份设置、快捷指令和蓝牙按钮？", !0, (function() {
      t.bulkMode = "backup", t.bulkQueue = a.TYPES.map((function(a, t) {
        return t
      })), t.startBackupIndex(t.bulkQueue.shift())
    })) : e.msg("请先连接蓝牙", 0)
  },
  startBackupIndex: function(t) {
    var i = this,
      c = a.TYPES[t];
    c && (this.setData({
      backupIdx: t,
      action: "backup",
      loading: !0,
      message: "".concat("backup" === this.bulkMode ? "全量备份：" : "", "正在读取模块").concat(c.name)
    }), this.waitForPacket("读取设备数据超时，备份未完成"), e.tx(c.readType, new Uint8Array(c.readPayload)).catch((function(a) {
      i.failAction(a.message || "读取设备数据失败")
    })))
  },
  recover: function(t) {
    var i = this,
      c = Number(t.currentTarget.dataset.idx),
      n = a.TYPES[c],
      s = this.data.items[c];
    n && s && (s.backupData ? e.globalData.connected ? e.modal("确定将云端".concat(n.name, "恢复到设备？"), !0, (function() {
      i.startRecoverIndex(c)
    })) : e.msg("请先连接蓝牙", 0) : e.msg("请先备份数据", 0))
  },
  recoverAll: function() {
    var t = this;
    if (e.globalData.connected)
      if (this.data.items.length) {
        var i = this.data.items.filter((function(a) {
          return !a.backupData
        })).map((function(a) {
          return a.typeName
        }));
        i.length ? e.msg("缺少".concat(i.join("、"), "备份"), 0, 2400) : e.modal("确定全量恢复设置、快捷指令和蓝牙按钮？", !0, (function() {
          t.bulkMode = "recover", t.bulkQueue = a.TYPES.map((function(a, t) {
            return t
          })), t.startRecoverIndex(t.bulkQueue.shift())
        }))
      } else e.msg("暂无可恢复备份", 0);
    else e.msg("请先连接蓝牙", 0)
  },
  startRecoverIndex: function(t) {
    var i = this,
      c = a.TYPES[t],
      n = this.data.items[t];
    if (c && n)
      if (n.backupData) {
        var s = this.buildRecoverPayload(t, n.backupData);
        s.length ? (this.setData({
          backupIdx: t + 3,
          action: "recover",
          loading: !0,
          message: "".concat("recover" === this.bulkMode ? "全量恢复：" : "", "正在恢复").concat(c.name, "到模块"),
          recoverCheckHex: e.format.decToHex(s)
        }), this.waitForPacket("恢复设备数据超时，请重新读取确认状态"), e.tx(c.writeType, s).catch((function(a) {
          i.failAction(a.message || "恢复写入失败")
        }))) : e.msg("备份数据为空", 0)
      } else e.msg("请先备份数据", 0)
  },
  shareChange: function(a) {
    this.setData({
      shareValues: a.detail.value || []
    })
  },
  shareBackup: function() {
    var t = a.shareMask(this.data.shareValues);
    this.callBackupApi("share", "&set=".concat(t.set, "&btn=").concat(t.btn, "&ble=").concat(t.ble)).then((function(a) {
      e.msg(a && a.msg ? a.msg : "分享请求已发送", a && a.success ? 1 : -1)
    })).catch((function() {
      e.msg("网络不可用，无法分享云端备份", 0)
    }))
  },
  removeAllBackup: function() {
    var t = this,
      i = this.targetDeviceId();
    i ? !this.data.inputId || this.data.inputId === this.data.UID || e.isAdmin() ? e.modal("确定删除云端所有备份？", !0, (function() {
      t.callBackupApi("removeAllbackup").then((function(c) {
        var n = a.removeAll(i);
        t.setData({
          items: t.normalizeItems(n),
          message: c && c.msg ? c.msg : "已删除本地兜底备份"
        }), e.msg(c && c.msg ? c.msg : "删除完成", c && c.success ? 1 : -1)
      })).catch((function() {
        var c = a.removeAll(i);
        t.setData({
          items: t.normalizeItems(c),
          useLocalFallback: !0,
          message: "网络不可用，已删除本地兜底备份"
        }), e.msg("本地备份已删除", 1)
      }))
    })) : e.msg("不能删除他人备份的数据", 0) : e.msg("设备 ID 为空", 0)
  },
  rx: function(a, t) {
    var e = this.data.backupIdx;
    if (e >= 0 && e <= 2) {
      if (!this.isExpectedPacket(e, a, "backup")) return;
      this.finishBackup(e, t)
    } else if (e >= 3 && e <= 5) {
      var i = e - 3;
      if (!this.isExpectedPacket(i, a, "recover")) return;
      this.finishRecover(i, t)
    }
  },
  isExpectedPacket: function(t, e, i) {
    var c = a.TYPES[t];
    return !!c && ("backup" === i ? e === c.readType : "set" === c.key ? 160 === e || 163 === e : e === c.writeType)
  },
  finishBackup: function(t, i) {
    var c = this,
      n = a.TYPES[t];
    if (n && i && i.length) {
      clearTimeout(this.actionTimer);
      var s = e.format.decToHex(i),
        u = "&dataid=".concat(n.dataId, "&data=").concat(s);
      this.callBackupApi("backup", u).then((function(a) {
        c.afterBackupSaved(t, i, a && a.msg, !(!a || !a.success))
      })).catch((function() {
        c.afterBackupSaved(t, i, "网络不可用，已保存到本地备份", !1)
      }))
    } else this.failAction("设备未返回可备份数据")
  },
  afterBackupSaved: function(t, i, c, n) {
    var s = this.targetDeviceId(),
      u = a.backup(s, t, i),
      o = this.consumeBulkNext("backup");
    this.setData({
      items: this.normalizeItems(u),
      backupIdx: null === o ? 255 : t,
      action: null === o ? "" : "backup",
      loading: null !== o,
      useLocalFallback: !n,
      message: null === o ? c || "备份完成" : "已备份".concat(a.TYPES[t].name, "，继续下一项")
    }), null === o ? (e.msg(this.bulkMode ? "全量备份完成" : c || "备份完成", n ? 1 : -1), this.clearBulk()) : this.startBackupIndex(o)
  },
  finishRecover: function(t, i) {
    var c = this.data.items[t];
    if (c && i) {
      clearTimeout(this.actionTimer);
      var n = e.format.decToHex(i) === (this.data.recoverCheckHex || c.backupData),
        s = n ? this.consumeBulkNext("recover") : null;
      this.setData({
        backupIdx: null === s ? 255 : t + 3,
        action: null === s ? "" : "recover",
        loading: null !== s,
        recoverCheckHex: "",
        message: n ? null === s ? "恢复成功" : "已恢复".concat(a.TYPES[t].name, "，继续下一项") : "恢复已写入，但回读数据和备份不一致"
      }), null === s ? (e.msg(n ? this.bulkMode ? "全量恢复成功" : "恢复成功" : "恢复回读不一致", n ? 1 : 0), this.clearBulk()) : this.startRecoverIndex(s)
    } else this.failAction("设备未返回恢复结果")
  },
  consumeBulkNext: function(a) {
    return this.bulkMode === a && Array.isArray(this.bulkQueue) && this.bulkQueue.length ? this.bulkQueue.shift() : null
  },
  clearBulk: function() {
    this.bulkMode = "", this.bulkQueue = []
  },
  buildRecoverPayload: function(t, i) {
    var c = a.parseBackupData(i);
    if (0 === t && e.globalData.deviceInfo.buf.length >= 18) {
      for (var n = 0; n < 18 && n < c.length; n += 1) c[n] = e.globalData.deviceInfo.buf[n];
      var s = this.data.items.slice();
      s[t] = Object.assign({}, s[t], {
        backupData: e.format.decToHex(c)
      }), this.setData({
        items: s
      })
    }
    return c
  },
  callBackupApi: function(a, t) {
    var i = this.targetDeviceId(a),
      c = i === this.data.UID || e.isAdmin();
    return e.api.getBackup(i, c, a, t || "")
  },
  targetDeviceId: function(a) {
    return "local" === a ? this.data.UID : this.data.inputId || this.data.UID
  },
  handleApiFallback: function(a) {
    this.setLocalItems(a)
  },
  setLocalItems: function(t) {
    var e = this.targetDeviceId("local") || "mock";
    this.setData({
      items: this.normalizeItems(a.load(e)),
      loading: !1,
      useLocalFallback: !0,
      message: t
    })
  },
  normalizeItems: function(t) {
    return a.TYPES.map((function(a, e) {
      var i = (t || []).find((function(t) {
        return Number(t.id) === a.dataId || t.key === a.key
      })) || {};
      return Object.assign({}, i, {
        id: a.dataId,
        key: a.key,
        name: i.name || a.name,
        backupData: i.backupData || "",
        hasData: !!i.backupData,
        typeName: a.name,
        index: e
      })
    }))
  },
  waitForPacket: function(a) {
    var t = this;
    clearTimeout(this.actionTimer), this.actionTimer = setTimeout((function() {
      t.data.loading && t.failAction(a)
    }), 8e3)
  },
  failAction: function(a) {
    clearTimeout(this.actionTimer), this.clearBulk(), this.setData({
      backupIdx: 255,
      action: "",
      loading: !1,
      recoverCheckHex: "",
      message: a
    }), e.msg(a, 0)
  },
  onHide: function() {
    var a = this;
    [160, 163, 171, 186].forEach((function(t) {
      return a.packetHandler && e.offPacket(t, a.packetHandler)
    })), clearTimeout(this.actionTimer), this.clearBulk()
  }
});