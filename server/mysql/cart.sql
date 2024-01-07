CREATE DATABASE IF NOT EXISTS `mysql_01` DEFAULT CHARACTER SET utf8; 
USE `mysql_01`; 

CREATE TABLE IF NOT EXISTS `product` ( 
  `prod_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `prod_name` varchar(50) NOT NULL,
  `unit_price` int(11) NOT NULL DEFAULT 0,
  `type` char(1) NOT NULL, 
  `desc` Json NOT NULL,  
  `img_url` varchar(255) NOT NULL,
  `cur_amount` int(11) NOT NULL DEFAULT 0,
  `total_amount` int(11) NOT NULL DEFAULT 0,

  PRIMARY KEY (`prod_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '상품리스트';


CREATE TABLE IF NOT EXISTS `cart_list` (
  `cart_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(10) NOT NULL, 
  `prod_id` int(11) unsigned NOT NULL,             
  `amount` int(11) default 1, 
  `option` varchar(10), 
  `order_id` int(11) unsigned NOT NULL,  

  PRIMARY KEY (`cart_id`),
  INDEX(`prod_id`, `order_id`),
  FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`)
  ON DELETE CASCADE ON UPDATE CASCADE, 
  FOREIGN KEY (`order_id`) REFERENCES `order_list` (`order_id`) 

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '장바구니' ;


CREATE TABLE IF NOT EXISTS `order_list`(
    `order_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `userId`  varchar(10),
    `address` varchar(225) NOT NULL,    
    `prod_id` int(11) unsigned NOT NULL,     
    `deliveryCost` int(11) DEFAULT 0,
    `total_price` int(11) DEFAULT 0, 
    `pay_amount` int(11) DEFAULT 0,
    `orderOTM` datetime DEFAULT current_timestamp(),
    `order_pointId`  int(11),  
    `usePoint` int(11) DEFAULT 0, 
    `newPoint` int(11) DEFAULT 0, 
    `orderState` varchar(30),  
    `orderDate` timestamp default now(),
    
     PRIMARY KEY (`order_id`),
     INDEX(`prod_id`), 
     FOREIGN KEY (`prod_id`) REFERENCES `product` (`prod_id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '주문상세' ;


-- procedure ====================================================

-- //주문서 추가 // 
CREATE PROCEDURE `mysql_01`.`sp_order_add`(
  IN items json,
  IN iUserId varchar(10), 
  IN iaddr varchar(255), 
  in ideliveryCost int, 
  in itotal_price INT,
  in ipay_amount int,
  IN iorderOTM datetime,
  in iusePoint int,
  in inewPoint int,
  in iorderState varchar(20),
  out oResultCode varchar(10),
  out order_id int 
)
    COMMENT '주문서 추가'
BEGIN

 DECLARE oPointId binary(16); 
 declare i int DEFAULT 0;
 DECLARE countRow INT DEFAULT 0; 
 
    set @@autocommit=0; 
    commit;

    -- 1)포인트처리 
    CALL sp_point_order(iUserId, iusePoint, inewPoint, @oResultCode, @oPointId);
    SELECT @oResultCode, @oPointId ;
    
    SET oResultCode = @oResultCode; 
    SET oPointId  = @oPointId; 

    if oResultCode  = 'A' then -- A:완료 / F : 실패 / E : 포인트 부족

      -- 2)주문서 추가 
      INSERT INTO order_list(UserId, addr, items, deliveryCost, total_price, 
                             pay_amount, orderOTM,order_pointId, usePoint, newPoint, orderState)  
                VALUES(iUserId, iaddr, items , ideliveryCost, itotal_price,
                       ipay_amount,iorderOTM, oPointid, iusePoint,inewPoint,iorderState); 

      set order_id = LAST_INSERT_ID(); 
   
      
      if order_id > 0 then
          SET oResultCode = 'add_order';

          WHILE (i < json_length(items)) DO     -- 3)장바구니 삭제.
               
              DELETE FROM cart_list          
	          WHERE UserId = iUserId AND prod_id = JSON_EXTRACT(items, concat('$[', i ,'].prod_id')); 
	          
	          SET countRow = countRow + ROW_COUNT(); 
	          SET i = i + 1;          
    
         END WHILE;
          
          if (countRow = json_length(items)) then 

            CALL sp_prod_cur_incre(items, @oResultCode); -- 4)재고수량 업데이트 
            select @oResultCode; 
            set oResultCode = @oResultCode; -- 'done' 

          end if; 

      end if;  

    end if;
    
    --5) 실행완료 및 취소 
 if oResultCode = 'done' then     
   commit; 
 else
   rollback; 
 end if;   

END



-- // 주문취소 // 
CREATE PROCEDURE `mysql_01`.`sp_order_cancel`(
  in iUserId varchar(10),
  IN iOrderId int,
  out oResultCode varchar(10)
)
    COMMENT '주문취소'
BEGIN
  DECLARE oPointId BINARY(16);
  DECLARE countRow INT;
  DECLARE i_items JSON; 
  
  
  set @@autocommit=0; 
  commit;

	-- 포인트 취소 
	CALL sp_point_use_cancel(iUserId, iOrderId,@oResultCode,@oPointId);
	select @oResultCode, @oPointId; 
	set oResultCode = @oResultCode; -- C : 취소(정상)
    set oPointId = @oPointId;
    
  if(oResultCode = 'C') then  -- 주문서 취소 
  
    UPDATE order_list 
    SET orderState = '주문취소' , order_pointId = oPointId     -- or null // 가능?? 
    WHERE userId = iUserId AND order_id = iOrderId;
    SET countRow = ROW_COUNT(); 
       
     if(countRow = 1) then  
                         
	    SELECT items into i_items 
	    from order_list WHERE userId = iUserId AND order_id = iOrderId;
	     
		 IF(json_length(i_items) > 0) then -- 주문수량 취소   
				      
			CALL sp_prod_cur_decre(i_items, @oResult);
			select @oResult; 
			set oResultCode = @oResult; -- 'done' 
				      
	    END IF; 
 
    END IF; 

  END IF; 


 if oResultCode = 'done' then     
   commit; 
 else
   rollback; 
 end if;  
	
END
	