import Cookies from 'js-cookie';
import { projectStatus, customerTypes, language, background, educationList, projectPass, projectTalentStatus, projectProgress } from "./constant";

export const forEach = (arr, fn) => {
  if (!arr.length || !fn) return
  let i = -1
  let len = arr.length
  while (++i < len) {
    let item = arr[i]
    fn(item, i, arr)
  }
}

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的交集, 两个数组的元素为数值或字符串
 */
export const getIntersection = (arr1, arr2) => {
  let len = Math.min(arr1.length, arr2.length)
  let i = -1
  let res = []
  while (++i < len) {
    const item = arr2[i]
    if (arr1.indexOf(item) > -1) res.push(item)
  }
  return res
}

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的并集, 两个数组的元素为数值或字符串
 */
export const getUnion = (arr1, arr2) => {
  return Array.from(new Set([...arr1, ...arr2]))
}

/**
 * @param {Array} target 目标数组
 * @param {Array} arr 需要查询的数组
 * @description 判断要查询的数组是否至少有一个元素包含在目标数组中
 */
export const hasOneOf = (targetarr, arr) => {
  return targetarr.some(_ => arr.indexOf(_) > -1)
}

/**
 * @param {String|Number} value 要验证的字符串或数值
 * @param {*} validList 用来验证的列表
 */
export function oneOf(value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true
    }
  }
  return false
}

/**
 * @param {Number} timeStamp 判断时间戳格式是否是毫秒
 * @returns {Boolean}
 */
const isMillisecond = timeStamp => {
  const timeStr = String(timeStamp)
  return timeStr.length > 10
}

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} currentTime 当前时间时间戳
 * @returns {Boolean} 传入的时间戳是否早于当前时间戳
 */
const isEarly = (timeStamp, currentTime) => {
  return timeStamp < currentTime
}

/**
 * @param {Number} num 数值
 * @returns {String} 处理后的字符串
 * @description 如果传入的数值小于10，即位数只有1位，则在前面补充0
 */
const getHandledValue = num => {
  return num < 10 ? '0' + num : num
}

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} startType 要返回的时间字符串的格式类型，传入'year'则返回年开头的完整时间
 */
export const getDate = (timeStamp, startType) => {
  debugger
  const d = new Date(timeStamp * 1000)
  const year = d.getFullYear()
  const month = getHandledValue(d.getMonth() + 1)
  const date = getHandledValue(d.getDate())
  const hours = getHandledValue(d.getHours())
  const minutes = getHandledValue(d.getMinutes())
  const second = getHandledValue(d.getSeconds())
  let resStr = ''
  if (startType === 'year') resStr = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + second
  else resStr = month + '-' + date + ' ' + hours + ':' + minutes
  return resStr
}

/**
 * @param {String|Number} timeStamp 时间戳
 * @returns {String} 相对时间字符串
 */
export const getRelativeTime = timeStamp => {
  // 判断当前传入的时间戳是秒格式还是毫秒
  const IS_MILLISECOND = isMillisecond(timeStamp)
  // 如果是毫秒格式则转为秒格式
  if (IS_MILLISECOND) Math.floor(timeStamp /= 1000)
  // 传入的时间戳可以是数值或字符串类型，这里统一转为数值类型
  timeStamp = Number(timeStamp)
  // 获取当前时间时间戳
  const currentTime = Math.floor(Date.parse(new Date()) / 1000)
  // 判断传入时间戳是否早于当前时间戳
  const IS_EARLY = isEarly(timeStamp, currentTime)
  // 获取两个时间戳差值
  let diff = currentTime - timeStamp
  // 如果IS_EARLY为false则差值取反
  if (!IS_EARLY) diff = -diff
  let resStr = ''
  const dirStr = IS_EARLY ? '前' : '后'
  // 少于等于59秒
  if (diff <= 59) resStr = diff + '秒' + dirStr
  // 多于59秒，少于等于59分钟59秒
  else if (diff > 59 && diff <= 3599) resStr = Math.floor(diff / 60) + '分钟' + dirStr
  // 多于59分钟59秒，少于等于23小时59分钟59秒
  else if (diff > 3599 && diff <= 86399) resStr = Math.floor(diff / 3600) + '小时' + dirStr
  // 多于23小时59分钟59秒，少于等于29天59分钟59秒
  else if (diff > 86399 && diff <= 2623859) resStr = Math.floor(diff / 86400) + '天' + dirStr
  // 多于29天59分钟59秒，少于364天23小时59分钟59秒，且传入的时间戳早于当前
  else if (diff > 2623859 && diff <= 31567859 && IS_EARLY) resStr = getDate(timeStamp)
  else resStr = getDate(timeStamp, 'year')
  return resStr
}

/**
 * @returns {String} 当前浏览器名称
 */
export const getExplorer = () => {
  const ua = window.navigator.userAgent
  const isExplorer = (exp) => {
    return ua.indexOf(exp) > -1
  }
  if (isExplorer('MSIE')) return 'IE'
  else if (isExplorer('Firefox')) return 'Firefox'
  else if (isExplorer('Chrome')) return 'Chrome'
  else if (isExplorer('Opera')) return 'Opera'
  else if (isExplorer('Safari')) return 'Safari'
}

/**
 * @description 绑定事件 on(element, event, handler)
 */
export const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * 判断一个对象是否存在key，如果传入第二个参数key，则是判断这个obj对象是否存在key这个属性
 * 如果没有传入key这个参数，则判断obj对象是否有键值对
 */
export const hasKey = (obj, key) => {
  if (key) return key in obj
  else {
    let keysArr = Object.keys(obj)
    return keysArr.length
  }
}

/**
 * @param {*} obj1 对象
 * @param {*} obj2 对象
 * @description 判断两个对象是否相等，这两个对象的值只能是数字或字符串
 */
export const objEqual = (obj1, obj2) => {
  const keysArr1 = Object.keys(obj1)
  const keysArr2 = Object.keys(obj2)
  if (keysArr1.length !== keysArr2.length) return false
  else if (keysArr1.length === 0 && keysArr2.length === 0) return true
  /* eslint-disable-next-line */
  else return !keysArr1.some(key => obj1[key] != obj2[key])
}

/**
 * 时间转化字符串
 */
export const getDateTime = (date) => {
  if (date) {
    date = new Date(date);
    let [year, month, day, hour, minute, second] = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    if (year == NaN) {
      return null;
    }
    month = month < 10 ? '-0' + month : '-' + month
    day = day < 10 ? '-0' + day : '-' + day;
    hour = hour < 10 ? '0' + (hour+':') : hour+':';
    minute = minute < 10 ? '0' + (minute+':') : minute+':';
    second = second < 10 ? '0' + second : second;
    return year+month+day+ ' '+hour+minute+second;
  }
  return null;
};
export const getDateTime2 = (date) => {
  if (date) {
    date = new Date(date);
    let [year, month, day, hour, minute, second] = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    if (year == NaN) {
      return null;
    }
    month = month < 10 ? '-0' + month : '-' + month
    day = day < 10 ? '-0' + day : '-' + day;
    return year+month+day;
  }
  return null;
};
export const getDateMonth = (date) => {
  if (date) {
    date = new Date(date);
    let [year, month, day, hour, minute, second] = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    if (year == NaN) {
      return null;
    }
    month = month < 10 ? '-0' + month : '-' + month
    return year + month;
  }
  return null;
};
/**
 *  renderLink
 */
export const renderLink = (h, href, text) => {
  return h('a',{
    domProps: {
      href: href,
      target: '_blank'
    }
  }, text || href)
}

// 获取普通列表render
export const getRenderList = (h, data, flag) => {
  data = getJsonArray(data);

  return !!flag
    ? h('p',{class: 'line', domProps: {title: data.join('--')}}, data.join('--'))
    : h('div', data.map(item => {
    return h('p', item)
  }))
}

// 获取登录用户id
export const getUserId = () => {
  // 判断用户是否登录
  // let userInfo = Cookies.get('userInfo')
  let userInfo = localStorage.getItem('userInfo')
  if (userInfo === null || userInfo === "" || userInfo === undefined) {
    // 未登录
    return;
  }
  return JSON.parse(userInfo).id;
}

// 根据key或许用户信息
export const getUserInfoByKey = (key) => {
  // 判断用户是否登录
  // let userInfo = Cookies.get('userInfo')
  let userInfo = localStorage.getItem('userInfo')
  if (userInfo === null || userInfo === "" || userInfo === undefined) {
    // 未登录
    return;
  }
  return JSON.parse(userInfo)[key];
}

/**
 * 前端分页获取数据
 * @param page
 * @param data
 * @param pageSize
 * @returns {*}
 */
export const getPageList = (page, data, pageSize) => {
  if (!Array.isArray(data) || !data) {
    data = [];
  }
  return data.slice((page-1)*10, page*10);
}

function getJsonArray (data) {
  if ( !data || data.toString().toUpperCase() == "NULL") {
    return [];
  }
  try {
    data = JSON.parse(data)
  } catch (e) {
    data = []
  }
  return data
}

export const jsonArray = getJsonArray;

// 获取职能render
export const getAptness = (h, data) => {
  data = getJsonArray(data) || []
  return h('p', data.map(item => {
    return h('span', {
      'class': {
        mL10: true
      }
    }, item)
  }))
}
// 获取城市render
export const getCity = (h, data) => {
  data = getJsonArray(data)
  return h('span', data.map(item => {
    return h('span', {
      'class': {
        mL5: true
      }
    }, item)
  }))
}

// 获取pagrender
export const getPagRender = (h, data) => {
  data = getJsonArray(data)
  return h('div', data.map(item => {
    return h('span', {
      'class': {
        mL5: true
      }
    }, item)
  }))
}
// 获取客户状态
export const getCustomerType = (h, data) => {
  let text = '';
  const index = customerTypes.findIndex(item => item.value == data);
  text = index > -1 ? customerTypes[index].label : '';
  if (data == 1) {
    text = '列名';
  }
  return h ? h('span', text) : text;
}
// 获取状态render
export const getStatusRender = (h, data) => {
  let text = ''
  switch (data) {
    case 1: text = '不在职看机会'; break
    case 2: text = '在职不看机会'; break
    case 3: text = '在职看机会'; break
    case 4: text = '在职急换工作'; break
    case 5: text = '半年后看机会'; break
    case 6: text = '1年后看机会'; break
    case 7: text = '2年后看机会'; break
    case 8: text = '新入职，暂时不看机会'; break
    case 9: text = '推荐给客户总监'; break
    case 10: text = '推荐给客户'; break
    case 11: text = '项目候选人';break;
  }
  return h ? h('span', text) : text;
}
// 获取项目状态
export const getProjectStatus = (h, data) => {
  let text = ''
  const index = projectStatus.findIndex(item => item.value == data);
  text = index > -1 ? projectStatus[index].label : ''
  return h ? h('span', text) : text;
}
// 过滤人才详情
export const getTalentInfoUtil = (data) => {
  let {industry, aptness, city, intentionCity} = data
  Object.assign(data, {
    industry: getJsonArray(industry),
    aptness: getJsonArray(aptness),
    city: getJsonArray(city),
    intentionCity: getJsonArray(intentionCity),
  })
  return data;
}

/**
 * 过滤客户详情
 */
export const getCustomerInfoUtil = (data) => {
  let {city, industry} = data;
  Object.assign(data, {
    city: getJsonArray(city),
    industry: getJsonArray(industry)
  })
  return data;
}

/**
 * 获取项目详情
 */
export const getProjectInfoUtil = (data) => {
  let {industry, aptness, city, matches} = data;
  Object.assign(data, {
    industry: getJsonArray(industry),
    aptness: getJsonArray(aptness),
    city: getJsonArray(city),
    matches: getJsonArray(matches)
  })
  return data;
}

// manager view 查询
export const globalSearch = (vm, name) => {
  vm.$refs[name || 'manager'].emitManagerHandler(3, {
    unFresh: true
  });
}

// util component toggleShow
export const toggleShow = (vm, key, flag) => {
  vm.$refs[key].toggleShow(flag);
};

// get role
export const getRoleName = (level) => {
  switch (level) {
    case 2: return '经理';
    case 3: return '高级顾问';
    case 4: return '中级顾问';
    case 5: return '兼职';
    case 6: return '顾问';
    case 7: return '助理';
    default: return '';
  }
}

// 获取名企背景
export const getBackground = (h, data) => {
  let text = ''
  const index = background.findIndex(item => item.value == data);
  text = index > -1 ? background[index].label : ''
  return h ? h('span', text) : text;
}

// 获取语言能力
export const getLanguage = (h, data) => {
  let text = ''
  const index = language.findIndex(item => item.value == data);
  text = index > -1 ? language[index].label : ''
  return h ? h('span', text) : text;
}

// 获取名企背景
export const getEducation = (h, data) => {
  let text = ''
  const index = educationList.findIndex(item => item.value == data);
  text = index > -1 ? educationList[index].label : ''
  return h ? h('span', text) : text;
}

// 获取保证期方式
export const getQuality = (h, data) => {
  let text = ''
  const index = projectPass.findIndex(item => item.value == data);
  text = index > -1 ? projectPass[index].label : ''
  return h ? h('span', text) : text;
}

// 获取项目人才状态
export const getProjectTalentStatus = (h, data) => {
  let text = ''
  const index = projectTalentStatus.findIndex(item => Number(item.value) == Number(data));
  text = index > -1 ? projectTalentStatus[index].label : ''
  return h ? h('span', text) : text;
}

// 获取项目人才跟踪类型
export const getProjectTalentType = (h, data) => {
  let text = ''
  const index = projectProgress.findIndex(item => Number(item.id) == Number(data));
  text = index > -1 ? projectProgress[index].name : ''
  return h ? h('span', text) : text;
}
