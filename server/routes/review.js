const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const File = require('../models/file'); //스키마,생성,삭제,읽어오기 등
const multer = require('multer');
const upload_s3 = require('../modules/s3-multer');
const upload = multer({ dest: 'uploadedFiles/' });
     //multer(upload) -> req.file 혹은 req.files 로 내용을 넘겨줌. 
const {img_server} = process.env;

//전체 게시글 or 카테고리(선택)==================================// 
router.get('/:category/:page/:size', async function(req, res){     

  const page = Number(req.params.page); //선택한 페이지 
  const size = Number(req.params.size); //페이지당 게시물 수 

  const category = Category(); //카테고리 선택 
   function Category(){
    if(req.params.category === 'all'){
      return; 
    }else{
      return {category :req.params.category}; 
    }
  };

  Review.find(category)
  .sort( { "_id": -1 } )
  .skip(size*(page-1)).limit(size) 
  .populate('author').populate('attachment') 
  .exec( async function(err, reviews){
    if(err) return res.json(err);
    if(reviews){

      const totalCount = await posts_Count(); //전체 데이터
      const totalPage = Math.ceil(totalCount/size); //전체 페이지수
      const tableIndex = totalCount-(page-1)*size; //테이블 인덱스

      function posts_Count(){ 
        if(category === undefined){
          return Review.count().exec();
        }else{
          return Review.find(category).countDocuments().exec(); 
        }
      } 
        res.json({
          posts : reviews, 
          page : {
            totalCount : totalCount, 
            totalPage : totalPage,  
            tableIndex : tableIndex
          }
        })
    }
  });

});



//조건별데이터 ==================================// 
router.get('/:query', function(req, res){

  if(req.params.query === 'best-reviews'){
    Review.find()
    .populate('author').populate('attachment') 
    .sort({views: -1}).limit(5)
    .exec(function(err, reviews){
      if(err) return res.json(err)
      res.json(reviews);
    });
  }else  if(req.params.query === 'my-reviews'){
    Review.find({author : req.user._id})  
    .exec(function(err, reviews){
      if(err) return res.json(err);
      res.json(reviews);
    });
  }
});


//searchQuery(자료검색) =========================//
router.get('/search/:category/:page/:size', function(req, res){
 
 let searchQuery = createSearchQuery(req.query); //조건,텍스트,카테고리
 console.log(searchQuery)

 const page = Number(req.params.page);
 const size = Number(req.params.size); 

    Review.find(searchQuery) 
    .populate('author').populate('attachment') 
    .sort( { "_id": -1 } )
    .skip(size*(page-1)).limit(size) 
    .exec(async function(err, reviews){
      if(err) return res.json(err);
      if(reviews){

      const totalCount = await posts_Count(); //전체 데이터
      const totalPage = Math.ceil(totalCount/size); //전체 페이지수
      const tableIndex = totalCount-(page-1)*size; //테이블 인덱스

      function posts_Count(){  
       return Review.find(searchQuery).countDocuments().exec(); 
      } 

          res.json({
            posts : reviews, 
            page : {
              totalCount : totalCount, 
              totalPage : totalPage,
              tableIndex : tableIndex
            }
          })
      }
    });

});


//게시물 (:_id)  =========================================// 
router.get('/post/:id', function(req, res){

    Review.findOne({_id:req.params.id})  //'attachment'
    .populate('author').populate('attachment') //{path:'attachment',match:{isDeleted:false}
    .exec(function(err, review){
      if(err) return res.json(err);
      res.json(review);
      
      review.views ++; 
      review.save(); 
      
    });
});


//포스팅생성
router.post('/', upload.single('attachment'), async function(req, res) {
   const attachment = req.file? await File.createNewInstance(req.file, req.user._id):undefined;
    req.body.attachment = attachment;    //파일 인스턴스 생성
    req.body.author = req.user._id; 

      Review.create(req.body, function(err, review){

        if(err) return res.send(err);
        if(review){

          if(attachment){                 
            attachment.postId = review._id; 
            attachment.save();           
          }
            console.log(review)
            res.status(200).json(review._id); 
        }             
    });
});

//s3 이미지 포스팅(게시물)
router.post('/upload-s3', upload_s3.image.single('imgFile'), function(req, res, next) {
   //multer 메서드임.
  //upload.single => 한개의 파일만 업로드
  //pload.array('many') => 여러개의 파일을 업로드
  //upload.none() => 파일 업로드 없음  
  
  const imgFile = req.file; //multer가 req.file 객체를 생성함.
  const url = `${img_server}/reviews/${imgFile.key}`; //key: 저장된 파일이름
  imgFile.url = url;
  res.json(imgFile);
});


//포스팅 수정 
router.put('/update/:id', upload.single('newAttachment'), async function(req, res){
   let review = await Review.findOne({_id:req.params.id}).populate('attachment'); 
  
                        //새 파일첨부 or 파일삭제
   if(review.attachment && (req.file  || !req.body.attachment)){   
    review.attachment.processDelete(); 
   }    
    req.body.attachment= req.file?await File.createNewInstance(req.file, req.user.id, req.params.id):review.attachment;  

    Review.findOneAndUpdate({_id:req.params.id}, req.body, function(err, review){
      if(err) return res.json(err);
      if(review) res.json({success:true})
    }); 
});


//삭제 
router.delete('/delete/:id', function(req, res){
       
     Review.deleteOne({ _id: req.params.id}, function(err, output){
        if(err) return res.status(500).json({ error: "Database Failure!" });
        res.send('삭제 되었습니다.');
    })

});


module.exports = router;

//검색어함수 ==============================================// 
function createSearchQuery(queries){ 
  let searchQuery = {}; //최종객체 
  
 if(queries.searchType && queries.searchText && queries.searchText.length >= 1){
   let searchTypes = queries.searchType.toLowerCase().split(','); //조건 : (전체,제목,본문)
   let postQueries = []; 

   // 검색어추가
   if(searchTypes.includes('title')){ //정규식표현으로 써야 필터링됨. 
     postQueries.push( {title: { $regex: new RegExp(queries.searchText, 'i') } } );
   }
   if(searchTypes.includes('text')){
     postQueries.push({ text: { $regex: new RegExp(queries.searchText, 'i') } });
   }
   if(postQueries.length > 0) searchQuery = {$or:postQueries}; 

   //카테고리 추가 
   if(queries.category !== 'all'){ //카테고리 속성 추가. 
     searchQuery.category = queries.category ; 
   }
 }
 

 return searchQuery;
}

