App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloudbase-0gbj4vjq6bb698f7', // 替换为你的云环境ID
        traceUser: true,
      })
    }
  }
})