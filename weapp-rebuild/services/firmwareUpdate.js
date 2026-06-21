var e = require("../@babel/runtime/helpers/typeof"),
  t = ["getinfo 原始 URL、请求体和响应体", "update 原始 URL、请求体和响应体", "Referer 完整值", "User-Agent 完整值", "Cookie 或 Set-Cookie", "微信/SAAA 自动头，如 x-wx-*、X-WX-*、X-Requested-With", "官方页面展示的当前版本、最新版本和设备名称", "抓包时使用的是微信正式小程序、独立 IPA，还是开发者工具"],
  r = {
    safety: "只用于核对官方成功请求，不包含 OTA 写入动作。",
    conclusion: "当前 getinfo/update 失败更像服务端识别运行环境或包版本门禁，不是 BLE 版本字段单独错误。",
    ipaChain: "原 IPA 先用 BLE 160/163 帧取 id/vin/bt_ver/fw_ver，再请求 getinfo 覆盖远端版本，最后 ready() 调 update 下载固件页。",
    serverGate: "updatehelp 可成功但 getinfo/update 失败，说明升级说明公开，设备元信息和固件下载存在更高权限或版本门禁。",
    knownIpaRuntime: {
      miniModuleId: "wxfdd0d6e4aa8ddf22",
      weappId: "wx64f19032ca1ea79e",
      appVersion: 1200000025,
      bundleShortVersion: "1.1.0"
    },
    needOfficialRequest: t
  };

function n() {
  return "undefined" != typeof wx && wx && "function" == typeof wx.setStorageSync
}

function a(e, t) {
  var r = Number(e);
  return Number.isFinite(r) ? r : t
}

function o(e, t) {
  var r = e || {};
  return a(t ? r.fw_ver : r.bt_ver, 0)
}

function i(e, t) {
  var r = e || {},
    n = String(r.id || ""),
    a = String(r.vin || "");
  return /MOCK/i.test(t || "") ? "当前连接来自 MOCK_TSL_DEVICE 模拟缓存" : /^(001122|010203|021032)/i.test(n) ? "设备 ID 命中开发/模拟前缀，服务端通常不会下发固件" : /^LRW3E7FS0NC0+1$/i.test(a) ? "VIN 命中开发占位车辆，服务端通常不会识别为真实授权设备" : ""
}

function c(e, t) {
  var r = Array.prototype.slice.call(e || []),
    n = a(t, 80);
  return r.slice(0, n).map((function(e) {
    return "00".concat(Number(e || 0).toString(16)).slice(-2).toUpperCase()
  })).join("")
}

function s(e) {
  var t = e || {},
    r = Array.prototype.slice.call(t.buf || []),
    n = r.length > 1 ? r[1] : 0,
    a = r.length > 2 ? r[2] : 0;
  return {
    frame_len: r.length,
    frame_hex_80: c(r, 80),
    frame_boot_byte: n,
    frame_fw_byte: a,
    frame_bt_ver: n << 8,
    frame_fw_ver: a << 8
  }
}

function u(e, t) {
  var r = e || {},
    n = t || {},
    a = encodeURIComponent(r.id || ""),
    o = encodeURIComponent(r.vin || ""),
    i = n.isAdmin ? 1 : 0,
    c = n.moveid ? 1 : 0;
  return "fun=getinfo&id=".concat(a, "&vin=").concat(o, "&isAdmin=").concat(i, "&moveid=").concat(c)
}

function f(e) {
  var t = e || {},
    r = encodeURIComponent(t.id || ""),
    n = encodeURIComponent(t.vin || "");
  return "fun=updatehelp&id=".concat(r, "&vin=").concat(n)
}

function g(e, t) {
  var r = e || {},
    n = t || {},
    i = Number(n.isApp ? 1 : 0),
    c = encodeURIComponent(r.id || ""),
    s = encodeURIComponent(r.vin || ""),
    u = a(n.pageStart, 0),
    f = a(n.pageLen, 0),
    g = n.isAdmin ? 1 : 0,
    l = n.moveid ? 1 : 0,
    d = a(void 0 === n.version ? o(r, i) : n.version, 0);
  return "fun=update&id=".concat(c, "&vin=").concat(s, "&isAdmin=").concat(g, "&moveid=").concat(l, "&isapp=").concat(i, "&ver=").concat(d, "&pagestart=").concat(u, "&pagelen=").concat(f, "&updatenew=3")
}

function l(e) {
  var t = e ? "当前请求地址：".concat(e) : "当前请求地址未能读取，请检查“我的-服务器域名”配置。";
  return "请求域名未加入微信小程序 request 合法域名。\n".concat(t, "\n请在微信公众平台“开发管理-开发设置-服务器域名”添加对应 HTTPS 域名；如果只是在开发者工具调试，可临时勾选“不校验合法域名、web-view、TLS 版本以及 HTTPS 证书”。如曾在“我的-服务器域名”修改地址，请恢复默认 www.iffrc.com 或确认新域名已加入合法域名。")
}

function d(t, r) {
  var n = void 0 === r ? "未知错误" : r;
  if (null == t || "" === t) return n;
  if ("string" == typeof t) return /url\s+not\s+in\s+domain\s+list/i.test(t) ? l("") : t;
  if ("number" == typeof t || "boolean" == typeof t) return String(t);
  if (t instanceof Error) return d(t.message || t.cause, n);
  if ("object" === e(t)) {
    for (var a = [t.message, t.msg, t.errMsg, t.error, t.reason, t.data && t.data.message, t.data && t.data.msg, t.data && t.data.errMsg], o = 0; o < a.length; o += 1) {
      var i = a[o];
      if (i !== t) {
        var c = d(i, "");
        if (c) return c
      }
    }
    return function(e) {
      try {
        return JSON.stringify(e)
      } catch (t) {
        return String(e)
      }
    }(t)
  }
  return String(t)
}

function p(e, t) {
  return new Error(d(e, t))
}

function h(e, t) {
  var r = String(e || "").replace(/\s+/g, "");
  if (!r || r.length % 2 != 0 || /[^0-9a-f]/i.test(r)) throw new Error("第 ".concat(t + 1, " 页固件 HEX 数据不合法"));
  return r.toUpperCase()
}

function v(e, t) {
  for (var r = h(e, t), n = new Uint8Array(r.length / 2), a = 0; a < r.length; a += 2) n[a / 2] = parseInt(r.substr(a, 2), 16);
  return n
}

function m(e, t, r) {
  var n = String(e && e.id || "unknown").replace(/[^0-9a-f]/gi, "").toUpperCase();
  return "".concat("firmwareUpdate:").concat(n, ":").concat(t ? "fw" : "bt", ":").concat(r || 0)
}

function w(e) {
  var t = 2166136261;
  return e.forEach((function(e) {
    for (var r = 0; r < e.length; r += 1) t ^= e.charCodeAt(r), t = Math.imul(t, 16777619) >>> 0
  })), "fnv1a-".concat(t.toString(16).padStart(8, "0"))
}

function _(e, t, r) {
  var n = e || {},
    i = r || {},
    c = (n.hexPages || n.hex || []).map((function(e, t) {
      return h(e, t)
    })),
    s = n.checkCodes || n.CheckCode || [],
    u = a(n.PageCount || n.pageCount, c.length),
    f = a(n.BytesCount || n.bytesCount, 0),
    g = a(n.PageSize || n.pageSize || n.PackSize, 0);
  if (!c.length) throw new Error("服务端未返回固件页数据");
  if (c.length !== u) throw new Error("固件页数不一致：已下载 ".concat(c.length, " / 服务端 ").concat(u));
  if (s.length < c.length) throw new Error("固件校验码数量不足：".concat(s.length, " / ").concat(c.length));
  var l = 0,
    d = [];
  if (c.forEach((function(e, t) {
      var r = v(e, t);
      if (r.length < 2) throw new Error("第 ".concat(t + 1, " 页固件长度不足"));
      var n = r[0] << 8 | r[1];
      if (n !== t) throw new Error("第 ".concat(t + 1, " 页序号错误：").concat(n));
      var o = function(e) {
        for (var t = 0, r = 0; r < e.length; r += 1) t = t + e[r] & 65535;
        return t
      }(r);
      if (o !== a(s[t], -1)) throw new Error("第 ".concat(t + 1, " 页 CheckCode 错误：服务端 ").concat(s[t], " / 本地 ").concat(o));
      if (g > 0 && r.length !== g) throw new Error("第 ".concat(t + 1, " 页大小错误：服务端 ").concat(g, " / 本地 ").concat(r.length));
      l += r.length, d.push(r.length)
    })), !f || l !== f) throw new Error("固件总长度错误：服务端 ".concat(f, " / 本地 ").concat(l));
  var p = Number(i.isApp ? 1 : 0),
    _ = a(void 0 === i.version ? o(t, p) : i.version, 0);
  return {
    ok: !0,
    isApp: p,
    version: _,
    pageCount: u,
    bytesCount: l,
    pageSize: g || d[0],
    checkCodeCount: s.length,
    hash: w(c),
    firstPagePreview: c[0].slice(0, 32),
    hexPages: c,
    checkCodes: s.slice(0, c.length),
    storageKey: m(t, p, _)
  }
}

function y(e, t) {
  var r = Date.now(),
    a = {
      ok: !0,
      isApp: e.isApp,
      version: e.version,
      pageCount: e.pageCount,
      bytesCount: e.bytesCount,
      pageSize: e.pageSize,
      checkCodeCount: e.checkCodeCount,
      hash: e.hash,
      firstPagePreview: e.firstPagePreview,
      storageKey: e.storageKey,
      cachedAt: r,
      cachedFullPackage: !1,
      cacheFilePath: ""
    },
    o = function(e, t) {
      if ("undefined" == typeof wx || !wx || !wx.env || !wx.env.USER_DATA_PATH || "function" != typeof wx.getFileSystemManager) return null;
      if (t.hexPages.reduce((function(e, t) {
          return e + t.length
        }), 0) > 4194304) return null;
      var r = wx.getFileSystemManager(),
        n = "".concat(wx.env.USER_DATA_PATH, "/firmware");
      try {
        r.mkdirSync(n, !0)
      } catch (e) {
        try {
          r.mkdirSync(n)
        } catch (e) {}
      }
      var a = "".concat(n, "/").concat(e.storageKey.replace(/[^0-9A-Za-z_-]/g, "_"), ".json");
      return r.writeFileSync(a, JSON.stringify({
        summary: e,
        hexPages: t.hexPages,
        checkCodes: t.checkCodes
      }), "utf8"), a
    }(a, e);
  return o && (a.cachedFullPackage = !0, a.cacheFilePath = o), n() && (wx.setStorageSync(a.storageKey, Object.assign({}, a, {
    deviceId: t && t.id || ""
  })), wx.setStorageSync("firmwareUpdate:last", a.storageKey)), a
}

function C(e, t, r) {
  if (!n()) return null;
  var a = m(e, t, r);
  return wx.getStorageSync(a) || null
}
module.exports = {
  LAST_STORAGE_KEY: "firmwareUpdate:last",
  MAX_CACHE_HEX_CHARS: 4194304,
  OFFICIAL_REQUEST_CHECKLIST: t,
  OFFICIAL_RUNTIME_HINTS: r,
  buildDeviceMetaQuery: u,
  buildDiagnosticPayload: function(e, n) {
    var o = e || {},
      c = n || {},
      l = a(c.pageLen, 0),
      d = c.isAdmin ? 1 : 0,
      p = c.moveid ? 1 : 0,
      h = c.endpoint || "https://www.iffrc.com/ffkj/user/ble.php",
      v = g(o, {
        isApp: 1,
        isAdmin: d,
        moveid: p,
        pageLen: l
      }),
      m = g(o, {
        isApp: 0,
        isAdmin: d,
        moveid: p,
        pageLen: l
      }),
      w = u(o, {
        isAdmin: d,
        moveid: p
      }),
      _ = i(o, c.storageDeviceId),
      y = s(o);
    return {
      safety: "只读诊断，不调用 updateok，不发送 BLE 85/83/87/69。",
      suspiciousDevice: !!_,
      suspiciousReason: _,
      endpoint: h,
      id: o.id || "",
      vin: o.vin || "",
      hw_ver: a(o.hw_ver, 0),
      bt_ver: a(o.bt_ver, 0),
      fw_ver: a(o.fw_ver, 0),
      bt_ver_text: o.bt_ver ? c.versionText(o.bt_ver) : "",
      fw_ver_text: o.fw_ver ? c.versionText(o.fw_ver) : "",
      bt_ver_new: a(o.bt_ver_new, 0),
      fw_ver_new: a(o.fw_ver_new, 0),
      frame_len: y.frame_len,
      frame_hex_80: y.frame_hex_80,
      frame_boot_byte: y.frame_boot_byte,
      frame_fw_byte: y.frame_fw_byte,
      frame_bt_ver: y.frame_bt_ver,
      frame_fw_ver: y.frame_fw_ver,
      frame_bt_ver_text: y.frame_bt_ver ? c.versionText(y.frame_bt_ver) : "",
      frame_fw_ver_text: y.frame_fw_ver ? c.versionText(y.frame_fw_ver) : "",
      isAdmin: d,
      moveid: p,
      pageLen: l,
      getinfo: w,
      updatehelp: f(o),
      update_fw: v,
      update_bt: m,
      official_request_checklist: t,
      official_runtime_hints: r,
      curl_getinfo: "curl '".concat(h, "' -H 'content-type: application/x-www-form-urlencoded' --data-raw '").concat(w, "' --compressed"),
      curl_update_fw: "curl '".concat(h, "' -H 'content-type: application/x-www-form-urlencoded' --data-raw '").concat(v, "' --compressed"),
      curl_update_bt: "curl '".concat(h, "' -H 'content-type: application/x-www-form-urlencoded' --data-raw '").concat(m, "' --compressed")
    }
  },
  buildFrameDiagnostic: s,
  buildStorageKey: m,
  buildUpdateHelpQuery: f,
  buildUpdateQuery: g,
  cacheFirmwarePackage: y,
  createDomainListErrorMessage: l,
  downloadAndVerify: function(e, t, r) {
    try {
      ! function(e) {
        var t = e || {};
        if (!t.id || 24 !== String(t.id).length) throw new Error("设备ID为空或不完整，请先连接蓝牙并加载设备信息")
      }(t)
    } catch (e) {
      return Promise.reject(e)
    }
    if (!e || "function" != typeof e.getUpdatePackage) return Promise.reject(new Error("缺少固件下载 API 封装"));
    var n = r || {},
      o = a(n.pageLen, 0),
      i = {
        hexPages: [],
        checkCodes: [],
        PageCount: 0,
        BytesCount: 0,
        PageSize: 0
      };
    return function r(c) {
      return e.getUpdatePackage(t, Object.assign({}, n, {
        pageStart: c,
        pageLen: o
      })).then((function(e) {
        var o = i.hexPages.length;
        if (function(e, t) {
            var r = t || {},
              n = r.hex || [],
              o = r.CheckCode || [];
            if (!r.success) throw p(r.msg || r, "固件下载接口返回失败");
            if (!Array.isArray(n) || !n.length) throw p(r, "固件下载接口未返回 hex 分页");
            n.forEach((function(t) {
              return e.hexPages.push(t)
            })), o.forEach((function(t) {
              return e.checkCodes.push(t)
            })), e.PageCount = a(r.PageCount, e.PageCount || e.hexPages.length), e.BytesCount = a(r.BytesCount, e.BytesCount || 0), e.PageSize = a(r.PageSize || r.PackSize, e.PageSize || 0)
          }(i, e), "function" == typeof n.onProgress && n.onProgress({
            downloaded: i.hexPages.length,
            total: i.PageCount || i.hexPages.length
          }), i.hexPages.length >= i.PageCount) return y(_(i, t, n), t);
        if (i.hexPages.length === o) throw new Error("固件下载进度未推进，已终止");
        return r(i.hexPages.length)
      }))
    }(0)
  },
  formatErrorMessage: d,
  getCachedFirmwarePackage: C,
  getSuspiciousDeviceReason: i,
  hexToBytes: v,
  isDomainListError: function(t) {
    var r = function t(r, n) {
      return null == r || n > 3 ? "" : "string" == typeof r || "number" == typeof r || "boolean" == typeof r ? String(r) : r instanceof Error ? "".concat(r.message || "", " ").concat(t(r.cause, n + 1), " ").concat(t(r.originalError, n + 1)) : "object" === e(r) ? [r.message, r.msg, r.errMsg, r.error, r.reason, r.originalError, r.data].map((function(e) {
        return t(e, n + 1)
      })).join(" ") : String(r)
    }(t, 0);
    return /url\s+not\s+in\s+domain\s+list/i.test(r)
  },
  readCachedFirmwarePackage: function(e, t, r) {
    var n = C(e, t, r);
    if (!n) return {
      summary: null,
      fullPackage: null,
      reason: "未找到本地固件缓存，请先执行下载评估"
    };
    if (!n.cachedFullPackage || !n.cacheFilePath) return {
      summary: n,
      fullPackage: null,
      reason: "本地只保存了校验摘要，缺少完整固件页，需重新下载评估"
    };
    if ("undefined" == typeof wx || !wx || "function" != typeof wx.getFileSystemManager) return {
      summary: n,
      fullPackage: null,
      reason: "当前环境无法读取小程序本地文件系统"
    };
    try {
      var a = wx.getFileSystemManager().readFileSync(n.cacheFilePath, "utf8"),
        o = JSON.parse(a);
      return {
        summary: n,
        fullPackage: {
          isApp: n.isApp,
          version: n.version,
          pageCount: n.pageCount,
          bytesCount: n.bytesCount,
          pageSize: n.pageSize,
          hexPages: o.hexPages || [],
          checkCodes: o.checkCodes || []
        },
        reason: ""
      }
    } catch (e) {
      return {
        summary: n,
        fullPackage: null,
        reason: "完整固件缓存读取失败：".concat(e.message || e)
      }
    }
  },
  resolveUpdateHelp: function(e, t) {
    var r = e || {};
    if (!r.success) return d(r.msg || r, "服务端未返回升级说明");
    for (var n = "bt" === t ? "bt" : "fw", a = [n, "".concat(n, "_help"), "bt" === n ? "boot" : "app", "bt" === n ? "bt_msg" : "fw_msg", "msg", "help"], o = 0; o < a.length; o += 1) {
      var i = r[a[o]];
      if ("string" == typeof i && i.trim()) return i
    }
    return JSON.stringify(r)
  },
  verifyFirmwarePackage: _
};