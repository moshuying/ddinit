"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * dd-cli
 */
var axios_1 = require("axios");
var crypto = require("crypto");
var crypto_1 = require("./crypto");
// tslint:disable-next-line: no-var-requires
var CronJob = require('cron').CronJob;
// tslint:disable-next-line: no-var-requires
var Moment = require('moment');
var DD_Cli = /** @class */ (function () {
    /**
     * 构建主要参数
     * @param {string} appKey
     * @param {string} appSecre
     * @param {number} 周数据缓存大小,默认为1,传0不缓存
     * @param {number} 月数据缓存大小,默认为1,传0不缓存
     */
    function DD_Cli(key, Secret, week, moon, speed) {
        this.weekdata = [];
        this.moondata = [];
        this.daliyData = [];
        this.holidayData = {};
        this.data = { userIdList: [], employee: [] };
        this.cooldata = { dimissionList: [], employee: [] };
        this.getDoubleIndex = function (arr, start, end) {
            var temp = [];
            for (var index = start; index < end; index++) {
                var element = arr[index];
                if (element === undefined) {
                    continue;
                }
                temp.push(element);
            }
            return temp;
        };
        this.Key = key;
        this.Secret = Secret;
        speed = speed || 3000;
        week = week || 1;
        moon = moon || 1;
        this.refreshen(week, moon, speed);
    }
    /**
     * 启动时刷新数据
     */
    DD_Cli.prototype.refreshen = function (week, moon, speed) {
        return __awaiter(this, void 0, void 0, function () {
            var ix, ix, _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        this.getAccessTonken();
                        return [4 /*yield*/, this.getHoliday()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.getToken()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.getStatusList()];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.getemployee()];
                    case 4:
                        _b.sent();
                        this.job(speed);
                        this.gettoDayData();
                        for (ix = 0; ix < week; ix++) {
                            log(ix + config.apiList.getWeekData.keyName + 'starting');
                            this.getWeekData(ix + 1, ix);
                        }
                        for (ix = 0; ix < moon; ix++) {
                            log(ix + config.apiList.getMoonData.keyName + 'starting');
                            this.getMoonData(ix + 1, ix);
                        }
                        return [4 /*yield*/, this.getdimission()];
                    case 5:
                        _b.sent();
                        _a = this.cooldata;
                        return [4 /*yield*/, this.getemployee(this.cooldata.dimissionList)];
                    case 6:
                        _a.employee = _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _b.sent();
                        log(e_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 不传参时,默认以最高速度获取在职员工id信息
     * @param speed 获取速度
     * @param Substate 员工子状态
     * @param offsetis 分页值,默认从0开始
     * @param sizeis 单页数据大小
     * @param token 秘钥
     * @returns array 离职员工列表
     */
    DD_Cli.prototype.getStatusList = function (Substate, offsetis, sizeis, token) {
        return __awaiter(this, void 0, void 0, function () {
            var userIdList, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sizeis = sizeis || 20;
                        offsetis = offsetis || 0;
                        Substate = Substate || config.apiList.getStatusList.status_list;
                        token = token || this.AccessToken;
                        userIdList = new Array();
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, axios_1.default({
                                method: 'post',
                                url: "" + mainUrl + config.apiList.getStatusList.url + token,
                                data: { status_list: Substate, offset: offsetis, size: sizeis }
                            })];
                    case 2:
                        data = (_a.sent()).data;
                        offsetis = data.result.next_cursor;
                        if (data.result.next_cursor !== undefined) {
                            data.result.data_list.forEach(function (el) {
                                userIdList.push(el);
                            });
                        }
                        else {
                            log(config.apiList.getStatusList.keyName + config.functiondone);
                            this.data.userIdList = userIdList;
                            return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, userIdList];
                }
            });
        });
    };
    /**
     * 不传参时,默认以最高速度获取离职员工id信息
     * @param speed 获取速度
     * @param offsetis 分页值
     * @param sizeis 单词取得数据大小
     * @param token 秘钥
     * @returns array 离职员工id信息
     */
    DD_Cli.prototype.getdimission = function (offsetis, sizeis, token) {
        return __awaiter(this, void 0, void 0, function () {
            var dimissionList, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sizeis = sizeis || 50;
                        offsetis = offsetis || 0;
                        token = token || this.AccessToken;
                        dimissionList = [];
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, axios_1.default({
                                method: 'post',
                                url: "" + mainUrl + config.apiList.getdimission.url + token,
                                data: { offset: offsetis, size: sizeis }
                            })];
                    case 2:
                        data = (_a.sent()).data;
                        offsetis = data.result.next_cursor;
                        if (data.result.next_cursor !== undefined) {
                            data.result.data_list.forEach(function (el) {
                                dimissionList.push(el);
                            });
                        }
                        else {
                            log(config.apiList.getdimission.keyName + config.functiondone);
                            this.cooldata.dimissionList = dimissionList;
                            return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, dimissionList];
                }
            });
        });
    };
    /**
     * 不传参时,函数默认调用在职(待离职也算)员工列表,并获取其id,姓名,职位,部门信息
     * @param list 员工id列表
     * @param token 秘钥
     * @returns array 返回员工部门职位,姓名和id信息
     */
    DD_Cli.prototype.getemployee = function (list, token) {
        return __awaiter(this, void 0, void 0, function () {
            var redata, api, fieldFilter, querix, data, pushData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        list = list || this.data.userIdList;
                        redata = [];
                        api = config.apiList.getemployee;
                        fieldFilter = api.fieldFilter;
                        querix = 0;
                        _a.label = 1;
                    case 1:
                        if (!(querix >= 0)) return [3 /*break*/, 4];
                        if (querix === list.length) {
                            log(api.keyName + config.functiondone);
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, axios_1.default({
                                method: 'post',
                                url: "" + mainUrl + api.url + token,
                                data: {
                                    userid_list: list[querix],
                                    field_filter_list: fieldFilter,
                                }
                            })];
                    case 2:
                        data = (_a.sent()).data;
                        if (data.success) {
                            pushData = {
                                name: data.result[0].field_list[0].value,
                                userid: data.result[0].userid,
                                branch: data.result[0].field_list[3].value,
                                place: data.result[0].field_list[1].value
                            };
                            redata.push(pushData);
                        }
                        _a.label = 3;
                    case 3:
                        querix++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (list.length === this.data.userIdList.length) {
                            this.data.employee = redata;
                        }
                        return [2 /*return*/, redata];
                }
            });
        });
    };
    /**
     * 不传参时,默认以最高速度获取在职员工每日打卡结果
     * @param offsetis 分页值,不传参默认以0开始
     * @param limitis 分页大小,也就是每一次查询时的返回数据条数,默认为50
     * @param list 员工列表,默认使用在职员工信息
     * @param token 秘钥
     * @returns array 返回在职员工打卡结果
     */
    DD_Cli.prototype.gettoDayData = function (offsetis, limitis, list, token) {
        return __awaiter(this, void 0, void 0, function () {
            var time, fromtime, totime, Ltemp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        offsetis = offsetis || 0;
                        limitis = limitis || 50;
                        list = list || this.data.userIdList;
                        token = token || this.AccessToken;
                        time = new Date().toJSON().substring(0, 10);
                        fromtime = time + ' 00:00:00';
                        totime = time + ' 23:59:59';
                        Ltemp = [];
                        return [4 /*yield*/, this.getKaoqingLists(fromtime, totime, list, this.data.employee, offsetis, limitis)];
                    case 1:
                        Ltemp = _a.sent();
                        this.daliyData = Ltemp.sort(function (item1, item2) {
                            return item1.name.localeCompare(item2.name, 'zh-CN');
                        });
                        // log(config.apiList.gettoDayData.keyName, config.functiondone)
                        return [2 /*return*/, Ltemp];
                }
            });
        });
    };
    /**
     * 返回上num周的数据,不传数据默认获取上周在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
     * @param num 获取上num周的数据默认为1,传或不传为上周数据,传2位上第二周数据
     * @param ix 暂存下标
     * @param offsetis 分页值
     * @param limitis 分页数据大小
     * @param list 员工id:名字信息表
     * @param token 秘钥
     */
    DD_Cli.prototype.getWeekData = function (num, ix, offsetis, limitis, list, token) {
        return __awaiter(this, void 0, void 0, function () {
            var lastWeek1, lastWeek2, time1, time2, Ltemp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        num = num || 1;
                        limitis = limitis || 50;
                        offsetis = offsetis || 0;
                        list = list || this.data.userIdList;
                        token = token || this.AccessToken;
                        lastWeek1 = new Moment().day(-((num * 7) - 1)).format('YYYY-MM-DD').toString();
                        lastWeek2 = new Moment().day(-((num * 7) - 7)).format('YYYY-MM-DD').toString();
                        time1 = '' + lastWeek1 + ' 00:00:00';
                        time2 = '' + lastWeek2 + ' 23:59:59';
                        Ltemp = [];
                        return [4 /*yield*/, this.getKaoqingLists(time1, time2, list, this.data.employee, offsetis, limitis)];
                    case 1:
                        Ltemp = _a.sent();
                        this.weekdata[ix] = Ltemp.sort(function (item1, item2) {
                            return item1.name.localeCompare(item2.name, 'zh-CN');
                        });
                        // log(JSON.stringify(this.weekdata))
                        log(config.apiList.getWeekData.keyName, num, ix, config.functiondone);
                        return [2 /*return*/, Ltemp];
                }
            });
        });
    };
    /**
     * 返回上num月的数据,不传数据默认获取上月在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
     * @param num 获取上num月的数据,默认为1,传或不传为上月数据,传2位上第二月数据
     * @param ix 暂存下标
     * @param offsetis 分页值
     * @param limitis 分页数据大小
     * @param list 员工id:名字信息表
     * @param token 秘钥
     */
    DD_Cli.prototype.getMoonData = function (num, ix, offsetis, limitis, list, token) {
        return __awaiter(this, void 0, void 0, function () {
            var day, Ltemp, year, month, lastMoon1, lastMoonDay, day_1, time1, time2, temp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        day = 1;
                        num = num || 1;
                        Ltemp = [];
                        limitis = limitis || 50;
                        offsetis = offsetis || 0;
                        list = list || this.data.userIdList;
                        token = token || this.AccessToken;
                        year = new Moment().format('YYYY').toString();
                        month = Number(new Moment().format('MM').toString()) - num - 1;
                        lastMoon1 = new Moment([year, month, day]).format('YYYY-MM-DD');
                        lastMoonDay = new Moment(lastMoon1).endOf('month').format('DD');
                        day_1 = 1;
                        _a.label = 1;
                    case 1:
                        if (!(day_1 < Number(lastMoonDay))) return [3 /*break*/, 4];
                        time1 = new Moment([year, month, day_1]).format('YYYY-MM-DD') + ' 00:00:00';
                        time2 = new Moment([year, month, day_1]).add(1, 'days').format('YYYY-MM-DD') + ' 23:59:59';
                        return [4 /*yield*/, this.getKaoqingLists(time1, time2, list, this.data.employee, offsetis, limitis)];
                    case 2:
                        temp = _a.sent();
                        Ltemp.push.apply(Ltemp, temp);
                        time2 = null;
                        time1 = null;
                        temp = null;
                        _a.label = 3;
                    case 3:
                        day_1++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.moondata[ix] = Ltemp.sort(function (item1, item2) {
                            return item1.name.localeCompare(item2.name, 'zh-CN');
                        });
                        log(config.apiList.getMoonData.keyName, num, ix, config.functiondone);
                        return [2 /*return*/, Ltemp];
                }
            });
        });
    };
    /**
     * 获取time1和time2之间的用户考勤信息,time1和time2最长间隔7天
     * @param useridList 用户id列表,查询考勤数据必填选项
     * @param employeeList 用户id与姓名,部门,职位等信息表,格式为数组对象[{name:name,branch:branch}]
     * @param time1 查询所需的开始时间
     * @param time2 查询所需的结束时间
     * @param offsetis 分页值,默认从0开始
     * @param limitis 单页数据大小,默认为50
     * @param apiUrl 请求的url这里似乎是固定的
     * @param start 用户id列表的查询起始值,默认从0开始
     * @param token 秘钥
     */
    DD_Cli.prototype.getKaoqingLists = function (time1, time2, useridList, employeeList, offsetis, limitis, apiUrl, start, token) {
        return __awaiter(this, void 0, void 0, function () {
            var Ltemp, data, _loop_1, this_1, _i, _a, el;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Ltemp = [];
                        start = start || 0;
                        useridList = useridList || this.data.userIdList;
                        employeeList = employeeList || this.data.employee;
                        limitis = limitis || 50;
                        offsetis = offsetis || 0;
                        token = token || this.AccessToken;
                        apiUrl = apiUrl || config.apiList.getKaoqingLists.url;
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, axios_1.default({
                                method: 'post',
                                url: "" + mainUrl + apiUrl + token,
                                data: {
                                    workDateFrom: time1,
                                    workDateTo: time2,
                                    userIdList: this.getDoubleIndex(useridList, start, start + 50),
                                    offset: offsetis,
                                    limit: limitis
                                }
                            })];
                    case 2:
                        data = (_b.sent()).data;
                        offsetis = offsetis + limitis;
                        _loop_1 = function (el) {
                            var Lname = employeeList.find(function (Lelement) {
                                if (Lelement.userid === el.userId) {
                                    return { name: Lelement.name, branch: Lelement.branch };
                                }
                            });
                            if (Lname.name === undefined) {
                                Lname.name = '未知人员或已离职人员';
                                Lname.branch = '未知人员或已离职人员';
                            }
                            var checkDate = new Date(el.baseCheckTime).toJSON().substring(5, 10).split('-');
                            var month = Number(checkDate[0]) < 10 ? '0' + Number(checkDate[0]) : Number(checkDate[0]);
                            var day = Number(checkDate[1]) < 10 ? '0' + Number(checkDate[1]) : '' + Number(checkDate[1]);
                            var temp = {
                                name: Lname.name,
                                userId: el.userId,
                                branch: Lname.branch,
                                checkType: el.checkType,
                                timeResult: el.timeResult,
                                workDay: this_1.holidayData[month + day] === undefined ? '0' : this_1.holidayData[month + day],
                                sortTime: el.userCheckTime,
                                baseCheckTime: el.baseCheckTime,
                                locationResult: el.locationResult,
                                userCheckTime: new Date(el.userCheckTime).toLocaleString()
                            };
                            Ltemp.push(temp);
                            temp = null;
                            Lname = null;
                        };
                        this_1 = this;
                        for (_i = 0, _a = data.recordresult; _i < _a.length; _i++) {
                            el = _a[_i];
                            _loop_1(el);
                        }
                        if (!data.hasMore) {
                            start += 50;
                            offsetis = 0;
                        }
                        if (!data.hasMore && start > useridList.length) {
                            return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, Ltemp];
                }
            });
        });
    };
    /**
     * 立即获取秘钥并保存在对象中
     */
    DD_Cli.prototype.getToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, Key, Secret, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, Key = _a.Key, Secret = _a.Secret;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/gettoken?appkey=" + Key + "&appsecret=" + Secret)];
                    case 1:
                        data = (_b.sent()).data;
                        if (data.access_token) {
                            log("access_token is updata");
                        }
                        else {
                            throw new Error('秘钥请求失败, 请检查秘钥或网络');
                        }
                        this.AccessToken = data.access_token;
                        return [2 /*return*/, data.access_token];
                }
            });
        });
    };
    /**
     * 每(两小时-5s)获取一次token,对象被创建时即被引用
     */
    DD_Cli.prototype.getAccessTonken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, Key, Secret, data;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = this, Key = _a.Key, Secret = _a.Secret;
                                return [4 /*yield*/, axios_1.default(mainUrl + "/gettoken?appkey=" + Key + "&appsecret=" + Secret)];
                            case 1:
                                data = (_b.sent()).data;
                                if (data.access_token) {
                                    log("access_token is updata");
                                }
                                else {
                                    throw new Error('秘钥请求失败, 请检查秘钥或网络');
                                }
                                this.AccessToken = data.access_token;
                                return [2 /*return*/, data];
                        }
                    });
                }); }, (2 * 60 * 60 * 1000) - 5000);
                return [2 /*return*/];
            });
        });
    };
    /**
       * 获取用户ID
       * @param code 授权码
       * @param token 秘钥
       */
    DD_Cli.prototype.getUserId = function (code, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/user/getuserinfo?access_token=" + token + "&code=" + code)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * 获取用户信息
     * @param userid 用户id
     * @param token 秘钥
     */
    DD_Cli.prototype.getUser = function (userid, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/user/get?access_token=" + token + "&userid=" + userid)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * 获取子部门列表
     * @param id 父部门id。根部门传1
     * @param token 秘钥
     */
    DD_Cli.prototype.childDepartment = function (id, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/department/list_ids?access_token=" + token + "&id=" + id)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * 获取部门列表
     * @param id 父部门id（如果不传，默认部门为根部门，根部门ID为1）
     * @param token 秘钥
     */
    DD_Cli.prototype.department = function (id, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/department/list?access_token=" + token + "&id=" + id)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * 查询部门的所有上级父部门路径
     * @param id 希望查询的部门的id，包含查询的部门本身
     * @param token 秘钥
     */
    DD_Cli.prototype.getAllDepartment = function (id, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/department/list_parent_depts_by_dept?access_token=" + token + "&id=" + id)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
   * 查询指定用户的所有上级父部门路径
   * @param userId 希望查询的用户的id
   * @param token 秘钥
   */
    DD_Cli.prototype.departmentListParentDepts = function (userId, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/department/list_parent_depts?access_token=" + token + "&userId=" + userId)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
    * 获取企业员工人数
    * @param onlyActive 0：包含未激活钉钉的人员数量 1：不包含未激活钉钉的人员数量
    * @param token 秘钥
    */
    DD_Cli.prototype.getOrgUserCount = function (onlyActive, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/user/get_org_user_count?access_token=" + token + "&onlyActive=" + onlyActive)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * 发送工作消息
     * @param data IMessage {
     *    @param agent_id: number; // 应用agent_id,
     *    @param userid_list: string; // 可选(userid_list,dept_id_list, to_all_user必须有一个不能为空) 最大列表长度：100
     *    @param dept_id_list?: string; // 接收者的部门id列表， 最大长度20
     *    @param to_all_user?: boolean;  // 是否发送给企业全部用户
     *    @param msg: object;  // json对象
     * }
     * @param token 秘钥
     */
    DD_Cli.prototype.setWorkerMessage = function (data, token) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default({
                                url: mainUrl + "/topapi/message/corpconversation/asyncsend_v2?access_token=" + token,
                                data: data,
                                method: 'POST'
                            })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    /**
   * 查询工作通知消息的发送进度
   * @param data ITask {
   *    @param agent_id: number; // 应用agent_id,
   *    @param task_id: number; // 发送消息时钉钉返回的任务id
   * }
   * @param token 秘钥
   */
    DD_Cli.prototype.viewWorkerMessage = function (data, token) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default({
                                url: mainUrl + "/topapi/message/corpconversation/asyncsend_v2?access_token=" + token,
                                data: data,
                                method: 'POST'
                            })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    /**
     * 查询工作通知消息的发送结果
     * @param data ITask {
     *   @param agent_id: number; // 应用agent_id,
     *   @param task_id: number; // 发送消息时钉钉返回的任务id
     * }
     * @param token 秘钥
     */
    DD_Cli.prototype.resultWorkerMessage = function (data, token) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default({
                                url: mainUrl + "/topapi/message/corpconversation/getsendresult?access_token=" + token,
                                data: data,
                                method: 'POST'
                            })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    /**
     * 创建一个审批实例
     * @param data IInstance {
     * @param  process_code: string; // 审批流的唯一码，process_code就在审批流编辑的页面URL中
     * @param  originator_user_id: string;  // 审批实例发起人的userid
     * @param  dept_id: number; // 发起人所在的部门，如果发起人属于根部门，传-1
     * @param  approvers: string; // 审批人userid列表，最大列表长度：20。
     * @param  form_component_values: any; // 审批流表单参数
     * }
     * @param token 秘钥
     */
    DD_Cli.prototype.createProcessInstance = function (data, token) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default.post(mainUrl + "/topapi/processinstance/create?access_token=" + token, data)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    /**
   * 获取审批实例
   * @param id 审批实例ID
   * @param token 秘钥
   */
    DD_Cli.prototype.getProcessInstance = function (id, token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default.post(mainUrl + "/topapi/processinstance/get?access_token=" + token, {
                                process_instance_id: id
                            })];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
    * 注册审批回调
    * @param data IRegisterCallBack{
    *    @param call_back_tag: string[]; 需要监听的事件类型
    *    @param token: 加解密需要用到的token;
    *    @param aes_key: 数据加密密钥。用于回调数据的加密，长度固定为43个字符，从a-z, A-Z, 0-9共62个字符中选取,您可以随机生成，ISV(服务提供商)推荐使用注册套件时填写的EncodingAESKey;
    *    @param url: 接收事件回调的url，必须是公网可以访问的url地址
    * }
    * @param token
    */
    DD_Cli.prototype.registerCallBack = function (data, token) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default.post(mainUrl + "/call_back/register_call_back?access_token=" + token, data)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    /**
     * 实例化crypto
     * @param token
     * @param encodingAESKey
     * @param CorpId
     */
    DD_Cli.prototype.instanceCrypto = function (data) {
        var token = data.token, encodingAESKey = data.encodingAESKey, CorpId = data.CorpId, timestamp = data.timestamp, nonce = data.nonce, userid = data.userid;
        // tslint disabled-next-line
        var Cipher = new crypto_1.default(token, encodingAESKey, CorpId);
        var text = Cipher.encrypt('success');
        // 签名文本
        var sign = Cipher.getSignature(timestamp, nonce, text);
        var result = {
            userid: userid,
            msg_signature: sign,
            timeStamp: timestamp,
            nonce: nonce,
            encrypt: text
        };
        return result;
    };
    /**
     * 获取事件回调
     * @param token 秘钥
     */
    DD_Cli.prototype.getCallBack = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/call_back/get_call_back?access_token=" + token)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * 删除回调注册事件
     * @param token 秘钥
     */
    DD_Cli.prototype.deleteCallBack = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = token || this.AccessToken;
                        return [4 /*yield*/, axios_1.default(mainUrl + "/call_back/delete_call_back?access_token=" + token)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DD_Cli.prototype.job = function (speed) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // tslint:disable-next-line: no-unused-expression
                setInterval(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.gettoDayData()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                }); }); }, speed);
                // tslint:disable-next-line: no-unused-expression
                new CronJob('0 0 */1 * *', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // 更新每日数据
                            return [4 /*yield*/, this.getStatusList()];
                            case 1:
                                // 更新每日数据
                                _a.sent();
                                return [4 /*yield*/, this.getemployee()];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, this.gettoDayData()];
                            case 3:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, null, true, 'Asia/Shanghai');
                // tslint:disable-next-line: no-unused-expression
                new CronJob('0 0 * * */7', function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: 
                            // 更新每周数据
                            return [4 /*yield*/, this.getWeekData()
                                // 离职员工信息
                            ];
                            case 1:
                                // 更新每周数据
                                _b.sent();
                                // 离职员工信息
                                _a = this.cooldata;
                                return [4 /*yield*/, this.getemployee(this.cooldata.dimissionList)];
                            case 2:
                                // 离职员工信息
                                _a.employee = _b.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, null, true, 'Asia/Shanghai');
                // tslint:disable-next-line: no-unused-expression
                new CronJob('0 0 */31 * *', function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: 
                            // 更新每月数据
                            return [4 /*yield*/, this.getMoonData()];
                            case 1:
                                // 更新每月数据
                                _b.sent();
                                return [4 /*yield*/, this.getdimission()];
                            case 2:
                                _b.sent();
                                _a = this.cooldata;
                                return [4 /*yield*/, this.getemployee(this.cooldata.dimissionList)];
                            case 3:
                                _a.employee = _b.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, null, true, 'Asia/Shanghai');
                return [2 /*return*/];
            });
        });
    };
    DD_Cli.prototype.getHoliday = function (year) {
        return __awaiter(this, void 0, void 0, function () {
            function time(year, month) {
                var tempTime = new Date(year, month, 0);
                var time = new Date();
                for (var i = 1; i <= tempTime.getDate(); i++) {
                    time.setFullYear(year, month - 1, i);
                    var day = time.getDay();
                    if (day === 6) {
                        Ltemp[(month < 10 ? '0' + month : month) + (i < 10 ? '0' + i : i)] = 6;
                    }
                    else if (day === 0) {
                        Ltemp[(month < 10 ? '0' + month : month) + (i < 10 ? '0' + i : i)] = 7;
                    }
                }
            }
            var Ltemp, data, ix;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Ltemp = {};
                        year = year || Number(new Moment().format('YYYY').toString());
                        return [4 /*yield*/, axios_1.default.get('http://tool.bitefu.net/jiari/?d=' + year)];
                    case 1:
                        data = (_a.sent()).data;
                        Ltemp = data[year];
                        for (ix = 1; ix < 13; ix++) {
                            time(year, ix);
                        }
                        log('Holiday done');
                        this.holidayData = Ltemp;
                        return [2 /*return*/, Ltemp];
                }
            });
        });
    };
    DD_Cli.prototype.destroy = function () {
        return null;
    };
    return DD_Cli;
}());
/**
 * 授权登录
 * @param accessKey 扫码登录应用的appId
 * @param appSecret 扫码登录应用的appSecret
 * @param code 临时授权码
 */
function authEncrypto(accessKey, appSecret, code) {
    return __awaiter(this, void 0, void 0, function () {
        var timestamp, signature, URL, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timestamp = +new Date();
                    signature = crypto
                        .createHmac('sha256', appSecret)
                        .update("" + timestamp)
                        .digest()
                        .toString('base64');
                    signature = encodeURIComponent(signature);
                    URL = mainUrl + "/sns/getuserinfo_bycode?accessKey=" + accessKey + "&timestamp=" + timestamp + "&signature=" + signature;
                    return [4 /*yield*/, axios_1.default.post(URL, {
                            tmp_auth_code: code
                        })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.authEncrypto = authEncrypto;
/**
* 发送钉钉通知  消息类型 https://open-doc.dingtalk.com/microapp/serverapi2/qf2nxq
* @param access_token
* @param msg
*/
function ddNotification(access_token, msg) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default({
                        url: mainUrl + "/robot/send?access_token=" + access_token,
                        data: msg,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        }
                    })];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.ddNotification = ddNotification;
var config = {
    mainUrl: 'https://oapi.dingtalk.com/',
    listen: 80,
    functiondone: ' complete',
    apiList: {
        getStatusList: {
            url: 'topapi/smartwork/hrm/employee/queryonjob?access_token=',
            status_list: '2,3,5,-1',
            keyName: 'StatusList'
        },
        getemployee: {
            url: 'topapi/smartwork/hrm/employee/list?access_token=',
            keyName: 'employee',
            fieldFilter: 'sys00-name,sys00-dept,sys00-position'
        },
        getdimission: {
            url: 'topapi/smartwork/hrm/employee/querydimission?access_token=',
            keyName: 'dimission'
        },
        gettoDayData: {
            url: 'attendance/list?access_token=',
            keyName: 'toDayData'
        },
        getWeekData: {
            url: 'attendance/list?access_token=',
            keyName: 'WeekData'
        },
        getMoonData: {
            url: 'attendance/list?access_token=',
            keyName: 'MoonData'
        },
        getKaoqingLists: {
            url: 'attendance/list?access_token='
        }
    }
};
var log = console.log;
var mainUrl = config.mainUrl;
exports.default = DD_Cli;
//# sourceMappingURL=core.js.map