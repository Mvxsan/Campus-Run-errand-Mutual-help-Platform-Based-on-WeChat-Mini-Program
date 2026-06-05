Page({
  data: {
    userList: [],
    searchKeyword: ''
  },
  
  onLoad() {
    // 检查是否是管理员
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || userInfo.role !== 1) {
      wx.showToast({
        title: '权限不足，仅管理员可访问',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
      return
    }
    
    // 加载用户列表
    this.loadUserList()
  },
  
  loadUserList() {
    wx.request({
      url: 'http://localhost:8881/api/users/admin/list',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          // 过滤掉系统管理员（phone为'admin'的用户）并处理头像
          const filteredUserList = res.data.filter(user => user.phone !== 'admin').map(user => {
            user.avatar = this.processAvatar(user.avatar)
            return user
          })
          this.setData({
            userList: filteredUserList
          })
        } else {
          wx.showToast({
            title: '获取用户列表失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  processAvatar(avatar) {
    if (!avatar) {
      return 'https://img.icons8.com/color/48/000000/user.png'
    }
    if (avatar.includes('http://tmp/') || avatar.includes('_tmp_')) {
      return 'https://img.icons8.com/color/48/000000/user.png'
    }
    if (avatar.startsWith('/')) {
      if (avatar.startsWith('/api/')) {
        return 'http://localhost:8881' + avatar
      } else {
        return 'http://localhost:8881/api' + avatar
      }
    }
    return avatar
  },
  
  toggleRole(e) {
    const userId = e.currentTarget.dataset.id
    const currentRole = e.currentTarget.dataset.role
    const newRole = currentRole === 1 ? 0 : 1
    
    wx.request({
      url: `http://localhost:8881/api/users/admin/update-role/${userId}?role=${newRole}`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '角色更新成功',
            icon: 'success'
          })
          // 重新加载用户列表
          this.loadUserList()
        } else {
          wx.showToast({
            title: '角色更新失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  toggleStatus(e) {
    const userId = e.currentTarget.dataset.id
    const currentStatus = e.currentTarget.dataset.status
    const newStatus = currentStatus === 1 ? 0 : 1
    
    wx.request({
      url: `http://localhost:8881/api/users/admin/update-status/${userId}?status=${newStatus}`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '状态更新成功',
            icon: 'success'
          })
          // 重新加载用户列表
          this.loadUserList()
        } else {
          wx.showToast({
            title: res.data || '状态更新失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  deleteUser(e) {
    const userId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `http://localhost:8881/api/users/admin/delete/${userId}`,
            method: 'DELETE',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '用户删除成功',
                  icon: 'success'
                })
                // 重新加载用户列表
                this.loadUserList()
              } else {
                wx.showToast({
                  title: res.data || '用户删除失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  // 搜索用户
  handleSearch(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    
    if (!keyword.trim()) {
      // 如果关键词为空，加载全部用户
      this.loadUserList()
      return
    }
    
    // 发送搜索请求
    wx.request({
      url: `http://localhost:8881/api/users/admin/search?keyword=${encodeURIComponent(keyword)}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          // 过滤掉系统管理员（phone为'admin'的用户）并处理头像
          const filteredUserList = res.data.filter(user => user.phone !== 'admin').map(user => {
            user.avatar = this.processAvatar(user.avatar)
            return user
          })
          this.setData({
            userList: filteredUserList
          })
        } else {
          wx.showToast({
            title: '搜索失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  
  // 点击头像进入用户信息页面
  navigateToUserInfo(e) {
    const userId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/user-info/user-info?userId=${userId}`
    })
  }
})