const mysql = require('mysql');

/**
 * @msg: [MysqlManager mysql助手]
 * @param {string} database [数据库名称]
 * @param {string} table [指定主表]
 */
let MysqlManager = module.exports = function (database, table) {
    if (!(this instanceof MysqlManager)) return new MysqlManager(database, table); //去 new
    this.pool = mysql.createPool({ //设置连接池
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database, //数据库
        dateStrings: true
    });
    this.table = table; //设置主表
};

MysqlManager.prototype = {
    constructor: MysqlManager,
    /**
     * @msg: [query 查询]
     * @param {object} option [field字段 table指定表 where条件 order排序]
     * @param {function} callback [成功回调]
     */
    query(option, callback) {
        let field = option.field || '*', //字段，默认为 *
            table = option.table || this.table, //默认操作表为主表
            where = option.where ? `where ${option.where}` : '', //查询条件
            order = option.order ? `order by ${option.order}` : '', //排序条件
            limit = option.limit ? `limit ${option.limit}` : '', //截取
            join = ''; //关联
        if (option.join) { //查询关联表
            join = `join ${option.join}`;
            where = where.replace('where', 'on');
        }
        sql = `select ${field} from ${table} ${join} ${where} ${order} ${limit};`; //查询sql语句
        this.pool.query(sql, (err, results) => {
            if (err) {
                throw err;
            } else {
                switch (results.length) {
                    case 0:
                        results = null; //未找到数据
                        break;
                    case 1:
                        results = results[0]; //1条数据，直接取数据对象
                        break;
                }
                callback && callback(results);
            }
        });
    },
    /**
     * @msg: [insert 增加]
     * @param {object} obj [新增的数据对象]
     * @param {string} table [指定表，可选]
     * @param {function} callback [成功回调]
     */
    insert(obj, table, callback) {
        if (typeof table == 'function') { //使用默认表
            callback = table;
            table = this.table;
        }
        this.pool.query(`insert into ${table} set ?`, obj, (err, results) => {
            if (err) {
                throw err;
            } else {
                callback && callback();
            }
        });
    },
    /**
     * @msg: [update 更新数据]
     * @param {object} obj [更新的数据对象]
     * @param {string} where [修改条件]
     * @param {string} table [指定表，可选]
     * @param {function} callback [成功回调]
     */
    update(obj, where, table, callback) {
        if (typeof table == 'function') {
            callback = table;
            table = this.table;
        }
        this.pool.query(`update ${table} set ? where ${where}`, obj, (err) => {
            if (err) {
                throw err;
            } else {
                callback && callback();
            }
        });
    },
    /**
     * @msg: [delete 删除]
     * @param {string} where [删除的条件]
     * @param {string} table [指定表，可选]
     * @param {function} callback [成功回调]
     */
    delete(where, table, callback) {
        if (typeof table == 'function') {
            callback = table;
            table = this.table;
        }
        this.pool.query(`delete from ${table} where ${where}`, (err) => {
            if (err) {
                throw err;
            } else {
                callback && callback();
            }
        });
    }
}