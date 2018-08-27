const db = wx.cloud.database();
const _ = db.command;
var app = getApp();
function isAllData(cName){
  return (cName=='articles')
};
function getData(tName,requirement,dateArr){
  requirement.updatedAt = _.gt(dateArr[1])
}
module.exports = {
getAllData: function(tName,requirement){
  return new Promise((resolve, reject) => {
    db.collection(tName).add({
      data: {                                     //用户的原始定义
        _id: user.openid,
        line: 9,                   //条线
        position: 9,               //岗位
        nickName: user.nickName,
        gender: user.gender,
        language: user.language,
        city: user.city,
        province: user.province,
        unionid: user.unionid,
        unit: '0',
        unitVerified: false,
        mobilePhoneNumber: "0"
      }
    }).then(_id=>{ resolve(_id) });
  }).catch(err=> { reject(err) })
},

}
