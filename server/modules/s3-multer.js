const aws = require('aws-sdk'); //   import S3 from 'aws-sdk/clients/s3'; //s3직접접근
const multer = require('multer'); //타입: multeipart/form-data 받아서 upload. 
const multerS3 = require('multer-s3-transform') //transform 사용하기 위해. 
const sharp = require('sharp');

aws.config.loadFromPath(__dirname + '/../config/s3.json');
const s3 = new aws.S3();

const profile = multer({
    storage: multerS3({

        s3: s3,
        bucket: 'artnbooks-img-lamda/profile',
        acl: 'public-read', // acl 관련 설정을 풀어줘야 사용할 수 있다.
        limits: { fileSize: 5 * 1024 * 1024 , files : 1 }, //용량제한 5MB
        contentType: multerS3.AUTO_CONTENT_TYPE,
        shouldTransform: true, 

        transforms : [{
            id: 'resized',
            key: function(req, file, cb){   //lastModified = Data.now + extension.
                cb(null, Date.now() + '.' + file.originalname.split('.').pop()); // 이름 설정
            },
            transform: function (req, file, cb) {
                cb(null, sharp().resize(100, 100)); 
            },
          }]
      }),

},'NONE');


const image = multer({ 
  
    storage: multerS3({
        
        s3: s3, //퍼블릭액세스 열려 있어야, aws-sdk 사용가능, + IAM(액세스키 : S3 FULL ACCESS)//
        bucket: 'artnbooks-img-lamda/reviews',
        acl: 'public-read', //자유롭게 가용 
        limits: { fileSize: 5 * 1024 * 1024 , files : 1 }, //용량제한 5MB
        contentType: multerS3.AUTO_CONTENT_TYPE, // 자동 콘텐츠 타입(Content/mime type)
        //cacheControl: 'max-age=31536000', //캐시사용여부 
        //shouldTransform: true or function //업로드 전 변환될 값. //true: 변환시작.

        key: function(req, file, cb){
              cb(null, Date.now() + '.' + file.originalname.split('.').pop()); // 이름 설정
        }
    }),
},'NONE');


module.exports = {image, profile}; 


