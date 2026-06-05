// follows.js
Page({
  data: {
    followingList: []
  },
  
  onLoad() {
    // 加载关注列表
    this.loadFollowingList()
  },
  
  navigateBack() {
    wx.navigateBack()
  },
  
  // 加载关注列表
  loadFollowingList() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    wx.request({
      url: `http://localhost:8881/api/follows/${userInfo.id}/following`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const followingList = res.data.map(user => {
            // 处理头像路径
            if (user.avatar) {
              if (user.avatar.includes('http://tmp/') || user.avatar.includes('_tmp_')) {
                user.avatar = 'https://img.icons8.com/color/48/000000/user.png'
              } else if (user.avatar.startsWith('/')) {
                user.avatar = 'http://localhost:8881' + user.avatar
              }
            }
            return user
          })
          
          this.setData({
            followingList: followingList
          })
        }
      }
    })
  },
  
  // 跳转到用户主页
  navigateToUserProfile(e) {
    const userId = e.currentTarget.dataset.userId
    const userName = e.currentTarget.dataset.userName
    console.log('导航到用户主页 - userId:', userId)
    console.log('导航到用户主页 - userName:', userName)
    if (userId && userName) {
      wx.navigateTo({
        url: '/pages/user-info/user-info?userId=' + userId + '&userName=' + encodeURIComponent(userName),
        success: function(res) {
          console.log('导航成功:', res)
        },
        fail: function(res) {
          console.log('导航失败:', res)
        }
      })
    } else {
      wx.showToast({ title: '获取用户信息失败', icon: 'none' })
    }
  },
  
  // 取消关注
  handleUnfollow(e) {
    // 阻止事件冒泡
    if (e.stopPropagation) {
      e.stopPropagation()
    }
    
    const userId = e.currentTarget.dataset.userId
    const currentUser = wx.getStorageSync('userInfo')
    
    console.log('取消关注 - userId:', userId)
    console.log('取消关注 - currentUser:', currentUser)
    
    if (!currentUser || !currentUser.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    if (!userId) {
      wx.showToast({ title: '获取用户信息失败', icon: 'none' })
      return
    }
    
    wx.showModal({
      title: '取消关注',
      content: '确定要取消关注该用户吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `http://localhost:8881/api/follows?followerId=${currentUser.id}&followingId=${userId}`,
            method: 'DELETE',
            success: (res) => {
              console.log('取消关注请求响应:', res)
              if (res.statusCode === 200) {
                wx.showToast({ title: '取消关注成功', icon: 'success' })
                // 重新加载关注列表
                this.loadFollowingList()
              } else {
                wx.showToast({ title: '取消关注失败', icon: 'none' })
              }
            },
            fail: (err) => {
              console.log('取消关注请求失败:', err)
              wx.showToast({ title: '网络请求失败', icon: 'none' })
            }
          })
        }
      }
    })
  }
})
