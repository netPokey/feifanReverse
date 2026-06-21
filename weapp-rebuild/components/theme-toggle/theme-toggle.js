var e = getApp();
Component({
  properties: {
    theme: {
      type: String,
      value: "midnight"
    },
    customStyle: {
      type: String,
      value: ""
    }
  },
  data: {
    themeMode: "midnight",
    themeLabel: "深夜模式",
    nextLabel: "白天模式",
    iconPath: "/assets/icons/generated/header-theme-midnight@48.png"
  },
  lifetimes: {
    attached: function() {
      this.syncTheme(!0)
    }
  },
  pageLifetimes: {
    show: function() {
      this.syncTheme(!0)
    }
  },
  observers: {
    theme: function() {
      this.syncTheme(!1)
    }
  },
  methods: {
    syncTheme: function(t) {
      var a = t ? e.applyThemeToCurrentPage() : e.getThemeMeta(this.properties.theme || e.getThemeMode());
      this.setData({
        themeMode: a.mode,
        themeLabel: a.label,
        nextLabel: a.nextLabel,
        iconPath: a.iconPath
      })
    },
    toggleTheme: function() {
      var t = e.toggleThemeMode();
      this.setData({
        themeMode: t.mode,
        themeLabel: t.label,
        nextLabel: t.nextLabel,
        iconPath: t.iconPath
      }), e.msg("已切换".concat(t.label), 1, 1200)
    }
  }
});