Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '数组管理',
    },
    name: String,
    value: {
      type: Array,
      value: []
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
    iValue: '输入内容'
  },

  lifetimes: {
    attached() {
      this.setData({inclose:this.data.value.length!=0})
    }
  },
  methods: {
    selclose(){                         //按下载ICON打开选择框
      this.setData({inclose: !this.data.inclose});
    },
    inputarr({ currentTarget:{id,dataset},detail:{value} }) {
      this.setData({iValue: value});
    },
    seccessarr({ currentTarget:{id,dataset},detail:{value} }) {
      this.data.value.push(dataset.add);
      this.setData({
        value: this.data.value,
        iValue: '输入内容'
      });
    },
    arrdel({ currentTarget:{id,dataset},detail:{value} }) {                //按显示名称进行删除
      let i = Number(id);
      this.data.value.splice(i, 1);
      this.setData({
        value: this.data.value
      })
    },
  }
})
