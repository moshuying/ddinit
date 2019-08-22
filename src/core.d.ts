declare class DD_Cli {
    weekdata: any[];
    moondata: any[];
    daliyData: any[];
    holidayData: {};
    data: {
        userIdList: any[];
        employee: any[];
    };
    cooldata: {
        dimissionList: any[];
        employee: any[];
    };
    private Key;
    private Secret;
    private AccessToken;
    /**
     * 构建主要参数
     * @param {string} appKey
     * @param {string} appSecre
     * @param {number} 周数据缓存大小,默认为1,传0不缓存
     * @param {number} 月数据缓存大小,默认为1,传0不缓存
     */
    constructor(key: string, Secret: string, week?: number, moon?: number, speed?: number);
    /**
     * 启动时刷新数据
     */
    refreshen(week: number, moon: number, speed: number): Promise<void>;
    /**
     * 不传参时,默认以最高速度获取在职员工id信息
     * @param speed 获取速度
     * @param Substate 员工子状态
     * @param offsetis 分页值,默认从0开始
     * @param sizeis 单页数据大小
     * @param token 秘钥
     * @returns array 离职员工列表
     */
    getStatusList(Substate?: string, offsetis?: string | number, sizeis?: string | number, token?: string): Promise<any[]>;
    /**
     * 不传参时,默认以最高速度获取离职员工id信息
     * @param speed 获取速度
     * @param offsetis 分页值
     * @param sizeis 单词取得数据大小
     * @param token 秘钥
     * @returns array 离职员工id信息
     */
    getdimission(offsetis?: string | number, sizeis?: string | number, token?: string): Promise<any[]>;
    /**
     * 不传参时,函数默认调用在职(待离职也算)员工列表,并获取其id,姓名,职位,部门信息
     * @param list 员工id列表
     * @param token 秘钥
     * @returns array 返回员工部门职位,姓名和id信息
     */
    getemployee(list?: {
        [x: string]: any;
    }, token?: string): Promise<any[]>;
    /**
     * 不传参时,默认以最高速度获取在职员工每日打卡结果
     * @param offsetis 分页值,不传参默认以0开始
     * @param limitis 分页大小,也就是每一次查询时的返回数据条数,默认为50
     * @param list 员工列表,默认使用在职员工信息
     * @param token 秘钥
     * @returns array 返回在职员工打卡结果
     */
    gettoDayData(offsetis?: number, limitis?: number, list?: any[], token?: string): Promise<any[]>;
    /**
     * 返回上num周的数据,不传数据默认获取上周在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
     * @param num 获取上num周的数据默认为1,传或不传为上周数据,传2位上第二周数据
     * @param ix 暂存下标
     * @param offsetis 分页值
     * @param limitis 分页数据大小
     * @param list 员工id:名字信息表
     * @param token 秘钥
     */
    getWeekData(num?: number, ix?: number, offsetis?: number, limitis?: number, list?: any[], token?: string): Promise<any[]>;
    /**
     * 返回上num月的数据,不传数据默认获取上月在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
     * @param num 获取上num月的数据,默认为1,传或不传为上月数据,传2位上第二月数据
     * @param ix 暂存下标
     * @param offsetis 分页值
     * @param limitis 分页数据大小
     * @param list 员工id:名字信息表
     * @param token 秘钥
     */
    getMoonData(num?: number, ix?: number, offsetis?: number, limitis?: number, list?: any[], token?: string): Promise<any[]>;
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
    getKaoqingLists(time1: string, time2: string, useridList?: any[], employeeList?: any[], offsetis?: number, limitis?: number, apiUrl?: string, start?: number, token?: string): Promise<any[]>;
    /**
     * 立即获取秘钥并保存在对象中
     */
    getToken(): Promise<any>;
    /**
     * 每(两小时-5s)获取一次token,对象被创建时即被引用
     */
    getAccessTonken(): Promise<void>;
    /**
       * 获取用户ID
       * @param code 授权码
       * @param token 秘钥
       */
    getUserId(code: string, token?: string): Promise<any>;
    /**
     * 获取用户信息
     * @param userid 用户id
     * @param token 秘钥
     */
    getUser(userid: string, token?: string): Promise<any>;
    /**
     * 获取子部门列表
     * @param id 父部门id。根部门传1
     * @param token 秘钥
     */
    childDepartment(id: number, token?: string): Promise<any>;
    /**
     * 获取部门列表
     * @param id 父部门id（如果不传，默认部门为根部门，根部门ID为1）
     * @param token 秘钥
     */
    department(id: number, token?: string): Promise<any>;
    /**
     * 查询部门的所有上级父部门路径
     * @param id 希望查询的部门的id，包含查询的部门本身
     * @param token 秘钥
     */
    getAllDepartment(id: number, token?: string): Promise<any>;
    /**
   * 查询指定用户的所有上级父部门路径
   * @param userId 希望查询的用户的id
   * @param token 秘钥
   */
    departmentListParentDepts(userId: string, token?: string): Promise<any>;
    /**
    * 获取企业员工人数
    * @param onlyActive 0：包含未激活钉钉的人员数量 1：不包含未激活钉钉的人员数量
    * @param token 秘钥
    */
    getOrgUserCount(onlyActive: number, token?: string): Promise<any>;
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
    setWorkerMessage(data: IMessage, token?: string): Promise<any>;
    /**
   * 查询工作通知消息的发送进度
   * @param data ITask {
   *    @param agent_id: number; // 应用agent_id,
   *    @param task_id: number; // 发送消息时钉钉返回的任务id
   * }
   * @param token 秘钥
   */
    viewWorkerMessage(data: ITask, token?: string): Promise<any>;
    /**
     * 查询工作通知消息的发送结果
     * @param data ITask {
     *   @param agent_id: number; // 应用agent_id,
     *   @param task_id: number; // 发送消息时钉钉返回的任务id
     * }
     * @param token 秘钥
     */
    resultWorkerMessage(data: ITask, token?: string): Promise<any>;
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
    createProcessInstance(data: IInstance, token?: string): Promise<any>;
    /**
   * 获取审批实例
   * @param id 审批实例ID
   * @param token 秘钥
   */
    getProcessInstance(id: string, token?: string): Promise<any>;
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
    registerCallBack(data: IRegisterCallBack, token?: string): Promise<any>;
    /**
     * 实例化crypto
     * @param token
     * @param encodingAESKey
     * @param CorpId
     */
    instanceCrypto(data: ICrypto): {
        userid: string;
        msg_signature: any;
        timeStamp: number;
        nonce: string;
        encrypt: any;
    };
    /**
     * 获取事件回调
     * @param token 秘钥
     */
    getCallBack(token?: string): Promise<any>;
    /**
     * 删除回调注册事件
     * @param token 秘钥
     */
    deleteCallBack(token?: string): Promise<any>;
    job(speed?: number): Promise<void>;
    getDoubleIndex: (arr: {
        [x: string]: any;
    }, start: number, end: number) => any[];
    getHoliday(year?: number): Promise<{}>;
    destroy(): any;
}
/**
 * 授权登录
 * @param accessKey 扫码登录应用的appId
 * @param appSecret 扫码登录应用的appSecret
 * @param code 临时授权码
 */
export declare function authEncrypto(accessKey: string, appSecret: string, code: string): Promise<any>;
/**
* 发送钉钉通知  消息类型 https://open-doc.dingtalk.com/microapp/serverapi2/qf2nxq
* @param access_token
* @param msg
*/
export declare function ddNotification(access_token: string, msg: any): Promise<any>;
interface IMessage {
    agent_id: number;
    userid_list: string;
    dept_id_list?: string;
    to_all_user?: boolean;
    msg: object;
}
interface ITask {
    agent_id: number;
    task_id: number;
}
interface IInstance {
    process_code: string;
    originator_user_id: string;
    dept_id: number;
    approvers: string;
    form_component_values: any;
}
interface IRegisterCallBack {
    call_back_tag: string[];
    token: string;
    aes_key: string;
    url: string;
}
interface ICrypto {
    timestamp: number;
    nonce: string;
    token: string;
    userid: string;
    encodingAESKey: string;
    CorpId: string;
}
export default DD_Cli;
