// mine.js
Page({
  data: {
    userInfo: null,
    stats: {
      publishedTasks: 0,
      acceptedTasks: 0,
      completedTasks: 0,
      disabledTasks: 0
    },
    userRating: 0,
    refresherTriggered: false // 下拉刷新状态
  },
  
  onLoad() {
    // 加载用户信息
    this.loadUserInfo()
    // 加载统计信息
    this.loadStats()
    // 加载用户评分
    this.loadUserRating()
  },
  
  onShow() {
    // 每次页面显示时重新加载用户信息和统计信息，确保数据及时更新
    this.loadUserInfo()
    this.loadStats()
    this.loadUserRating()
  },
  
  loadUserInfo() {
    // 先从本地存储获取基础信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      // 如果没有用户信息，保持userInfo为null，显示登录提示
      this.setData({
        userInfo: null
      })
      return
    }
    
    // 从后端获取最新的用户信息
    wx.request({
      url: `http://localhost:8881/api/users/${userInfo.id}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          let latestUserInfo = res.data
          // 处理头像路径
          if (latestUserInfo.avatar) {
            if (latestUserInfo.avatar.includes('http://tmp/') || latestUserInfo.avatar.includes('_tmp_')) {
              latestUserInfo.avatar = 'https://img.icons8.com/color/48/000000/user.png';
            } else if (latestUserInfo.avatar.startsWith('/')) {
              latestUserInfo.avatar = 'http://localhost:8881' + latestUserInfo.avatar;
            }
          }
          // 更新本地存储和页面数据
          wx.setStorageSync('userInfo', latestUserInfo)
          this.setData({
            userInfo: latestUserInfo
          })
        }
      },
      fail: () => {
        // 如果请求失败，使用本地存储的用户信息
        this.setData({
          userInfo: userInfo
        })
      }
    })
  },
  
  navigateToLogin() {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  
  loadStats() {
    // 获取当前登录用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      this.setData({
        stats: {
          publishedTasks: 0,
          acceptedTasks: 0,
          completedTasks: 0
        }
      })
      return
    }
    
    // 检查是否是系统管理员（phone为'admin'）
    if (userInfo.phone === 'admin' && userInfo.role === 1) {
      // 系统管理员加载所有用户的任务总和
      this.loadAdminStats()
    } else {
      // 普通用户和其他管理员加载个人任务统计
      this.loadUserStats(userInfo.id)
    }
  },
  
  // 加载管理员统计数据（所有用户的任务总和）
  loadAdminStats() {
    // 调用后端API获取所有用户的任务总和
    wx.request({
      url: 'http://localhost:8881/api/tasks/stats',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({
            stats: {
              publishedTasks: res.data.publishedTasks || 0,
              acceptedTasks: res.data.acceptedTasks || 0,
              completedTasks: res.data.completedTasks || 0,
              disabledTasks: res.data.disabledTasks || 0
            }
          })
        } else {
          this.setData({
            stats: {
              publishedTasks: 0,
              acceptedTasks: 0,
              completedTasks: 0,
              disabledTasks: 0
            }
          })
        }
      },
      fail: () => {
        this.setData({
          stats: {
            publishedTasks: 0,
            acceptedTasks: 0,
            completedTasks: 0,
            disabledTasks: 0
          }
        })
      }
    })
  },
  
  // 加载普通用户统计数据
  loadUserStats(userId) {
    // 使用后端统计API获取数据
    wx.request({
      url: `http://localhost:8881/api/users/stats/${userId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({
            stats: {
              publishedTasks: res.data.publishedTasks || 0,
              acceptedTasks: res.data.acceptedTasks || 0,
              completedTasks: res.data.completedTasks || 0,
              disabledTasks: 0
            }
          })
        } else {
          this.setData({
            stats: {
              publishedTasks: 0,
              acceptedTasks: 0,
              completedTasks: 0,
              disabledTasks: 0
            }
          })
        }
      },
      fail: () => {
        this.setData({
          stats: {
            publishedTasks: 0,
            acceptedTasks: 0,
            completedTasks: 0,
            disabledTasks: 0
          }
        })
      }
    })
  },
  
  navigateToUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    console.log('点击用户信息区域，获取到的用户信息:', userInfo)
    if (userInfo) {
      console.log('用户已登录，跳转到用户信息页面')
      wx.navigateTo({
        url: '/pages/user-info/user-info?id=' + userInfo.id + '&userName=' + encodeURIComponent(userInfo.nickname || userInfo.phone),
        success: function(res) {
          console.log('跳转到用户信息页面成功')
        },
        fail: function(res) {
          console.log('跳转到用户信息页面失败:', res)
        }
      })
    } else {
      console.log('用户未登录，跳转到登录页面')
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  
  navigateToMyOrders() {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  
  navigateToAccountSecurity() {
    wx.navigateTo({
      url: '../account-security/account-security'
    })
  },
  
  navigateToAdmin() {
    wx.navigateTo({
      url: '../admin/admin'
    })
  },
  
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          wx.showToast({
            title: '退出成功',
            icon: 'success'
          })
          
          // 跳转到登录页面
          setTimeout(() => {
            wx.navigateTo({
              url: '../login/login'
            })
          }, 1000)
        }
      }
    })
  },
  
  // 处理我的关注
  handleMyFollow() {
    wx.navigateTo({
      url: '../follows/follows'
    })
  },
  
  // 处理我的评价
  handleMyEvaluation() {
    wx.navigateTo({
      url: '../my-evaluations/my-evaluations'
    })
  },
  
  // 处理我的点赞
  handleMyLikes() {
    wx.navigateTo({
      url: '../my-likes/my-likes'
    })
  },
  
  // 处理帮助中心
  handleHelpCenter() {
    wx.showToast({
      title: '帮助中心',
      icon: 'none'
    })
  },
  
  // 处理校园互助规则
  handleCampusRules() {
    console.log('点击了校园互助规则选项')
    // 检查是否是系统管理员（phone为'admin'）
    const userInfo = wx.getStorageSync('userInfo')
    console.log('获取到的用户信息:', userInfo)
    if (userInfo && userInfo.phone === 'admin' && userInfo.role === 1) {
      console.log('用户是系统管理员，跳转到编辑页面')
      // 系统管理员直接进入编辑页面
      wx.navigateTo({
        url: '/pages/campus-rules/edit-rules/edit-rules',
        success: function(res) {
          console.log('跳转到编辑页面成功')
        },
        fail: function(res) {
          console.log('跳转到编辑页面失败:', res)
        }
      })
    } else {
      console.log('用户不是系统管理员，跳转到查看页面')
      // 普通用户和其他管理员进入查看页面
      wx.navigateTo({
        url: '/pages/campus-rules/campus-rules',
        success: function(res) {
          console.log('跳转到查看页面成功')
        },
        fail: function(res) {
          console.log('跳转到查看页面失败:', res)
        }
      })
    }
  },
  
  // 处理联系客服 - 跳转到预设管理员admin的聊天对话框
  handleContactService() {
    // 预设管理员admin的ID是3（根据数据库初始化数据）
    wx.navigateTo({
      url: '/pages/chat/chat?userId=3&userName=' + encodeURIComponent('系统管理员'),
      success: function(res) {
        console.log('跳转到管理员聊天页面成功')
      },
      fail: function(res) {
        console.log('跳转到管理员聊天页面失败:', res)
      }
    })
  },
  
  // 导航到提现页面
  navigateToWithdrawal() {
    wx.navigateTo({
      url: '/pages/withdrawal/withdrawal',
      success: function(res) {
        console.log('跳转到提现页面成功')
      },
      fail: function(res) {
        console.log('跳转到提现页面失败:', res)
      }
    })
  },
  
  // 导航到排行榜页面
  navigateToRanking() {
    wx.navigateTo({
      url: '/pages/ranking/ranking',
      success: function(res) {
        console.log('跳转到排行榜页面成功')
      },
      fail: function(res) {
        console.log('跳转到排行榜页面失败:', res)
      }
    })
  },
  
  // 导航到账号与安全页面
  navigateToAccountSecurity() {
    wx.navigateTo({
      url: '/pages/account-security/account-security',
      success: function(res) {
        console.log('跳转到账号与安全页面成功')
      },
      fail: function(res) {
        console.log('跳转到账号与安全页面失败:', res)
      }
    })
  },
  
  // 导航到用户管理页面
  navigateToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/admin',
      success: function(res) {
        console.log('跳转到用户管理页面成功')
      },
      fail: function(res) {
        console.log('跳转到用户管理页面失败:', res)
      }
    })
  },

  // 加载用户评分
  loadUserRating() {
    // 获取当前登录用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      this.setData({
        userRating: 0
      })
      return
    }
    
    wx.request({
      url: `http://localhost:8881/api/reviews/user/${userInfo.id}/rating`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data !== null) {
          // 确保userRating是一个数字类型
          const rating = parseFloat(res.data)
          this.setData({
            userRating: rating
          })
        }
      }
    })
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    console.log('开始下拉刷新')
    this.setData({ refresherTriggered: true })
    
    // 重新加载用户信息和统计数据
    this.loadUserInfo()
    this.loadStats()
    this.loadUserRating()
    
    // 模拟网络请求时间，然后结束刷新
    setTimeout(() => {
      this.setData({ refresherTriggered: false })
    }, 1000)
  }
})