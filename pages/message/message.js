// message.js
Page({
  data: {
    activeTab: 0,
    isLoggedIn: false,
    messageList: [],
    allMessages: [],
    refresherTriggered: false, // 下拉刷新状态
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    console.log("message.js onShow() - 页面显示");
    // 每次页面显示时都检查登录状态
    this.checkLoginStatus();

    // 初始化全局数据
    if (!getApp().globalData) {
      console.log("message.js onShow() - 初始化全局数据");
      getApp().globalData = {};
    }
    // 将当前页面实例保存到全局数据中，供其他页面调用addMessage方法和获取消息数据
    getApp().globalData.messagePage = this;
    console.log("message.js onShow() - 保存messagePage实例到全局数据");

    // 检查本地存储中是否有未显示的消息
    this.loadPendingMessages();
  },

  // 加载本地存储中未显示的消息
  loadPendingMessages() {
    console.log("message.js loadPendingMessages() - 加载未显示的消息");
    const pendingMessages = wx.getStorageSync("pendingMessages") || [];
    console.log(
      "message.js loadPendingMessages() - 未显示的消息数量:",
      pendingMessages.length,
    );
    console.log(
      "message.js loadPendingMessages() - 未显示的消息:",
      pendingMessages,
    );
    if (pendingMessages.length > 0) {
      // 添加未显示的消息
      console.log("message.js loadPendingMessages() - 添加未显示的消息");
      pendingMessages.forEach((message) => {
        console.log("message.js loadPendingMessages() - 添加消息:", message);
        this.addMessage(message);
      });
      // 清空本地存储中的未显示消息
      console.log("message.js loadPendingMessages() - 清空未显示的消息");
      wx.setStorageSync("pendingMessages", []);
    }
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync("userInfo");
    const currentLoggedIn = this.data.isLoggedIn;

    if (userInfo && !currentLoggedIn) {
      // 用户从未登录变为已登录
      this.setData({ isLoggedIn: true });
      // 加载消息列表
      this.loadMessages();
    } else if (!userInfo && currentLoggedIn) {
      // 用户从已登录变为未登录
      this.setData({ isLoggedIn: false });
    }
    // 如果登录状态没有变化，不执行任何操作
  },

  navigateToLogin() {
    wx.navigateTo({
      url: "/pages/login/login",
    });
  },

  loadMessages() {
    // 显示加载提示
    wx.showLoading({ title: "加载中..." });

    // 获取当前登录用户信息
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo || !userInfo.id) {
      // 隐藏加载提示
      wx.hideLoading();
      return;
    }

    // 获取用户的所有消息
    const userId = parseInt(userInfo.id);
    console.log("message.js loadMessages() - 请求用户ID:", userId);
    console.log(
      "message.js loadMessages() - 请求URL:",
      `http://localhost:8881/api/messages/receiver/${userId}`,
    );

    // 并行请求系统消息和聊天消息
    Promise.all([
      // 请求系统消息
      new Promise((resolve, reject) => {
        wx.request({
          url: `http://localhost:8881/api/messages/receiver/${userId}`,
          method: "GET",
          success: (res) => {
            if (res.statusCode === 200 && res.data) {
              resolve(res.data);
            } else {
              resolve([]);
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      }),
      // 请求聊天消息
      new Promise((resolve, reject) => {
        // 这里我们需要获取用户的所有聊天记录
        wx.request({
          url: `http://localhost:8881/api/chat-records/user/${userId}`,
          method: "GET",
          success: (res) => {
            if (res.statusCode === 200 && res.data) {
              resolve(res.data);
            } else {
              resolve([]);
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      }),
    ])
      .then(([systemMessages, chatMessages]) => {
        // 处理系统消息
        const processedSystemMessages = systemMessages.map((msg) => {
          // 提取senderId和senderName
          let senderId = null;
          let senderName = null;
          
          // 对于订单消息，尝试从消息内容或其他字段中提取对方用户信息
          // 这里需要根据实际的消息结构进行调整
          if (msg.type === 'order' && msg.relatedUserId) {
            // 如果有relatedUserId字段，使用它作为对方用户ID
            senderId = msg.relatedUserId;
            senderName = msg.relatedUserName || '用户';
          } else if (msg.sender) {
            if (typeof msg.sender === 'object' && msg.sender.id && msg.sender.id !== userId) {
              // 确保sender不是当前用户
              senderId = msg.sender.id;
              senderName = msg.sender.nickname || '用户';
            } else if (typeof msg.sender === 'string') {
              senderName = msg.sender;
            }
          }
          
          return {
            ...msg,
            id: msg.id,
            title: msg.title || "消息通知",
            body: msg.content || "",
            time: msg.createdAt
              ? msg.createdAt.replace("T", " ")
              : new Date().toLocaleString("zh-CN"),
            type: this.getMessageType(msg.type), // 根据消息类型设置type
            avatar:
              msg.avatar ||
              "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
            unread: !msg.isRead,
            senderId: senderId,
            senderName: senderName
          };
        });

        // 处理聊天消息，按用户分组
        const userChatMap = new Map();
        chatMessages.forEach((msg) => {
          // 确定对话的另一方用户
          let otherUser;
          let otherUserId;
          let otherUserName;
          let otherUserAvatar;

          if (msg.sender && msg.sender.id !== userId) {
            // 消息来自其他用户
            otherUser = msg.sender;
            otherUserId = msg.sender.id;
            otherUserName = msg.sender.nickname || "用户";
            otherUserAvatar =
              msg.sender.avatar ||
              "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
          } else if (msg.receiver) {
            // 消息是当前用户发送的
            otherUser = msg.receiver;
            otherUserId = msg.receiver.id;
            otherUserName = msg.receiver.nickname || "用户";
            otherUserAvatar =
              msg.receiver.avatar ||
              "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
          } else {
            // 跳过无效消息
            return;
          }

          // 检查是否已经有该用户的对话
          if (!userChatMap.has(otherUserId)) {
            // 只有当消息是由其他用户发送的且未读时，才设置为未读
            const isUnread =
              msg.sender && msg.sender.id !== userId && !msg.isRead;
            // 为聊天消息生成唯一ID，避免与其他消息类型冲突
            const chatMessageId = 'chat_' + otherUserId;
            userChatMap.set(otherUserId, {
              id: chatMessageId,
              title: otherUserName,
              body: msg.content,
              time: msg.createdAt
                ? new Date(msg.createdAt).toLocaleString("zh-CN")
                : new Date().toLocaleString("zh-CN"),
              type: 2, // 聊天消息
              avatar: otherUserAvatar,
              unread: isUnread,
              senderId: otherUserId,
              senderName: otherUserName,
              lastMessage: msg.content,
              lastMessageTime: msg.createdAt
                ? new Date(msg.createdAt).toLocaleString("zh-CN")
                : new Date().toLocaleString("zh-CN"),
            });
          } else {
            // 更新现有对话的最后一条消息
            const existingChat = userChatMap.get(otherUserId);
            const msgTime = msg.createdAt
              ? new Date(msg.createdAt).getTime()
              : 0;
            const existingTime = existingChat.lastMessageTime
              ? new Date(existingChat.lastMessageTime).getTime()
              : 0;

            if (msgTime > existingTime) {
              existingChat.body = msg.content;
              existingChat.time = msg.createdAt
                ? new Date(msg.createdAt).toLocaleString("zh-CN")
                : new Date().toLocaleString("zh-CN");
              existingChat.lastMessage = msg.content;
              existingChat.lastMessageTime = msg.createdAt
                ? new Date(msg.createdAt).toLocaleString("zh-CN")
                : new Date().toLocaleString("zh-CN");
              // 只有当消息是由其他用户发送的且未读时，才设置为未读
              if (msg.sender && msg.sender.id !== userId && !msg.isRead) {
                existingChat.unread = true;
              }
            }
          }
        });

        // 转换Map为数组
        const processedChatMessages = Array.from(userChatMap.values());

        // 合并所有消息
        const allMessages = [
          ...processedSystemMessages,
          ...processedChatMessages,
        ];

        console.log(
          "message.js loadMessages() - 处理后的消息数量:",
          allMessages.length,
        );
        console.log("message.js loadMessages() - 处理后的消息:", allMessages);

        // 更新页面数据
        this.setData({
          allMessages,
          messageList: this.filterMessages(allMessages, this.data.activeTab),
        });
      })
      .catch((err) => {
        console.error("message.js loadMessages() - 请求失败:", err);
      })
      .finally(() => {
        console.log("message.js loadMessages() - 请求完成");
        // 隐藏加载提示
        wx.hideLoading();
      });
  },

  // 根据消息类型获取对应的type值
  getMessageType(messageType) {
    switch (messageType) {
      case "system":
        return 0; // 系统通知
      case "order":
        return 1; // 订单消息
      case "chat":
        return 2; // 聊天消息
      default:
        return 0; // 默认系统通知
    }
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      activeTab: index,
      messageList: this.filterMessages(this.data.allMessages, index),
    });
  },

  filterMessages(messages, tabIndex) {
    switch (tabIndex) {
      case 0: // 系统通知 - 按时间降序排列
        return messages.filter((msg) => msg.type === 0).sort((a, b) => {
          return new Date(b.time) - new Date(a.time);
        });
      case 1: // 订单消息 - 按时间降序排列（最新的在上面）
        return messages.filter((msg) => msg.type === 1).sort((a, b) => {
          return new Date(b.time) - new Date(a.time);
        });
      case 2: // 聊天消息 - 按时间降序排列
        return messages.filter((msg) => msg.type === 2).sort((a, b) => {
          return new Date(b.time) - new Date(a.time);
        });
      default:
        return messages;
    }
  },

  navigateToMessageDetail(e) {
    console.log('navigateToMessageDetail - 点击事件触发:', e);
    const messageId = e.currentTarget.dataset.id;
    console.log('navigateToMessageDetail - messageId:', messageId, 'type:', typeof messageId);
    
    // 打印所有消息，以便查看消息数据
    console.log('navigateToMessageDetail - allMessages:', this.data.allMessages);
    
    // 尝试匹配消息ID，考虑类型转换
    let message = this.data.allMessages.find((msg) => {
      console.log('navigateToMessageDetail - checking message:', msg.id, 'type:', typeof msg.id);
      return msg.id == messageId; // 使用宽松相等，自动转换类型
    });
    
    // 如果没有找到消息，尝试检查是否是聊天消息ID
    if (!message && messageId.startsWith('chat_')) {
      console.log('navigateToMessageDetail - 尝试查找聊天消息:', messageId);
      message = this.data.allMessages.find((msg) => {
        return msg.type === 2 && msg.senderId == messageId.replace('chat_', '');
      });
    }
    console.log('navigateToMessageDetail - message:', message);
    
    if (!message) {
      console.log('navigateToMessageDetail - 未找到消息:', messageId);
      wx.showToast({ title: '消息不存在', icon: 'none' });
      return;
    }
    
    // 标记消息为已读
    this.markAsRead(messageId);
    
    // 获取当前用户ID
    const userInfo = wx.getStorageSync('userInfo');
    const currentUserId = userInfo ? userInfo.id : null;
    console.log('navigateToMessageDetail - currentUserId:', currentUserId);
    console.log('navigateToMessageDetail - message.type:', message.type);
    console.log('navigateToMessageDetail - message.senderId:', message.senderId, 'type:', typeof message.senderId);
    console.log('navigateToMessageDetail - message.senderName:', message.senderName);
    
    // 首先检查是否是聊天消息（类型为2）
    if (message.type === 2 && message.senderId && message.senderName) {
      console.log('navigateToMessageDetail - 是聊天消息，导航到聊天页面:', message.senderId, message.senderName);
      
      wx.navigateTo({
        url:
          "../chat/chat?userId=" +
          message.senderId +
          "&userName=" +
          encodeURIComponent(message.senderName),
        success: function(res) {
          console.log('navigateToMessageDetail - 导航成功:', res);
        },
        fail: function(res) {
          console.log('navigateToMessageDetail - 导航失败:', res);
        }
      });
    } else {
      // 其他情况导航到消息详情页面
      console.log('navigateToMessageDetail - 不是聊天消息，导航到消息详情页面');
      wx.navigateTo({
        url: "../message-detail/message-detail?id=" + messageId,
        success: function(res) {
          console.log('navigateToMessageDetail - 导航成功:', res);
        },
        fail: function(res) {
          console.log('navigateToMessageDetail - 导航失败:', res);
        }
      });
    }
  },

  markAsRead(messageId) {
    // 模拟标记消息为已读
    const updatedMessages = this.data.allMessages.map((msg) => {
      if (msg.id === messageId || (msg.type === 2 && msg.senderId == messageId.replace('chat_', ''))) {
        return { ...msg, unread: false };
      }
      return msg;
    });

    this.setData({
      allMessages: updatedMessages,
      messageList: this.filterMessages(updatedMessages, this.data.activeTab),
    });
  },

  // 添加新消息的方法，供其他页面调用
  addMessage(message) {
    console.log("message.js addMessage() - 添加新消息:", message);
    const userInfo = wx.getStorageSync("userInfo");
    const userId = userInfo ? parseInt(userInfo.id) : null;
    // 只有当消息不是由当前用户发送时，才设置为未读
    const isUnread =
      userId && message.senderId && parseInt(message.senderId) !== userId;
    const newMessage = {
      id: Date.now(),
      time: new Date().toLocaleString("zh-CN"),
      avatar:
        "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLjP4OJQV0xYVYV9LrYb6j8vX4V9QV0xYVYV9LrYb6j8vX4V9QV0xYVYV9LrYb6j8vX4V9QV0xYVYV9LrYb6j8w/132",
      unread: isUnread,
      sender: "系统管理员",
      senderId: "admin",
      ...message,
    };
    console.log("message.js addMessage() - 新消息对象:", newMessage);

    const updatedMessages = [newMessage, ...this.data.allMessages];
    console.log(
      "message.js addMessage() - 更新后的消息列表长度:",
      updatedMessages.length,
    );

    this.setData({
      allMessages: updatedMessages,
      messageList: this.filterMessages(updatedMessages, this.data.activeTab),
    });
    console.log("message.js addMessage() - 消息添加成功，显示提示");

    // 显示消息提示
    wx.showToast({
      title: "您有一条新消息",
      icon: "none",
    });
  },

  // 导航到聊天页面
  navigateToChat(e) {
    const senderId = e.currentTarget.dataset.senderId;
    const senderName = e.currentTarget.dataset.senderName;

    wx.navigateTo({
      url:
        "../chat/chat?userId=" +
        senderId +
        "&userName=" +
        encodeURIComponent(senderName),
    });
  },

  // 加载聊天消息
  loadChatMessages() {
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo || !userInfo.id) return;

    const userId = parseInt(userInfo.id);

    wx.request({
      url: `http://localhost:8881/api/chat-records/users?userId1=${userId}&userId2=${userId}`,
      method: "GET",
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          // 处理聊天消息
          const chatMessages = res.data.map((msg) => ({
            id: msg.id,
            title: msg.sender.nickname || "用户",
            body: msg.content,
            time: new Date(msg.createdAt).toLocaleString("zh-CN"),
            type: 2, // 聊天消息
            avatar:
              msg.sender.avatar ||
              "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
            unread: msg.sender.id !== userId && !msg.isRead,
            senderId: msg.sender.id,
            senderName: msg.sender.nickname || "用户",
          }));

          // 合并聊天消息到总消息列表
          const updatedMessages = [...this.data.allMessages, ...chatMessages];
          this.setData({
            allMessages: updatedMessages,
            messageList: this.filterMessages(
              updatedMessages,
              this.data.activeTab,
            ),
          });
        }
      },
      fail: (err) => {
        console.error("加载聊天消息失败:", err);
      },
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log("开始下拉刷新");
    this.setData({ refresherTriggered: true });

    // 检查登录状态并重新加载消息列表
    this.checkLoginStatus();

    // 模拟网络请求时间，然后结束刷新
    setTimeout(() => {
      this.setData({ refresherTriggered: false });
    }, 1000);
  },
});
