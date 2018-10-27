Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '时间',
    },
    value: {
      type: Date,
      value: 0
    },
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    inclose: false
  },

  lifetimes: {
    attached() {
      this.setData({inclose:this.data.value!=0})
    }
  },
  methods: {
    selclose(){
      this.setData({inclose: !this.data.inclose});
    },
    inputtime({ currentTarget:{id,dataset},detail:{value} }) {
      this.setData({                       //日期选择
        value: value
      });
    }
  }
})
