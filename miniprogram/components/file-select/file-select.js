import {formatTime} from '../../model/util.js';
var modalBehavior = require('../utils/poplib.js');
Component({
  behaviors: [modalBehavior],
  properties: {
    p: {
      type: String,
      value: '文件',
    },
    value: {
      type: String,
      value: '文件路径',
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
    idClicked: '0',
    fileType: '',
    animationData: {},
    showModalBox: false
  },
  lifetimes:{
    attached(){
      if (this.data.editable==2){
        this.modalSelectFile()
      } else {
        let index = this.data.value.indexOf(".");
        this.setData({fileType: this.data.value.substring(index+1)});
      }
    }
  },
  methods: {
    modalSelectFile({ currentTarget:{id,dataset} }) {            //文件选择面板弹出页
      let that = this;
      wx.getSavedFileList({
        success: function(res) {
          let index,filetype,fileData={},cOpenFile=['doc', 'xls', 'ppt', 'pdf', 'docx', 'xlsx', 'pptx'];
          let sFiles=res.fileList.map(({filePath,createTime,size})=>{
            index = filePath.lastIndexOf(".");                   //得到"."在第几位
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
      this.setData({value:this.data.pageData[this.data.idClicked]});
      this.downModal();
    },
    fOpen({ currentTarget:{id,dataset} }) {                  //打开文件
      wx.openDocument({
        filePath: id
      });
    },
    fClick({ currentTarget:{id,dataset} }) {                 //确认ID
      this.setData({idClicked:id});
    }
  }
})
