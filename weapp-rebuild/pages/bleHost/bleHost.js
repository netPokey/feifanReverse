var t = require("../../services/bleHostProtocol"),
  e = require("../../services/pageNav"),
  a = getApp();
Page({
  data: {
    connected: !1,
    loading: !1,
    statusText: "等待蓝牙业务连接",
    lastMessage: "连接模块后会自动搜索外部蓝牙按钮",
    findList: [],
    bondList: [],
    findCount: 0,
    bondCount: 0
  },
  onShow: function() {
    a.applyThemeToPage && a.applyThemeToPage(this), this.visible = !0, this.packetHandler = this.rx.bind(this), this.stateHandler = this.handleConnectionState.bind(this), a.onPacket(240, this.packetHandler), a.onPacket("state", this.stateHandler), this.handleConnectionState(a.globalData.connected)
  },
  back: function() {
    e.goBack("/pages/my/my")
  },
  handleConnectionState: function(t) {
    var e = !!t;
    if (this.setData({
        connected: e,
        statusText: e ? "模块主机已连接" : "等待蓝牙业务连接",
        lastMessage: e ? "正在同步搜索和已配对列表" : "请先到蓝牙页连接模块"
      }), e) return this.startPolling(), void this.startFind(!0);
    this.stopPolling(), this.setData({
      loading: !1
    })
  },
  toggle: function() {
    this.ensureConnected() && (this.data.loading ? this.stopFind() : this.startFind(!1))
  },
  startFind: function(e) {
    if (this.ensureConnected()) {
      var n = {
        loading: !0,
        statusText: "正在搜索外部蓝牙按钮",
        lastMessage: e ? "已按原包逻辑自动开启搜索" : "已发送搜索指令",
        findList: [],
        findCount: 0
      };
      this.setData(n), this.tx(t.buildFindCommand(a.globalData.deviceInfo))
    }
  },
  stopFind: function() {
    this.ensureConnected() && (this.tx(t.buildStopCommand(a.globalData.deviceInfo)), this.setData({
      loading: !1,
      statusText: "搜索已停止",
      lastMessage: "已发送停止搜索指令"
    }))
  },
  queryBondList: function() {
    this.visible && this.ensureConnected() && this.tx(t.buildBondQueryCommand(a.globalData.deviceInfo))
  },
  tx: function(t) {
    var e = this;
    return a.globalData.connected ? a.tx(240, t).catch((function(t) {
      e.setData({
        statusText: "指令发送失败",
        lastMessage: t.errMsg || t.message || "蓝牙写入失败"
      })
    })) : Promise.reject(new Error("蓝牙业务未连接"))
  },
  connect: function(e) {
    if (this.ensureConnected()) {
      var n = e.currentTarget.dataset.mac,
        s = this.findItemByMac(this.data.findList, n);
      s ? (this.setData({
        statusText: "正在连接外部蓝牙按钮",
        lastMessage: "".concat(s.name, " / ").concat(s.mac)
      }), this.tx(t.buildConnectCommand(a.globalData.deviceInfo, s))) : a.msg("未找到待连接设备", 0)
    }
  },
  removeBond: function(e) {
    var n = this;
    if (this.ensureConnected()) {
      var s = e.currentTarget.dataset.mac,
        i = this.findItemByMac(this.data.bondList, s);
      i ? a.modal("确定要删除 ".concat(i.name, " 吗?"), !0, (function() {
        var e = n.data.bondList.filter((function(t) {
          return t.mac !== i.mac
        }));
        n.setData({
          bondList: e,
          bondCount: e.length,
          statusText: "正在删除已配对设备",
          lastMessage: i.mac
        }), n.tx(t.buildDeleteCommand(a.globalData.deviceInfo, i)).then((function() {
          return n.queryBondList()
        }))
      })) : a.msg("未找到已配对设备", 0)
    }
  },
  rx: function(e, a) {
    var n = t.parsePacket(a);
    n && ("search" !== n.type ? "bond" !== n.type ? "status" === n.type && this.applyStatus(n) : this.applyBondList(n) : this.applySearchResult(n))
  },
  applySearchResult: function(t) {
    if (this.createMacMap(this.data.bondList)[t.item.mac]) this.setData({
      loading: t.loading
    });
    else {
      var e = this.createMacMap(this.data.findList),
        a = Object.assign({}, e[t.item.mac] || {}, t.item);
      e[a.mac] = a;
      var n = this.sortByRssi(Object.keys(e).map((function(t) {
        return e[t]
      })));
      this.setData({
        loading: t.loading,
        findList: n,
        findCount: n.length,
        statusText: t.loading ? "正在搜索外部蓝牙按钮" : "搜索已结束",
        lastMessage: "发现 ".concat(a.name)
      })
    }
  },
  applyBondList: function(t) {
    var e = this.createMacMap(t.list),
      a = this.data.findList.filter((function(t) {
        return !e[t.mac]
      }));
    this.setData({
      loading: t.loading,
      bondList: t.list,
      bondCount: t.list.length,
      findList: a,
      findCount: a.length,
      statusText: t.loading ? "正在搜索外部蓝牙按钮" : "已同步配对列表",
      lastMessage: t.list.length ? "已配对 ".concat(t.list.length, " 个设备") : "暂无已配对设备"
    })
  },
  applyStatus: function(t) {
    this.setData({
      loading: t.loading,
      statusText: t.text,
      lastMessage: "模块返回状态码 ".concat(t.code)
    }), a.msg(t.text, t.ok), 1 !== t.code && 4 !== t.code || this.queryBondList()
  },
  ensureConnected: function() {
    return !!a.globalData.connected || (a.msg("请先连接蓝牙模块", 0), this.setData({
      connected: !1,
      statusText: "等待蓝牙业务连接",
      lastMessage: "入口保持可见，但配对操作需要先连接模块"
    }), !1)
  },
  findItemByMac: function(t, e) {
    return (t || []).find((function(t) {
      return t.mac === e
    }))
  },
  createMacMap: function(t) {
    var e = {};
    return (t || []).forEach((function(t) {
      t && t.mac && (e[t.mac] = t)
    })), e
  },
  sortByRssi: function(t) {
    return (t || []).sort((function(t, e) {
      var a = "number" == typeof t.rssi ? t.rssi : -999;
      return ("number" == typeof e.rssi ? e.rssi : -999) - a
    }))
  },
  startPolling: function() {
    var t = this;
    this.pollTimer || (this.queryBondList(), this.pollTimer = setInterval((function() {
      return t.queryBondList()
    }), 1e3))
  },
  stopPolling: function() {
    this.pollTimer && clearInterval(this.pollTimer), this.pollTimer = null
  },
  offBleHost: function() {
    this.visible = !1, this.stopPolling(), a.globalData.connected && this.tx(t.buildStopCommand(a.globalData.deviceInfo)), this.setData({
      loading: !1,
      findList: [],
      findCount: 0
    })
  },
  onHide: function() {
    this.offBleHost(), this.packetHandler && a.offPacket(240, this.packetHandler), this.stateHandler && a.offPacket("state", this.stateHandler)
  },
  onUnload: function() {
    this.offBleHost(), this.packetHandler && a.offPacket(240, this.packetHandler), this.stateHandler && a.offPacket("state", this.stateHandler)
  }
});