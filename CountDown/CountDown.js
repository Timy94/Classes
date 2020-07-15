/*
 * @Descripttion: ArrayLocalStorage
 * @version: 
 * @Author: Timy
 * @Date: 2020-06-22 13:33:45
 * @LastEditors: 李天明
 * @LastEditTime: 2020-07-15 15:29:04
 */

/**
 * @msg: [Count 倒计时类]
 */
class CountDown {
    constructor(count) {
        this.count = parseInt(count); //计时数，秒为单位
        this.timer = null; //定时器
    }
    //转换为时间
    formatDate() {
        let hour = parseInt(this.count / 3600);
        let min = parseInt((this.count % 3600) / 60);
        let sec = this.count % 3600 % 60;
        //补零函数
        let toDouble = function (n) {
            return n < 10 ? '0' + n : '' + n;
        };
        return {
            hour: toDouble(hour),
            min: toDouble(min),
            sec: toDouble(sec)
        };
    }
    //倒计方法
    countBack() {
        this.count--;
        if (!this.count) { //计数为0时，停止计时器
            clearInterval(this.timer); //清除计时器
        }
        return this;
    }
    // 开始计时
    start(callback) {
        let self = this;
        clearInterval(self.timer); //防止定时器重复
        self.timer = setInterval(function () {
            self.countBack(); //倒计
            // if (typeof callback == 'function') callback.call(self); //循环回调
            callback && typeof callback == 'function' && callback.call(self); //循环回调
        }, 1000);

        return this;
    }
    //停止
    stop() {
        clearInterval(this.timer);
        return this;
    }
}