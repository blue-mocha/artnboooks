const express = require('express');
const router = express.Router();
const getConnection = require('../mysql/dbsetting');

//const User = require('../models/user'); 
//https://gdlovehush.tistory.com/148(참고)
//https://gist.github.com/livelikeabel/909d5dc35e96e3f0bed0cd28cddcdeaf

//개인정보(포인트,등급)-(성공)
router.get('/user', (req, response) => {

  const UserId = req.user?.userId; 

  const s_point = `SELECT SUM(Point) as point FROM point_event 
                   WHERE UserId = "${UserId}"`

  const s_level = `SELECT SUM(pay_amount) as amount FROM order_list
                   WHERE UserId = "${UserId}" 
                   AND orderState = "결제" `      

  let point = 0;
  let level = "silver";    

  let a = 0; 
  switch (true) {
      case(a >= 100000): level = 'gold'; break;
      case(a >= 50000): level  = 'ruby';  break;
      default: level = 'silver'; break;
  }

      getConnection((conn) => {

        conn.query(s_point,(error, res) => {
            if (error) throw error;
            //console.log(res, '포인트합계');   
            point = res[0].point;  

            conn.query(s_level,(error, res) => {
              if (error) throw error;
              a = res[0].amount;     //유저등급 
            })

            response.json({point : point, level : level});

          });
        conn.release(); 
      }); 

}); 

//전체상품 (연결성공)
router.get('/product', (req, response) => {

  const sql = `SELECT * FROM product`;  
 
  getConnection((conn) => {
    conn.query(sql ,(error, result) => {
        if (error) throw error;
        response.json(JSON.parse(JSON.stringify(result))) 
        //console.log(JSON.parse(JSON.stringify(result)))
      });
    conn.release();

  }); 

}); 

//장바구니 목록 불러오기(연결성공)====================================================//
//--https://daje0601.tistory.com/147(조인설명)

router.get('/cartlist', (req, response) => {

  const sql = `SELECT
        c.prod_id, c.amount,
        p.prod_name, p.unit_price, p.desc, p.img_url, p.type
        FROM cart_list AS c LEFT JOIN product AS p  
        ON c.prod_id = p.prod_id 
        WHERE c.userId = "${req.user?.userId}"`;

  getConnection((conn) => {
    conn.query(sql ,(error, rows) => {
        if (error) throw error;
        if(rows){
          //console.log(rows, '장바구니 목록');
          response.json(rows);
        }
      });
    conn.release();
  });

});


//장바구니 목록추가(일반추가)(연결성공!!)
router.post('/add-cart', (req, response) => { 
 
  const userId = req.user?.userId;
  const m = req.body;  //{prod_id : 1, amount : 1}

  const s_check_s = `SELECT * FROM cart_list  
                     WHERE userId = "${userId}" AND prod_id = ${m.prod_id}` ; 

  const s_insert = `INSERT INTO cart_list(userId, prod_id, amount)
                    VALUES("${userId}", ${m.prod_id}, ${m.amount})`; 

  const s_update =`UPDATE product
                   SET cur_amount = cur_amount + ${m.amount}
                   WHERE prod_id = ${m.prod_id}`     

  getConnection((conn) => {

    conn.query(s_check_s,(err, res) => { 
      if(err) throw err;
      if(res.length > 0){
        //console.log(res, '상품중복');
        response.send('중복') //중복조회 
      }else{

        conn.query(s_insert,(err, res) => { 
          if(err) throw err;
          if(res.insertId){   
            //console.log(res, '목록추가성공');
            
            conn.query(s_update, (err, res) => {  
              if(err) throw err;
              if(res.changedRows > 0){ 
                //console.log(res, '재고 업데이트 완료');
                response.send('성공');      
              }
            }) 
          }
        });
      }
  });
      conn.release();
  });
});

  

//장바구니 목록추가(로그인 후, 목록추가)(성공!!) 
router.post('/update-cart', (req, response) => { 
 
  const userId = req.user?.userId;
  const items = req.body;

  getConnection((conn) => {

      //중복제외(1) 
    conn.query(`SELECT JSON_ARRAYAGG(prod_id) FROM cart_list   
                WHERE userId = "${userId}"`,(err, res) => { 
      if(err) throw err;
      if(res){   //모든 변수에서 값이 null일 수 있는지 생각하기.
 
        const o_items = JSON.parse(res[0][`JSON_ARRAYAGG(prod_id)`]); //없는경우.
        const f_items = o_items !== null ? (items.filter((item => !o_items.includes(item.prod_id)))) : (items); 
        let i_items = []; 
        for(var i = 0; i < f_items.length; i++){
          i_items.push(`("${userId}", ${f_items[i].prod_id}, ${f_items[i].amount})`)
        }

       if(i_items.length > 0){ //추가 상품이 있는 경우.

          //장바구니 추가(2)
        conn.query(`INSERT INTO cart_list(userId, prod_id, amount)
          VALUES ${i_items.toString(',')}`,(err, res) => { //value(1,2),(2,3)
          if(err) throw err;
          if(res.affectedRows === f_items.length){   
            //console.log(res, '목록추가성공');

           let update_product = '';   
            for(var i = 0; i < f_items.length; i++){
              update_product +=   "\n" +
              `UPDATE product SET cur_amount = cur_amount + ${f_items[i].amount}
                WHERE prod_id = ${f_items[i].prod_id};` 
            }          
            //재고수량 업데이트(3)
            conn.query(update_product , (err, res) => { 
              if(err) throw err;
              if(res.affectedRows === f_items.length){ 
               //console.log(res, '재고 업데이트 완료');
                response.send('성공');
              }
           }); 
          }
        });      
       }
      }
    });
      conn.release();
  });    
});


//장바구니 수량변경 (연결성공)
router.get('/num/:state/:prod_id', (req, response) => {

    const m = req.params; 
    const userId = req.user?.userId;
    const num = (m.state == 'incre' ? 1 : -1);
    
    const sql_cart = `UPDATE cart_list
                      SET amount = amount + ${num}
                      WHERE userId = "${userId}" AND prod_id = ${m.prod_id}`; 

    const sql_product =`UPDATE product
                       SET cur_amount = cur_amount + 1
                       WHERE prod_id = ${m.prod_id}`  

    getConnection((conn) => {

      conn.query(sql_cart, (err, res) => {
        if(err) throw err;
        if(res.affectedRows > 0){ 
          //console.log(res,'장바구니 수량변경');

          conn.query( sql_product, (err, res) => {
            if(err) throw err;
            if(res.affectedRows > 0){
              //console.log(res, '재고수량 변경완료');
              response.send('수정완료');
          } 
          })
        }else{
          response.send('수정실패');
        }
      });
      conn.release();
    });
});

//장바구니 목록삭제(성공)
router.post('/del-cartlist', (req, response) => {

  const userId = req.user.userId;
  const items = req.body;
  
  const sql =  
   `DELETE FROM cart_list
    WHERE userId = "${userId}" AND prod_id in (${items.map(i => i.prod_id)})`; 

  let update_product = '';   

    for(var i = 0; i < items.length; i++){
      update_product +=   "\n" +
      `UPDATE product SET cur_amount = cur_amount - ${items[i].amount}
       WHERE prod_id = ${items[i].prod_id};` 
    }

  getConnection((conn) => {

    conn.query(sql, (err, res) => {
      if (err) throw err;
      if(res.affectedRows = items.length){
        console.log(res, '장바구니 목록삭제');

        conn.query(update_product, (err, res) => {
          if(err) throw err;
          if(res.affectedRows = items.length){
            console.log(res, '재고수량 변경완료');
            response.send('성공');
          }
        })
      }
    });
    conn.release();
  });
}); 

//===============================================================================//
//주문결제(코드완료) ==> res
//https://kimvampa.tistory.com/271

router.post('/add-order', (req, response) => {

  const UserId = req.user?.userId; 
  const m = req.body;  //items, info (주문정보)

  const params = [
  `${JSON.stringify(m.items)}`, //items_json 
  `${UserId}`
]; 

 //주문상세정보//
 const i_order = Object.values(m.info);
 for(var i = 0; i < i_order.length; i++){
    params.push(i_order[i]);
 }

  getConnection((conn) => { 
    conn.query(`call sp_order_add(?,?,?,?,?,?,?,?,?,?, @oResultCode,@order_id);
      select @oResultCode,@order_id`, params, (err, res) => {
      if(err) throw err;
      if(res){
        console.log(res)
        const result = JSON.parse(JSON.stringify(res[4])); 
        if(result[0]['@oResultCode'] === 'done'){
          response.send({message : '주문완료' , order_id : result[0]['@order_id']});
        }else{
          response.send('주문결제 오류');
        }
      }
     })
  }); 
    
});

//주문취소(코드완료)-----------------------------------------------------//
 
router.get('/cancel-order/:id', (req, response) => {

  const UserId = req.user?.userId; 
  const order_id = req.params.id; 

  console.log(req.user?.userId, order_id);

  getConnection((conn) => { 
  
    conn.query(`call sp_order_cancel("${UserId}",${order_id},@oResultCode);
      select @oResultCode`,(err, res) => {
      if(err) throw err;
      const result = JSON.parse(JSON.stringify(res[3])); 
      if(result[0]['@oResultCode'] === 'done'){
        response.send('성공');
      }else{
        response.send('주문취소 오류');
      }
     })
     conn.release();
  }); 

});



//주문리스트 (res)-------------------------------------------------//
router.get('/orderList', (req, response) => {

  const sql = `SELECT  
               o.order_id, o.orderDate, o.orderState, o.deliveryCost,
               o.total_price, p.prod_name, p.img_url,
               JSON_LENGTH(o.items) as num FROM order_list AS o 
               LEFT JOIN product AS p 
               ON JSON_EXTRACT(o.items, '$[0].prod_id') = p.prod_id  
               WHERE o.userId = "${req.user.userId}"  
               ORDER BY o.order_id DESC` //날짜(최신순, 역순으로) 

      getConnection((conn) => {
      conn.query(sql ,(err, rows) => {
          if (err) throw err;
          if(rows.length > 0){
            //console.log(rows, '주문리스트');
            response.json(rows);
          }else{
            res.json({message: '주문내역이 없습니다.'});
          }
        
        });
      conn.release();
    });
  
}); 

//주문상세 
router.get('/order_detail/:id', (req, response) => {

 const userId = req.user.userId;
 const order_id = req.params.id; 

 const s_detail = `SELECT * from order_list
                   WHERE userId = "${userId}" AND order_Id = ${order_id}`

 // 아이템 불러오기 주문서에서                   
 const s_items = `select p.prod_name, p.unit_price, p.img_url,
                  JSON_EXTRACT(o.items,'$[*].amount') as amount
                  FROM order_list as o 
                  left join product as p 
                  on json_contains(json_extract(o.items, '$[*].prod_id'), 
                  CAST(p.prod_id as JSON), '$')
                  WHERE userId = "${userId}" AND order_Id = ${order_id}`            

  let order_detail ;  //주문상세   json_extract (o.items, '$[*].amount' ) as amount

   getConnection((conn) => {
    conn.query(s_detail ,(error, res) => {
        if(error) throw error;
        if(res){
          //console.log(res, '주문상세'); 
          order_detail = res; 
          conn.query(s_items ,(error, result) => {
            if(error) throw error;
            if(result){
             // console.log(result, '주문한 품목'); 
             response.json({info : order_detail, items : result});
            }
          })
        }
      });
    conn.release();
  });
});

//주문목록 삭제 
router.get('/del-orderlist/:id', (req, response) => {

  getConnection((conn) => {

    conn.query(`DELETE FROM order_list
                WHERE userId = "${req.user?.userId}" 
                AND order_id = ${req.params.id}`, (err, res) => {
      if (err) throw err;
       console.log(res);
      if(res.affectedRows === 1){
        console.log(res, '주문목록삭제');
        response.send('성공');
      }
    });
    conn.release();
  });
}); 


module.exports = router;
//=================================================================//

