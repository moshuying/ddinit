/**
 * dd-cli
 */
import axios from 'axios'
import * as crypto from 'crypto';
import DDCrypto from './crypto';
// tslint:disable-next-line: no-var-requires
const CronJob = require('cron').CronJob
// tslint:disable-next-line: no-var-requires
const Moment = require('moment')

class DD_Cli {
  public weekdata = []
  public moondata = []
  public daliyData = []
  public holidayData = {}
  public data = { userIdList: [], employee: [] }
  public cooldata = { dimissionList: [], employee: [] }

  private Key: string
  private Secret: string
  private AccessToken: string
  /**
   * 构建主要参数
   * @param {string} appKey
   * @param {string} appSecre
   * @param {number} 周数据缓存大小,默认为1,传0不缓存
   * @param {number} 月数据缓存大小,默认为1,传0不缓存
   */
  constructor(key: string, Secret: string, week?: number, moon?: number, speed?: number) {
    this.Key = key
    this.Secret = Secret
    speed = speed || 3000
    week = week || 0
    moon = moon || 0
    this.refreshen(week, moon, speed)
  }
  /**
   * 启动时刷新数据
   */
  async refreshen(week: number, moon: number, speed: number) {
    try {
      this.getAccessTonken()
      await this.getHoliday()
      await this.getToken()
      await this.getStatusList()
      await this.getemployee()
      this.job(speed)
      this.gettoDayData()
      for (let ix = 0; ix < week; ix++) {
        log(ix + config.apiList.getWeekData.keyName + 'starting')
        this.getWeekData(ix + 1, ix)
      }
      for (let ix = 0; ix < moon; ix++) {
        log(ix + config.apiList.getMoonData.keyName + 'starting')
        this.getMoonData(ix + 1, ix)
      }
      await this.getdimission()
      this.cooldata.employee = await this.getemployee(this.cooldata.dimissionList)
    } catch (e) {
      log(e)
    }
  }
  /**
   * 不传参时,默认以最高速度获取在职员工id信息
   * @param speed 获取速度
   * @param Substate 员工子状态
   * @param offsetis 分页值,默认从0开始
   * @param sizeis 单页数据大小
   * @param token 秘钥
   * @returns array 离职员工列表
   */
  async getStatusList(Substate?: string, offsetis?: string | number, sizeis?: string | number, token?: string) {
    sizeis = sizeis || 20
    offsetis = offsetis || 0
    Substate = Substate || config.apiList.getStatusList.status_list
    token = token || this.AccessToken
    const userIdList = new Array()
    while (true) {
      const { data } = await axios({
        method: 'post',
        url: `${mainUrl}${config.apiList.getStatusList.url}${token}`,
        data: { status_list: Substate, offset: offsetis, size: sizeis }
      })
      offsetis = data.result.next_cursor
      if (data.result.next_cursor !== undefined) {
        data.result.data_list.forEach((el: any) => {
          userIdList.push(el)
        })
      } else {
        log(config.apiList.getStatusList.keyName + config.functiondone)
        this.data.userIdList = userIdList
        break
      }
    }
    return userIdList
  }
  /**
   * 不传参时,默认以最高速度获取离职员工id信息
   * @param speed 获取速度
   * @param offsetis 分页值
   * @param sizeis 单词取得数据大小
   * @param token 秘钥
   * @returns array 离职员工id信息
   */
  async getdimission(offsetis?: string | number, sizeis?: string | number, token?: string) {
    sizeis = sizeis || 50
    offsetis = offsetis || 0
    token = token || this.AccessToken
    const dimissionList = []
    while (true) {
      const { data } = await axios({
        method: 'post',
        url: `${mainUrl}${config.apiList.getdimission.url}${token}`,
        data: { offset: offsetis, size: sizeis }
      })
      offsetis = data.result.next_cursor
      if (data.result.next_cursor !== undefined) {
        data.result.data_list.forEach((el: any) => {
          dimissionList.push(el)
        })
      } else {
        log(config.apiList.getdimission.keyName + config.functiondone)
        this.cooldata.dimissionList = dimissionList
        break
      }
    }
    return dimissionList
  }
  /**
   * 不传参时,函数默认调用在职(待离职也算)员工列表,并获取其id,姓名,职位,部门信息
   * @param list 员工id列表
   * @param token 秘钥
   * @returns array 返回员工部门职位,姓名和id信息
   */
  async getemployee(list?: { [x: string]: any; }, token?: string) {
    token = token || this.AccessToken
    list = list || this.data.userIdList
    const redata = []
    const api = config.apiList.getemployee
    const fieldFilter = api.fieldFilter
    for (let querix = 0; querix >= 0; querix++) {
      if (querix === list.length) {
        log(api.keyName + config.functiondone)
        break
      }
      const { data } = await axios({
        method: 'post',
        url: `${mainUrl}${api.url}${token}`,
        data: {
          userid_list: list[querix],
          field_filter_list: fieldFilter,
        }
      })
      if (data.success) {
        const pushData = {
          name: data.result[0].field_list[0].value,
          userid: data.result[0].userid,
          branch: data.result[0].field_list[3].value,
          place: data.result[0].field_list[1].value
        }
        redata.push(pushData)
      }
    }
    if (list.length === this.data.userIdList.length) {
      this.data.employee = redata
    }
    return redata
  }
  /**
   * 不传参时,默认以最高速度获取在职员工每日打卡结果
   * @param offsetis 分页值,不传参默认以0开始
   * @param limitis 分页大小,也就是每一次查询时的返回数据条数,默认为50
   * @param list 员工列表,默认使用在职员工信息
   * @param token 秘钥
   * @returns array 返回在职员工打卡结果
   */
  async gettoDayData(offsetis?: number, limitis?: number, list?: any[], token?: string) {
    offsetis = offsetis || 0
    limitis = limitis || 50
    list = list || this.data.userIdList
    token = token || this.AccessToken
    const time = new Date().toJSON().substring(0, 10)
    const fromtime = time + ' 00:00:00'
    const totime = time + ' 23:59:59'
    let Ltemp = []
    Ltemp = await this.getKaoqingLists(fromtime, totime, list, this.data.employee, offsetis, limitis)
    this.daliyData = Ltemp.sort((item1, item2) => {
      return item1.name.localeCompare(item2.name, 'zh-CN')
    })
    // log(config.apiList.gettoDayData.keyName, config.functiondone)
    return Ltemp
  }
  /**
   * 返回上num周的数据,不传数据默认获取上周在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
   * @param num 获取上num周的数据默认为1,传或不传为上周数据,传2位上第二周数据
   * @param ix 暂存下标
   * @param offsetis 分页值
   * @param limitis 分页数据大小
   * @param list 员工id:名字信息表
   * @param token 秘钥
   */
  async getWeekData(num?: number, ix?: number, offsetis?: number, limitis?: number, list?: any[], token?: string) {
    num = num || 1
    limitis = limitis || 50
    offsetis = offsetis || 0
    list = list || this.data.userIdList
    token = token || this.AccessToken
    const lastWeek1 = new Moment().day(-((num * 7) - 1)).format('YYYY-MM-DD').toString()
    const lastWeek2 = new Moment().day(-((num * 7) - 7)).format('YYYY-MM-DD').toString()
    const time1 = '' + lastWeek1 + ' 00:00:00'
    const time2 = '' + lastWeek2 + ' 23:59:59'
    let Ltemp = []
    Ltemp = await this.getKaoqingLists(time1, time2, list, this.data.employee, offsetis, limitis)
    this.weekdata[ix] = Ltemp.sort((item1, item2) => {
      return item1.name.localeCompare(item2.name, 'zh-CN')
    })
    // log(JSON.stringify(this.weekdata))
    log(config.apiList.getWeekData.keyName, num, ix, config.functiondone)
    return Ltemp
  }
  /**
   * 返回上num月的数据,不传数据默认获取上月在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
   * @param num 获取上num月的数据,默认为1,传或不传为上月数据,传2位上第二月数据
   * @param ix 暂存下标
   * @param offsetis 分页值
   * @param limitis 分页数据大小
   * @param list 员工id:名字信息表
   * @param token 秘钥
   */
  async getMoonData(num?: number, ix?: number, offsetis?: number, limitis?: number, list?: any[], token?: string) {
    const day = 1
    num = num || 1
    const Ltemp = []
    limitis = limitis || 50
    offsetis = offsetis || 0
    list = list || this.data.userIdList
    token = token || this.AccessToken
    const year = new Moment().format('YYYY').toString()
    const month = Number(new Moment().format('MM').toString()) - num - 1
    const lastMoon1 = new Moment([year, month, day]).format('YYYY-MM-DD')
    const lastMoonDay = new Moment(lastMoon1).endOf('month').format('DD')
    for (let day = 1; day < Number(lastMoonDay); day++) {
      let time1 = new Moment([year, month, day]).format('YYYY-MM-DD') + ' 00:00:00'
      let time2 = new Moment([year, month, day]).add(1, 'days').format('YYYY-MM-DD') + ' 23:59:59'
      let temp = await this.getKaoqingLists(time1, time2, list, this.data.employee, offsetis, limitis)
      Ltemp.push.apply(Ltemp, temp)
      time2 = null
      time1 = null
      temp = null
    }
    this.moondata[ix] = Ltemp.sort((item1, item2) => {
      return item1.name.localeCompare(item2.name, 'zh-CN')
    })
    log(config.apiList.getMoonData.keyName, num, ix, config.functiondone)
    return Ltemp
  }
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
  async getKaoqingLists(time1: string, time2: string, useridList?: any[], employeeList?: any[],
    offsetis?: number, limitis?: number, apiUrl?: string, start?: number, token?: string) {
    const Ltemp = []
    start = start || 0
    useridList = useridList || this.data.userIdList
    employeeList = employeeList || this.data.employee
    limitis = limitis || 50
    offsetis = offsetis || 0
    token = token || this.AccessToken
    apiUrl = apiUrl || config.apiList.getKaoqingLists.url
    while (true) {
      const { data } = await axios({
        method: 'post',
        url: `${mainUrl}${apiUrl}${token}`,
        data: {
          workDateFrom: time1,
          workDateTo: time2,
          userIdList: this.getDoubleIndex(useridList, start, start + 50),
          offset: offsetis,
          limit: limitis
        }
      })
      offsetis = offsetis + limitis
      for (const el of data.recordresult) {
        let Lname = employeeList.find((Lelement: any) => {
          if (Lelement.userid === el.userId) {
            return { name: Lelement.name, branch: Lelement.branch }
          }
        })
        if (Lname.name === undefined) {
          Lname.name = '未知人员或已离职人员'
          Lname.branch = '未知人员或已离职人员'
        }
        const checkDate = new Date(el.baseCheckTime).toJSON().substring(5, 10).split('-')
        const month = Number(checkDate[0]) < 10 ? '0' + Number(checkDate[0]) : Number(checkDate[0])
        const day = Number(checkDate[1]) < 10 ? '0' + Number(checkDate[1]) : '' + Number(checkDate[1])
        let temp = {
          name: Lname.name,
          userId: el.userId,
          branch: Lname.branch,
          checkType: el.checkType,
          timeResult: el.timeResult,
          workDay: this.holidayData[month + day] === undefined ? '0' : this.holidayData[month + day],
          sortTime: el.userCheckTime,
          baseCheckTime: el.baseCheckTime,
          locationResult: el.locationResult,
          userCheckTime: new Date(el.userCheckTime).toLocaleString()
        }
        Ltemp.push(temp)
        temp = null
        Lname = null
      }
      if (!data.hasMore) { start += 50; offsetis = 0 }
      if (!data.hasMore && start > useridList.length) { break }
    }
    return Ltemp
  }

  /**
   * 立即获取秘钥并保存在对象中
   */
  async getToken() {
    const { Key, Secret } = this
    const { data } = await axios(
      `${mainUrl}/gettoken?appkey=${Key}&appsecret=${Secret}`)
    if (data.access_token) {
      log(`access_token is updata`)
    } else {
      throw new Error('秘钥请求失败, 请检查秘钥或网络')
    }
    this.AccessToken = data.access_token
    return data.access_token
  }
  /**
   * 每(两小时-5s)获取一次token,对象被创建时即被引用
   */
  async getAccessTonken() {
    setInterval(async () => {
      const { Key, Secret } = this
      const { data } = await axios(
        `${mainUrl}/gettoken?appkey=${Key}&appsecret=${Secret}`)
      if (data.access_token) {
        log(`access_token is updata`)
      } else {
        throw new Error('秘钥请求失败, 请检查秘钥或网络')
      }
      this.AccessToken = data.access_token
      return data
    }, (2 * 60 * 60 * 1000) - 5000)
  }
  /**
     * 获取用户ID
     * @param code 授权码
     * @param token 秘钥
     */
  async getUserId(code: string, token?: string) {
    token = token || this.AccessToken
    const { data } = await axios(`${mainUrl}/user/getuserinfo?access_token=${token}&code=${code}`)
    return data
  }

  /**
   * 获取用户信息
   * @param userid 用户id
   * @param token 秘钥
   */
  async getUser(userid: string, token?: string) {
    token = token || this.AccessToken
    const { data } = await axios(`${mainUrl}/user/get?access_token=${token}&userid=${userid}`)
    return data
  }

  /**
   * 获取子部门列表
   * @param id 父部门id。根部门传1
   * @param token 秘钥
   */
  async childDepartment(id: number, token?: string) {
    token = token || this.AccessToken
    const { data } = await axios(`${mainUrl}/department/list_ids?access_token=${token}&id=${id}`)
    return data
  }

  /**
   * 获取部门列表
   * @param id 父部门id（如果不传，默认部门为根部门，根部门ID为1）
   * @param token 秘钥
   */
  async department(id: number, token?: string) {
    token = token || this.AccessToken
    const { data } = await axios(`${mainUrl}/department/list?access_token=${token}&id=${id}`)
    return data
  }

  /**
   * 查询部门的所有上级父部门路径
   * @param id 希望查询的部门的id，包含查询的部门本身
   * @param token 秘钥
   */
  async getAllDepartment(id: number, token?: string) {
    token = token || this.AccessToken
    const { data } = await axios(`${mainUrl}/department/list_parent_depts_by_dept?access_token=${token}&id=${id}`)
    return data
  }

  /**
 * 查询指定用户的所有上级父部门路径
 * @param userId 希望查询的用户的id
 * @param token 秘钥
 */
  async departmentListParentDepts(userId: string, token?: string) {
    token = token || this.AccessToken
    const { data } = await axios(`${mainUrl}/department/list_parent_depts?access_token=${token}&userId=${userId}`)
    return data
  }
  /**
  * 获取企业员工人数
  * @param onlyActive 0：包含未激活钉钉的人员数量 1：不包含未激活钉钉的人员数量
  * @param token 秘钥
  */
  async getOrgUserCount(onlyActive: number, token?: string) {
    token = token || this.AccessToken
    const { data } = await axios(`${mainUrl}/user/get_org_user_count?access_token=${token}&onlyActive=${onlyActive}`)
    return data
  }
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
  async setWorkerMessage(data: IMessage, token?: string) {
    token = token || this.AccessToken
    const res = await axios({
      url: `${mainUrl}/topapi/message/corpconversation/asyncsend_v2?access_token=${token}`,
      data,
      method: 'POST'
    })
    return res.data
  }
  /**
 * 查询工作通知消息的发送进度
 * @param data ITask {
 *    @param agent_id: number; // 应用agent_id,
 *    @param task_id: number; // 发送消息时钉钉返回的任务id
 * }
 * @param token 秘钥
 */
  async viewWorkerMessage(data: ITask, token?: string) {
    token = token || this.AccessToken
    const res = await axios({
      url: `${mainUrl}/topapi/message/corpconversation/asyncsend_v2?access_token=${token}`,
      data,
      method: 'POST'
    })
    return res.data
  }
  /**
   * 查询工作通知消息的发送结果
   * @param data ITask {
   *   @param agent_id: number; // 应用agent_id,
   *   @param task_id: number; // 发送消息时钉钉返回的任务id
   * }
   * @param token 秘钥
   */
  async resultWorkerMessage(data: ITask, token?: string) {
    token = token ||this.AccessToken
    const res = await axios({
      url: `${mainUrl}/topapi/message/corpconversation/getsendresult?access_token=${token}`,
      data,
      method: 'POST'
    })
    return res.data
  }
  
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
  async createProcessInstance(data: IInstance, token?: string) {
    token = token ||this.AccessToken
    const res = await axios.post(
      `${mainUrl}/topapi/processinstance/create?access_token=${token}`,
      data
    )
    return res.data
  }
    /**
   * 获取审批实例
   * @param id 审批实例ID
   * @param token 秘钥
   */
  async getProcessInstance(id: string, token?: string) {
    token = token ||this.AccessToken
    const { data } = await axios.post(
      `${mainUrl}/topapi/processinstance/get?access_token=${token}`,
      {
        process_instance_id: id
      }
    )
    return data
  }
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
  async registerCallBack(data: IRegisterCallBack, token?: string) {
    token = token ||this.AccessToken
    const res = await axios.post(
      `${mainUrl}/call_back/register_call_back?access_token=${token}`,
      data
    )
    return res.data
  }
  /**
   * 实例化crypto
   * @param token
   * @param encodingAESKey
   * @param CorpId
   */
  instanceCrypto(data: ICrypto) {
    const { token, encodingAESKey, CorpId, timestamp, nonce, userid } = data;
    // tslint disabled-next-line
    const Cipher: any = new DDCrypto(token, encodingAESKey, CorpId)
    const text = Cipher.encrypt('success')
    // 签名文本
    const sign = Cipher.getSignature(timestamp, nonce, text)
    const result = {
      userid,
      msg_signature: sign,
      timeStamp: timestamp,
      nonce,
      encrypt: text
    }
    return result
  }
  /**
   * 获取事件回调
   * @param token 秘钥
   */
  async getCallBack(token?: string) {
    token = token ||this.AccessToken
    const { data } = await axios(`${mainUrl}/call_back/get_call_back?access_token=${token}`)
    return data
  }
  /**
   * 删除回调注册事件
   * @param token 秘钥
   */
  async deleteCallBack(token?: string) {
    token = token ||this.AccessToken
    const { data } = await axios(`${mainUrl}/call_back/delete_call_back?access_token=${token}`)
    return data
  }
  async job(speed?: number) {
    // tslint:disable-next-line: no-unused-expression
    setInterval(async () => { await this.gettoDayData() }, speed)
    // tslint:disable-next-line: no-unused-expression
    new CronJob('0 0 */1 * *', async () => {
      // 更新每日数据
      await this.getStatusList()
      await this.getemployee()
      await this.gettoDayData()
    }, null, true, 'Asia/Shanghai')
    // tslint:disable-next-line: no-unused-expression
    new CronJob('0 0 * * */7', async () => {
      // 更新每周数据
      await this.getWeekData()
      // 离职员工信息
      this.cooldata.employee = await this.getemployee(this.cooldata.dimissionList)
    }, null, true, 'Asia/Shanghai')
    // tslint:disable-next-line: no-unused-expression
    new CronJob('0 0 */31 * *', async () => {
      // 更新每月数据
      await this.getMoonData()
      await this.getdimission()
      this.cooldata.employee = await this.getemployee(this.cooldata.dimissionList)
    }, null, true, 'Asia/Shanghai')
  }

  getDoubleIndex = (arr: { [x: string]: any; }, start: number, end: number) => {
    const temp = []
    for (let index = start; index < end; index++) {
      const element = arr[index]
      if (element === undefined) { continue }
      temp.push(element)
    }
    return temp
  }

  async getHoliday(year?: number) {
    let Ltemp = {}
    year = year || Number(new Moment().format('YYYY').toString())
    const { data } = await axios.get('http://tool.bitefu.net/jiari/?d=' + year)
    Ltemp = data[year]
    for (let ix = 1; ix < 13; ix++) {
      time(year, ix)
    }
    function time(year: any, month: any) {
      const tempTime = new Date(year, month, 0)
      const time = new Date()
      for (let i = 1; i <= tempTime.getDate(); i++) {
        time.setFullYear(year, month - 1, i)
        const day = time.getDay()
        if (day === 6) {
          Ltemp[(month < 10 ? '0' + month : month) + (i < 10 ? '0' + i : i)] = 6
        } else if (day === 0) {
          Ltemp[(month < 10 ? '0' + month : month) + (i < 10 ? '0' + i : i)] = 7
        }
      }
    }
    log('Holiday done')
    this.holidayData = Ltemp
    return Ltemp
  }
  destroy() {
    return null
  }
}
/**
 * 授权登录
 * @param accessKey 扫码登录应用的appId
 * @param appSecret 扫码登录应用的appSecret
 * @param code 临时授权码
 */
export async function authEncrypto(
  accessKey: string,
  appSecret: string,
  code: string
) {
  const timestamp = +new Date();
  let signature = crypto
    .createHmac('sha256', appSecret)
    .update(`${timestamp}`)
    .digest()
    .toString('base64');
  signature = encodeURIComponent(signature)

  const URL = `${mainUrl}/sns/getuserinfo_bycode?accessKey=${accessKey}&timestamp=${timestamp}&signature=${signature}`;
  const { data } = await axios.post(URL, {
    tmp_auth_code: code
  })
  return data
}
/**
* 发送钉钉通知  消息类型 https://open-doc.dingtalk.com/microapp/serverapi2/qf2nxq
* @param access_token
* @param msg
*/
export async function ddNotification(access_token: string, msg: any) {
 const { data } = await axios({
   url: `${mainUrl}/robot/send?access_token=${access_token}`,
   data: msg,
   method: 'POST',
   headers: {
     'Content-Type': 'application/json; charset=utf-8'
   }
 })
 return data
}
const config = {
  mainUrl: 'https://oapi.dingtalk.com/', // 钉钉的后台api链接
  listen: 80, // 开启服务器时的监听地址,建议80
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
}
interface IMessage {
  agent_id: number; // 应用agent_id,
  userid_list: string; // 可选(userid_list,dept_id_list, to_all_user必须有一个不能为空) 最大列表长度：100
  dept_id_list?: string; // 接收者的部门id列表， 最大长度20
  to_all_user?: boolean;  // 是否发送给企业全部用户
  msg: object;  // json对象
}
interface ITask {
  agent_id: number; // 应用agent_id,
  task_id: number; // 发送消息时钉钉返回的任务id
}
interface IInstance {
  process_code: string; // 审批流的唯一码，process_code就在审批流编辑的页面URL中
  originator_user_id: string;  // 审批实例发起人的userid
  dept_id: number; // 发起人所在的部门，如果发起人属于根部门，传-1
  approvers: string; // 审批人userid列表，最大列表长度：20。
  form_component_values: any; // 审批流表单参数
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
const { log } = console
const mainUrl = config.mainUrl
export default DD_Cli
