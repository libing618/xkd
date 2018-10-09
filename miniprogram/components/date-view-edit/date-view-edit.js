Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '日期',
    },
    value: {
      type: Date,
      value: 0
    },
    editen: {
      type: Boolean,
      value: false,
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
        value: new Date(value)
      });
    }
  }
})
