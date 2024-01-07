CREATE PROCEDURE mysql_01.sp_order_cancel(
  in UserId varchar(10),
  IN iOrderId int,
  out oResaultCode varchar(10)
)
COMMENT '주문취소' 
BEGIN
  DECLARE countRow INT DEFAULT 0;
  DECLARE items json; 
  
  set @@autocommit=0; 
  commit;

	-- 포인트 취소 
	CALL sp_point_use_cancel(i_orderId,@oResaultCode,@oPointId)
	select @oResaultCode; -- C : 취소 

  if(oResaultCode = 'C') THEN   -- 주문서 수정(주문취소)
    UPDATE order_list SET orderState = '주문취소' 
    WHERE userId = iUserId AND order_id = iOrderId; 
    SET countRow = ROW_COUNT(); 

     if(countRow = 1) then  -- 주문수량 바꾸기(취소)   

      SELECT prod_id, amount from cart_list
      WHERE userId = iUserId AND order_id = iOrderId; -- 상품목록.

      CALL sp_prod_cur_incre(items, @oResultCode); 
      select @oResultCode; 
      set oResultCode = @oResultCode; -- 'done' 

    END IF; 

  END IF; 

 if oResultCode = 'done' then     
   commit; 
 else
   rollback; 
 end if;  
	
END 