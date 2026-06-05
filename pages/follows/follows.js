// follows.js
Page({
  data: {
    follows: []
  },
  
  onLoad() {
    // 加载关注列表
    this.loadFollows()
  },
  
  // 加载关注列表
  loadFollows() {
    const userInfo = wx.getStorageSync('userInfo')
    console.log('userInfo:', userInfo)
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    const userId = parseInt(userInfo.id)
    console.log('userId:', userId)
    
    wx.request({
      url: `http://localhost:8881/api/follows/${userId}/following`,
      method: 'GET',
      success: (res) => {
        console.log('加载关注列表成功:', res.data)
        if (res.statusCode === 200 && res.data) {
          const follows = res.data.map(user => ({
            ...user,
            avatar: user.avatar ? 
              (user.avatar.startsWith('/') ? 
                'http://localhost:8881' + user.avatar : 
                user.avatar) : 
              'https://img.icons8.com/color/48/000000/user.png'
          }))
          this.setData({ follows })
        }
      },
      fail: (err) => {
        console.error('加载关注列表失败:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },
  
  // 导航到用户详情页
  navigateToUserInfo(e) {
    const userId = e.currentTarget.dataset.id
    const nickname = e.currentTarget.dataset.nickname
    
    wx.navigateTo({
      url: '../user-info/user-info?userId=' + userId + '&userName=' + encodeURIComponent(nickname)
    })
  },
  
  // 取消关注
  handleUnfollow(e) {
    const followingId = e.currentTarget.dataset.id
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    wx.request({
      url: `http://localhost:8881/api/follows?followerId=${parseInt(userInfo.id)}&followingId=${parseInt(followingId)}`,
      method: 'DELETE',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '取消关注成功', icon: 'success' })
          // 重新加载关注列表
          this.loadFollows()
        }
      },
      fail: (err) => {
        console.error('取消关注失败:', err)
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
    })
  }
})