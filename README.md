钉钉官方并未提供nodejs包,第一次调用接口的时候非常费事,而且尝试去寻找相关的钉钉考勤数据模块的时候只找到了一些消息啊,只能办公啊,免登啊之类的模块,有关考勤数据的似乎没有
[关于dd的npm包中一个有较全面](https://www.npmjs.com/package/egg-dd-sdk),但是这个包似乎是egg的模块,我没有尝试单独使用

不得不说钉钉小程序的服务端api真的恶心,为了获得考勤数据要拿access_tonken然后再拿员工id列表,然后再拿员工id列表对应的员工姓名和部门,然后才能拿员工考勤数据,这个考勤数据还有限制,不能查询半年以前的,一次获取的结果还有限制,真的让人很无语,而且服务端还不支持websocket,也就是说每次查询还得
## 使用方法
**需要拿考勤信息的人请注意**因为拿下来的数据要放到内存当中处理,所以这个脚手架需要一点启动时间(100人大概3秒左右)才能拿到数据,3秒后随便调用考勤信息
如果仅仅是需要获取用户/部门信息,发送工作消息,则不需要准备时间(但是这这包会自动准备到用户id/姓名部门的对应表阶段,)


安装

> npm install ddinit

[觉得好用的话麻烦给个star吧,感激不尽](https://github.com/moshuying/dd-cli)

构建并使用,后三位选填,不填的话不会缓存周/月考勤数据,最后一位是每日考勤数据的更新速度,单位是毫秒
```javascript
  import DDdata from 'ddinit'
  const dd =  new DDdata('这里换成你的appkey', '这里换成你的appsecret', 4, 2, 500)
```
尽管这个包是用es6,7语法书写的,它仍然支持commonjs调用,这意味着你可以再例如koa2这种较为先进的node服务中使用,也可以在express中使用

[详细使用可以参照这里的示例](https://github.com/TCmoshuying/dd-cli)

## 考勤api

>**我猜你很忙,所以这里先展示核心api,另外,所有的api参数都是选填,不传参数可以使用**


构建时传入周/月数据缓存大小大于1时,会把请求结果暂存在内存中,方便开发和后续调用,使用时,直接**dd.moondata[0]**即可拿到缓存的上月数据,**dd.moondata[1]**即可拿到缓存的上2月数据,以此类推,使用**dd.weekdata[0]**获取缓存的上周的数据

**dd.daliyData[]**返回缓存的每日数据
**dd.data.userIdList[]**返回在职员工id列表,包含(2，试用期；3，正式；5，待离职；-1，无状态)
**dd.data.employee[]**返回在职员工花名册,包含(id,姓名,部门,职位)信息

**dd.cooldata.dimissionList** 返回离职员工id列表
**dd.cooldata.employee** 返回离职员工花名册,包含(id,姓名,部门,职位)信息

>月考勤数据 **dd.getMoonData()**
传入参数(
   * 返回上num月的数据,不传数据默认获取上月在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
   * @param num 获取上num月的数据,默认为1,传或不传为上月数据,传2位上第二月数据,以此类推,最多查询至半年以前
   * @param ix 暂存下标
   * @param offsetis 分页值
   * @param limitis 分页数据大小
   * @param list 员工id:名字信息表
   * @param token 秘钥
)
返回示例
```JavaScript
[
  {
    "name": "张三",
    "userId": "234567898765456",
    "branch": "法律部",
    "checkType": "OffDuty",
    "timeResult": "Normal",
    "workDay": "0",
    "sortTime": 1561111490000,
    "baseCheckTime": 1561111200000,
    "locationResult": "Normal",
    "userCheckTime": "6/21/2019, 6:04:50 PM"
  },
  {
    "name": "代成伟",
    "userId": "234567898765456",
    "branch": "法律部",
    "checkType": "OffDuty",
    "timeResult": "Normal",
    "workDay": "0",
    "sortTime": 1560506875000,
    "baseCheckTime": 1560506400000,
    "locationResult": "Normal",
    "userCheckTime": "6/14/2019, 6:07:55 PM"
  },
  ..more
```

sortTime是Unix时间戳,单位为毫秒,可以以此与baseCheckTime计算迟到时间或先到时间,加班时间等,workDay为节假日判定,0表示工作日,1-3法定节假日,67分别代表周六和周日,[其余返回值参考钉钉文档](https://ding-doc.dingtalk.com/doc#/serverapi2/ul33mm)

>周考勤数据 **dd.getWeekData()**
传入参数(
  * 返回上num周的数据,不传数据默认获取上周在职员工的打卡数据(不会解析离职员工信息,返回'已离职')
   * @param num 获取上num周的数据默认为1,传或不传为上周数据,传2位上第二周数据
   * @param ix 暂存下标
   * @param offsetis 分页值
   * @param limitis 分页数据大小
   * @param list 员工id:名字信息表
   * @param token 秘钥
)

返回类型同上

>每日考勤数据,这里根据构建时传入的更新速度自动更新**dd.gettoDayData()**
传入参数(
  * 不传参时,默认以3秒一次获取在职员工每日打卡结果
   * @param offsetis 分页值,不传参默认以0开始
   * @param limitis 分页大小,也就是每一次查询时的返回数据条数,默认为50
   * @param list 员工列表,默认使用在职员工信息
   * @param token 秘钥
   * @returns array 返回在职员工打卡结果
)

返回类型同上

>获取任意两个时间之间的用户考勤信息,最长间隔7天**dd.getKaoqingLists()**
传入参数(
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
)

返回类型同上

## 小程序相关api
这部分参考了[dd-sdk](https://www.npmjs.com/package/dd-sdk)模块
### 获取access_token

```
dd.AccessToken
```

### 获取用户ID
```
dd.getUserId(code: string, token?: string)
```

### 获取用户信息

```
dd.getUser(userid: string, token?: string)
```

### 获取子部门列表

```
dd.childDepartment(id: number, token?: string)
```

### 获取部门列表

```
dd.department(id: number, token?: string)
```

### 获取部门信息

```
dd.departmentInfo(id: number, token?: string)
```


### 查询部门的所有上级父部门路径

```
dd.getAllDepartment(id: number, token?: string)
```

### 查询指定用户的所有上级父部门路径

```
dd.departmentListParentDepts(userId: string, token?: string)
```

### 获取企业员工人数

```
dd.getOrgUserCount(onlyActive: number, token?: string)
```

### 发送工作消息

```
dd.setWorkerMessage(data: IMessage, token?: string)
```

### 查询工作通知消息的发送进度

```
dd.viewWorkerMessage(data: ITask, token?: string)
```

### 查询工作通知消息的发送结果

```
dd.resultWorkerMessage(data: ITask, token?: string)
```

### 创建一个审批实例

```
dd.createProcessInstance(data: IInstance, token?: string)
```

### 获取审批实例

```
dd.getProcessInstance(id: string, token?: string)
```

### 注册审批回调

```
dd.registerCallBack(data: IRegisterCallBack, token?: string)
```

### 注册事件回调时要实例化crypto

```
dd.instanceCrypto(data: ICrypto)
```

### 获取事件回调

```
dd.getCallBack(token?: string)
```

### 删除回调注册事件

```
dd.deleteCallBack(token?: string)
```

### 授权登录(H5微应用/第三方应用)

```
import { authEncrypto } from "dd-sdk";

authEncrypto(accessKey: string, appSecret: string, code: string)
```
