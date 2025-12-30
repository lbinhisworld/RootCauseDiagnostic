# GitHub 同步指南

## 步骤 1: 在 GitHub 上创建仓库

1. 登录 GitHub (https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `RootCauseDiagnostic` (或您喜欢的名称)
   - Description: `企业诊断根因分析辅助软件`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 "Create repository"

## 步骤 2: 连接本地仓库到 GitHub

复制 GitHub 上显示的仓库 URL（例如：`https://github.com/yourusername/RootCauseDiagnostic.git`），然后运行：

```bash
# 添加远程仓库（请将 URL 替换为您实际的 GitHub 仓库 URL）
git remote add origin https://github.com/yourusername/RootCauseDiagnostic.git

# 将分支重命名为 main（GitHub 默认使用 main）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

## 如果使用 SSH（推荐）

如果您已经配置了 SSH 密钥，可以使用 SSH URL：

```bash
git remote add origin git@github.com:yourusername/RootCauseDiagnostic.git
git branch -M main
git push -u origin main
```

## 后续更新

之后如果您修改了代码，可以使用以下命令同步：

```bash
git add .
git commit -m "您的提交信息"
git push
```


