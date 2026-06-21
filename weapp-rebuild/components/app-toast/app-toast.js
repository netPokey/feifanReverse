Component({
  properties: {
    toast: {
      type: Object,
      value: {
        visible: !1,
        leaving: !1,
        type: "info",
        iconPath: "/assets/icons/generated/toast-info@48.png",
        title: ""
      }
    }
  },
  methods: {
    noop: function() {}
  }
});