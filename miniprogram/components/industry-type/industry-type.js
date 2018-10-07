// inputedit/industry-type/industry-type.js
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    c: {
      type: Object,
      value: {code: [], sName: []}
    },
    inclose: {
      type: Boolean,
      value: false,
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    aVl:[0,0,0]
  },

  lifetimes: {
    attached() {
      this.setData({inclose:this.data.c.code.length!=0})
    }
  },
  methods: {
    selclose(){                         //按下载ICON打开选择框
      this.setData({inclose: !this.data.inclose});
    },
    industrysel(e) {                         //选择行业类型
      let vdSet = {inclose: true};                      //按确定ICON确认选择
      if (!this.data.inclose) {
        let cvalue = this.data.c;
        cvalue.code.push(Number(e.currentTarget.dataset.ca));
        cvalue.sName.push(e.currentTarget.dataset.sa);
        vdSet.c = { code: cvalue.code, sName:cvalue.sName };
        vdSet.value = { code: cvalue.code, sName:cvalue.sName };
      }
      this.setData(vdSet);
    },
    itemsel({ currentTarget:{id,dataset},detail:{value} }) {
      if (this.data.aVl[0] == value[0]) {
        if (this.data.aVl[1] != value[1]) { value[2] = 0; }
      } else { value[1] = 0; value[2] = 0; }
      this.setData({aVl: value});
    },
    selectdel({ currentTarget:{id,dataset},detail:{value} }) {      //按显示类型名称进行删除
      let i = Number(dataset.id);
      this.data.c.code.splice(i, 1);
      this.data.c.sName.splice(i, 1);
      this.setData({
        c: this.data.c,
        value: this.data.c
      })
    }
  }
})
