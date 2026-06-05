/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50530
Source Host           : localhost:3306
Source Database       : campus_errand

Target Server Type    : MYSQL
Target Server Version : 50530
File Encoding         : 65001

Date: 2026-05-10 02:26:47
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `campus_rules`
-- ----------------------------
DROP TABLE IF EXISTS `campus_rules`;
CREATE TABLE `campus_rules` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `update_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校园规则表';

-- ----------------------------
-- Records of campus_rules
-- ----------------------------
INSERT INTO `campus_rules` VALUES ('1', '诚实守信', '2026-04-10 14:03:13');

-- ----------------------------
-- Table structure for `chat_records`
-- ----------------------------
DROP TABLE IF EXISTS `chat_records`;
CREATE TABLE `chat_records` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) DEFAULT NULL,
  `sender_id` bigint(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chat_records_task_id` (`task_id`),
  KEY `idx_chat_records_sender_id` (`sender_id`),
  KEY `idx_chat_records_receiver_id` (`receiver_id`),
  CONSTRAINT `chat_records_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_records_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_records_ibfk_4` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天记录表';

-- ----------------------------
-- Records of chat_records
-- ----------------------------
INSERT INTO `chat_records` VALUES ('2', '10', '1', '4', '111', '0', '2026-02-26 23:23:28', '2026-02-26 23:23:28');
INSERT INTO `chat_records` VALUES ('3', '10', '4', '1', 'hhh', '0', '2026-02-26 23:48:02', '2026-02-26 23:48:02');
INSERT INTO `chat_records` VALUES ('4', '10', '4', '1', '你在干嘛', '0', '2026-02-27 14:09:37', '2026-02-27 14:09:37');
INSERT INTO `chat_records` VALUES ('5', '13', '5', '1', 'hhhhhhh', '0', '2026-03-15 20:43:19', '2026-03-15 20:43:19');
INSERT INTO `chat_records` VALUES ('6', '13', '5', '1', 'nihao==', '0', '2026-03-15 20:43:27', '2026-03-15 20:43:27');
INSERT INTO `chat_records` VALUES ('7', '13', '5', '1', '/api/uploads/33c197dd-9e99-448e-9e1a-aedb8d5924e8.jpg', '0', '2026-03-15 22:03:18', '2026-03-15 22:03:18');
INSERT INTO `chat_records` VALUES ('8', '13', '5', '1', '/api/uploads/e802ff91-67f2-4e3c-bed0-2f304696c2cd.png', '0', '2026-03-15 22:03:29', '2026-03-15 22:03:29');
INSERT INTO `chat_records` VALUES ('9', '13', '5', '1', '/uploads/4e1475da-64e9-439e-bef2-fa491081de55.png', '0', '2026-03-15 22:07:11', '2026-03-15 22:07:11');
INSERT INTO `chat_records` VALUES ('10', '13', '5', '1', '/uploads/c90c81d0-3022-44fa-8e00-b876734a780f.png', '0', '2026-03-15 22:12:34', '2026-03-15 22:12:34');
INSERT INTO `chat_records` VALUES ('11', '13', '1', '5', '收到', '0', '2026-03-18 15:01:20', '2026-03-18 15:01:20');
INSERT INTO `chat_records` VALUES ('12', '13', '1', '5', '一度', '0', '2026-03-18 15:01:37', '2026-03-18 15:01:37');
INSERT INTO `chat_records` VALUES ('13', '13', '1', '5', '111', '0', '2026-03-18 15:01:40', '2026-03-18 15:01:40');
INSERT INTO `chat_records` VALUES ('14', '13', '1', '5', '2', '0', '2026-03-18 15:01:44', '2026-03-18 15:01:44');
INSERT INTO `chat_records` VALUES ('15', '18', '4', '1', 'lll', '0', '2026-04-30 00:20:30', '2026-04-30 00:20:30');
INSERT INTO `chat_records` VALUES ('16', '18', '7', '3', '111', '0', '2026-05-01 23:01:11', '2026-05-01 23:01:11');
INSERT INTO `chat_records` VALUES ('17', '18', '9', '3', '我有问题', '0', '2026-05-09 11:57:25', '2026-05-09 11:57:25');
INSERT INTO `chat_records` VALUES ('18', '18', '9', '3', '/uploads/6ca4aba1-93e8-4ff1-8f27-15a8a95031c5.jpeg', '0', '2026-05-09 11:57:31', '2026-05-09 11:57:31');
INSERT INTO `chat_records` VALUES ('19', '23', '9', '8', '木头人机你好', '0', '2026-05-09 15:37:40', '2026-05-09 15:37:40');
INSERT INTO `chat_records` VALUES ('20', '25', '8', '9', 'nihao', '0', '2026-05-10 02:02:11', '2026-05-10 02:02:11');

-- ----------------------------
-- Table structure for `follows`
-- ----------------------------
DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `follower_id` bigint(20) NOT NULL,
  `following_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follower_following` (`follower_id`,`following_id`),
  KEY `idx_follows_follower_id` (`follower_id`),
  KEY `idx_follows_following_id` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- ----------------------------
-- Records of follows
-- ----------------------------
INSERT INTO `follows` VALUES ('3', '1', '4', '2026-02-26 21:49:30');
INSERT INTO `follows` VALUES ('4', '7', '1', '2026-05-01 22:55:50');
INSERT INTO `follows` VALUES ('6', '7', '4', '2026-05-02 00:36:27');
INSERT INTO `follows` VALUES ('7', '8', '7', '2026-05-03 13:58:33');
INSERT INTO `follows` VALUES ('8', '9', '8', '2026-05-09 15:37:18');

-- ----------------------------
-- Table structure for `likes`
-- ----------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `liked_user_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_liked` (`user_id`,`liked_user_id`),
  KEY `liked_user_id` (`liked_user_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`liked_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ----------------------------
-- Records of likes
-- ----------------------------
INSERT INTO `likes` VALUES ('3', '1', '4', '2026-02-28 22:28:26');
INSERT INTO `likes` VALUES ('4', '5', '4', '2026-02-28 22:39:50');
INSERT INTO `likes` VALUES ('5', '5', '5', '2026-02-28 22:42:51');
INSERT INTO `likes` VALUES ('8', '4', '1', '2026-03-11 15:21:42');
INSERT INTO `likes` VALUES ('9', '5', '1', '2026-03-15 16:16:24');
INSERT INTO `likes` VALUES ('11', '7', '1', '2026-05-02 00:36:32');
INSERT INTO `likes` VALUES ('12', '8', '7', '2026-05-03 13:58:34');
INSERT INTO `likes` VALUES ('13', '9', '1', '2026-05-09 11:29:57');
INSERT INTO `likes` VALUES ('14', '9', '8', '2026-05-09 15:37:20');
INSERT INTO `likes` VALUES ('15', '8', '1', '2026-05-10 02:13:44');

-- ----------------------------
-- Table structure for `messages`
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` bigint(20) DEFAULT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_sender_id` (`sender_id`),
  KEY `idx_messages_receiver_id` (`receiver_id`),
  KEY `idx_messages_is_read` (`is_read`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单消息表';

-- ----------------------------
-- Records of messages
-- ----------------------------
INSERT INTO `messages` VALUES ('1', '任务发布成功', '您发布的任务\"代买\"已成功发布，等待其他用户接单。', 'order', '1', '1', '0', '2026-02-24 16:27:27', '2026-02-24 16:27:27');
INSERT INTO `messages` VALUES ('2', '任务发布成功', '您发布的任务\"借四级耳机\"已成功发布，等待其他用户接单。', 'order', '1', '5', '0', '2026-02-28 22:39:25', '2026-02-28 22:39:25');
INSERT INTO `messages` VALUES ('3', '订单状态更新', '您的任务\"借四级耳机\"状态已更新为：已接单', 'order', '1', '5', '0', '2026-03-02 23:45:29', '2026-03-02 23:45:29');
INSERT INTO `messages` VALUES ('4', '订单状态更新', '您的任务\"借四级耳机\"状态已更新为：已接单', 'order', '1', '1', '0', '2026-03-02 23:45:29', '2026-03-02 23:45:29');
INSERT INTO `messages` VALUES ('5', '任务接单成功', '您已成功接取任务\"借四级耳机\"，请及时处理。', 'order', '1', '1', '0', '2026-03-02 23:45:29', '2026-03-02 23:45:29');
INSERT INTO `messages` VALUES ('6', '订单状态更新', '您的任务\"借四级耳机\"状态已更新为：待接单', 'order', '1', '5', '0', '2026-03-02 23:45:38', '2026-03-02 23:45:38');
INSERT INTO `messages` VALUES ('7', '任务发布成功', '您发布的任务\"代送\"已成功发布，等待其他用户接单。', 'order', '1', '1', '0', '2026-03-02 23:46:09', '2026-03-02 23:46:09');
INSERT INTO `messages` VALUES ('8', '订单状态更新', '您的任务\"取快递\"状态已更新为：已送达', 'order', '1', '4', '0', '2026-03-02 23:48:20', '2026-03-02 23:48:20');
INSERT INTO `messages` VALUES ('9', '订单状态更新', '您的任务\"取快递\"状态已更新为：已送达', 'order', '1', '1', '0', '2026-03-02 23:48:20', '2026-03-02 23:48:20');
INSERT INTO `messages` VALUES ('10', '订单状态更新', '您的任务\"取快递\"状态已更新为：已完成', 'order', '1', '4', '0', '2026-03-11 13:44:42', '2026-03-11 13:44:42');
INSERT INTO `messages` VALUES ('11', '订单状态更新', '您的任务\"取快递\"状态已更新为：已完成', 'order', '1', '1', '0', '2026-03-11 13:44:42', '2026-03-11 13:44:42');
INSERT INTO `messages` VALUES ('12', '订单状态更新', '您的任务\"取快递\"状态已更新为：已确认收货', 'order', '1', '4', '0', '2026-03-11 13:45:57', '2026-03-11 13:45:57');
INSERT INTO `messages` VALUES ('13', '订单状态更新', '您的任务\"取快递\"状态已更新为：已确认收货', 'order', '1', '1', '0', '2026-03-11 13:45:57', '2026-03-11 13:45:57');
INSERT INTO `messages` VALUES ('14', '订单状态更新', '您的任务\"买饭\"状态已更新为：已取货', 'order', '1', '1', '0', '2026-03-13 17:38:00', '2026-03-13 17:38:00');
INSERT INTO `messages` VALUES ('15', '订单状态更新', '您的任务\"买饭\"状态已更新为：已取货', 'order', '1', '4', '0', '2026-03-13 17:38:00', '2026-03-13 17:38:00');
INSERT INTO `messages` VALUES ('16', '订单状态更新', '您的任务\"买饭\"状态已更新为：已送达', 'order', '1', '1', '0', '2026-03-13 17:38:03', '2026-03-13 17:38:03');
INSERT INTO `messages` VALUES ('17', '订单状态更新', '您的任务\"买饭\"状态已更新为：已送达', 'order', '1', '4', '0', '2026-03-13 17:38:03', '2026-03-13 17:38:03');
INSERT INTO `messages` VALUES ('18', '订单状态更新', '您的任务\"买饭\"状态已更新为：已完成', 'order', '1', '1', '0', '2026-03-13 17:38:05', '2026-03-13 17:38:05');
INSERT INTO `messages` VALUES ('19', '订单状态更新', '您的任务\"买饭\"状态已更新为：已完成', 'order', '1', '4', '0', '2026-03-13 17:38:05', '2026-03-13 17:38:05');
INSERT INTO `messages` VALUES ('20', '订单状态更新', '您的任务\"买饭\"状态已更新为：已确认收货', 'order', '1', '1', '0', '2026-03-13 17:38:59', '2026-03-13 17:38:59');
INSERT INTO `messages` VALUES ('21', '订单状态更新', '您的任务\"买饭\"状态已更新为：已确认收货', 'order', '1', '4', '0', '2026-03-13 17:38:59', '2026-03-13 17:38:59');
INSERT INTO `messages` VALUES ('22', '任务发布成功', '您发布的任务\"瑞幸\"已成功发布，等待其他用户接单。', 'order', '1', '5', '0', '2026-03-22 21:59:21', '2026-03-22 21:59:21');
INSERT INTO `messages` VALUES ('23', '任务发布成功', '您发布的任务\"取快递\"已成功发布，等待其他用户接单。', 'order', '4', '4', '0', '2026-04-29 21:59:07', '2026-04-29 21:59:07');
INSERT INTO `messages` VALUES ('24', '订单状态更新', '您的任务\"取快递\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 21:59:35', '2026-04-29 21:59:35');
INSERT INTO `messages` VALUES ('25', '订单状态更新', '您的任务\"取快递\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 21:59:51', '2026-04-29 21:59:51');
INSERT INTO `messages` VALUES ('26', '订单状态更新', '您的任务\"取快递\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 22:02:37', '2026-04-29 22:02:37');
INSERT INTO `messages` VALUES ('27', '订单状态更新', '您的任务\"取快递\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 22:03:31', '2026-04-29 22:03:31');
INSERT INTO `messages` VALUES ('28', '订单状态更新', '您的任务\"取快递\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 22:25:33', '2026-04-29 22:25:33');
INSERT INTO `messages` VALUES ('29', '订单状态更新', '您的任务\"取快递\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 22:26:23', '2026-04-29 22:26:23');
INSERT INTO `messages` VALUES ('30', '订单状态更新', '您的任务\"取快递\"状态已更新为：已取消', 'order', '1', '4', '0', '2026-04-29 22:38:42', '2026-04-29 22:38:42');
INSERT INTO `messages` VALUES ('31', '订单状态更新', '您的任务\"代送\"状态已更新为：已取消', 'order', '1', '1', '0', '2026-04-29 22:38:57', '2026-04-29 22:38:57');
INSERT INTO `messages` VALUES ('32', '订单状态更新', '您的任务\"借四级耳机\"状态已更新为：已接单', 'order', '1', '5', '0', '2026-04-29 22:39:08', '2026-04-29 22:39:08');
INSERT INTO `messages` VALUES ('33', '订单状态更新', '您的任务\"借四级耳机\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-04-29 22:39:08', '2026-04-29 22:39:08');
INSERT INTO `messages` VALUES ('34', '任务接单成功', '您已成功接取任务\"借四级耳机\"，请及时处理。', 'order', '4', '4', '0', '2026-04-29 22:39:08', '2026-04-29 22:39:08');
INSERT INTO `messages` VALUES ('35', '订单状态更新', '您的任务\"借四级耳机\"状态已更新为：已取消', 'order', '1', '5', '0', '2026-04-29 22:39:24', '2026-04-29 22:39:24');
INSERT INTO `messages` VALUES ('36', '订单状态更新', '您的任务\"代送\"状态已更新为：已接单', 'order', '1', '1', '0', '2026-04-29 22:44:59', '2026-04-29 22:44:59');
INSERT INTO `messages` VALUES ('37', '订单状态更新', '您的任务\"代送\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-04-29 22:44:59', '2026-04-29 22:44:59');
INSERT INTO `messages` VALUES ('38', '任务接单成功', '您已成功接取任务\"代送\"，请及时处理。', 'order', '4', '4', '0', '2026-04-29 22:45:00', '2026-04-29 22:45:00');
INSERT INTO `messages` VALUES ('39', '订单状态更新', '您的任务\"代送\"状态已更新为：已取消', 'order', '1', '1', '0', '2026-04-29 22:45:07', '2026-04-29 22:45:07');
INSERT INTO `messages` VALUES ('40', '任务发布成功', '您发布的任务\"买葡萄\"已成功发布，等待其他用户接单。', 'order', '4', '4', '0', '2026-04-29 22:46:39', '2026-04-29 22:46:39');
INSERT INTO `messages` VALUES ('41', '订单状态更新', '您的任务\"买葡萄\"状态已更新为：已取消', 'order', '1', '4', '0', '2026-04-29 22:46:49', '2026-04-29 22:46:49');
INSERT INTO `messages` VALUES ('42', '订单状态更新', '您的任务\"瑞幸\"状态已更新为：已接单', 'order', '1', '5', '0', '2026-04-29 22:58:10', '2026-04-29 22:58:10');
INSERT INTO `messages` VALUES ('43', '订单状态更新', '您的任务\"瑞幸\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-04-29 22:58:10', '2026-04-29 22:58:10');
INSERT INTO `messages` VALUES ('44', '任务接单成功', '您已成功接取任务\"瑞幸\"，请及时处理。', 'order', '4', '4', '0', '2026-04-29 22:58:10', '2026-04-29 22:58:10');
INSERT INTO `messages` VALUES ('45', '订单状态更新', '您的任务\"瑞幸\"状态已更新为：已取消', 'order', '1', '5', '0', '2026-04-29 22:58:18', '2026-04-29 22:58:18');
INSERT INTO `messages` VALUES ('46', '任务发布成功', '您发布的任务\"取快递\"已成功发布，等待其他用户接单。', 'order', '4', '4', '0', '2026-04-29 23:00:52', '2026-04-29 23:00:52');
INSERT INTO `messages` VALUES ('47', '任务发布成功', '您发布的任务\"买饭\"已成功发布，等待其他用户接单。', 'order', '4', '4', '0', '2026-04-29 23:01:37', '2026-04-29 23:01:37');
INSERT INTO `messages` VALUES ('48', '任务发布成功', '您发布的任务\"送东西\"已成功发布，等待其他用户接单。', 'order', '5', '5', '0', '2026-04-29 23:04:39', '2026-04-29 23:04:39');
INSERT INTO `messages` VALUES ('49', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-04-29 23:07:21', '2026-04-29 23:07:21');
INSERT INTO `messages` VALUES ('50', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '1', '0', '2026-04-29 23:07:21', '2026-04-29 23:07:21');
INSERT INTO `messages` VALUES ('51', '任务接单成功', '您已成功接取任务\"买饭\"，请及时处理。', 'order', '1', '1', '0', '2026-04-29 23:07:21', '2026-04-29 23:07:21');
INSERT INTO `messages` VALUES ('52', '订单状态更新', '您的任务\"买饭\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 23:07:37', '2026-04-29 23:07:37');
INSERT INTO `messages` VALUES ('53', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-04-29 23:09:22', '2026-04-29 23:09:22');
INSERT INTO `messages` VALUES ('54', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '1', '0', '2026-04-29 23:09:22', '2026-04-29 23:09:22');
INSERT INTO `messages` VALUES ('55', '订单状态更新', '您的任务\"买饭\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-29 23:09:24', '2026-04-29 23:09:24');
INSERT INTO `messages` VALUES ('56', '订单状态更新', '您的任务\"买饭\"状态已更新为：已取消', 'order', '1', '4', '0', '2026-04-29 23:24:46', '2026-04-29 23:24:46');
INSERT INTO `messages` VALUES ('57', '订单状态更新', '您的任务\"买饭\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-04-30 00:19:29', '2026-04-30 00:19:29');
INSERT INTO `messages` VALUES ('58', '任务发布成功', '您发布的任务\"拿快递\"已成功发布，等待其他用户接单。', 'order', '7', '7', '0', '2026-05-02 00:44:41', '2026-05-02 00:44:41');
INSERT INTO `messages` VALUES ('59', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-05-02 00:49:39', '2026-05-02 00:49:39');
INSERT INTO `messages` VALUES ('60', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '7', '0', '2026-05-02 00:49:39', '2026-05-02 00:49:39');
INSERT INTO `messages` VALUES ('61', '任务接单成功', '您已成功接取任务\"买饭\"，请及时处理。', 'order', '7', '7', '0', '2026-05-02 00:49:39', '2026-05-02 00:49:39');
INSERT INTO `messages` VALUES ('62', '订单状态更新', '您的任务\"买饭\"状态已更新为：待接单', 'order', '1', '4', '0', '2026-05-02 00:49:50', '2026-05-02 00:49:50');
INSERT INTO `messages` VALUES ('63', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-05-02 00:49:55', '2026-05-02 00:49:55');
INSERT INTO `messages` VALUES ('64', '订单状态更新', '您的任务\"买饭\"状态已更新为：已接单', 'order', '1', '7', '0', '2026-05-02 00:49:55', '2026-05-02 00:49:55');
INSERT INTO `messages` VALUES ('65', '任务接单成功', '您已成功接取任务\"买饭\"，请及时处理。', 'order', '7', '7', '0', '2026-05-02 00:49:55', '2026-05-02 00:49:55');
INSERT INTO `messages` VALUES ('66', '订单状态更新', '您的任务\"买饭\"状态已更新为：已取货', 'order', '1', '4', '0', '2026-05-02 00:50:05', '2026-05-02 00:50:05');
INSERT INTO `messages` VALUES ('67', '订单状态更新', '您的任务\"买饭\"状态已更新为：已取货', 'order', '1', '7', '0', '2026-05-02 00:50:05', '2026-05-02 00:50:05');
INSERT INTO `messages` VALUES ('68', '订单状态更新', '您的任务\"买饭\"状态已更新为：已送达', 'order', '1', '4', '0', '2026-05-02 00:50:08', '2026-05-02 00:50:08');
INSERT INTO `messages` VALUES ('69', '订单状态更新', '您的任务\"买饭\"状态已更新为：已送达', 'order', '1', '7', '0', '2026-05-02 00:50:08', '2026-05-02 00:50:08');
INSERT INTO `messages` VALUES ('70', '订单状态更新', '您的任务\"买饭\"状态已更新为：已完成', 'order', '1', '4', '0', '2026-05-02 00:50:11', '2026-05-02 00:50:11');
INSERT INTO `messages` VALUES ('71', '订单状态更新', '您的任务\"买饭\"状态已更新为：已完成', 'order', '1', '7', '0', '2026-05-02 00:50:11', '2026-05-02 00:50:11');
INSERT INTO `messages` VALUES ('72', '订单状态更新', '您的任务\"买饭\"状态已更新为：已确认收货', 'order', '1', '4', '0', '2026-05-02 01:06:43', '2026-05-02 01:06:43');
INSERT INTO `messages` VALUES ('73', '订单状态更新', '您的任务\"买饭\"状态已更新为：已确认收货', 'order', '1', '7', '0', '2026-05-02 01:06:43', '2026-05-02 01:06:43');
INSERT INTO `messages` VALUES ('74', '任务发布成功', '您发布的任务\"买水果\"已成功发布，等待其他用户接单。', 'order', '7', '7', '0', '2026-05-03 13:50:44', '2026-05-03 13:50:44');
INSERT INTO `messages` VALUES ('75', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已接单', 'order', '1', '7', '0', '2026-05-03 13:53:28', '2026-05-03 13:53:28');
INSERT INTO `messages` VALUES ('76', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已接单', 'order', '1', '8', '0', '2026-05-03 13:53:28', '2026-05-03 13:53:28');
INSERT INTO `messages` VALUES ('77', '任务接单成功', '您已成功接取任务\"拿快递\"，请及时处理。', 'order', '8', '8', '0', '2026-05-03 13:53:28', '2026-05-03 13:53:28');
INSERT INTO `messages` VALUES ('78', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已取货', 'order', '1', '7', '0', '2026-05-03 13:53:42', '2026-05-03 13:53:42');
INSERT INTO `messages` VALUES ('79', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已取货', 'order', '1', '8', '0', '2026-05-03 13:53:42', '2026-05-03 13:53:42');
INSERT INTO `messages` VALUES ('80', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已送达', 'order', '1', '7', '0', '2026-05-03 13:53:46', '2026-05-03 13:53:46');
INSERT INTO `messages` VALUES ('81', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已送达', 'order', '1', '8', '0', '2026-05-03 13:53:46', '2026-05-03 13:53:46');
INSERT INTO `messages` VALUES ('82', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已完成', 'order', '1', '7', '0', '2026-05-03 13:53:50', '2026-05-03 13:53:50');
INSERT INTO `messages` VALUES ('83', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已完成', 'order', '1', '8', '0', '2026-05-03 13:53:50', '2026-05-03 13:53:50');
INSERT INTO `messages` VALUES ('84', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已确认收货', 'order', '1', '7', '0', '2026-05-03 13:54:31', '2026-05-03 13:54:31');
INSERT INTO `messages` VALUES ('85', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已确认收货', 'order', '1', '8', '0', '2026-05-03 13:54:31', '2026-05-03 13:54:31');
INSERT INTO `messages` VALUES ('86', '订单状态更新', '您的任务\"送东西\"状态已更新为：已接单', 'order', '1', '5', '0', '2026-05-03 14:07:52', '2026-05-03 14:07:52');
INSERT INTO `messages` VALUES ('87', '订单状态更新', '您的任务\"送东西\"状态已更新为：已接单', 'order', '1', '8', '0', '2026-05-03 14:07:52', '2026-05-03 14:07:52');
INSERT INTO `messages` VALUES ('88', '任务接单成功', '您已成功接取任务\"送东西\"，请及时处理。', 'order', '8', '8', '0', '2026-05-03 14:07:52', '2026-05-03 14:07:52');
INSERT INTO `messages` VALUES ('89', '订单状态更新', '您的任务\"送东西\"状态已更新为：已取货', 'order', '1', '5', '0', '2026-05-03 14:08:09', '2026-05-03 14:08:09');
INSERT INTO `messages` VALUES ('90', '订单状态更新', '您的任务\"送东西\"状态已更新为：已取货', 'order', '1', '8', '0', '2026-05-03 14:08:09', '2026-05-03 14:08:09');
INSERT INTO `messages` VALUES ('91', '订单状态更新', '您的任务\"送东西\"状态已更新为：已送达', 'order', '1', '5', '0', '2026-05-03 14:08:13', '2026-05-03 14:08:13');
INSERT INTO `messages` VALUES ('92', '订单状态更新', '您的任务\"送东西\"状态已更新为：已送达', 'order', '1', '8', '0', '2026-05-03 14:08:13', '2026-05-03 14:08:13');
INSERT INTO `messages` VALUES ('93', '订单状态更新', '您的任务\"送东西\"状态已更新为：已完成', 'order', '1', '5', '0', '2026-05-03 14:08:15', '2026-05-03 14:08:15');
INSERT INTO `messages` VALUES ('94', '订单状态更新', '您的任务\"送东西\"状态已更新为：已完成', 'order', '1', '8', '0', '2026-05-03 14:08:15', '2026-05-03 14:08:15');
INSERT INTO `messages` VALUES ('95', '订单状态更新', '您的任务\"送东西\"状态已更新为：已确认收货', 'order', '1', '5', '0', '2026-05-03 14:08:59', '2026-05-03 14:08:59');
INSERT INTO `messages` VALUES ('96', '订单状态更新', '您的任务\"送东西\"状态已更新为：已确认收货', 'order', '1', '8', '0', '2026-05-03 14:08:59', '2026-05-03 14:08:59');
INSERT INTO `messages` VALUES ('97', '任务发布成功', '您发布的任务\"拿快递\"已成功发布，等待其他用户接单。', 'order', '7', '7', '0', '2026-05-03 14:16:43', '2026-05-03 14:16:43');
INSERT INTO `messages` VALUES ('98', '订单状态更新', '您的任务\"买水果\"状态已更新为：已接单', 'order', '1', '7', '0', '2026-05-03 14:17:02', '2026-05-03 14:17:02');
INSERT INTO `messages` VALUES ('99', '订单状态更新', '您的任务\"买水果\"状态已更新为：已接单', 'order', '1', '8', '0', '2026-05-03 14:17:02', '2026-05-03 14:17:02');
INSERT INTO `messages` VALUES ('100', '任务接单成功', '您已成功接取任务\"买水果\"，请及时处理。', 'order', '8', '8', '0', '2026-05-03 14:17:02', '2026-05-03 14:17:02');
INSERT INTO `messages` VALUES ('101', '订单状态更新', '您的任务\"买水果\"状态已更新为：已取货', 'order', '1', '7', '0', '2026-05-03 14:17:26', '2026-05-03 14:17:26');
INSERT INTO `messages` VALUES ('102', '订单状态更新', '您的任务\"买水果\"状态已更新为：已取货', 'order', '1', '8', '0', '2026-05-03 14:17:26', '2026-05-03 14:17:26');
INSERT INTO `messages` VALUES ('103', '订单状态更新', '您的任务\"买水果\"状态已更新为：已送达', 'order', '1', '7', '0', '2026-05-03 14:17:35', '2026-05-03 14:17:35');
INSERT INTO `messages` VALUES ('104', '订单状态更新', '您的任务\"买水果\"状态已更新为：已送达', 'order', '1', '8', '0', '2026-05-03 14:17:35', '2026-05-03 14:17:35');
INSERT INTO `messages` VALUES ('105', '订单状态更新', '您的任务\"买水果\"状态已更新为：已完成', 'order', '1', '7', '0', '2026-05-03 14:17:41', '2026-05-03 14:17:41');
INSERT INTO `messages` VALUES ('106', '订单状态更新', '您的任务\"买水果\"状态已更新为：已完成', 'order', '1', '8', '0', '2026-05-03 14:17:41', '2026-05-03 14:17:41');
INSERT INTO `messages` VALUES ('107', '订单状态更新', '您的任务\"买水果\"状态已更新为：已确认收货', 'order', '1', '7', '0', '2026-05-03 14:18:12', '2026-05-03 14:18:12');
INSERT INTO `messages` VALUES ('108', '订单状态更新', '您的任务\"买水果\"状态已更新为：已确认收货', 'order', '1', '8', '0', '2026-05-03 14:18:12', '2026-05-03 14:18:12');
INSERT INTO `messages` VALUES ('109', '任务发布成功', '您发布的任务\"拿圆通快递\"已成功发布，等待其他用户接单。', 'order', '9', '9', '0', '2026-05-09 11:52:58', '2026-05-09 11:52:58');
INSERT INTO `messages` VALUES ('110', '任务发布成功', '您发布的任务\"买里建奶茶\"已成功发布，等待其他用户接单。', 'order', '9', '9', '0', '2026-05-09 11:56:38', '2026-05-09 11:56:38');
INSERT INTO `messages` VALUES ('111', '订单状态更新', '您的任务\"取快递\"状态已更新为：已接单', 'order', '1', '4', '0', '2026-05-09 12:20:03', '2026-05-09 12:20:03');
INSERT INTO `messages` VALUES ('112', '订单状态更新', '您的任务\"取快递\"状态已更新为：已接单', 'order', '1', '9', '0', '2026-05-09 12:20:03', '2026-05-09 12:20:03');
INSERT INTO `messages` VALUES ('113', '任务接单成功', '您已成功接取任务\"取快递\"，请及时处理。', 'order', '9', '9', '0', '2026-05-09 12:20:03', '2026-05-09 12:20:03');
INSERT INTO `messages` VALUES ('114', '任务发布成功', '您发布的任务\"买饭\"已成功发布，等待其他用户接单。', 'order', '9', '9', '0', '2026-05-09 15:39:13', '2026-05-09 15:39:13');
INSERT INTO `messages` VALUES ('115', '订单状态更新', '您的任务\"拿圆通快递\"状态已更新为：已取消', 'order', '1', '9', '0', '2026-05-09 15:39:53', '2026-05-09 15:39:53');
INSERT INTO `messages` VALUES ('116', '订单状态更新', '您的任务\"取快递\"状态已更新为：已取货', 'order', '1', '4', '0', '2026-05-09 15:47:01', '2026-05-09 15:47:01');
INSERT INTO `messages` VALUES ('117', '订单状态更新', '您的任务\"取快递\"状态已更新为：已取货', 'order', '1', '9', '0', '2026-05-09 15:47:01', '2026-05-09 15:47:01');
INSERT INTO `messages` VALUES ('118', '订单状态更新', '您的任务\"取快递\"状态已更新为：已送达', 'order', '1', '4', '0', '2026-05-09 15:47:03', '2026-05-09 15:47:03');
INSERT INTO `messages` VALUES ('119', '订单状态更新', '您的任务\"取快递\"状态已更新为：已送达', 'order', '1', '9', '0', '2026-05-09 15:47:03', '2026-05-09 15:47:03');
INSERT INTO `messages` VALUES ('120', '订单状态更新', '您的任务\"取快递\"状态已更新为：已完成', 'order', '1', '4', '0', '2026-05-09 15:47:05', '2026-05-09 15:47:05');
INSERT INTO `messages` VALUES ('121', '订单状态更新', '您的任务\"取快递\"状态已更新为：已完成', 'order', '1', '9', '0', '2026-05-09 15:47:05', '2026-05-09 15:47:05');
INSERT INTO `messages` VALUES ('122', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已接单', 'order', '1', '7', '0', '2026-05-10 01:09:31', '2026-05-10 01:09:31');
INSERT INTO `messages` VALUES ('123', '订单状态更新', '您的任务\"拿快递\"状态已更新为：已接单', 'order', '1', '9', '0', '2026-05-10 01:09:31', '2026-05-10 01:09:31');
INSERT INTO `messages` VALUES ('124', '任务接单成功', '您已成功接取任务\"拿快递\"，请及时处理。', 'order', '9', '9', '0', '2026-05-10 01:09:31', '2026-05-10 01:09:31');

-- ----------------------------
-- Table structure for `orders`
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `publisher_id` bigint(20) NOT NULL,
  `acceptor_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `payment_time` datetime DEFAULT NULL,
  `completion_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_task_id` (`task_id`),
  KEY `idx_orders_publisher_id` (`publisher_id`),
  KEY `idx_orders_acceptor_id` (`acceptor_id`),
  KEY `idx_orders_status` (`status`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`publisher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`acceptor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES ('1', '18', '4', '9', '1.00', '0', null, null, '2026-05-09 12:20:03', '2026-05-09 12:20:03');
INSERT INTO `orders` VALUES ('2', '23', '7', '9', '2.00', '0', null, null, '2026-05-10 01:09:31', '2026-05-10 01:09:31');

-- ----------------------------
-- Table structure for `reviews`
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `reviewer_id` bigint(20) NOT NULL,
  `reviewee_id` bigint(20) NOT NULL,
  `rating` int(11) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_id` bigint(20) DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_task_id` (`task_id`),
  KEY `idx_reviews_reviewer_id` (`reviewer_id`),
  KEY `idx_reviews_reviewee_id` (`reviewee_id`),
  KEY `FK2fbmducna9wit1mcfn18y71md` (`reviewed_id`),
  CONSTRAINT `FK2fbmducna9wit1mcfn18y71md` FOREIGN KEY (`reviewed_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- ----------------------------
-- Records of reviews
-- ----------------------------
INSERT INTO `reviews` VALUES ('1', '6', '4', '1', '5', '????', '2026-03-12 22:34:11', '2026-03-12 22:34:11', '??,???', null, null, null);
INSERT INTO `reviews` VALUES ('2', '6', '4', '1', '5', '好的', '2026-03-13 21:38:53', '2026-03-13 21:38:53', '??,???', null, null, null);
INSERT INTO `reviews` VALUES ('3', '6', '4', '1', '5', '态度好', '2026-03-13 22:25:36', '2026-03-13 22:25:36', '??,???', null, null, null);
INSERT INTO `reviews` VALUES ('4', '6', '4', '1', '5', 'good', '2026-03-13 22:28:33', '2026-03-13 22:28:33', '??,???,效率高', null, null, null);
INSERT INTO `reviews` VALUES ('5', '9', '4', '1', '5', 'gh', '2026-04-27 18:27:17', '2026-04-27 23:10:32', '', null, 'publisher', '');
INSERT INTO `reviews` VALUES ('6', '9', '4', '1', '5', '18765', '2026-04-28 02:03:04', '2026-04-28 02:03:04', '', null, 'publisher', '');
INSERT INTO `reviews` VALUES ('7', '9', '4', '1', '5', '', '2026-04-28 02:03:19', '2026-04-28 02:03:19', '', null, 'publisher', '/uploads/8f3e42a6-2438-4f33-905d-ba0db108e90f.png');
INSERT INTO `reviews` VALUES ('8', '9', '4', '1', '5', '', '2026-04-28 03:04:08', '2026-04-28 03:04:08', '', null, 'publisher', '/uploads/72b1868c-a629-4fcd-b646-6249fb9d7c98.png');
INSERT INTO `reviews` VALUES ('9', '9', '4', '1', '5', '', '2026-04-29 21:55:29', '2026-04-29 21:55:29', '', null, 'publisher', '/uploads/0b12bdc8-a99b-4991-ad2e-b065fdd11bf5.png');
INSERT INTO `reviews` VALUES ('10', '9', '4', '1', '5', '1', '2026-04-29 21:55:42', '2026-04-29 21:55:42', '', null, 'publisher', '/uploads/c8bf6e35-a187-4fce-b0cb-071539121b50.png');
INSERT INTO `reviews` VALUES ('11', '9', '4', '1', '5', '', '2026-04-29 21:56:47', '2026-04-29 21:56:47', '', null, 'publisher', '/uploads/e46251ea-ea4b-4807-974a-394e500eefd6.png');
INSERT INTO `reviews` VALUES ('12', '21', '8', '7', '5', '好好好', '2026-05-03 13:58:04', '2026-05-03 13:58:04', '沟通顺畅', null, 'receiver', '');
INSERT INTO `reviews` VALUES ('13', '18', '9', '4', '5', '赞赞赞', '2026-05-09 15:47:23', '2026-05-09 15:47:23', '礼貌', null, 'receiver', '');
INSERT INTO `reviews` VALUES ('14', '18', '9', '4', '5', '', '2026-05-09 15:47:32', '2026-05-09 15:47:32', '', null, 'receiver', '/uploads/21086e57-6613-4228-90b7-72f6c11c0cd1.jpeg');

-- ----------------------------
-- Table structure for `tasks`
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reward` decimal(10,2) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `publisher_id` bigint(20) NOT NULL,
  `acceptor_id` bigint(20) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `cancel_type` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_publisher_id` (`publisher_id`),
  KEY `idx_tasks_acceptor_id` (`acceptor_id`),
  KEY `idx_tasks_status` (`status`),
  KEY `idx_tasks_cancel_type` (`cancel_type`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`publisher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`acceptor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- ----------------------------
-- Records of tasks
-- ----------------------------
INSERT INTO `tasks` VALUES ('3', '取快递', '', '取快递', '极突 → 3栋', '1.00', '2026-02-21 12:33:29', '2026-02-21 14:33:29', '1', null, '5', '2026-02-21 20:34:20', '2026-02-21 20:34:20', null);
INSERT INTO `tasks` VALUES ('4', '食堂', '玉米', '代买', '二食堂 → B栋教学楼', '1.00', '2026-02-21 13:31:54', '2026-02-21 15:31:54', '1', null, '5', '2026-02-21 21:33:37', '2026-02-21 21:33:37', null);
INSERT INTO `tasks` VALUES ('5', '买饭', '谁顺路帮个忙呗', '代买', '食堂二楼 → 3栋四楼', '1.00', '2026-02-23 11:45:46', '2026-02-23 13:45:46', '1', '4', '6', '2026-02-23 19:47:09', '2026-02-23 19:47:09', null);
INSERT INTO `tasks` VALUES ('6', '取快递', '小件', '取快递', '邮政 → 食堂', '1.00', '2026-02-23 14:39:17', '2026-02-23 16:39:17', '4', '1', '6', '2026-02-23 22:39:56', '2026-02-23 22:39:56', null);
INSERT INTO `tasks` VALUES ('7', '代送', '', '取快递', '校门口外卖 → 4栋', '1.00', '2026-02-23 14:43:37', '2026-02-23 16:43:37', '4', '1', '5', '2026-02-23 22:44:20', '2026-02-23 22:44:20', null);
INSERT INTO `tasks` VALUES ('8', '代送', '一点点奶茶', '代送', '里建 → 图书馆', '3.00', '2026-02-24 07:21:16', '2026-02-24 09:21:16', '1', null, '5', '2026-02-24 15:22:29', '2026-02-24 15:22:29', '1');
INSERT INTO `tasks` VALUES ('9', '代买', '紫米饭团', '代买', '外面美食街 → 3栋', '1.50', '2026-02-24 07:32:13', '2026-02-24 09:32:13', '4', '1', '6', '2026-02-24 15:33:39', '2026-02-24 15:33:39', null);
INSERT INTO `tasks` VALUES ('10', '取快递', '不大不小', '取快递', '极突 → 4栋', '1.50', '2026-02-24 07:41:31', '2026-02-24 09:41:31', '1', null, '5', '2026-02-24 15:42:55', '2026-02-24 15:42:55', '2');
INSERT INTO `tasks` VALUES ('11', '买饭', '一荤一素', '取快递', '食堂 → 宿舍6', '1.00', '2026-02-24 07:48:28', '2026-02-24 09:48:28', '1', '5', '5', '2026-02-24 15:49:09', '2026-02-24 15:49:09', '1');
INSERT INTO `tasks` VALUES ('12', '代买', '', '代买', '超市 → 宿舍', '1.00', '2026-02-24 08:26:56', '2026-02-24 10:26:56', '1', null, '5', '2026-02-24 16:27:27', '2026-02-24 16:27:27', '2');
INSERT INTO `tasks` VALUES ('13', '借四级耳机', '仅需一上午', '取快递', '三栋 → 任意', '3.00', '2026-02-28 14:37:48', '2026-02-28 16:37:48', '5', null, '5', '2026-02-28 22:39:25', '2026-02-28 22:39:25', '1');
INSERT INTO `tasks` VALUES ('14', '代送', '一本书', '取快递', '教学楼 → 食堂', '2.00', '2026-03-02 15:45:49', '2026-03-02 17:45:49', '1', null, '5', '2026-03-02 23:46:09', '2026-03-02 23:46:09', '1');
INSERT INTO `tasks` VALUES ('15', '瑞幸', '接单后我下单，可送到宿舍接', '代买', '超市 → 3栋 5楼', '1.50', '2026-03-22 13:57:47', '2026-03-22 15:57:47', '5', null, '5', '2026-03-22 21:59:21', '2026-03-22 21:59:21', '1');
INSERT INTO `tasks` VALUES ('16', '取快递', '小快递', '取快递', '圆通快递 → 6栋', '1.00', '2026-04-29 13:58:39', '2026-04-29 15:59:59', '4', null, '5', '2026-04-29 21:59:07', '2026-04-29 21:59:07', '1');
INSERT INTO `tasks` VALUES ('17', '买葡萄', '小葡萄', '代买', '外面美食街 → 11栋', '2.00', '2026-04-29 14:46:29', '2026-04-29 15:59:59', '4', null, '5', '2026-04-29 22:46:39', '2026-04-29 22:46:39', '1');
INSERT INTO `tasks` VALUES ('18', '取快递', '不大的快递', '取快递', '邮政 → 11栋', '1.00', '2026-04-29 15:00:39', '2026-04-29 15:59:59', '4', '9', '4', '2026-04-29 23:00:52', '2026-04-29 23:00:52', null);
INSERT INTO `tasks` VALUES ('19', '买饭', '一荤一素', '代买', '食堂一楼 → 9栋', '1.50', '2026-04-29 15:00:55', '2026-04-29 17:00:55', '4', '7', '6', '2026-04-29 23:01:37', '2026-04-29 23:01:37', null);
INSERT INTO `tasks` VALUES ('20', '送东西', '一本书', '代送', '3栋 → 教学楼', '2.00', '2026-04-29 15:03:39', '2026-04-29 17:03:39', '5', '8', '6', '2026-04-29 23:04:39', '2026-04-29 23:04:39', null);
INSERT INTO `tasks` VALUES ('21', '拿快递', '中等', '取快递', '极突快递 → 5栋', '2.00', '2026-05-01 16:42:35', '2026-05-01 18:42:35', '7', '8', '6', '2026-05-02 00:44:41', '2026-05-02 00:44:41', null);
INSERT INTO `tasks` VALUES ('22', '买水果', '一个西瓜，其它是路费', '代买', '小吃街 → 5栋', '15.00', '2026-05-03 05:50:11', '2026-05-03 15:59:59', '7', '8', '6', '2026-05-03 13:50:44', '2026-05-03 13:50:44', null);
INSERT INTO `tasks` VALUES ('23', '拿快递', '取件码3-3-6636', '取快递', '校内驿站 → 1栋', '2.00', '2026-05-03 06:13:23', '2026-05-03 15:59:59', '7', '9', '1', '2026-05-03 14:16:43', '2026-05-03 14:16:43', null);
INSERT INTO `tasks` VALUES ('24', '拿圆通快递', '两点前能送到接，衣服', '取快递', '圆通快速 → 5栋', '2.00', '2026-05-09 03:52:38', '2026-05-09 05:52:38', '9', null, '5', '2026-05-09 11:52:58', '2026-05-09 11:52:58', '1');
INSERT INTO `tasks` VALUES ('25', '买里建奶茶', '奶茶19，路费三块，下午三点前', '代买', '一点点 → 5栋', '22.00', '2026-05-09 03:56:23', '2026-05-09 05:56:23', '9', null, '0', '2026-05-09 11:56:38', '2026-05-09 11:56:38', null);
INSERT INTO `tasks` VALUES ('26', '买饭', '一荤一素', '代买', '后街吉米 → 5栋', '12.00', '2026-05-09 07:40:00', '2026-05-09 09:37:00', '9', null, '0', '2026-05-09 15:39:13', '2026-05-09 15:39:13', null);

-- ----------------------------
-- Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `role` int(11) DEFAULT '0',
  `status` int(11) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `credit_level` int(11) DEFAULT '0',
  `likes_count` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_users_phone` (`phone`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', '18070741019', '123456', '懵女下山', 'http://localhost:8881/api/uploads/350ff068-82f8-40dc-b174-d1f0fe03b812.png', '1.00', '0', '1', '2026-02-19 20:33:59', '2026-02-19 20:33:59', '0', '0');
INSERT INTO `users` VALUES ('3', 'admin', 'admin', '系统管理员', 'http://tmp/xd5N6b589czH3568e5ecfa0326a16d2496b334f1fb1e.png', '0.00', '1', '1', '2026-02-23 20:07:28', '2026-02-23 20:07:28', '0', '0');
INSERT INTO `users` VALUES ('4', '15678173772', '123456', '小花', 'http://localhost:8881/api/uploads/35117173-4d4e-4e88-9348-58319e714d23.png', '1.00', '0', '1', '2026-02-23 22:04:41', '2026-02-23 22:04:41', '0', '0');
INSERT INTO `users` VALUES ('5', '123456', '1234567', '水豚大王', 'http://localhost:8881/api/uploads/ead7aa3a-abd9-4420-8aa7-e194d7d6bfad.png', '0.00', '1', '1', '2026-02-28 22:37:00', '2026-03-02 20:33:51', '0', '0');
INSERT INTO `users` VALUES ('6', '13567654123', '123456', '一只熊', 'http://localhost:8881/api/uploads/e86df956-9ff0-4d7e-b61c-0a5ff26df3bf.jpeg', '0.00', '0', '1', '2026-05-01 22:31:16', '2026-05-01 22:31:16', '0', '0');
INSERT INTO `users` VALUES ('7', '13590078006', '123456', '啦啦啦', '/api/uploads/532eafd0-e6a0-4f62-972e-84c1bc468946.jpeg', '1.50', '0', '1', '2026-05-01 22:37:49', '2026-05-01 22:37:49', '0', '0');
INSERT INTO `users` VALUES ('8', '13688935567', '123456', '木头人机', '/api/uploads/b9057428-4149-4eba-824c-0940b57b20d6.jpeg', '19.00', '1', '1', '2026-05-03 13:53:03', '2026-05-03 13:53:03', '0', '0');
INSERT INTO `users` VALUES ('9', '15577351819', '123456', '你好', '/api/uploads/427f7645-15ce-4341-9bba-2e08a2c2e605.jpeg', '0.00', '0', '1', '2026-05-09 11:28:52', '2026-05-09 11:28:52', '0', '0');

-- ----------------------------
-- Table structure for `withdrawals`
-- ----------------------------
DROP TABLE IF EXISTS `withdrawals`;
CREATE TABLE `withdrawals` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `amount` double NOT NULL,
  `status` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `withdrawals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of withdrawals
-- ----------------------------
