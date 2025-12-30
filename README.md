# 根因分析诊断工具

企业诊断根因分析辅助软件，通过交互式画布帮助用户进行根因分析。

## 功能特性

1. **问题输入页面**：简洁的对话输入框，输入需要分析的问题
2. **交互式画布**：基于 React Flow 的可视化根因分析画布
3. **Why 按钮**：每个节点都有 Why 按钮，点击后创建新的原因节点
4. **节点编辑**：双击节点内容可编辑文本
5. **节点选中**：点击节点可选中，选中状态下点击 Why 按钮会创建新分支
6. **多级追踪**：支持无限级的原因追踪，形成完整的根因分析树

## 技术栈

- React 18
- React Flow 11
- Vite
- CSS3

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

## 使用说明

1. 在输入页面输入您想要分析的问题
2. 点击"开始分析"进入画布模式
3. 点击节点上的"Why?"按钮添加原因节点
4. 双击节点文本可编辑内容
5. 点击节点可选中，选中后点击 Why 按钮会从该节点创建新分支
6. 使用画布控制按钮进行缩放、平移等操作

## 项目结构

```
RootCauseDiagnostic/
├── src/
│   ├── components/
│   │   ├── ProblemInput.jsx      # 问题输入组件
│   │   ├── DiagnosticCanvas.jsx  # 画布主组件
│   │   └── CustomNode.jsx        # 自定义节点组件
│   ├── App.jsx                   # 主应用组件
│   ├── main.jsx                  # 入口文件
│   └── index.css                 # 全局样式
├── index.html
├── package.json
└── vite.config.js
```


