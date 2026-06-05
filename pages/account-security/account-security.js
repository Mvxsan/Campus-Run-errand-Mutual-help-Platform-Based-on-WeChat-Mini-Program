// account-security.js
Page({
  data: {
    userInfo: {},
    showPasswordDialog: false,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  
  onLoad() {
    // 加载用户信息
    this.loadUserInfo()
  },
  
  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },
  
  // 跳转到编辑个人资料页面
  navigateToEditProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },
  
  // 显示密码修改弹窗
  showPasswordChangeDialog() {
    this.setData({
      showPasswordDialog: true,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  },
  
  // 隐藏密码修改弹窗
  hidePasswordChangeDialog() {
    this.setData({
      showPasswordDialog: false
    })
  },
  
  // 处理旧密码输入
  handleOldPasswordInput(e) {
    this.setData({
      oldPassword: e.detail.value
    })
  },
  
  // 处理新密码输入
  handleNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    })
  },
  
  // 处理确认密码输入
  handleConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },
  
  // 处理密码修改
  handlePasswordChange() {
    const { oldPassword, newPassword, confirmPassword, userInfo } = this.data
    
    if (!oldPassword) {
      wx.showToast({ title: '请输入当前密码', icon: 'none' })
      return
    }
    
    if (!newPassword) {
      wx.showToast({ title: '请输入新密码', icon: 'none' })
      return
    }
    
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' })
      return
    }
    
    // 验证旧密码
    wx.request({
      url: 'http://localhost:8881/api/users/login',
      method: 'POST',
      data: {
        phone: userInfo.phone,
        password: oldPassword
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 旧密码验证成功，更新密码
          this.updatePassword(newPassword)
        } else {
          wx.showToast({ title: '当前密码错误', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      }
    })
  },
  
  // 更新密码
  updatePassword(newPassword) {
    const userInfo = this.data.userInfo
    
    wx.request({
      url: 'http://localhost:8881/api/users',
      method: 'PUT',
      data: {
        id: userInfo.id,
        phone: userInfo.phone,
        password: newPassword,
        nickname: userInfo.nickname,
        avatar: userInfo.avatar
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ 
            title: '密码修改成功，请重新登录', 
            icon: 'success',
            duration: 2000
          })
          
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          // 跳转到登录页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }, 2000)
        } else {
          wx.showToast({ title: '密码修改失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      }
    })
  }
})