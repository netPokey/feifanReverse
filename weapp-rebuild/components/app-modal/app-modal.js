Component({
  properties: {
    modal: {
      type: Object,
      value: {
        visible: !1,
        themeMode: "midnight",
        title: "提示",
        content: "",
        showCancel: !1,
        confirmText: "确定",
        cancelText: "取消",
        sessionId: 0
      }
    }
  },
  methods: {
    noop: function() {},
    cancel: function() {
      getApp().resolveAppModal("cancel", this.properties.modal.sessionId)
    },
    confirm: function() {
      getApp().resolveAppModal("confirm", this.properties.modal.sessionId)
    }
  }
});