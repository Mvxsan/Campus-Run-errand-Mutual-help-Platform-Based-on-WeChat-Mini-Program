// ranking.js
const { requireLogin } = require('../../utils/auth')

Page({
  data: {
    activeTab: 0, // 0: 任务完成榜, 1: 获赞榜
    taskCompletionRanking: [],
    likesRanking: [],
    refresherTriggered: false // 下拉刷新状态
  },
  
  onLoad() {
    this.loadTaskCompletionRanking()
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },
  
  // 切换标签
  switchRankingTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      activeTab: index
    })
    
    // 加载对应的数据
    if (index === 0) {
      this.loadTaskCompletionRanking()
    } else {
      this.loadLikesRanking()
    }
  },
  
  // 处理用户头像路径
  processAvatar(avatar) {
    if (!avatar) {
      return 'https://img.icons8.com/color/48/000000/user.png'
    }
    // 处理临时文件路径的头像
    if (avatar.includes('http://tmp/') || avatar.includes('_tmp_')) {
      return 'https://img.icons8.com/color/48/000000/user.png'
    }
    // 处理相对路径的头像
    if (avatar.startsWith('/')) {
      if (avatar.startsWith('/api/')) {
        return 'http://localhost:8881' + avatar
      } else {
        return 'http://localhost:8881/api' + avatar
      }
    }
    return avatar
  },
  
  // 过滤系统管理员并处理头像
  filterAdminUsers(users) {
    return users.filter(user => {
      // 只过滤掉超级管理员（phone为admin的用户）
      const isSuperAdmin = user.phone === 'admin' || user.nickname === '系统管理员' || user.nickname === 'admin'
      return !isSuperAdmin
    }).map(user => {
      // 处理头像路径
      user.avatar = this.processAvatar(user.avatar)
      return user
    })
  },
  
  // 加载任务完成榜
  loadTaskCompletionRanking() {
    wx.showLoading({ title: '加载中...' })
    
    wx.request({
      url: 'http://localhost:8881/api/reviews/ranking/task-completion',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          // 过滤掉系统管理员
          const filteredData = this.filterAdminUsers(res.data)
          this.setData({
            taskCompletionRanking: filteredData
          })
        }
      },
      fail: (err) => {
        console.error('加载任务完成榜失败:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  // 加载获赞榜
  loadLikesRanking() {
    wx.showLoading({ title: '加载中...' })
    
    console.log('开始加载获赞榜')
    wx.request({
      url: 'http://localhost:8881/api/likes/ranking',
      method: 'GET',
      success: (res) => {
        console.log('获赞榜请求成功:', res)
        if (res.statusCode === 200 && res.data && res.data.ranking) {
          console.log('获赞榜数据:', res.data.ranking)
          // 过滤掉系统管理员
          const filteredData = this.filterAdminUsers(res.data.ranking)
          this.setData({
            likesRanking: filteredData
          })
        } else {
          console.log('获赞榜数据格式不正确:', res.data)
        }
      },
      fail: (err) => {
        console.error('加载获赞榜失败:', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('开始下拉刷新')
    this.setData({ refresherTriggered: true })
    
    // 根据当前选中的标签加载对应的数据
    if (this.data.activeTab === 0) {
      this.loadTaskCompletionRanking()
    } else {
      this.loadLikesRanking()
    }
    
    // 模拟网络请求时间，然后结束刷新
    setTimeout(() => {
      this.setData({ refresherTriggered: false })
    }, 1000)
  },
  
  // 导航到用户信息页面
  navigateToUserInfo(e) {
    // 检查登录状态
    if (!requireLogin()) {
      return
    }
    
    const userId = e.currentTarget.dataset.userid
    const nickname = e.currentTarget.dataset.nickname
    console.log('navigateToUserInfo() - userId:', userId)
    console.log('navigateToUserInfo() - nickname:', nickname)
    wx.navigateTo({
      url: '/pages/user-info/user-info?userId=' + userId + '&userName=' + encodeURIComponent(nickname || ''),
      success: function(res) {
        console.log('navigateToUserInfo() - 跳转成功:', res)
      },
      fail: function(res) {
        console.log('navigateToUserInfo() - 跳转失败:', res)
      }
    })
  }
})