function r(r) {
  var e = Number(r);
  if (!Number.isInteger(e) || e < 1 || e > 255) throw new Error("缺少可执行指令");
  return new Uint8Array([e])
}
module.exports = {
  buildExecutePayload: r,
  execute: function(e, t, n, o) {
    var u;
    try {
      ! function(r) {
        var e = r && r.kind;
        if (["fun", "bleButtonId"].indexOf(e) < 0) throw new Error("缺少执行来源，已阻止发送");
        if (r && r.source && ["automation", "superShortcut", "homeQuick"].indexOf(r.source) < 0) throw new Error("执行来源不受支持，已阻止发送")
      }(o), u = r(t)
    } catch (r) {
      return Promise.reject(r)
    }
    var c = n || "指令 ".concat(u[0]);
    return e.tx(187, u, {
      executeKind: o.kind,
      source: o.source || ""
    }).then((function() {
      return {
        value: u[0],
        message: "".concat(c, " 已写入蓝牙，等待模块回应")
      }
    })).catch((function(r) {
      throw new Error(r && (r.message || r.errMsg) || "".concat(c, " 发送失败"))
    }))
  }
};