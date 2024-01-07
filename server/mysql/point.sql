
CREATE TABLE IF NOT EXISTS `sp_users` (  
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `UserId` varchar(11) NOT NULL,
  `user_point` int(11) NOT NULL DEFAULT 1000, 
  `payments` int(11) NOT NULL DEFAULT 0, 
  `member_level` int(11) NOT NULL DEFAULT 0,  

  PRIMARY KEY (`id` )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '유저';

--포인트 관련 테이블 -------------------------------------
CREATE TABLE IF NOT EXISTS `sp_point_event` (
  `Id` binary(16)NOT NULL, 
  `UserId` varchar(11) NOT NULL,
  `Type` char(1) NOT NULL DEFAULT 'A', 
  `Point` int(11) NOT NULL DEFAULT 0,
  `Comment` varchar(64) NOT NULL DEFAULT '',
  `ExpireDate` date DEFAULT NULL,
  `CreateDate` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`Id`), 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `sp_point_detail` (
  `Id` binary(16) NOT NULL, 
  `PointId` binary(16) NOT NULL, 
  `GroupId` binary(16) NOT NULL, 
  `Type` char(1) NOT NULL DEFAULT 'A',
  `Point` int(11) NOT NULL DEFAULT 0, 
  `CreateDate` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`Id`),
  INDEX (`PointId`),
  FOREIGN KEY (`PointId`) REFERENCES `sp_point_event`(`Id`) 
  ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 


-- 포인트관련 프로시저 ----------------------------------
CREATE PROCEDURE `mysql_01`.`sp_point_add`(
    IN iUserId varchar(10),
    IN iPoint Int, 
    IN iExpireDate Date,
    IN iComment varchar(64),
    out oResult char(1),
    out oPointId binary(16)
)
    COMMENT '포인트 적립'
BEGIN

	DECLARE mPointId binary(16); 
    DECLARE mDetailId binary(16); 

    set mPointId = fn_create_key();  
    SET mDetailId = fn_create_key(); 

    INSERT INTO point_event(Id, UserId,`Type`,`Point`, `Comment`, ExpireDate)
    values(mPointId, iUserId, "A", iPoint, iComment, iExpireDate);

    INSERT INTO point_detail(Id, PointId,`Type`,`Point`, GroupId) 
    values(mDetailId, mPointId, "A",iPoint, mDetailId);
    
    set oResult = 'A';
    set oPointId = mPointId; 

END

CREATE PROCEDURE `mysql_01`.`sp_point_use`(
    IN iUserId varchar(10), 
    IN iPoint INT, 
    IN iComment VARCHAR(10),
    out oResultCode char(1),
    out oPointId binary(16)
)
    COMMENT '포인트 사용'
BEGIN

    DECLARE mDone INT DEFAULT 0;
    DECLARE mPointId binary(16);
    DECLARE mDetailId binary(16);
    DECLARE mGroupId binary(16);
    Declare mTotalPoint INT;
    Declare mCurrentPoint INT;
    DECLARE mPoint INT;
 

    DECLARE cur CURSOR FOR 
        SELECT t.GroupId, t.`Point`
            FROM (
                SELECT d.GroupId, SUM(d.`Point`) AS `Point`
                FROM point_event AS p
                JOIN point_detail AS d ON p.Id = d.PointId 
                WHERE p.UserId = iUserId 
                GROUP BY d.GroupId 
                    ORDER BY p.ExpireDate
            )AS t
        WHERE `Point` > 0;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET mDone = 1;
        
    DECLARE exit handler for SQLEXCEPTION
    BEGIN
        SET oResultCode = 'E';
        ROLLBACK; 
    END;

    set mCurrentPoint = iPoint;

    START TRANSACTION; 

    SELECT IFNULL(SUM(`point`), 0) INTO mTotalPoint 
    FROM point_event 
    WHERE UserId = iUserId
    GROUP BY UserId;


    if(mTotalPoint < iPoint) then
        set oResultCode = 'F';
    else
    
        SET mPointId = fn_create_key();
        INSERT INTO point_event(Id, UserId, `Type`, `Point`, `Comment`)
        VALUES(mPointId, iUserId, 'U', (iPoint * -1), iComment);

        OPEN cur;
            read_loop : LOOP
                FETCH cur INTO mGroupId, mPoint;

                IF mDone OR mCurrentPoint < 1 THEN
                LEAVE read_loop;
                END IF;

                SET mDetailId = fn_create_key();

                if mCurrentPoint > mPoint then
                  
                    INSERT INTO point_detail(Id, PointId, `Type`, `Point`, GroupId)
                    VALUES(mDetailId, mPointId, 'U', (mPoint * -1), mGroupId);

                    set mCurrentPoint = mCurrentPoint - mPoint;
                    
                else
                   
                    INSERT INTO point_detail(Id, PointId, `Type`, `Point`, GroupId)
                    VALUES(mDetailId, mPointId, 'U', (mCurrentPoint * -1), mGroupId);

                    SET mCurrentPoint = 0;
                    
                end if;

            END LOOP;
        CLOSE cur;

        SET oResultCode = 'A';
        set oPointId = mPointId;

    end If;

    COMMIT; 

END


CREATE PROCEDURE `mysql_01`.`sp_point_use_cancel`( 
    in  iUserId varchar(10),
    IN  iOrderId int(11),
    OUT oResultCode char(5),
    out oPointId binary(16)
)
    COMMENT '포인트 사용 취소'
BEGIN
		
    DECLARE iPointId BINARY(16); 
    DECLARE mNewId BINARY(16);
    DECLARE mNewPointId BINARY(16);
    DECLARE countRow INT DEFAULT 0; 
  
    set @@autocommit=0; 
    commit;    
    

    SET iPointId = (SELECT order_pointId FROM order_list 
                    WHERE userId = iUserId and order_id = iOrderId);                  
                    
	    SET mNewPointId = fn_create_key(); 
	    SET mNewId = fn_create_key(); 
	      
		   INSERT INTO point_event(Id, UserId, `Type`, `Point`, `Comment`) 
		   select mNewPointId, UserId, 'C' , (`Point` * -1), concat(`Comment`, '취소') 
		   from point_event
		   where Id = iPointId;
		        
		   SET countRow = ROW_COUNT(); 
		        
		        if(countRow = 1) then 
		
		        INSERT INTO point_detail(Id, PointId, `Type`, `Point`, GroupId)
		        select mNewId, mNewPointId, 'C', (`Point` * -1), GroupId 
		        from point_detail
		        WHERE PointId = iPointId; 
		        
		        SET oResultCode = 'c';
		        set oPointId = mNewPointId;
		
		        end if; 
        
    
if oResultCode = 'c' then     
   commit; 
else
   rollback; 
end if;    

END

CREATE PROCEDURE `mysql_01`.`sp_point_expire`(
    IN `iWorkDate` DATE 
)
    COMMENT '포인트 만료 정리'
BEGIN

    DECLARE mDone INT DEFAULT 0; 
    DECLARE mUserId varchar(10);
    DECLARE mGroupId binary(16) ;
    DECLARE mPoint INT;
    DECLARE mPointId binary(16) ;
    DECLARE mDetailId binary(16) ;


    DECLARE cur CURSOR FOR 
        SELECT t.GroupId, t.`Point` 
        FROM (
            SELECT d.GroupId, SUM(d.`Point`) AS `Point` 
            FROM point_event AS p
            JOIN point_detail AS d ON p.Id = d.PointId
            WHERE p.ExpireDate < iWorkDate OR p.ExpireDate IS NULL 
            GROUP BY d.GroupId
        ) AS t
        WHERE `Point` > 0; 

    DECLARE CONTINUE HANDLER FOR 
     NOT FOUND SET mDone = 1; 

    OPEN cur; 
    read_loop : LOOP 
        FETCH cur INTO mGroupId, mPoint; 

        IF mDone THEN 
          LEAVE read_loop; 
        END IF;

        SELECT p.UserId INTO mUserId
        FROM point_detail AS d
            JOIN point_event AS p ON d.PointId = p.Id
        WHERE d.GroupId = mGroupId
        LIMIT 1;

        SET mPointId = fn_create_key();

        INSERT INTO point_event(Id, UserId, `Type`, `Point`, `Comment`)
        VALUES(mPointId, mUserId, 'E', (mPoint * -1), '유효기간만료');

        INSERT INTO point_detail(Id, PointId, `Type`, `Point`, GroupId)
        VALUES(fn_create_key(), mPointId, 'E', (mPoint * -1), mGroupId);

    END LOOP; 
    CLOSE cur;

END


CREATE PROCEDURE `mysql_01`.`sp_point_order`(
    IN iUserId varchar(10), 
    IN iUsePoint INT,
    IN iNewPoint INT,
    out oResult char(5),
    out oPointId binary(16)
)
    COMMENT '포인트처리(주문시)'
BEGIN

    DECLARE mPoint INT;
    
        IF (iUsePoint > iNewPoint) then

            SET mPoint = (iUsePoint - iNewPoint); 
            
            CALL sp_point_use(iUserId, mPoint, '사용', @oResultCode, @oPointId); 
            SELECT @oResultCode , oPointId ;  

            SET oResult = @oResultCode; 
            SET oPointId  = @oPointId; 

        ELSEIF(iNewPoint > iUsePoint) then

            SET mPoint = (iNewPoint - iUsePoint); 

            CALL sp_point_add(iUserId, mPoint, null, '적립', @oResultCode, @oPointId); 
            SELECT @oResultCode, @oPointId;  

            SET oResult = @oResultCode; 
            SET oPointId  = @oPointId;  

        ELSE 

          SET oResult ='A'; 

       END IF;
       

END


CREATE FUNCTION `fn_create_key`() RETURNS binary(16)

    COMMENT '순차적 BINARY ID 생성' 

    BEGIN

        RETURN UNHEX(replace(uuid(),'-',''));

         -- uuid() = utf8, string 값임. 
         -- unhex = binary(2진법) => 저장되는 값(이상한 기호): 아스키코드.
         -- 2진법 보낼때 : buffer 객체로 보냄. 풀어서 쓰면됨. 
         -- hex = 16진법 

    END
