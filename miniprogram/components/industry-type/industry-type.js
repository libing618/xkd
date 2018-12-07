const gscode = require('../utils/apdv.js');
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
      value: {_id: '', uName: []}
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
    vale_id:[],
    inclose: true,
    aVl:[0,0,0]
  },

  lifetimes: {
    attached() {
      let iSetData = {gskv: {}, drone: {}};
      iSetData.gsroot = ["101","102","103","104","105","106","107","108","109","110","201","202","203","204","301","302","303","304","305","306","307","401","402","403","404","405","406","501","502","503","601","602","603","604","605","606","607","608","609","610","611","612"];
      if (this.data.editable){
        function nextKeys(nKey){
          let knArr = [],kEatch;
          for (let n=0;n<100;n++){
            kEatch = ''+(nKey*100+n)
            if (kEatch in gscode){
              knArr.push(kEatch);
              iSetData.gskv[kEatch] = gscode[kEatch]
            }
          }
          if (knArr.length>0) {iSetData.drone['' + nKey] = knArr}
          return knArr.length
        }
        iSetData.gsroot.forEach(k2 => {
          if (nextKeys(k2)) {
            iSetData.drone['' + k2].forEach(k3 => {
              if (nextKeys(k3)) {
                iSetData.drone['' + k3].forEach(k4 => { nextKeys(k4); })
              };
            })
          }
        })
        if (this.data.value) {
          iSetData.value_id = this.data.value._id.split(',');
        }
      } else {
        iSetData.value_id = this.data.value._id.split(',')
        iSetData.value_id.forEach(ikv=>{ iSetData.gskv[ikv] = gscode[ikv] });
      }
      this.setData(iSetData)
    }
  },
  methods: {
    selclose(){                         //按下载ICON打开选择框
      this.setData({inclose: !this.data.inclose});
    },
    industrysel(e) {                         //选择行业类型
      if (!this.data.inclose) {
        let cvalue = this.data.value;
        cvalue.uName.push(e.currentTarget.dataset.sa);
        this.data.value_id.push(e.currentTarget.dataset.ca);
        cvalue._id = this.data.value_id.join(',');
        this.setData({
          value_id: this.data.value_id,
          value: { _id: cvalue._id, uName: cvalue.uName }
        });
      }

    },
    itemsel({ currentTarget:{id,dataset},detail:{value} }) {
      if (this.data.aVl[0] == value[0]) {
        if (this.data.aVl[1] != value[1]) { value[2] = 0; }
      } else { value[1] = 0; value[2] = 0; }
      this.setData({aVl: value});
    },
    selectdel({ currentTarget:{id,dataset},detail:{value} }) {      //按显示类型名称进行删除
      let i = Number(dataset.id);
      this.data.value_id.splice(i, 1);
      this.data.value.uName.splice(i, 1);
      this.setData({
        value_id: this.data.value_id,
        value: { _id: this.data.value_id.join(',') , uName: this.data.value.uName}
      });
    }
  }
})
