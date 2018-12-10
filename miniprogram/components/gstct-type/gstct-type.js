const gscode = require('../utils/apdv.js');
const {roleData} = getApp();
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    name: String,
    value: String,
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    _id: [],
    inclose: true,
    succId: '',
    aVl: [0, 0, 0]
  },
  lifetimes: {
    attached() {
      this._init(this.data.csc ? roleData.uUnit.indType.splice(',') : ['1', '2', '3', '4', '5', '6'])
    }
  },
  methods: {
    _init(gsroot) {
      let iSetData = { apdv: {} };
      if (this.data.value) {
        iSetData._id = this.data.value.split(',');
      };
      if (this.data.editable) {
        iSetData.kd1 = [];
        iSetData.drone = {};
        iSetData.gsroot = ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "201", "202", "203", "204", "301", "302", "303", "304", "305", "306", "307", "401", "402", "403", "404", "405", "406", "501", "502", "503", "601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611", "612"];
        function nextKeys(nKeys) {
          return new Promise((resolve,reject)=>{
            let klArr = [];
            nKeys.forEach(nKey => {
              let knArr = [], nn = Number(nKey), kEach;
              for (let n = 1; n < 100; n++) {
                kEach = '' + (nn * 100 + n)
                if (kEach in gscode) {
                  knArr.push(kEach);
                  klArr.push(kEach);
                  iSetData.apdv[kEach] = gscode[kEach]
                }
              }
              if (knArr.length > 0) {
                iSetData.drone[nKey] = knArr
              }
            });
            resolve(klArr)
          })
        }
        nextKeys(gsroot).then(kv1=>{
          iSetData.kd1 = kv1;
          nextKeys(iSetData.kd1).then(kv2 => {
            nextKeys(kv2).then(()=>{
              this.setData(iSetData);
            })
          })
        })
      } else {
        iSetData._id.forEach(ikv => { iSetData.apdv[ikv] = gscode[ikv] });
        this.setData(iSetData);
      }
    },

    _succecId(sv = [0, 0, 0]) {
      let succId = this.data.kd1[sv[0]];
      if (this.data.drone[succId]) {
        succId = this.data.drone[succId][sv[1]];
        if (this.data.drone[succId]) {
          succId = this.data.drone[succId][sv[2]];
        }
      }
      return succId;
    },

    selclose() {                         //按下载ICON打开选择框
      let coData = { inclose: !this.data.inclose };
      if (this.data.inclose) { coData.succId = this._succecId() };
      this.setData(coData);
    },

    industrysel({ currentTarget: { id, dataset }, detail: { value } }) {                         //选择行业类型
      if (!this.data._id.includes(this.data.succId) && this.data.editable) {
        this.data._id.push(this.data.succId);
        this.setData({
          value: this.data._id.join(','),
          _id: this.data._id
        });
      }
    },

    itemsel({ currentTarget: { id, dataset }, detail: { value } }) {
      if (this.data.aVl[0] == value[0]) {
        if (this.data.aVl[1] != value[1]) {
          value[2] = 0;
        }
      } else { value[1] = 0; value[2] = 0; }
      this.setData({
        aVl: value,
        succId: this._succecId(value)
      });
    },
    selectdel({ currentTarget: { id, dataset }, detail: { value } }) {      //按显示类型名称进行删除
      if (this.data.editable) {
        let i = Number(dataset.id);
        this.data._id.splice(i, 1);
        this.setData({
          _id: this.data._id,
          value: this.data._id.join(',')
        });
      };
    }
  }
})
