const express = require('express');
const router = express.Router();
const request = require('request');
const converter = require('xml-js');
const redisCli = require('../config/redis-client'); 

//도서검색(api) 
require('dotenv').config();
const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

//추천도서
router.get('/recent/art', function (req, res) {
   
  const options = {
     url: "https://openapi.naver.com/v1/search/book_adv.xml",

     qs : {
       d_titl : '예술',
       display : 10, 
      },
     headers: {
         'X-Naver-Client-Id': client_id, 
         'X-Naver-Client-Secret': client_secret}
  };
 
 request.get(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {
     const xmlToJson = converter.xml2json(body,{compact: true, spaces: 4});
     res.json(xmlToJson);

   } else {
     res.status(response.statusCode).end();
     console.log('error = ' + response.statusCode);
   }
 });
});

//===========================================================//

//레디스 
router.get('/redis', async(req, res) => {
   const redis_res = await redisCli.zRange(`${req.user.userId}`, 0, -1); //zrange : 스코어 낮은순
   res.send(redis_res); 
});


//일반검색 & 재검색 ===============================================//
router.post('/:page', async(req, res)=>{   
    
    const req_D = req.body.params;
    // const req_D = [{title : '미주'}];
    //console.log(req_D);

    if(req_D[0]?.title && req.user){ //캐시체크 //[0]
      let nano_t = new Date().getTime() / 1000; 
      await redisCli.zAdd(`${req.user.userId}`,{score : nano_t, value: req_D[0].title});
      await redisCli.zRemRangeByRank(`${req.user.userId}`, -6, -6);  //6번째 삭제
    }

    function display_num(){       
      if(req_D.length > 1){ return 100 }
      else {return 10 };
    }

    function start_num(){
      if(req_D.length > 1){ return 1}
      else {return (req.params.page-1)*10+1 };
    }
    
    const options = {
       url: "https://openapi.naver.com/v1/search/book_adv.xml",

       qs : {
        //상세검색 
         d_titl : req_D[0]?.title,
         d_auth : req_D[0]?.auth,
         d_publ : req_D[0]?.publ,
         d_isbn : req_D[0]?.isbn,
         //(상세검색 외 생략가능) 
         display : display_num(), 
         start : start_num() 
      },
       headers: {
           'X-Naver-Client-Id': client_id, 
           'X-Naver-Client-Secret': client_secret}
    };
   
   request.get(options, async function (error, response, body) {
    
    if(error){
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode);
      }else if(body){ //실제 데이터값. 

        //xmlToJson
        const xmlToJson = await converter.xml2json(body,{compact: true, spaces: 4});
        const Json_data = await JSON.parse(xmlToJson);
        const items = Json_data.rss?.channel.item;  //전체데이터 
        
        //items 배열화하기(결과값이 1개인 경우 : {})
        function arr_items(items){ 
          if(items?.length === undefined){return Array.of(items)}
          else{return items}
        }; 
        
       //---------------------------------------------------------//
        if(req_D?.length > 1 ){  // 재검색 //
          const result = filter_data(); 
        
            if(result.length > 0){

              const firstIndex = (req.params.page-1)*10;
              const lastIndex = firstIndex + 9; 
    
              const totalCount = result.length; //전체 데이터수
              const totalPage = Math.ceil(totalCount/10); //전체 페이지수
              
              res.send({items : result.slice(firstIndex,lastIndex),
                        totalCount : totalCount, 
                        totalPage : totalPage, 
                        input_data : req_D //req.body.params
                      });
            }else{
              res.send({items: [], totalCount : 0, totalPage : 0, input_data : req_D})
            }
          
         }else{ // 일반검색 //

           const totalCount = Json_data.rss?.channel.total._text; //전체 데이터수
           const totalPage = Math.ceil(totalCount/10); //전체 페이지수

           if(items){
              res.send({items : arr_items(items),
                        totalCount : totalCount, 
                        totalPage : totalPage, 
                        input_data : req_D //req.body.params
                      });
            }else{
              res.send({items: [], totalCount : 0,  totalPage : 0, input_data : req_D})
            }
          }
            
          //재검색(필터링 함수)
          function filter_data(){   
            
              for(var i = 1; i <= req_D.length-1; i++){ //1,2

                var Items = arr_items(items);

                if(Items.length > 0 && req_D[i]){
                    var filtered = [];  

                    filtered = Items.filter((obj) =>  
                    obj.title._text?.includes(req_D[i].title) ||
                    obj.author._text?.includes(req_D[i].auth) ||  
                    obj.publisher._text?.includes(req_D[i].publ))

                    Items = filtered; 
                  }     
                 
              }return Items;  
              
          };



      } //body

   });
 });

 module.exports = router;
