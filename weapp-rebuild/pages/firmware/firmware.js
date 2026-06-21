var e = require("../../@babel/runtime/helpers/slicedToArray"),
  a = require("../../services/pageNav"),
  t = require("../../services/firmwareUpdate"),
  n = getApp();
Page({
  data: {
    connected: !1,
    device: {},
    deviceRows: [],
    diagnosticText: "",
    diagnosticRows: [],
    diagnosticWarning: "",
    officialCaptureRows: t.OFFICIAL_REQUEST_CHECKLIST.map((function(e) {
      return {
        value: e
      }
    })),
    metaProbeText: "",
    metaProbeLoading: !1,
    firmwareCards: [],
    firmwareDownloadingType: ""
  },
  onLoad: function() {
    this.stateHandler = this.refresh.bind(this), n.onPacket("state", this.stateHandler)
  },
  onShow: function() {
    n.applyThemeToPage && n.applyThemeToPage(this), this.refresh(), n.globalData.connected && n.queryDeviceInfo().catch((function() {}))
  },
  refresh: function() {
    var e = n.globalData.deviceInfo || {};
    this.setData({
      connected: n.globalData.connected,
      device: e,
      deviceRows: this.buildDeviceRows(e),
      diagnosticText: this.buildDiagnosticText(e),
      diagnosticRows: this.buildDiagnosticRows(e),
      diagnosticWarning: this.buildDiagnosticWarning(e),
      firmwareCards: this.buildFirmwareCards(e)
    })
  },
  buildDeviceRows: function(e) {
    var a = e || {};
    return [{
      label: "设备名称",
      value: a.name || "- - -"
    }, {
      label: "设备ID",
      value: a.id || "- - -"
    }, {
      label: "车辆VIN",
      value: a.vin || "- - -"
    }, {
      label: "激活时间",
      value: a.auth_time && "0000-00-00 00:00:00" !== a.auth_time ? a.auth_time : "- - -"
    }]
  },
  buildDiagnosticOptions: function() {
    return {
      endpoint: n.api.getBaseUrl(),
      isAdmin: n.isAdmin(),
      moveid: wx.getStorageSync("moveid") ? 1 : 0,
      pageLen: wx.getStorageSync("pagelen") ? 20 : 0,
      versionText: n.format.versionText
    }
  },
  buildDiagnosticPayload: function(e) {
    return t.buildDiagnosticPayload(e || {}, this.buildDiagnosticOptions())
  },
  buildDiagnosticWarning: function(e) {
    var a = t.getSuspiciousDeviceReason(e);
    return a ? "".concat(a, "。请连接真实蓝牙模块后重新采集诊断信息。") : ""
  },
  buildDiagnosticText: function(e) {
    var a = this.buildDiagnosticPayload(e);
    return JSON.stringify(a, null, 2)
  },
  buildDiagnosticRows: function(e) {
    var a = this.buildDiagnosticPayload(e);
    return [{
      label: "服务端",
      value: a.endpoint
    }, {
      label: "isAdmin / moveid",
      value: "".concat(a.isAdmin, " / ").concat(a.moveid)
    }, {
      label: "pageLen",
      value: a.pageLen
    }, {
      label: "设备风险",
      value: a.suspiciousDevice ? a.suspiciousReason : "未命中模拟特征"
    }, {
      label: "硬件版本",
      value: a.hw_ver || "- - -"
    }, {
      label: "Boot ver",
      value: "".concat(a.bt_ver || 0, " ").concat(a.bt_ver_text || "")
    }, {
      label: "运行 ver",
      value: "".concat(a.fw_ver || 0, " ").concat(a.fw_ver_text || "")
    }, {
      label: "设备帧长度",
      value: a.frame_len || 0
    }, {
      label: "帧版本字节",
      value: "Boot=".concat(a.frame_boot_byte || 0, " / 运行=").concat(a.frame_fw_byte || 0)
    }, {
      label: "帧解析版本",
      value: "Boot ".concat(a.frame_bt_ver || 0, " ").concat(a.frame_bt_ver_text || "", " / 运行 ").concat(a.frame_fw_ver || 0, " ").concat(a.frame_fw_ver_text || "")
    }, {
      label: "设备帧前 80 字节",
      value: a.frame_hex_80 || "- - -"
    }, {
      label: "getinfo",
      value: a.getinfo
    }, {
      label: "update 运行",
      value: a.update_fw
    }, {
      label: "update Boot",
      value: a.update_bt
    }]
  },
  buildFirmwareCards: function(e) {
    var a = e || {},
      t = !(!a.id || 24 !== String(a.id).length);
    return [{
      type: "bt",
      title: "Boot 引导固件",
      current: a.bt_ver ? n.format.versionText(a.bt_ver) : "- - -",
      latest: a.bt_ver_new ? n.format.versionText(a.bt_ver_new) : "- - -",
      available: !!a.bt_is_new,
      canDownload: t
    }, {
      type: "fw",
      title: "运行固件",
      current: a.fw_ver ? n.format.versionText(a.fw_ver) : "- - -",
      latest: a.fw_ver_new ? n.format.versionText(a.fw_ver_new) : "- - -",
      available: !!a.fw_is_new,
      canDownload: t
    }]
  },
  openOta: function(e) {
    var a = this,
      i = "bt" === e.currentTarget.dataset.type,
      o = i ? "Boot 引导固件" : "运行固件",
      r = n.globalData.deviceInfo || {};
    if (r.id && 24 === String(r.id).length) {
      var c = t.getSuspiciousDeviceReason(r);
      c ? n.modal("".concat(c, "\n\n请连接真实蓝牙模块后重新采集诊断信息。"), !1) : n.modal("确认下载并校验".concat(o, "？\n\n本操作只请求服务端固件包并做本地校验，不向设备写入任何固件数据。"), !0, (function() {
        a.downloadFirmwarePackage(i ? 0 : 1, o, r)
      }))
    } else n.msg("请先连接蓝牙并读取设备ID", 0)
  },
  showUpdateHelp: function(e) {
    var a = "bt" === e.currentTarget.dataset.type ? "bt" : "fw",
      i = n.globalData.deviceInfo || {};
    n.api.getUpdateHelp(i).then((function(e) {
      n.modal(t.resolveUpdateHelp(e, a), !1)
    })).catch((function() {
      n.modal("暂未获取到升级说明，请稍后重试。", !1)
    }))
  },
  probeMetaOnly: function() {
    var a = this,
      i = n.globalData.deviceInfo || {};
    if (i.id && 24 === String(i.id).length) {
      var o = t.getSuspiciousDeviceReason(i);
      if (o) return this.setData({
        metaProbeText: JSON.stringify({
          safety: "meta-only 未请求服务端，未下载固件页，未写入设备。",
          blocked: !0,
          reason: o,
          diagnostic: this.buildDiagnosticPayload(i)
        }, null, 2)
      }), void n.modal("".concat(o, "\n\n请连接真实蓝牙模块后重新采集诊断信息。"), !1);
      this.data.metaProbeLoading ? n.msg("元信息探测正在进行", -1, 1600) : (this.setData({
        metaProbeLoading: !0,
        metaProbeText: "正在请求 getinfo / updatehelp..."
      }), Promise.all([n.api.getDeviceInfoMeta(i, n.isAdmin(), wx.getStorageSync("moveid")), n.api.getUpdateHelp(i).catch((function(e) {
        return {
          success: !1,
          msg: t.formatErrorMessage(e, "updatehelp 请求失败")
        }
      }))]).then((function(t) {
        var o = e(t, 2),
          r = {
            safety: "meta-only，只请求 getinfo/updatehelp，未下载固件页，未写入设备。",
            getinfo: o[0],
            updatehelp: o[1],
            diagnostic: a.buildDiagnosticPayload(i)
          };
        a.setData({
          metaProbeText: JSON.stringify(r, null, 2)
        }), n.modal("服务端元信息探测完成，可复制诊断信息发送。", !1)
      })).catch((function(e) {
        a.setData({
          metaProbeText: t.formatErrorMessage(e, "服务端元信息探测失败")
        })
      })).finally((function() {
        a.setData({
          metaProbeLoading: !1
        })
      })))
    } else n.msg("请先连接蓝牙并读取设备ID", 0)
  },
  copyDiagnostic: function() {
    wx.setClipboardData({
      data: this.data.diagnosticText,
      success: function() {
        return n.msg("诊断参数已复制", 1, 1600)
      }
    })
  },
  copyMetaProbe: function() {
    var e = this.data.metaProbeText || "暂无元信息探测结果，请先点击“只测元信息”。";
    wx.setClipboardData({
      data: e,
      success: function() {
        return n.msg("探测结果已复制", 1, 1600)
      }
    })
  },
  downloadFirmwarePackage: function(e, a, i) {
    var o = this;
    if (this.data.firmwareDownloadingType) n.msg("固件下载校验正在进行", -1, 1800);
    else {
      var r = wx.getStorageSync("pagelen") ? 20 : 0;
      this.setData({
        firmwareDownloadingType: e ? "fw" : "bt"
      }), wx.showLoading({
        title: "固件下载中...",
        mask: !0
      }), t.downloadAndVerify(n.api, i, {
        isApp: e,
        isAdmin: n.isAdmin(),
        moveid: wx.getStorageSync("moveid") ? 1 : 0,
        pageLen: r,
        onProgress: function(e) {
          var a = e.total || e.downloaded || 1,
            t = Math.max(0, Math.min(99, Math.floor(e.downloaded / a * 100)));
          wx.showLoading({
            title: "下载中...".concat(t, "%"),
            mask: !0
          })
        }
      }).then((function(e) {
        wx.hideLoading(), o.setData({
          firmwareDownloadingType: ""
        }), n.modal(o.formatFirmwareSummary(a, e), !1)
      })).catch((function(e) {
        wx.hideLoading(), o.setData({
          firmwareDownloadingType: ""
        });
        var i = t.formatErrorMessage(e, "固件下载校验失败"),
          r = t.isDomainListError(e) ? "下载请求失败" : "下载校验失败";
        n.modal("".concat(a).concat(r, "：").concat(i, "\n\n未向设备写入任何固件数据。"), !1)
      }))
    }
  },
  formatFirmwareSummary: function(e, a) {
    var t = (a.bytesCount / 1024).toFixed(1),
      i = a.cachedFullPackage ? "已保存完整包与摘要" : "已保存校验摘要";
    return "".concat(e, "下载校验完成\n版本：").concat(n.format.versionText(a.version), "\n页数：").concat(a.pageCount, "\n大小：").concat(t, "KB\n页大小：").concat(a.pageSize, "B\n校验码：").concat(a.checkCodeCount, " 条\n摘要：").concat(a.hash, "\n缓存：").concat(i, "\n\n本次只完成下载与校验，未向设备写入任何固件数据。")
  },
  goBack: function() {
    a.goBack("/pages/my/my")
  },
  onUnload: function() {
    this.stateHandler && n.offPacket("state", this.stateHandler)
  }
});