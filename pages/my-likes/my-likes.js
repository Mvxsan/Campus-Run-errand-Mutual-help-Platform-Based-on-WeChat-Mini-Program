Page({
  data: {
    likedUsers: []
  },

  onLoad() {
    this.loadLikedUsers();
  },

  onShow() {
    this.loadLikedUsers();
  },

  loadLikedUsers() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    wx.request({
      url: `http://localhost:8881/api/likes/user/${userInfo.id}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          // 处理头像路径
          const likedUsers = res.data.map(user => ({
            ...user,
            avatar: user.avatar ? 
              (user.avatar.startsWith('/api') ? 'http://localhost:8881' + user.avatar : 
               user.avatar.startsWith('/') ? 'http://localhost:8881/api' + user.avatar : 
               (user.avatar.startsWith('http') ? user.avatar : 'http://localhost:8881' + user.avatar)) : 
              'https://img.icons8.com/color/48/000000/user.png'
          }));
          this.setData({ likedUsers: likedUsers });
        }
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  viewUser(e) {
    const userId = e.currentTarget.dataset.userid;
    const nickname = e.currentTarget.dataset.nickname;
    
    console.log('viewUser - userId:', userId);
    console.log('viewUser - nickname:', nickname);
    
    wx.navigateTo({
      url: '/pages/user-info/user-info?userId=' + userId + '&userName=' + encodeURIComponent(nickname || '')
    });
  },

  navigateBack() {
    wx.navigateBack();
  }
});