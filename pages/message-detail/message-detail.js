// message-detail.js
Page({
  data: {
    message: {}
  },
  
  onLoad(options) {
    const messageId = options.id
    console.log('message-detail onLoad - messageId:', messageId, 'type:', typeof messageId)
    
    // 从全局数据中获取消息数据
    const app = getApp()
    console.log('message-detail onLoad - app.globalData:', app.globalData)
    
    if (app.globalData && app.globalData.messagePage && app.globalData.messagePage.data && app.globalData.messagePage.data.allMessages) {
      const allMessages = app.globalData.messagePage.data.allMessages
      console.log('message-detail onLoad - allMessages:', allMessages)
      
      // 尝试匹配消息ID，考虑类型转换
      let message = allMessages.find(msg => {
        console.log('message-detail onLoad - checking message:', msg.id, 'type:', typeof msg.id)
        return msg.id == messageId // 使用宽松相等，自动转换类型
      })
      
      console.log('message-detail onLoad - found message:', message)
      if (message) {
        this.setData({
          message: message
        })
      } else {
        console.log('message-detail onLoad - message not found:', messageId)
        wx.showToast({ title: '消息不存在', icon: 'none' })
      }
    } else {
      console.log('message-detail onLoad - global message data not available')
      wx.showToast({ title: '消息数据不可用', icon: 'none' })
    }
  },
  
  navigateBack() {
    wx.navigateBack()
  }
})