Page({
  data: {
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    avatar: ''
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
  
  handleConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },
  
  handleNickNameInput(e) {
    this.setData({
      nickname: e.detail.value
    })
  },
  
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          avatar: tempFilePaths[0]
        })
      }
    })
  },
  
  // 生成随机昵称
  generateRandomNickName() {
    const prefixes = ['校园', '跑腿', '互助', '友善', '热心', '勤劳', '诚信', '阳光', '快乐', '积极']
    const suffixes = ['同学', '伙伴', '达人', '小能手', '志愿者', '雷锋', '天使', '卫士', '先锋', '使者']
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const randomNumber = Math.floor(Math.random() * 1000)
    return `${randomPrefix}${randomSuffix}${randomNumber}`
  },
  
  // 生成随机头像URL
  generateRandomAvatar() {
    // 使用随机数字生成不同的默认头像
    const randomAvatarId = Math.floor(Math.random() * 10) + 1
    return `https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/${randomAvatarId}`
  },
  
  // 检查手机号是否已存在
  checkPhoneExists(phone) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:8881/api/users/check-phone',
        method: 'GET',
        data: {
          phone
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.exists)
          } else {
            reject(res.data.message || '检查手机号失败')
          }
        },
        fail: (err) => {
          reject('网络错误，请稍后重试')
        }
      })
    })
  },
  
  // 上传头像
  uploadAvatar(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: 'http://localhost:8881/api/users/upload-avatar',
        filePath: filePath,
        name: 'file',
        success: (res) => {
          const data = JSON.parse(res.data)
          if (res.statusCode === 200 && data.url) {
            resolve(data.url)
          } else {
            reject(data.error || '头像上传失败')
          }
        },
        fail: () => {
          reject('头像上传失败，请重试')
        }
      })
    })
  },
  
  // 实际执行注册
  doRegister(phone, password, nickname, avatarUrl) {
    wx.request({
      url: 'http://localhost:8881/api/users/register',
      method: 'POST',
      data: {
        phone,
        password,
        nickname,
        avatar: avatarUrl
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '注册成功，请登录',
            icon: 'success'
          })
          
          // 跳转到登录页
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          wx.showToast({
            title: res.data.message || '注册失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  handleRegister() {
    const { phone, password, confirmPassword, nickname, avatar } = this.data
    
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
    
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      })
      return
    }
    
    // 检查手机号是否已存在
    wx.showLoading({ title: '检查手机号...' })
    this.checkPhoneExists(phone).then((exists) => {
      if (exists) {
        wx.hideLoading()
        wx.showToast({
          title: '手机号已存在',
          icon: 'none'
        })
        return
      }
      
      // 如果用户没有输入昵称，生成随机昵称
      const finalNickname = nickname || this.generateRandomNickName()
      
      if (avatar) {
        // 如果选择了头像，先上传
        wx.showLoading({ title: '上传头像...' })
        this.uploadAvatar(avatar).then((avatarUrl) => {
          wx.showLoading({ title: '注册中...' })
          this.doRegister(phone, password, finalNickname, avatarUrl)
        }).catch((error) => {
          wx.hideLoading()
          wx.showToast({
            title: error,
            icon: 'none'
          })
        })
      } else {
        // 没有选择头像，使用默认头像
        const finalAvatar = this.generateRandomAvatar()
        wx.showLoading({ title: '注册中...' })
        this.doRegister(phone, password, finalNickname, finalAvatar)
      }
    }).catch((error) => {
      wx.hideLoading()
      wx.showToast({
        title: error,
        icon: 'none'
      })
    })
  },
  
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})