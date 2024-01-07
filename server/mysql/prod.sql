
-- 상품 수량관리 프로시저 ---------------------------

CREATE PROCEDURE `mysql_01`.`sp_prod_cur_incre`( -- 증가
		 IN items JSON, 
		 out oResult varchar(10)
	
)
    COMMENT '상품 주문수량(증가)'
BEGIN
	 
	declare i int DEFAULT 0;

	WHILE (i < json_length(items)) DO  
	
	     UPDATE product
	     SET cur_amount = cur_amount + json_extract(items, concat('$[', i ,'].amount'))
	     WHERE prod_id = json_extract(items, concat('$[', i ,'].prod_id'));	 
          
	    SET i = i + 1;
	  
    
    END WHILE;
    
    set oResult  = 'done';
   
	
END

CREATE PROCEDURE `mysql_01`.`sp_prod_cur_decre`( -- 감소 
		 IN items JSON,   
		 out oResult varchar(10)
	
)
    COMMENT '상품 주문수량 (취소)'
BEGIN
	 
	declare i int DEFAULT 0;
	
	WHILE (i < json_length(items)) DO  
	
	     UPDATE product
	     SET cur_amount = cur_amount - json_extract(items, concat('$[', i ,'].amount'))
	     WHERE prod_id = json_extract(items, concat('$[', i ,'].prod_id'));	 

          
	    SET i = i + 1;
    
    END WHILE;
    
    set oResult  = 'done';
   
	
END

