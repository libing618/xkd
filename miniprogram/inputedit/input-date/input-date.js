// inputedit/input-date/input-date.js
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
    inputdate({ currentTarget:{id,dataset},detail:{value} }) {
      this.setData({                       //日期选择
        c: new Date(value),
        value: new Date(value)
      });
    }
  }
})
