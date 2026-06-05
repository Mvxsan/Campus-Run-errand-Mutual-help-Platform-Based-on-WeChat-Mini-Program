// user-profile.js
Page({
  data: {
    userId: null,
    userInfo: {
      id: '',
      nickname: '',
      avatar: 'https://img.icons8.com/color/48/000000/user.png'
    },
    stats: {
      publishedTasks: 0,
      acceptedTasks: 0,
      completedTasks: 0
    },
    publishedTasks: [],
    isFollowing: false
  },
  
  onLoad(options) {
    console.log('用户主页加载，参数:', options)
    if (options.userId) {
      this.setData({
        userId: options.userId
      })
      // 加载用户信息
      this.loadUserInfo()
      // 加载用户统计数据
      this.loadUserStats()
      // 加载用户发布的任务
      this.loadPublishedTasks()
      // 检查是否已关注
      this.checkFollowStatus()
    }
  },
  
  navigateBack() {
    wx.navigateBack()
  },
  
  // 加载用户信息
  loadUserInfo() {
    const userId = this.data.userId
    if (!userId) return
    
    wx.request({
      url: `http://localhost:8881/api/users/${userId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          let userInfo = res.data
          // 处理头像路径
          if (userInfo.avatar) {
            if (userInfo.avatar.includes('http://tmp/') || userInfo.avatar.includes('_tmp_')) {
              userInfo.avatar = 'https://img.icons8.com/color/48/000000/user.png'
            } else if (userInfo.avatar.startsWith('/')) {
              userInfo.avatar = 'http://localhost:8881' + userInfo.avatar
            }
          }
          this.setData({
            userInfo: userInfo
          })
        }
      }
    })
  },
  
  // 加载用户统计数据
  loadUserStats() {
    const userId = this.data.userId
    if (!userId) return
    
    wx.request({
      url: `http://localhost:8881/api/users/stats/${userId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({
            stats: {
              publishedTasks: res.data.publishedTasks || 0,
              acceptedTasks: res.data.acceptedTasks || 0,
              completedTasks: res.data.completedTasks || 0
            }
          })
        }
      }
    })
  },
  
  // 加载用户发布的任务
  loadPublishedTasks() {
    const userId = this.data.userId
    if (!userId) return
    
    wx.request({
      url: `http://localhost:8881/api/tasks/publisher/${userId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const tasks = res.data.map(task => {
            // 转换状态码为状态名称
            let statusText = ''
            switch (task.status) {
              case 0:
                statusText = '待接单'
                break
              case 1:
                statusText = '已接单'
                break
              case 2:
                statusText = '已取货'
                break
              case 3:
                statusText = '已送达'
                break
              case 4:
                statusText = '已完成'
                break
              case 5:
                statusText = '已取消'
                break
              default:
                statusText = '未知状态'
            }
            
            return {
              id: task.id,
              title: task.title || '未知任务',
              type: task.type || '未知类型',
              reward: task.reward || 0,
              status: statusText,
              createTime: task.createTime || ''
            }
          })
          
          this.setData({
            publishedTasks: tasks
          })
        }
      }
    })
  },
  
  // 检查是否已关注
  checkFollowStatus() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    
    if (!currentUser || !currentUser.id) return
    
    wx.request({
      url: `http://localhost:8881/api/follows/check?followerId=${currentUser.id}&followingId=${targetUserId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            isFollowing: res.data
          })
        }
      }
    })
  },
  
  // 关注用户
  handleFollow() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    
    if (!currentUser || !currentUser.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    wx.request({
      url: 'http://localhost:8881/api/follows',
      method: 'POST',
      data: {
        followerId: currentUser.id,
        followingId: targetUserId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '关注成功', icon: 'success' })
          this.setData({
            isFollowing: true
          })
        }
      }
    })
  },
  
  // 取消关注
  handleUnfollow() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    
    if (!currentUser || !currentUser.id) return
    
    wx.request({
      url: `http://localhost:8881/api/follows?followerId=${currentUser.id}&followingId=${targetUserId}`,
      method: 'DELETE',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '取消关注成功', icon: 'success' })
          this.setData({
            isFollowing: false
          })
        }
      }
    })
  },
  
  // 跳转到任务详情
  navigateToTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    })
  }
})
