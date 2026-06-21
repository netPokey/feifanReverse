Component({
  properties: {
    items: {
      type: Array,
      value: []
    },
    theme: {
      type: String,
      value: "midnight"
    }
  },
  methods: {
    findItem: function(e) {
      return (this.data.items || []).find((function(t) {
        return t.id === e
      }))
    },
    handleSwitch: function(e) {
      var t = this.findItem(e.currentTarget.dataset.id);
      t && !t.disabled && this.triggerEvent("change", {
        id: t.id,
        value: e.detail.value ? t.switchOnValue : t.switchOffValue
      })
    },
    handleToggle: function(e) {
      var t = this.findItem(e.currentTarget.dataset.id);
      t && !t.disabled && this.triggerEvent("change", {
        id: t.id,
        value: t.checked ? t.switchOffValue : t.switchOnValue
      })
    },
    handleSelect: function(e) {
      var t = this.findItem(e.currentTarget.dataset.id);
      if (t && !t.disabled) {
        var i = t.options[Number(e.detail.value)];
        i && this.triggerEvent("change", {
          id: t.id,
          value: i.val
        })
      }
    }
  }
});