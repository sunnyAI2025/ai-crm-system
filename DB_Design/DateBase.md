# 数据库文档
文件名DateBase.md
##数据库说明
- 本项目数据库使用的是neonl数据库，编码使用utf8mb4；
- 数据库所有的表都有ID字段，且该字段是bigint类型，自增，主键；
- 数据库所有的表都有created_at和updated_at字段，示例如下：
```
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
```
- VARCHAR类型的字段都需要设置为utf8mb4_unicode_ci编码格式，同时要注意检查中文编码的问题；
- 所有表不使用外键约束，应用层维护数据一致性，字符集为 utf8mb4_unicode_ci。
- 枚举类型使用 TINYINT 或 SMALLINT；
- 项目需要支持高并发，优化性能，确保安全性和数据一致性，数据库需要设定相关的索引。
- 本项目中，需要单独在根目录下新建一个setting.py,将数据库的连接和配置信息写进去，方便本项目直接使用；

## 数据库信息：
psql 'postgresql://neondb_owner:npg_TCx79eZizfGU@ep-plain-moon-aewc6a58-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

## 数据库表查询与建立
- sept1:通过本机终端通过连接数据库的信息，写出连接数据库的脚本；
- sept2:对照需求，检查相关的数据库表是否存在；
   - logic branch 1:如果相关的数据库表存在，则需要在终端中查询表结构，分析当前表结构是否满足功能开发的需要，如果满足，按照实际的表结构写出需求对应的API代码，如果不满足需要询问开发者是否允许新增/修改/删除字段，得到开发者同意或者新的提示后，按照开发的要求操作数据库表字段，再进行代码编写；
   - logic branch 2:如果不存在需要根据需求新建数据库表。新建数据库表的时候，表命名规则需要跟功能名称一致，且符合数据库说明的相关约束；
- sept3:API代码写完后，需要编写配套的测试脚本，测试接口，操作数据库的内容，并读取数据库在操作之后的表结构和内容，检查是否满足开发需求；如果满足，则进入下一个需求的开发，如果不满足，需要继续调整代码；