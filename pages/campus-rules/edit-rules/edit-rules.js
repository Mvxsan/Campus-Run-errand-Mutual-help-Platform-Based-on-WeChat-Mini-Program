// edit-rules.js
Page({
  data: {
    ruleItems: []
  },
  
  onLoad() {
    // 检查是否是管理员
    this.checkAdminPermission()
    // 加载现有规则内容
    this.loadRulesContent()
  },
  
  checkAdminPermission() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.role !== 1) {
      // 不是管理员，返回上一页
      wx.showToast({ title: '无权限编辑规则', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    }
  },
  
  loadRulesContent() {
    // 从服务器获取现有规则内容
    wx.request({
      url: 'http://localhost:8881/api/rules',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const content = res.data.content || ''
          // 将内容按换行符分割为规则项
          const ruleItems = content ? content.split('\n').filter(item => item.trim()) : []
          this.setData({
            ruleItems: ruleItems
          })
        }
      }
    })
  },
  
  // 添加规则项
  addRuleItem() {
    const { ruleItems } = this.data
    ruleItems.push('')
    this.setData({
      ruleItems: ruleItems
    })
  },
  
  // 删除规则项
  deleteRuleItem(e) {
    const index = e.currentTarget.dataset.index
    const { ruleItems } = this.data
    ruleItems.splice(index, 1)
    this.setData({
      ruleItems: ruleItems
    })
  },
  
  // 修改规则项内容
  handleRuleItemChange(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const { ruleItems } = this.data
    ruleItems[index] = value
    this.setData({
      ruleItems: ruleItems
    })
  },
  
  saveRules() {
    const { ruleItems } = this.data
    
    // 验证内容
    const nonEmptyRules = ruleItems.filter(item => item.trim())
    if (nonEmptyRules.length === 0) {
      wx.showToast({ title: '至少需要添加一条规则', icon: 'none' })
      return
    }
    
    // 将规则项合并为单个字符串，用换行符分隔
    const rulesContent = nonEmptyRules.join('\n')
    
    // 保存规则到服务器
    wx.request({
      url: 'http://localhost:8881/api/rules',
      method: 'PUT',
      data: { content: rulesContent },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '保存成功', icon: 'success' })
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      }
    })
  }
})