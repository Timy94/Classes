/*
 * @Descripttion: LocalStorageManager
 * @version: 
 * @Author: Timy
 * @Date: 2020-05-13 21:34:02
 * @LastEditors: 李天明
 * @LastEditTime: 2020-07-15 15:29:21
 */

(function (window) {

    /**
     * @msg: [LocalStorageManager 本地存储管理插件]
     * @param {string} address [用于本地存储的地址即localStorage的key]
     * @param {function} read [读取缓存的方法，实例独有，可选]
     */
    class LocalStorageManager {
        constructor(address, read) {
            this.address = address; //地址，即 key
            if (read) this.read = read; //读取方法，实例独有
            //初始化缓存信息
            this.cache = localStorage.getItem(this.address) ? JSON.parse(localStorage.getItem(this.address)) : [];

            //获取id数组
            const idArr = this.cache.map(function (item) {
                return +item.storageId; //使用map获取成员storageId组成的数组
            }).concat([0]); //添加 0，当缓存数组为空时，0最大

            this.countId = Math.max.apply(Math, idArr); //从storageId数组中选取最大值，初始化id计数
        }
        /**
         * @msg:[backup 备份，将数据保存到本地]
         */
        backup() {
            localStorage.setItem(this.address, JSON.stringify(this.cache));
            return this;
        }
        /**
         * @msg: [add 增加缓存]
         * @param {object} newItem 新增项 
         * @param {boolean} method 添加方法，可选  假值默认push  真值为unshift
         */
        add(newItem, method) {
            method = method ? 'unshift' : 'push';
            newItem.storageId = ++this.countId; // 增强新项
            this.cache[method](newItem); //增强缓存
            this.backup(); //备份
            return this;
        }
        /**
         * @msg:  [remove 删除缓存的方法]
         * @param {number} storageId 数字storageId 
         */
        remove(storageId) {
            let flag = this.cache.some(function (item, index, arr) {
                if (item.storageId == storageId) { //遍历寻找相同storageId的成员进行删除
                    arr.splice(index, 1);
                    return true;
                }
            });

            if (!flag) throw new Error('存储列表中没有对应成员');

            this.backup();
            return this;
        }
        /**
         * @msg: [accessCacheById 根据storageId访问缓存]
         * @param {number} storageId [数字storageId]
         * @param {function} callback [回调函数]
         */
        accessCacheById(storageId, callback) {
            let flag = this.cache.some(function (item, index, arr) {
                if (item.storageId == storageId) {
                    //找到对应storageId的成员，调用回调函数，参数--当前项， 当前索引 ， 数组本身 ，执行环境为存储对象
                    if (typeof callback == 'function') callback.call(this, item, index, arr);
                    return true;
                }
            }, this);

            if (!flag) throw new Error('存储列表中没有对应项成员');

            return this;
        }
        /** 
         * @msg: [modify 根据storageId修改缓存项]
         * @param {number} storageId [数字storageId] 
         * @param {object} newData [新数据]
         */
        modify(storageId, newData) {
            //调用storageId访问缓存方法，使用新数据拓展旧数据
            this.accessCacheById(storageId, function (item) {
                for (let key in newData) {
                    if (newData.hasOwnProperty(key)) {
                        if (key != 'storageId') item[key] = newData[key]; //注意屏蔽storageId
                    }
                }
            });
            this.backup();
            return this;
        }

        /**
         * @msg: [readAll 读取全部缓存]
         * @return {array}: 数组 用于存储读取出来的全部缓存
         */
        readAll() {
            if (typeof this.read === 'function') { //存在实例读取方法时，可用于读取全部缓存
                let arr = [];
                for (let i = 0, len = this.cache.length; i < len; i++) {
                    arr.push(this.read(i)); //将缓存项的读取项推入数组
                }
                return arr;
            }
            throw new Error('读取单项缓存的方法未定义');
        }
        /** 
         * @msg: [以下为遍历方法，由数组方法改造]
         * @param {function} callback [回调函数，参数当前项 当前索引 存储数组] 
         * @param {object} context [环境对象]
         */
        traver(method, callback, context) {
            callback = callback || function (v) {
                return v;
            };
            return this.cache[method](callback, context);
        }
        each(callback, context) {
            this.traver('forEach', callback, context);
            return this;
        }
        every(callback, context) {
            return this.traver('every', callback, context);
        }
        some(callback, context) {
            return this.traver('some', callback, context);
        }
        filter(callback, context) {
            return this.traver('filter', callback, context);
        }
        map(callback, context) {
            return this.traver('map', callback, context);
        }
    }

    window.LocalStorageManager = window.LSManager = LocalStorageManager;
})(window);