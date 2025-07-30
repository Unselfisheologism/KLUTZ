# OpenManus Web 应用

这是OpenManus项目的Web界面部分，提供了一个友好的用户界面，让用户可以直接在浏览器中与OpenManus AI助手进行交互。

![OpenManus Web界面](../assets/interface.png)

## 主要特性

- 🌐 现代化Web界面，支持实时通信
- 💬 直观的聊天界面，可以提问并获得AI回答
- 🧠 可视化思考过程，展示AI思考的每一步
- 📁 工作区文件管理，查看和管理AI生成的文件
- 📊 详细的日志跟踪和监控
- 🚀 支持中断和停止正在处理的请求

## 技术栈

- **后端**: FastAPI, Python, WebSocket
- **前端**: HTML, CSS, JavaScript
- **通信**: WebSocket实时通信
- **存储**: 文件系统存储生成的文件和日志

## 快速开始

1. 确保已安装所有依赖:

```bash
pip install -r requirements.txt
```

2. 启动Web服务器:

```bash
python web_run.py
```

或者从项目根目录:

```bash
python main.py --web
```

3. 打开浏览器访问: http://localhost:8000

## 项目结构

```
app/web/
├── app.py               # Web应用主入口，FastAPI应用实例
├── log_handler.py       # 日志处理模块
├── log_parser.py        # 日志解析器
├── thinking_tracker.py  # 思考过程跟踪器
├── static/              # 静态资源文件夹(JS, CSS)
│   ├── connected_interface.html # 主要界面HTML
│   ├── connected_interface.js   # 主要界面JavaScript
│   └── ...                      # 其他静态资源
└── templates/           # Jinja2模板文件夹
```

## API端点

### 聊天相关

- `POST /api/chat` - 创建新的聊天会话
- `GET /api/chat/{session_id}` - 获取特定会话的结果
- `POST /api/chat/{session_id}/stop` - 停止特定会话的处理
- `WebSocket /ws/{session_id}` - 与会话建立WebSocket连接

### 文件相关

- `GET /api/files` - 获取所有工作区目录和文件
- `GET /api/files/{file_path}` - 获取特定文件的内容

### 日志相关

- `GET /api/logs` - 获取系统日志列表
- `GET /api/logs/{log_name}` - 获取特定日志文件内容
- `GET /api/logs_parsed` - 获取解析后的日志信息列表
- `GET /api/logs_parsed/{log_name}` - 获取特定日志文件的解析信息
- `GET /api/latest_log` - 获取最新日志文件的解析信息
- `GET /api/systemlogs/{session_id}` - 获取指定会话的系统日志

### 思考过程

- `GET /api/thinking/{session_id}` - 获取特定会话的思考步骤
- `GET /api/progress/{session_id}` - 获取特定会话的进度信息

## 界面说明

OpenManus Web界面分为两个主要部分:

1. **左侧面板** - 显示AI思考过程和工作区文件
   - AI思考时间线：显示AI处理过程中的每个步骤
   - 工作区文件：显示AI生成的文件，可以点击查看内容

2. **右侧面板** - 对话界面
   - 对话历史：显示用户和AI之间的对话
   - 输入区域：用户可以输入问题或指令

## 本地开发

1. 克隆仓库
2. 安装依赖
3. 在开发模式启动应用:

```bash
uvicorn app.web.app:app --reload
```
或者
```bash
python web_run.py
```

## 贡献

欢迎贡献代码、报告问题或提出改进建议。请创建Issue或提交Pull Request。

## 许可证

本项目使用[开源许可证]，详见项目根目录的LICENSE文件。

## 技术支持

如有问题或需要帮助，请创建GitHub Issue。
