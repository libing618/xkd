Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '商品分类',
    },
    name: String,
    value: {
      type: String,
      value: ''
    },
    inclose: {
      type: Boolean,
      value: false,
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
    inclose: true,
    osv:[0,0]
  },

  lifetimes: {
    attached() {
      if (!value) {
        this.setData({value:''})
      }
    }
  },
  methods: {
    selclose(){                         //按下载ICON打开选择框
      this.setData({inclose: !this.data.inclose});
    },
    goodssel({ currentTarget:{id,dataset},detail:{value} }) {            //选择商品类型
      let vdSet = {inclose: true};                      //按确定ICON确认选择
      if (!this.data.inclose) {
        vdSet.value = dataset.ca;
      }
      this.setData(vdSet);
    },
    itemsel({ currentTarget:{id,dataset},detail:{value} }) {
      if (this.data.osv[0] != value[0]) {
        value[1] = 0;
      }
      this.setData({osv: value});
    }
  }
})
