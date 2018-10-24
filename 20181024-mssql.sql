

CREATE DATABASE carPlusGame
COLLATE Chinese_Taiwan_Stroke_CI_AI;

USE carPlusGame;

-- Alter DATABASE carPlusGame COLLATE Chinese_Taiwan_Stroke_CI_AI

CREATE TABLE carPlusGame.dbo.game (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [name] nvarchar(45) NOT NULL DEFAULT '',
  [parameters] NVARCHAR(max) NOT NULL,
  [description] nvarchar(max) NOT NULL,
  [game_cover_image_url] varchar(500) NOT NULL DEFAULT '',
  PRIMARY KEY ([id])
);



CREATE TABLE carPlusGame.dbo.game_item (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [name] nvarchar(50) NOT NULL DEFAULT '',
  [type] int NOT NULL DEFAULT '0',
  [image_url] nvarchar(500) NOT NULL DEFAULT '',
  [game_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [car_plus_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [date_created] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [enabled_add_score_rate] bit NOT NULL DEFAULT '0' ,
  [enabled_add_game_point_rate] bit NOT NULL DEFAULT '0',
  [used_times] int NOT NULL DEFAULT '-1' ,
  [add_score_rate] float DEFAULT '0' ,
  [add_game_point_rate] float DEFAULT '0' ,
  [level_min_limit] int DEFAULT '-1' ,
  [description] nvarchar(1000) NOT NULL DEFAULT '',
  [enabled] bit NOT NULL DEFAULT '1',
  PRIMARY KEY ([id])
);



CREATE TABLE carPlusGame.dbo.game_question (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [question] nvarchar(500) NOT NULL DEFAULT '',
  [answer] nvarchar(max) NOT NULL,
  [sort] int NOT NULL DEFAULT '0',
  PRIMARY KEY ([id])
)  ;


CREATE TABLE carPlusGame.dbo.member (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [level] int NOT NULL DEFAULT '1' ,
  [car_plus_member_id] UNIQUEIDENTIFIER DEFAULT NULL ,
  [experience] decimal(18,2) NOT NULL DEFAULT '0.00' ,
  [car_plus_point] decimal(18,2) NOT NULL DEFAULT '0.00' ,
  [game_point] decimal(18,2) NOT NULL DEFAULT '0.00' ,
  [nick_name] nvarchar(50) NOT NULL DEFAULT '',
  [date_created] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [date_updated] datetime2(0) NOT NULL DEFAULT GETDATE(),
  PRIMARY KEY ([id])
)  ;


CREATE TABLE carPlusGame.dbo.member_game_history (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [member_id] UNIQUEIDENTIFIER NOT NULL,
  [game_id] UNIQUEIDENTIFIER NOT NULL,
  [game_score] decimal(18,2) NOT NULL DEFAULT '0.00',
  [date_created] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [date_finished] datetime2(0) DEFAULT NULL,
  [before_experience] decimal(18,2) NOT NULL DEFAULT '0.00',
  [after_experience] decimal(18,2) NOT NULL DEFAULT '0.00',
  [change_experience] decimal(18,2) NOT NULL DEFAULT '0.00',
  [before_level] int NOT NULL DEFAULT '0',
  [after_level] int NOT NULL DEFAULT '0',
  [change_level] int NOT NULL DEFAULT '0',
  PRIMARY KEY ([id])
)  ;



CREATE TABLE carPlusGame.dbo.member_game_history_game_item (
  [member_game_item_id] UNIQUEIDENTIFIER NOT NULL,
  [member_game_history_id] UNIQUEIDENTIFIER NOT NULL,
  [date_created] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [date_updated] datetime2(0) NOT NULL DEFAULT GETDATE(),
  PRIMARY KEY ([member_game_item_id],[member_game_history_id])
)  ;


CREATE TABLE carPlusGame.dbo.member_game_item (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [member_id] UNIQUEIDENTIFIER NOT NULL,
  [game_item_id] UNIQUEIDENTIFIER NOT NULL,
  [enabled] bit NOT NULL,
  [date_created] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [date_updated] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [total_used_times] int NOT NULL,
  [remain_times] int NOT NULL,
  [date_last_used] datetime2(0) NOT NULL,
  [is_using] bit NOT NULL DEFAULT '0' ,
  [member_game_point_history_id] UNIQUEIDENTIFIER DEFAULT NULL,
  PRIMARY KEY ([id])
)  ;


CREATE TABLE carPlusGame.dbo.member_game_point_history (
  [id] UNIQUEIDENTIFIER NOT NULL,
  [member_id] UNIQUEIDENTIFIER NOT NULL,
  [type] int NOT NULL DEFAULT '0',
  [before_game_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [after_game_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [change_game_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [before_car_plus_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [after_car_plus_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [change_car_plus_point] decimal(18,2) NOT NULL DEFAULT '0.00',
  [date_created] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [description] nvarchar(100) NOT NULL DEFAULT '',
  [game_item_id] UNIQUEIDENTIFIER DEFAULT NULL,
  [member_game_item_id] UNIQUEIDENTIFIER DEFAULT NULL,
  PRIMARY KEY ([id])
)  ;


CREATE TABLE carPlusGame.dbo.member_login (
  [client_id] UNIQUEIDENTIFIER NOT NULL,
  [member_id] UNIQUEIDENTIFIER NOT NULL,
  [is_logout] bit NOT NULL DEFAULT '0',
  [date_created] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [date_updated] datetime2(0) NOT NULL DEFAULT GETDATE(),
  [date_last_logout] datetime2(0) DEFAULT NULL,
  PRIMARY KEY ([client_id],[member_id])
)  ;



CREATE TABLE carPlusGame.dbo.vars (
  [key] varchar(100) NOT NULL,
  [description] varchar(200) NOT NULL DEFAULT '',
  [meta_str_1] nvarchar(100) DEFAULT NULL,
  [meta_str_2] nvarchar(100) DEFAULT NULL,
  [meta_int_1] int DEFAULT NULL,
  [meta_int_2] int DEFAULT NULL,
  [meta_str_long] nvarchar(max),
  [meta_date_1] datetime2(0) DEFAULT NULL,
  [meta_date_2] datetime2(0) DEFAULT NULL,
  PRIMARY KEY ([key])
)  ;


INSERT INTO game VALUES 
('08219c81-d446-11e8-9087-0242ac110002',N'超人接接樂','{}',N'天空中會落下氣球與炸彈，可透過點擊畫\n面改變左右方向，接到氣球可加分，接到\n炸彈會扣分或扣時間，限時3分鐘，接到越\n多氣球分數越高',''),('0821ce27-d446-11e8-9087-0242ac110002',N'射擊吧超人','{}',N'超人透過砲彈射擊壞人，按住螢幕瞄準，鬆手即\n發射，角度正確即可射擊成功，殺死越多壞人分\n數越高。','');




INSERT INTO carPlusGame.dbo.game_item
(id, name, [type], image_url, game_point, car_plus_point, date_created, enabled_add_scroe_rate, enabled_add_game_point_rate, used_times, add_scroe_rate, add_game_point_rate, level_min_limit, description,[enabled])
VALUES
(NEWID(), ('鋼鐵超人'), ('1'), (''), ('1500.00'),  ('0.00'), (getdate()), ('0'), ('0'), ('-1'), ('0'), ('0'), ((4)), '鋼鐵超人身穿著鋼鐵裝甲，比其他超人有著更高的防禦力，帥氣度也更高，限等級4以上購買使用。',1),
(NEWID(), ('超人隊長'), ('1'), (''), ('7500.00'),  ('0.00'), (getdate()), ('0'), ('0'), ('-1'), ('0'), ('0'), ((7)), '超人中的隊長，有著高超領導力與堅忍的意志力，所有超人都聽命於隊長，是超人中最厲害的角色，限等級7以上購買使用。',1),
(NEWID(), ('力霸超人'), ('1'), (''), ('12500.00'),  ('0.00'), (getdate()), ('0'), ('0'), ('-1'), ('0'), ('0'), ((12)), '超人中的隱藏角色，力量系的超人，是超人隊長遭遇困境時變身而來，全身肌肉發達，限等級12以上購買使用。',1),
(NEWID(), ('能量果實'), ('2'), (''), ('500.00'),  ('0.00'), (getdate()), ('1'), ('0'), ('2'), ('0.1'), ('0'), ((-1)), '充滿能量的神祕果實，使用後的兩場比賽，遊戲分數加乘10%。(使用後效果無法中斷，可與富翁果實同時使用)',1),
(NEWID(), ('富翁果實'), ('2'), (''), ('500.00'),  ('0.00'), (getdate()), ('0'), ('1'), ('2'), ('0'), ('0.1'), ((-1)), '有錢的富翁託人煉製的神祕果實，使用後的兩場比賽，該場獲得超人幣加乘10%。使用後效果無法中斷，可與能量果實同時使用)',1),
(NEWID(), ('超人幣'),   ('3'), (''),   ('500.00'),    ('1.00'), (getdate()), ('0'), ('0'), ('-1'), ('0'), ('0'), ((-1)), '使用格上服務所產生之紅利回饋，可購買超人幣，購買遊戲內之道具或角色，1點紅利可兌換500超人幣。',1),
(NEWID(), ('格上紅利'), ('4'), (''), ('500.00'),  ('0.00'), (getdate()), ('0'), ('0'), ('-1'), ('0'), ('0'), ((-1)), '於遊戲中獲得之超人幣可購買成為格上紅利，可使用於格上服務折抵，每日限制購買1點。',1);

