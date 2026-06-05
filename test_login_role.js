// 测试登录时的role字段
const wx = {
  request: function(options) {
    console.log('模拟登录请求:', options);
    // 模拟返回用户信息，包含role字段
    setTimeout(() => {
      options.success({
        statusCode: 200,
        data: {
          id: 2,
          phone: '13800138000',
          nickname: '测试管理员',
          avatar: 'https://img.icons8.com/color/48/000000/user.png',
          role: 1, // 管理员角色
          status: 1
        }
      });
    }, 1000);
  },
  setStorageSync: function(key, value) {
    console.log('存储数据:', key, value);
  },
  showToast: function(options) {
    console.log('显示提示:', options);
  },
  switchTab: function(options) {
    console.log('跳转到标签页:', options);
  }
};

// 模拟登录请求
wx.request({
  url: 'http://localhost:8881/api/users/login',
  method: 'POST',
  header: {
    'content-type': 'application/json'
  },
  data: {
    phone: '13800138000',
    password: '123456'
  },
  success: (res) => {
    console.log('登录响应:', res);
    console.log('用户信息:', res.data);
    console.log('用户角色:', res.data.role);
    
    if (res.statusCode === 200) {
      const userInfo = res.data;
      wx.setStorageSync('userInfo', userInfo);
      console.log('存储userInfo成功');
      
      // 检查用户角色
      if (userInfo.role === 1) {
        console.log('用户是管理员');
      } else {
        console.log('用户是普通用户');
      }
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1000);
    }
  },
  fail: () => {
    console.log('网络错误');
  }
});