Page({
  data: {
    date: '',
    gender:'0',
    hour: '12',
    minute: '0',
    loading: false,
    suggestion: '',
    error: ''
  },
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },
  async onSubmit() {
    const { date, gender, hour, minute } = this.data;
    if (!date) return;
    this.setData({ loading: true, suggestion: '', error: '' });
    const [year, month, day] = date.split('-').map(Number);

    // 1. 调用云函数获取八字
    try {
      const baziRes = await wx.cloud.callFunction({
        name: 'getbazi',
        data: { year, month, day, x:gender, h:hour, i:minute}
      });
      if (!baziRes.result.success) {
        this.setData({ error: '八字API错误: ' + baziRes.result.error, loading: false });
        return;
      }
      //const { ewxtg, ewxdz } = baziRes.result.data;
      const resdata = baziRes.result.data;
      const ewxtg = resdata.ewxtg;
      const ewxdz = resdata.ewxdz;

      // 2. 调用云函数分析八字
      const analyzeRes = await wx.cloud.callFunction({
        name: 'analyzebazi',
        data: { ewxtg, ewxdz }
      });
      if (!analyzeRes.result.success) {
        this.setData({ error: '分析API错误: ' + analyzeRes.result.error, loading: false });
        return;
      }
      this.setData({ suggestion: analyzeRes.result.suggestion, loading: false });
    } catch (e) {
      this.setData({ error: '网络错误: ' + e.message, loading: false });
    }
  }
});