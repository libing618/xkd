// inputedit/input-time/input-time.js
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '日期',
    },
    c: {
      type: Date,
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
      this.setData({inclose:this.data.c!=0})
    }
  },
  methods: {
    selclose(){
      this.setData({inclose: !this.data.inclose});
    },
    inputtime({ currentTarget:{id,dataset},detail:{value} }) {
      this.setData({                       //日期选择
        c: value,
        value: value
      });
    }
  }
})
