// campus-rules.js
Page({
  data: {
    ruleItems: [],
    updateTime: '未知',
    isAdmin: false
  },
  
  onLoad() {
    // 检查登录状态和用户角色
    this.checkLoginStatus()
    // 加载规则内容
    this.loadRulesContent()
  },
  
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.role === 1) {
      this.setData({ isAdmin: true })
    }
  },
  
  loadRulesContent() {
    // 从服务器获取规则内容
    wx.request({
      url: 'http://localhost:8881/api/rules',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const content = res.data.content || ''
          // 将内容按换行符分割为规则项
          const ruleItems = content ? content.split('\n').filter(item => item.trim()) : []
          this.setData({
            ruleItems: ruleItems,
            updateTime: res.data.updateTime || '未知'
          })
        }
      },
      fail: () => {
        // 如果获取失败，使用默认内容
        this.setData({
          ruleItems: [],
          updateTime: '未知'
        })
      }
    })
  },
  
  navigateToEditRules() {
    // 跳转到编辑规则页面
    wx.navigateTo({
      url: './edit-rules'
    })
  }
})