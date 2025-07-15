const cloud = require('wx-server-sdk')
const axios = require('axios')
const crypto = require('crypto')

cloud.init()

const API_KEY = '72m0D97ITm56yfVGLcSRM2tEol'; // 替换为你的key
const API_URL = 'https://api.t1qq.com/api/tool/day/paipan/bz';
// 如果你开启了签名校验，填写sk，否则留空
const SK = ''; // 没开签名校验就留空

exports.main = async (event, context) => {
  const { 
    year, 
    month, 
    day, 
    x = '0',    // 默认男性
    h = '12',   // 默认中午12点
    i = '0'     // 默认0分钟
  } = event;
  
  // 验证必填参数
  if (!year || !month || !day) {
    return {
      success: false,
      error: '缺少必要参数: year, month, day'
    };
  }
  
  // 构造API请求参数
  const params = {
    key: API_KEY,
    x,
    y: year,
    m: month,
    d: day,
    h,
    i
  };

  // 2. 构造 querystring，顺序要和 http_build_query 一致
  const querystring = Object.keys(params)
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');

  // 3. 计算 sign（如果需要）
  let sign = '';
  if (SK) {
    sign = crypto.createHash('md5').update(querystring + SK).digest('hex');
  }

  try {
    // 4. 发起 GET 请求
    const res = await axios.get(API_URL, {
      params,
      headers: sign ? { sign } : {},
      timeout: 10000
    });

    console.log('[API响应数据]', res.data); // 新增调试日志
    
    if (res.data && res.data.code === 200) {
      // 关键修改：从res.data.data中提取数据
      const { ewxtg, ewxdz } = res.data.data || {};
      
      // 检查字段是否存在（数组类型不影响解构）
      if (!ewxtg || !ewxdz) {
        return {
          success: false,
          error: 'API返回数据缺少ewxtg/ewxdz字段',
          rawData: res.data
        };
      }
      
      return {
        success: true,
        data: { ewxtg, ewxdz } // 返回正确的数据结构
      };
    } else {
      return {
        success: false,
        error: res.data.msg || 'API请求失败',
        rawData: res.data
      };
    }
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}