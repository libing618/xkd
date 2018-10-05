// components/file-select/file-select.js
var modalBehavior = require('../utils/poplib.js');
Component({
  behaviors: [modalBehavior],
  properties: {
    p: {
      type: String,
      value: '文件',
    },
    c: {
      type: String,
      value: '文件路径',
    },
    location: {
      type: Object,
      value: {latitude: 23, longitude:113},
    },
    code: {
      type: Number,
      value: 11000,
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    idClicked: '0',
    animationData: {},
    showModalBox: false
  },
  lifetimes:{
    attached(){
      if (!this.data.c){ this.modalSelectFile() }
    }
  },
  methods: {
    modalSelectFile({ currentTarget:{id,dataset} }) {            //文件选择面板弹出页
      let that = this;
      wx.getSavedFileList({
        success: function(res) {
          let index,filetype,fileData={},cOpenFile=['doc', 'xls', 'ppt', 'pdf', 'docx', 'xlsx', 'pptx'];
          let sFiles=res.fileList.map(({filePath,createTime,size})=>{
            index = filePath.indexOf(".");                   //得到"."在第几位
            filetype = filePath.substring(index+1);          //得到后缀
            if ( cOpenFile.indexOf(filetype)>=0 ){
              fileData[filePath] = {"fType":filetype,"cTime":formatTime(createTime,false),"fLen":size/1024};
              return (fileList.filePath);
            }
          })
          that.setData({
            pageData: fileData,
            tPage: sFiles
          });
          that.popModal();
        }
      })
    },
    fSelect({ currentTarget:{id,dataset} }) {                  //选定返回
      this.setData({c:this.data.pageData[this.data.idClicked]});
      this.downModal();
    },
    fOpen({ currentTarget:{id,dataset} }) {                  //打开文件
      wx.openDocument({
        filePath: this.data.idClicked
      });
    },
    fClick({ currentTarget:{id,dataset} }) {                 //确认ID
      this.setData({idClicked:id});
    }
  }
})
