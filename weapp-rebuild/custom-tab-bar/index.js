Component({
  data: {
    selected: 0,
    themeMode: "midnight",
    accessLocked: !1,
    list: [{
      pagePath: "/pages/index/index",
      text: "首页",
      iconPath: "/assets/icons/generated/tab-status@72.png",
      activeIconPath: "/assets/icons/generated/tab-status-active@72.png"
    }, {
      pagePath: "/pages/ble/ble",
      text: "蓝牙",
      iconPath: "/assets/icons/generated/tab-ble@72.png",
      activeIconPath: "/assets/icons/generated/tab-ble-active@72.png"
    }, {
      pagePath: "/pages/set/set",
      text: "设置",
      iconPath: "/assets/icons/generated/tab-set@72.png",
      activeIconPath: "/assets/icons/generated/tab-set-active@72.png"
    }, {
      pagePath: "/pages/my/my",
      text: "我的",
      iconPath: "/assets/icons/generated/tab-my@72.png",
      activeIconPath: "/assets/icons/generated/tab-my-active@72.png"
    }]
  },
  methods: {
    switchTab: function(e) {
      var t = Number(e.currentTarget.dataset.index),
        a = e.currentTarget.dataset.path;
      t !== this.data.selected && a && wx.switchTab({
        url: a
      })
    }
  }
});