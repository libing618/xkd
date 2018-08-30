const QCloud = require('./qclooud')
QCloud.init({
    module:'wenzhi',
    secretId:'自己的secretId',
    secretKey:'自己的secretKey'
})

let params = {
    'content':'人生苦短，please Python。太祖、刘邦、朱元璋哪个更厉害？！'
}

QCloud.use('TextClassify',params,function (responce) {
    console.log(eval('('+responce.data+')'))
},function (error) {
    console.log(error)
})