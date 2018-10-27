// inputedit/asset-type/asset-type.js
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    value: {
      type: Object,
      value: {_id: 0, uName: '点此处进行选择'}
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    inclose: true,
    aVl:[0,0,0]
  },

  lifetimes: {
    attached() {
      if (!value) {
        this.setData({value:{_id: 0, uName: '点此处进行选择'}})
      }
    }
  },
  methods: {
    selclose(){
      this.setData({inclose: !this.data.inclose});
    },
    productsel(e) {                         //数组选择类型
      let vdSet = {inclose: true};      //数组下标
      if (!this.data.inclose) {
        vdSet.c = { _id: e.currentTarget.dataset.ca, uName:e.currentTarget.dataset.sa };
        vdSet.value = { _id: e.currentTarget.dataset.ca, uName:e.currentTarget.dataset.sa };
      }
      this.setData(vdSet);
    },
    itemsel({ currentTarget:{id,dataset},detail:{value} }) {
      if (this.data.aVl[0] == value[0]) {
        if (this.data.aVl[1] != value[1]) { value[2] = 0; }
      } else { value[1] = 0; value[2] = 0; }
      this.setData({aVl: value});
    }
  }
})
