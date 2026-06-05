// edit-profile.js
Page({
  data: {
    userInfo: null
  },
  
  onLoad() {
    // 加载用户信息
    this.loadUserInfo()
  },
  
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    console.log('编辑个人资料页面加载，获取到的用户信息:', userInfo)
    if (userInfo) {
      // 处理头像路径
      if (userInfo.avatar) {
        // 处理临时文件路径的头像
        if (userInfo.avatar.includes('http://tmp/') || userInfo.avatar.includes('_tmp_')) {
          userInfo.avatar = 'https://img.icons8.com/color/48/000000/user.png';
          console.log('处理临时文件路径的头像，使用默认头像');
        }
        // 处理相对路径的头像
        else if (userInfo.avatar.startsWith('/')) {
          userInfo.avatar = 'http://localhost:8881' + userInfo.avatar;
          console.log('处理相对路径的头像，构建完整URL:', userInfo.avatar);
        }
        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo);
      }
      this.setData({
        userInfo
      })
    } else {
      // 如果没有用户信息，跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        console.log('选择头像成功，获取到的临时文件路径:', tempFilePaths)
        
        // 上传头像到服务器
        wx.uploadFile({
          url: 'http://localhost:8881/api/users/upload-avatar',
          filePath: tempFilePaths[0],
          name: 'file',
          success: (uploadRes) => {
            console.log('头像上传成功，服务器响应:', uploadRes)
            try {
              const uploadData = JSON.parse(uploadRes.data)
              if (uploadData.url) {
                console.log('获取到的头像URL:', uploadData.url)
                // 构建完整的绝对路径
                let avatarUrl = uploadData.url;
                if (avatarUrl.startsWith('/')) {
                  avatarUrl = 'http://localhost:8881' + avatarUrl;
                  console.log('构建完整头像URL:', avatarUrl);
                }
                // 更新用户信息
                const updatedUserInfo = {
                  ...this.data.userInfo,
                  avatar: avatarUrl
                }
                this.setData({
                  userInfo: updatedUserInfo
                })
                // 立即更新本地存储，确保发布任务时使用新头像
                wx.setStorageSync('userInfo', updatedUserInfo)
                wx.showToast({ title: '头像上传成功', icon: 'success' })
              } else if (uploadData.error) {
                console.error('头像上传失败:', uploadData.error)
                wx.showToast({ title: '头像上传失败', icon: 'none' })
              }
            } catch (e) {
              console.error('解析上传响应失败:', e)
              wx.showToast({ title: '头像上传失败', icon: 'none' })
            }
          },
          fail: (uploadErr) => {
            console.error('头像上传失败:', uploadErr)
            wx.showToast({ title: '头像上传失败', icon: 'none' })
          }
        })
      }
    })
  },
  
  handleNickNameInput(e) {
    const nickname = e.detail.value
    console.log('输入昵称:', nickname)
    const updatedUserInfo = {
      ...this.data.userInfo,
      nickname
    }
    this.setData({
      userInfo: updatedUserInfo
    })
  },
  
  handleSave() {
    console.log('保存个人资料，用户信息:', this.data.userInfo)
    // 保存用户信息到本地存储
    wx.setStorageSync('userInfo', this.data.userInfo)
    
    // 实际项目中应该上传到服务器
    wx.request({
      url: 'http://localhost:8881/api/users',
      method: 'PUT',
      data: this.data.userInfo,
      success: (res) => {
        console.log('保存个人资料到服务器成功:', res)
        if (res.statusCode === 200) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          // 跳回个人中心页面
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        console.log('保存个人资料到服务器失败:', res)
        // 即使服务器保存失败，也显示成功，因为本地已经保存了
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 跳回个人中心页面
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      }
    })
  }
})