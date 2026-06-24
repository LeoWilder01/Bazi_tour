const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init()

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const QWEN_API_KEY = 'sk-xxx'; // 替换为你的key

const TIMEOUT = 60000;

exports.main = async (event, context) => {
  const { ewxtg, ewxdz } = event;
  // 构造prompt
  const prompt = `
  你现在是一个中国传统八字命理的专业研究人员。你熟读穷通宝典，三命通会,滴天髓，渊海子平这些书籍。你熟读千里命稿，协纪辨方书，果老星宗，子平真栓，神峰通考一系列书籍。
  请根据以下八字信息，给用户找到三处具体的小众场景或者景点，（请结合互联网上的真实信息，最好是四五线的小城市里的，只有当地人才知道的小众场所），从五行、八字、命理上对该用户起到调和作用。请联系到该场所或者地区的区位、时令、场所能量、历史文化典故，给出用户在该场所适合进行的行为（例如静坐、垂钓、听流水、观月、跑步等，请举一反三而不要拘泥于我给的例子）。向用户说明你的分析过程。
八字天干: ${ewxtg}
八字地支: ${ewxdz}
请用简明易懂的语言输出。
`;

  try {
    const res = await axios.post(QWEN_API_URL, {
      model: "qwen-turbo",
      messages: [
        { role: "system", content: "你现在是一个中国传统八字命理的专业研究人员。" },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: TIMEOUT
    });

    if (res.data && res.data.choices && res.data.choices.length > 0) {
      return {
        success: true,
        suggestion: res.data.choices[0].message.content
      }
    } else {
      return {
        success: false,
        error: 'No response from Qwen'
      }
    }
  } catch (e) {
    if (e.code === 'ECONNABORTED') {
      return {
        success: false,
        error: `Request timed out after ${TIMEOUT}ms`
      };
    }
    return {
      success: false,
      error: e.message
    }
  }
}
