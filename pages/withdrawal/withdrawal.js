// withdrawal.js
Page({
  data: {
    userInfo: null,
    withdrawalAmount: '',
    canWithdraw: false,
    totalIncome: 0,
    totalWithdrawal: 0
  },
  
  onLoad() {
    // 加载用户信息
    this.loadUserInfo()
    // 加载收入统计
    this.loadIncomeStats()
  },
  
  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      // 如果没有用户信息，跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/login'
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
              latestUserInfo.avatar = 'https://img.icons8.com/color/48/000000/user.png'
            } else if (latestUserInfo.avatar.startsWith('/')) {
              latestUserInfo.avatar = 'http://localhost:8881' + latestUserInfo.avatar
            }
          }
          // 更新本地存储
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
  
  // 加载收入统计
  loadIncomeStats() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) return
    
    wx.request({
      url: `http://localhost:8881/api/users/income-stats/${userInfo.id}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({
            totalIncome: res.data.totalIncome || 0,
            totalWithdrawal: res.data.totalWithdrawal || 0
          })
        }
      }
    })
  },
  
  // 跳转到收入明细页面
  navigateToIncomeDetail() {
    wx.navigateTo({
      url: '/pages/income-detail/income-detail'
    })
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },
  
  // 处理金额输入
  handleAmountInput(e) {
    const amount = e.detail.value
    this.setData({
      withdrawalAmount: amount
    })
    this.checkCanWithdraw()
  },
  
  // 检查是否可以提现
  checkCanWithdraw() {
    const amount = parseFloat(this.data.withdrawalAmount)
    const balance = parseFloat(this.data.userInfo?.balance || 0)
    const canWithdraw = !isNaN(amount) && amount > 0 && amount <= balance
    this.setData({
      canWithdraw: canWithdraw
    })
  },
  
  // 设置快速金额
  setQuickAmount(e) {
    const amount = e.currentTarget.dataset.amount
    this.setData({
      withdrawalAmount: amount
    })
    this.checkCanWithdraw()
  },
  
  // 全部提现
  withdrawAll() {
    const balance = this.data.userInfo?.balance || 0
    this.setData({
      withdrawalAmount: balance.toString()
    })
    this.checkCanWithdraw()
  },
  
  // 处理提现
  handleWithdrawal() {
    const amount = parseFloat(this.data.withdrawalAmount)
    const balance = parseFloat(this.data.userInfo?.balance || 0)
    const userInfo = wx.getStorageSync('userInfo')
    
    // 验证金额
    if (isNaN(amount) || amount <= 0) {
      wx.showToast({
        title: '请输入有效的提现金额',
        icon: 'none'
      })
      return
    }
    
    if (amount > balance) {
      wx.showToast({
        title: '提现金额不能大于可用余额',
        icon: 'none'
      })
      return
    }
    
    // 调用后端提现接口
    wx.showLoading({ title: '处理中...' })
    
    wx.request({
      url: `http://localhost:8881/api/users/${userInfo.id}/withdraw`,
      method: 'POST',
      data: {
        amount: amount
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          // 更新本地用户信息
          const updatedUserInfo = { ...this.data.userInfo }
          updatedUserInfo.balance = res.data.newBalance
          wx.setStorageSync('userInfo', updatedUserInfo)
          
          // 显示成功提示
          wx.showToast({
            title: '提现申请成功',
            icon: 'success'
          })
          
          // 延迟后返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          // 显示错误信息
          wx.showToast({
            title: res.data?.message || '提现失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
    })
  }
})