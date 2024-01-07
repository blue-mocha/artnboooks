const aws = require('aws-sdk'); //   import S3 from 'aws-sdk/clients/s3'; //s3직접접근
const multer = require('multer'); //타입: multeipart/form-data 받아서 upload. 
const multerS3 = require('multer-s3-transform') //transform 사용하기 위해. 
const sharp = require('sharp');

aws.config.loadFromPath(__dirname + '/../config/s3.json');
const s3 = new aws.S3();

const profile = multer({
    storage: multerS3({
        //개인정보 보호를 위해서라도, 우선 프로필로 쓰이는 사진은 어느정도 작게 줄이고,
        //프론트에서 직접 올려서, s3에 이벤트 걸어 저장하는 방식도 있겠지만, 
        // CORS 설정이나 IAM 설정으로 권한을 제한하겠지만 
        //★=>>엑세스, 시크릿키가 공개됨으로 악의적인 공격을 당할 가능성이 존재.
        //보안 문제를 해결하기 위해선-> api gateway를 활요하면 되나(비용이 추가됨).
        //서버리스 = 람다 + api gateway(restapi, http api, 웹소켓 등등을 지원함)

        //람다함수로 저장과 동시에, 썸네일 따로 저장은(용량차지)
        //불러올떄 람다함수를 씁시다. 

        s3: s3,
        bucket: 'artnbooks-img-lamda/profile', // 버킷이름 : 유일한 값//
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
    //게시물 사진 - 원본그대로(용량만 제한)
    //서버쪽에서 하는게 나중에 변화에 대응하기 좋을 이유가 있지 않을까.
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


