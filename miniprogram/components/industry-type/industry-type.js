// inputedit/industry-type/industry-type.js
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    name: {
      type: String,
      value: 'thumbnail',
    },
    value: {
      type: Object,
      value: {_id: [], uName: []}
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    inclose: false,
    aVl:[0,0,0]
  },

  lifetimes: {
    attached() {
      if (!this.data.value) {
        this.setData({value:{_id: [], uName: []}})
      }
    }
  },
  methods: {
    selclose(){                         //按下载ICON打开选择框
      this.setData({inclose: !this.data.inclose});
    },
    industrysel(e) {                         //选择行业类型
      let vdSet = {inclose: true};                      //按确定ICON确认选择
      if (!this.data.inclose) {
        let cvalue = this.data.value;
        cvalue._id.push(Number(e.currentTarget.dataset.ca));
        cvalue.uName.push(e.currentTarget.dataset.sa);
        vdSet.value = { _id: cvalue._id, uName:cvalue.uName };
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
      this.data.value._id.splice(i, 1);
      this.data.value.uName.splice(i, 1);
      this.setData({
        value: this.data.value
      })
    }
  }
})
