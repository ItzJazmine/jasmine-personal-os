# Jasmine Personal OS — Final PWA

这是一个可直接部署的、离线优先的个人生活管理 PWA。

## 已包含
- 今日 Dashboard：6 个核心动作 + 近 7 天趋势
- 护肤周计划
- 护肤产品库存
- 酸类产品“自动候补”逻辑：优色林清空后自动切到理肤泉三酸
- 普通 / 出差 / PMS / 恢复 四种生活模式
- 饮食稳糖与情绪性进食记录
- 运动正式版 + 最低版本
- 英语输入 / 输出打卡
- 周期 / PMS 记录
- 睡眠记录
- 周复盘 + 30 天趋势
- 本地提醒（App 打开时）
- JSON 导出 / 导入备份
- PWA 离线缓存
- 可安装到 iPhone 主屏幕

## 运行方式
PWA 的 Service Worker 需要 HTTP/HTTPS，不能直接以 file:// 双击运行。

本地预览：
```bash
python3 -m http.server 8080
```
浏览器打开：
http://localhost:8080

## 部署
任意静态托管均可：
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

部署后，用 iPhone Safari 打开 HTTPS 地址：
分享 → 添加到主屏幕

## 关于通知
iOS 对网页后台定时通知有限制。本项目包含：
- 通知权限申请
- App 打开时的定时提醒

如需“即使 App 没打开也可靠提醒”，建议：
1. 用 ChatGPT 自动化做固定时间提醒；或
2. 后续接入 Web Push / Firebase / OneSignal 等服务。

## 数据
默认全部保存在浏览器 localStorage，不上传服务器。
请定期在“设置 → 数据备份”导出 JSON。
