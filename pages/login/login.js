Page({
  data: {
    phone: '',
    password: ''
  },
  
  handlePhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },
  
  handleLogin() {
    const { phone, password } = this.data
    
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }
    
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }
    
    // 连接后端登录API
    wx.request({
      url: 'http://localhost:8881/api/users/login',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        phone,
        password
      },
      success: (res) => {
        console.log('登录响应:', res)
        console.log('登录响应状态码:', res.statusCode)
        console.log('登录响应数据:', res.data)
        
        // 检查是否有错误
        if (res.statusCode !== 200) {
          console.log('登录失败，状态码:', res.statusCode)
          wx.showToast({
            title: res.data?.message || res.data?.error || '登录失败',
            icon: 'none',
            duration: 3000
          })
          return
        }
        
        // 检查响应数据中是否有错误消息
        if (res.data?.message && !res.data.id) {
          console.log('登录失败:', res.data.message)
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 3000
          })
          return
        }
        
        // 登录成功，存储用户信息
        console.log('用户信息:', res.data)
        console.log('用户角色:', res.data.role)
        
        try {
          // 处理临时文件路径的头像
          const userInfo = res.data;
          if (userInfo.avatar) {
            // 处理临时文件路径的头像
            if (userInfo.avatar.includes('http://tmp/') || userInfo.avatar.includes('_tmp_')) {
              userInfo.avatar = 'https://img.icons8.com/color/48/000000/user.png';
              console.log('处理临时文件路径的头像，使用默认头像');
            }
            // 处理相对路径的头像
            else if (userInfo.avatar.startsWith('/')) {
              if (userInfo.avatar.startsWith('/api/')) {
                userInfo.avatar = 'http://localhost:8881' + userInfo.avatar;
              } else {
                userInfo.avatar = 'http://localhost:8881/api' + userInfo.avatar;
              }
              console.log('处理相对路径的头像，构建完整URL:', userInfo.avatar);
            }
          }
          wx.setStorageSync('userInfo', userInfo)
          console.log('存储userInfo成功')
          
          wx.setStorageSync('token', 'mock_token') // 实际项目中应该使用后端返回的token
          console.log('存储token成功')
          
          // 验证存储是否成功
          setTimeout(() => {
            const storedUserInfo = wx.getStorageSync('userInfo')
            console.log('存储后用户信息:', storedUserInfo)
            console.log('存储后用户角色:', storedUserInfo.role)
            
            const storedToken = wx.getStorageSync('token')
            console.log('存储后token:', storedToken)
            
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            })
            
            // 跳转到首页
            setTimeout(() => {
              console.log('准备跳转到首页')
              wx.switchTab({
                url: '/pages/index/index'
              })
            }, 1000)
          }, 100)
        } catch (error) {
          console.error('存储信息失败:', error)
          wx.showToast({
            title: '存储信息失败',
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
  
  navigateToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})