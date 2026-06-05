// user-info.js
Page({
  data: {
    userInfo: {
      avatar: 'https://img.icons8.com/color/48/000000/user.png',
      nickname: '',
      phone: '',
      role: 0,
      likesCount: 0
    },
    userStats: {
      publishedTasks: 0,
      acceptedTasks: 0,
      completedTasks: 0
    },
    publishedTasks: [],
    userId: '',
    isFollowing: false,
    isLiked: false,
    isSelf: true,
    isAdmin: false,
    userRating: 0
  },
  
  onLoad(options) {
    // 获取传入的用户ID和用户名
    const userId = options.id || options.userId
    const userName = decodeURIComponent(options.userName)
    
    // 获取当前登录用户信息
    const currentUser = wx.getStorageSync('userInfo')
    
    // 判断是否是查看自己的主页
    let isSelf = false
    if (currentUser && currentUser.id && userId) {
      // 比较用户ID
      const currentUserId = String(currentUser.id)
      const targetUserId = String(userId)
      isSelf = currentUserId === targetUserId
    } else {
      // 如果没有传入 userId，默认为查看自己的主页
      isSelf = true
    }
    
    // 打印调试信息
    console.log('onLoad - options:', options)
    console.log('onLoad - userId:', userId)
    console.log('onLoad - currentUser:', currentUser)
    console.log('onLoad - isSelf:', isSelf)
    
    // 检查是否是管理员
    const isAdmin = currentUser && currentUser.role === 1
    
    // 设置数据
    this.setData({
      isSelf: isSelf,
      userId: userId,
      isAdmin: isAdmin
    })
    
    // 加载用户信息和关注状态
    console.log('onLoad - calling loadUserInfo')
    this.loadUserInfo()
    console.log('onLoad - calling loadUserStats')
    this.loadUserStats()
    console.log('onLoad - calling loadUserRating')
    this.loadUserRating()
    console.log('onLoad - calling loadPublishedTasks')
    this.loadPublishedTasks()
    if (!isSelf) {
      console.log('onLoad - calling checkFollowStatus')
      this.checkFollowStatus()
    }
    // 无论是否是自己的页面，都检查点赞状态
    console.log('onLoad - calling checkLikeStatus')
    this.checkLikeStatus()
  },
  
  onShow() {
    // 页面显示时重新加载评分数据
    console.log('onShow - calling loadUserRating')
    this.loadUserRating()
  },
  
  // 加载用户信息
  loadUserInfo() {
    const userId = this.data.userId
    const currentUser = wx.getStorageSync('userInfo')
    
    // 如果没有 userId 但有当前用户信息，使用当前用户的 ID
    if (!userId && currentUser && currentUser.id) {
      this.setData({
        userId: currentUser.id,
        isSelf: true
      })
    }
    
    const finalUserId = this.data.userId
    if (!finalUserId) return
    
    wx.request({
      url: `http://localhost:8881/api/users/${finalUserId}`,
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
          
          // 如果是查看自己的主页，更新本地存储
          if (this.data.isSelf) {
            wx.setStorageSync('userInfo', userInfo)
          }
          
          // 获取用户点赞数
          this.loadUserLikeCount(finalUserId, userInfo)
        }
      }
    })
  },
  
  // 加载用户点赞数
  loadUserLikeCount(userId, userInfo) {
    wx.request({
      url: `http://localhost:8881/api/likes/count/${userId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          userInfo.likesCount = res.data.count || 0
          this.setData({
            userInfo: userInfo
          })
        } else {
          // 如果获取点赞数失败，使用默认值
          userInfo.likesCount = 0
          this.setData({
            userInfo: userInfo
          })
        }
      },
      fail: () => {
        // 如果请求失败，使用默认值
        userInfo.likesCount = 0
        this.setData({
          userInfo: userInfo
        })
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
            userStats: {
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
            return {
              id: task.id,
              title: task.title || '未知任务',
              type: task.type || '未知类型',
              reward: task.reward || 0,
              status: task.status,
              cancelType: task.cancelType,
              createTime: task.createTime ? task.createTime.replace('T', ' ') : ''
            }
          })
          
          this.setData({
            publishedTasks: tasks
          })
        }
      }
    })
  },
  
  // 加载用户评分
  loadUserRating() {
    let userId = this.data.userId
    const currentUser = wx.getStorageSync('userInfo')
    
    console.log('loadUserRating - userId:', userId)
    console.log('loadUserRating - currentUser:', currentUser)
    
    // 如果没有 userId 但有当前用户信息，使用当前用户的 ID
    let finalUserId = userId
    if (!finalUserId && currentUser && currentUser.id) {
      finalUserId = currentUser.id
      console.log('loadUserRating - using current user ID:', finalUserId)
      this.setData({
        userId: finalUserId,
        isSelf: true
      })
    }
    
    if (!finalUserId) {
      console.log('loadUserRating - no userId, returning')
      return
    }
    
    console.log('loadUserRating - sending request for userId:', finalUserId)
    wx.request({
      url: `http://localhost:8881/api/reviews/user/${finalUserId}/rating`,
      method: 'GET',
      success: (res) => {
        console.log('loadUserRating - response:', res)
        if (res.statusCode === 200 && res.data !== null) {
          console.log('loadUserRating - setting userRating:', res.data)
          const rating = parseFloat(res.data)
          console.log('loadUserRating - parsed rating:', rating)
          this.setData({
            userRating: rating
          }, () => {
            console.log('loadUserRating - userRating after setData:', this.data.userRating)
          })
        }
      },
      fail: (res) => {
        console.log('loadUserRating - request failed:', res)
      }
    })
  },
  
  // 检查是否已关注
  checkFollowStatus() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    
    console.log('checkFollowStatus - currentUser:', currentUser)
    console.log('checkFollowStatus - targetUserId:', targetUserId)
    
    if (!currentUser || !currentUser.id) {
      console.log('用户未登录，跳过关注状态检查')
      return
    }
    
    console.log('发送关注状态检查请求')
    wx.request({
      url: `http://localhost:8881/api/follows/check?followerId=${parseInt(currentUser.id)}&followingId=${parseInt(targetUserId)}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        console.log('关注状态检查响应:', res)
        if (res.statusCode === 200) {
          this.setData({
            isFollowing: res.data
          })
        }
      },
      fail: (res) => {
        console.log('关注状态检查失败:', res)
        // 请求失败时不改变状态，保持默认值
      }
    })
  },
  
  // 关注用户
  handleFollow() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    
    console.log('handleFollow - currentUser:', currentUser)
    console.log('handleFollow - targetUserId:', targetUserId)
    
    if (!currentUser || !currentUser.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    // 立即更新界面状态
    this.setData({
      isFollowing: true
    })
    
    // 发送关注请求
    console.log('发送关注请求')
    wx.request({
      url: 'http://localhost:8881/api/follows',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        followerId: parseInt(currentUser.id),
        followingId: parseInt(targetUserId)
      },
      success: (res) => {
        console.log('关注请求响应:', res)
        if (res.statusCode === 200) {
          wx.showToast({ title: '关注成功', icon: 'success' })
        } else {
          // 请求失败，恢复状态
          this.setData({
            isFollowing: false
          })
          wx.showToast({ title: '关注失败', icon: 'none' })
        }
      },
      fail: (res) => {
        console.log('关注请求失败:', res)
        // 请求失败，恢复状态
        this.setData({
          isFollowing: false
        })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },
  
  // 取消关注
  handleUnfollow() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    
    console.log('handleUnfollow - currentUser:', currentUser)
    console.log('handleUnfollow - targetUserId:', targetUserId)
    
    if (!currentUser || !currentUser.id) return
    
    // 立即更新界面状态
    this.setData({
      isFollowing: false
    })
    
    // 发送取消关注请求
    console.log('发送取消关注请求')
    wx.request({
      url: `http://localhost:8881/api/follows?followerId=${parseInt(currentUser.id)}&followingId=${parseInt(targetUserId)}`,
      method: 'DELETE',
      success: (res) => {
        console.log('取消关注请求响应:', res)
        if (res.statusCode === 200) {
          wx.showToast({ title: '取消关注成功', icon: 'success' })
        } else {
          // 请求失败，恢复状态
          this.setData({
            isFollowing: true
          })
          wx.showToast({ title: '取消关注失败', icon: 'none' })
        }
      },
      fail: (res) => {
        console.log('取消关注请求失败:', res)
        // 请求失败，恢复状态
        this.setData({
          isFollowing: true
        })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },
  
  // 导航到聊天页面
  navigateToChat() {
    console.log('navigateToChat - userId:', this.data.userId)
    console.log('navigateToChat - userInfo.nickname:', this.data.userInfo.nickname)
    console.log('navigateToChat - 跳转到聊天页面')
    wx.navigateTo({
      url: '../chat/chat?userId=' + this.data.userId + '&userName=' + encodeURIComponent(this.data.userInfo.nickname),
      success: function(res) {
        console.log('跳转到聊天页面成功:', res)
      },
      fail: function(res) {
        console.log('跳转到聊天页面失败:', res)
      }
    })
  },
  
  // 导航到任务详情页面
  navigateToTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../task-detail/task-detail?id=' + taskId
    })
  },

  // 检查是否已点赞
  checkLikeStatus() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    
    if (!currentUser || !currentUser.id) {
      console.log('用户未登录，跳过点赞状态检查')
      return
    }
    
    wx.request({
      url: `http://localhost:8881/api/likes/check?userId=${parseInt(currentUser.id)}&targetUserId=${parseInt(targetUserId)}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        console.log('点赞状态检查响应:', res)
        if (res.statusCode === 200) {
          this.setData({
            isLiked: res.data.isLiked
          })
        }
      },
      fail: (res) => {
        console.log('点赞状态检查失败:', res)
        // 请求失败时不改变状态，保持默认值
      }
    })
  },

  // 处理点赞/取消点赞
  handleLike() {
    const currentUser = wx.getStorageSync('userInfo')
    const targetUserId = this.data.userId
    const currentLikesCount = this.data.userInfo.likesCount || 0
    
    if (!currentUser || !currentUser.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    // 获取当前点赞状态
    const isCurrentlyLiked = this.data.isLiked
    
    // 立即更新界面状态
    if (isCurrentlyLiked) {
      // 当前是已点赞状态，点击后取消点赞
      this.setData({
        isLiked: false,
        'userInfo.likesCount': currentLikesCount - 1
      })
    } else {
      // 当前是未点赞状态，点击后点赞
      this.setData({
        isLiked: true,
        'userInfo.likesCount': currentLikesCount + 1
      })
    }
    
    // 发送点赞请求
    wx.request({
      url: 'http://localhost:8881/api/likes/toggle',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        userId: parseInt(currentUser.id),
        targetUserId: parseInt(targetUserId)
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 服务器返回成功，使用服务器返回的数据更新状态（确保数据一致性）
          this.setData({
            isLiked: res.data.action === 'like',
            'userInfo.likesCount': res.data.likesCount
          })
          
          wx.showToast({ 
            title: res.data.action === 'like' ? '点赞成功' : '取消点赞成功', 
            icon: 'success' 
          })
        } else {
          // 请求失败，恢复状态
          this.setData({
            isLiked: isCurrentlyLiked,
            'userInfo.likesCount': currentLikesCount
          })
          wx.showToast({ title: '操作失败', icon: 'none' })
        }
      },
      fail: (res) => {
        console.log('点赞操作失败:', res)
        // 请求失败，恢复状态
        this.setData({
          isLiked: isCurrentlyLiked,
          'userInfo.likesCount': currentLikesCount
        })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },
  
  // 处理管理员角色切换
  handleToggleAdminRole(e) {
    const targetUserId = this.data.userId
    const currentRole = e.currentTarget.dataset.role
    const newRole = currentRole === 1 ? 0 : 1
    const roleText = newRole === 1 ? '升级为管理员' : '降级为普通用户'
    
    wx.showModal({
      title: '确认操作',
      content: `确定要${roleText}吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `http://localhost:8881/api/users/admin/update-role/${targetUserId}?role=${newRole}`,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({ 
                  title: roleText + '成功', 
                  icon: 'success'
                })
                // 重新加载用户信息
                this.loadUserInfo()
              } else {
                wx.showToast({ title: roleText + '失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
            }
          })
        }
      }
    })
  }
})
