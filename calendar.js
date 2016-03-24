var app = angular.module('myApp', []);
app.controller('myCtrl', ['$scope', function ($scope) {

    $scope.weekDayList = ["礼拜一", "礼拜二", "礼拜三", "礼拜四", "礼拜五", "礼拜六", "礼拜天"];

    //判断是否为闰年(leap year)
    function isLeapYear (year) {
        if ( (year%4 === 0 && year%100 != 0) || year%400 === 0 ) {
            return true;
        }

        return false;
    }

    //判断某个月有几天
    function getDayTotalNumberOfMonth (year, month) {
        switch ( month ) {
            case 1: 
                return 31;
            case 2: 
                return isLeapYear(year) ? 29 : 28;
            case 3: 
                return 31;
            case 4: 
                return 30;
            case 5: 
                return 31;
            case 6: 
                return 30;
            case 7: 
                return 31;
            case 8: 
                return 31;
            case 9: 
                return 30;
            case 10: 
                return 31;
            case 11: 
                return 30;
            case 12: 
                return 31;
        } 
    }

    //订阅-发布模式
    var SUBPUB = {
        clientFnList: [],
        listen: function (fn) {
            this.clientFnList.push(fn);
        },
        trigger: function () {
            for ( var i = 0; i < this.clientFnList.length; i++ ) {
                this.clientFnList[i].apply(this, arguments);
            }
        }
    }

    //计算某年某月某日是礼拜几 公式:W = ((Y-1)*365 + [(Y-1)/4] - [(Y-1)/100] + [(Y-1)/400] + D)%7
    function getWeekDay (year, month, day) {
        //这一年到这一天的积累天数
        var dayNum_thisYear = day;
        for ( var i = 1; i < month; i++ ) {
            dayNum_thisYear += getDayTotalNumberOfMonth(year, i);
        }

        return ((year - 1)*365 + Math.floor((year - 1)/4) - Math.floor((year - 1)/100) + Math.floor((year - 1)/400) + dayNum_thisYear)%7
    }

    function Calendar () {
        /*日历所能显示的最早年份和最晚年份*/
        this.begin_year = 1970;
        this.end_year = 2100;

        this.date = new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth() + 1;

        //常规休息日
        this.normal_restDay = [0, 6];

        this.colors = {
            bg_over: "#FFCC00",
            bg_out: "#EFEFEF",
            bg_today: "#009933",
            bg_restDay: "#CCCCCC"
        };

        this.init();
    }

    Calendar.prototype.init = function () {
        var t = this;

        var template_html = '<table id="calendar_table" >'
                            + '<tbody> <tr> <th colspan="5"> <select class="year" name="yearSelect" id="year_select">';
        for ( var i = this.begin_year; i <= this.end_year; i ++ ) {
            template_html += i === this.year ? '<option value="'+ i +'" selected >'+ i +'年</option>' : '<option value="'+ i +'">'+ i +'年</option>';
        }

        template_html += '</select> <select class="month" name="monthSelect" id="month_select">';

        for ( var i = 1; i <= 12; i++ ) {
             template_html += i === this.month ? '<option value="'+ i +'" selected>'+ toChNumber(i) +'月</option>' : '<option value="'+ i +'">'+ toChNumber(i) +'月</option>';
        }
        template_html += '</select> </th> </tr> <tr>';

        for ( var i = 0; i <= 6 ; i++ ) {
            var chNumber;
            if ( i === 0 ) {
                chNumber = "日";
            } else {
                chNumber = toChNumber(i);
            }

            template_html += '<th class="theader">'+ chNumber +'</th>';
        }

        template_html += '</tr>';

        for ( var i = 0; i < 6; i++ ) {
            template_html += '<tr align="center">';
            for ( var j = 0; j < 7; j++ ) {
                var class_name = "normal";
                template_html += '<td id="calendar_'+ (i + 1) +'_'+ (j + 1) +'" class="'+ class_name +'" style="background-color: rgb(239, 239, 239);">&nbsp</td>'
            }
            template_html += '</tr>';
        }
        template_html += '</tbody> </table>';

        document.getElementById('calendar').innerHTML = template_html;

        document.getElementById('year_select').onchange = function () {
            SUBPUB.trigger();
            t.year = parseInt(this.value);
            t.setDay(t.year, t.month);
        };

        document.getElementById('month_select').onchange = function () {
            SUBPUB.trigger();
            t.month = parseInt(this.value);
            t.setDay(t.year, t.month);
        };

        this.setDay();
    }

    Calendar.prototype.setRestDay = function () {

    }

    Calendar.prototype.setDay = function (year, month) {
        if ( !year ) {
            year = this.year;
        }
        if ( !month ) {
            month = this.month;
        }

        var t = this;
        //得到该月份第一天是礼拜几
        var weedDay_one =  getWeekDay(year, month, 1);
        //头部空格数
        var head_spacing_num;
        //尾部空格数
        var foot_spacing_num;
        //某个月的天数
        var day_totalNum = getDayTotalNumberOfMonth(year, month)
        //是不是当前的年份和月份
        var isNow = false;

        head_spacing_num = weedDay_one;
        foot_spacing_num = 48 - head_spacing_num - getDayTotalNumberOfMonth(year, month);

        var date = new Date();
        if ( date.getFullYear() === year && (date.getMonth() + 1) === month ) {
            isNow = true;
        }

        for ( var i = 0; i < 6; i++ ) {
            for ( var j = 1; j <= 7; j++ ) {
                var calendar_date = 7*i + j - head_spacing_num;
                if ( i === 0 && j > head_spacing_num || calendar_date <= day_totalNum && i != 0 ) {
                    var bg_color = t.colors.bg_out;
                    var week_day = getWeekDay(year, month, calendar_date);
                    var td = document.getElementById('calendar_'+ (i + 1) +'_'+ j +'');
                    //判断是否为当天
                    if ( isNow && date.getDate() === calendar_date ) {
                        td.style.backgroundColor = t.colors.bg_today;
                        SUBPUB.listen((function (dom) {
                            return function () {
                                dom.style.backgroundColor = t.colors.bg_out;    
                            }
                        })(td));
                        bg_color = t.colors.bg_today;
                    } else if ( week_day === 6 || week_day === 7 ){
                    //判断是否为礼拜六礼拜天

                    }

                    //判断是否为双休日
                    for ( var k = 0; k < this.normal_restDay.length; k++ ) {
                        if ( week_day === this.normal_restDay[k] ) {
                            td.style.backgroundColor = t.colors.bg_restDay;
                            bg_color = t.colors.bg_restDay;
                        }
                    }

                    td.innerHTML = calendar_date;
                    td.onmouseover = function () {
                        this.style.backgroundColor = t.colors.bg_over;
                    } 
                    td.onmouseout = (function (color) {
                        return function () {
                            this.style.backgroundColor = color;
                        }
                    })(bg_color);
                    
                } else {
                    document.getElementById('calendar_'+ (i + 1) +'_'+ j +'').innerHTML = "&nbsp";
                }
            }
        }
    }

    //将阿拉伯数字转化为中文描述(0-99的转化)
    function toChNumber (num) {
        var num = Number(num);
        if ( isNaN(num) ) {
            return '不是数字';
        }

        var ch_Num = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

        if ( num <= 10 ) {
            return ch_Num[num]
        } else if ( num%10 === 0 ) {
            return ch_Num[num/10] + ch_Num[10];
        } else if ( 10 < num < 20 ){
            return ch_Num[10] + ch_Num[num%10];
        } else {
            return ch_Num[Math.floor(num/10)] + ch_Num[10] + ch_Num[num%10];
        }
    }

    var calendar = new Calendar();
}]);

    