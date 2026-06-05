// chat.js
Page({
  data: {
    chatUser: '',
    otherUserId: '',
    otherUserAvatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    myAvatar: '',
    messages: [],
    inputValue: '',
    userId: '',
    selectedImage: null
  },
  
  onLoad(options) {
    // 获取传入的用户信息
    const otherUserId = parseInt(options.userId)
    const userName = decodeURIComponent(options.userName)
    
    // 获取当前登录用户信息
    const userInfo = wx.getStorageSync('userInfo')
    const userId = parseInt(userInfo.id)
    
    this.setData({
      chatUser: userName,
      otherUserId: otherUserId,
      myAvatar: userInfo.avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      userId: userId
    })
    
    console.log('聊天页面加载 - 当前用户ID:', userId)
    console.log('聊天页面加载 - 对方用户ID:', otherUserId)
    
    // 加载聊天记录
    this.loadChatMessages()
  },
  
  // 格式化消息时间
  formatMessageTime(timestamp) {
    const messageDate = new Date(timestamp)
    const today = new Date()
    
    // 检查是否是当天
    const isToday = messageDate.toDateString() === today.toDateString()
    
    if (isToday) {
      // 当天消息只显示时间
      return messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else {
      // 非当天消息显示完整时间
      return messageDate.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      })
    }
  },

  // 加载聊天记录
  loadChatMessages() {
    const userId = this.data.userId
    const otherUserId = this.data.otherUserId
    
    console.log('加载聊天记录 - 请求URL:', `http://localhost:8881/api/chat-records/users?userId1=${userId}&userId2=${otherUserId}`)
    
    wx.request({
      url: `http://localhost:8881/api/chat-records/users?userId1=${userId}&userId2=${otherUserId}`,
      method: 'GET',
      success: (res) => {
        console.log('加载聊天记录 - 响应状态:', res.statusCode)
        console.log('加载聊天记录 - 响应数据:', res.data)
        
        if (res.statusCode === 200 && res.data) {
          // 检查是否有对方的消息，获取对方的头像
          const otherMessages = res.data.filter(msg => msg.sender.id !== userId)
          if (otherMessages.length > 0) {
            const otherUser = otherMessages[0].sender
            if (otherUser.avatar) {
              // 检查头像URL是否为相对路径，如果是则添加完整的服务器地址
              let avatarUrl = otherUser.avatar
              // 处理临时文件路径的头像
              if (avatarUrl.includes('http://tmp/') || avatarUrl.includes('_tmp_')) {
                avatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
              } else if (avatarUrl && !avatarUrl.startsWith('http')) {
                // 检查是否已经有/api前缀
                if (avatarUrl.startsWith('/api/')) {
                  avatarUrl = 'http://localhost:8881' + avatarUrl
                } else {
                  avatarUrl = 'http://localhost:8881/api' + avatarUrl
                }
              }
              this.setData({
                otherUserAvatar: avatarUrl
              })
            }
          }
          
          const messages = res.data.map(msg => {
            let content = msg.content
            let type = 'text'
            
            // 检查消息内容是否是图片路径
            if (content.startsWith('/uploads/')) {
              // 构建完整的图片URL - 只添加一次http://localhost:8881
              content = 'http://localhost:8881/api' + content
              type = 'image'
            }
            
            return {
              id: msg.id,
              senderId: msg.sender.id,
              content: content,
              type: type,
              time: this.formatMessageTime(msg.createdAt)
            }
          })
          
          console.log('加载聊天记录 - 处理后的消息:', messages)
          
          this.setData({
            messages: messages
          })
        }
      },
      fail: (err) => {
        console.error('加载聊天记录失败:', err)
      }
    })
  },
  
  // 处理消息输入
  handleInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  
  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        
        // 检查图片大小
        wx.getFileInfo({
          filePath: tempFilePaths[0],
          success: (fileInfo) => {
            const fileSize = fileInfo.size // 单位为字节
            const maxSize = 10 * 1024 * 1024 // 10MB
            
            if (fileSize > maxSize) {
              wx.showToast({ 
                title: '图片大小不能超过10MB', 
                icon: 'none' 
              })
              return
            }
            
            this.setData({
              selectedImage: tempFilePaths[0]
            })
          }
        })
      }
    })
  },
  
  // 取消选择图片
  cancelImage() {
    this.setData({
      selectedImage: null
    })
  },
  
  // 上传图片
  uploadImage(tempFilePath) {
    wx.uploadFile({
      url: 'http://localhost:8881/api/upload',
      filePath: tempFilePath,
      name: 'file',
      success: (res) => {
        console.log('上传图片响应:', res)
        try {
          const data = JSON.parse(res.data)
          console.log('上传图片响应数据:', data)
          if (data.code === 200 && data.data) {
            const imageUrl = data.data
            this.sendImageMessage(imageUrl)
          } else {
            console.error('上传图片失败:', data)
            wx.showToast({ title: '上传图片失败', icon: 'none' })
          }
        } catch (error) {
          console.error('解析上传图片响应失败:', error)
          wx.showToast({ title: '上传图片失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('上传图片失败:', err)
        wx.showToast({ title: '上传图片失败', icon: 'none' })
      }
    })
  },
  
  // 发送图片消息
  sendImageMessage(imageUrl) {
    const userId = this.data.userId
    const otherUserId = this.data.otherUserId
    
    console.log('发送图片消息 - userId:', userId)
    console.log('发送图片消息 - otherUserId:', otherUserId)
    console.log('发送图片消息 - imageUrl:', imageUrl)
    
    // 发送图片消息到后端
    wx.request({
      url: 'http://localhost:8881/api/chat-records',
      method: 'POST',
      data: {
        senderId: userId,
        receiverId: otherUserId,
        content: imageUrl
      },
      success: (res) => {
        console.log('发送图片消息响应:', res)
        if (res.statusCode === 200) {
          console.log('发送图片消息结果:', res.data)
          // 构建完整的图片URL - 只添加一次http://localhost:8881/api
          let fullImageUrl
          if (imageUrl.startsWith('http')) {
            fullImageUrl = imageUrl
          } else if (imageUrl.startsWith('/api/')) {
            fullImageUrl = 'http://localhost:8881' + imageUrl
          } else {
            fullImageUrl = 'http://localhost:8881/api' + imageUrl
          }
          
          // 创建新消息
          const newMessage = {
            id: Date.now(), // 使用时间戳作为临时 ID
            senderId: userId,
            content: fullImageUrl,
            type: 'image',
            time: this.formatMessageTime(new Date())
          }
          
          // 更新消息列表
          const updatedMessages = [...this.data.messages, newMessage]
          this.setData({
            messages: updatedMessages,
            selectedImage: null
          })
          
          // 通知消息页面更新
          this.notifyMessagePage()
        } else {
          console.error('发送图片消息失败，服务器返回错误:', res)
          wx.showToast({ title: '发送图片失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('发送图片消息失败:', err)
        wx.showToast({ title: '发送图片失败', icon: 'none' })
      }
    })
  },
  
  // 发送消息
  handleSend() {
    const content = this.data.inputValue.trim()
    const selectedImage = this.data.selectedImage
    
    if (!content && !selectedImage) {
      return
    }
    
    const userId = this.data.userId
    const otherUserId = this.data.otherUserId
    
    // 如果选择了图片，先上传图片
    if (selectedImage) {
      this.uploadImage(selectedImage)
    } else {
      // 发送文本消息
      wx.request({
        url: 'http://localhost:8881/api/chat-records',
        method: 'POST',
        data: {
          senderId: userId,
          receiverId: otherUserId,
          content: content
        },
        success: (res) => {
          console.log('发送消息响应:', res)
          if (res.statusCode === 200) {
            console.log('发送消息结果:', res.data)
            // 无论后端返回什么，只要状态码是 200，就认为发送成功
            // 创建新消息
            const newMessage = {
              id: Date.now(), // 使用时间戳作为临时 ID
              senderId: userId,
              content: content,
              time: this.formatMessageTime(new Date())
            }
            
            // 更新消息列表
            const updatedMessages = [...this.data.messages, newMessage]
            this.setData({
              messages: updatedMessages,
              inputValue: ''
            })
            
            // 通知消息页面更新
            this.notifyMessagePage()
          } else {
            console.error('发送消息失败，服务器返回错误:', res)
          }
        },
        fail: (err) => {
          console.error('发送消息失败:', err)
        }
      })
    }
  },
  
  // 通知消息页面更新
  notifyMessagePage() {
    const app = getApp()
    if (app.globalData.messagePage) {
      app.globalData.messagePage.loadMessages()
    }
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },
  
  // 导航到用户信息页面
  navigateToUserInfo() {
    wx.navigateTo({
      url: '../user-info/user-info?userId=' + this.data.otherUserId + '&userName=' + encodeURIComponent(this.data.chatUser)
    })
  },
  
  // 处理头像加载失败
  handleAvatarError(e) {
    const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    const image = e.target
    image.src = defaultAvatar
  }
})
