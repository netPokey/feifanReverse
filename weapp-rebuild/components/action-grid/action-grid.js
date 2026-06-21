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
    handleTap: function(t) {
      t.currentTarget.dataset.disabled ? this.triggerEvent("disabled", {
        id: t.currentTarget.dataset.id
      }) : this.triggerEvent("select", {
        id: t.currentTarget.dataset.id
      })
    }
  }
});