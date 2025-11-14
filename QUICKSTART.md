# 快速开始

## 立即体验

### 步骤 1：启动扩展

```bash
# 安装依赖
npm install

# 编译代码
npm run compile

# 按 F5 启动扩展开发主机（或使用 VS Code 的"运行和调试"面板）
```

### 步骤 2：测试目录文件补全

1. 在新打开的窗口中，打开文件：[example/testcases/login/test_login_success.yaml](example/testcases/login/test_login_success.yaml)

2. 找到第 10 行左右的 `api:` 字段

3. 在 `api:` 后面输入 `apis/`（注意输入斜杠）

4. 你会看到自动补全列表显示该目录下的所有内容：
   ```
   📄 base.yaml
   📁 user/
   📁 user copy/
   ```

5. 选择 `user/`，然后会继续显示：
   ```
   📄 login.yaml
   ```

6. 选择后最终结果：
   ```yaml
   api: apis/user/login.yaml
   ```

### 步骤 3：测试函数补全

1. 在同一文件中，找到第 14 行左右的 `token:` 字段

2. 在 `token:` 后面输入 `$`（只需输入美元符号）

3. 你会看到自动补全列表显示 debugtalk.py 中的函数：
   ```
   ⚡ get_token()
   ⚡ get_user_id(username)
   ⚡ generate_random_string(length)
   ⚡ calculate_signature(data, secret_key)
   ```

4. 选择 `get_token()`，最终结果：
   ```yaml
   token: ${get_token()}  # 自动补全完整表达式
   ```

5. 再试试带参数的函数：
   - 在新行输入 `user_id: $`
   - 选择 `get_user_id(username)`
   - 会自动插入 `${get_user_id(username)}`
   - `username` 会被高亮选中，直接输入就能替换
   - 如果有多个参数，按 Tab 键跳转到下一个参数

## 项目结构说明

扩展依赖以下项目结构：

```
your-httprunner-project/
├── debugtalk.py          ← 必需！扩展通过此文件识别项目根目录
├── apis/                 ← 可选，存放 API 定义
│   ├── base.yaml
│   └── user/
│       └── login.yaml
├── data/                 ← 可选，存放测试数据
│   └── *.json
└── testcases/            ← 存放测试用例
    └── *.yaml
```

## 核心功能

### ✅ 功能 1：路径补全
- 触发：输入 `/`（斜杠）
- 效果：显示当前路径下的所有文件和目录
- 特性：
  - 输入 `apis/` 显示 apis 目录下的内容
  - 选择目录自动添加 `/` 并继续补全
  - 支持多级目录嵌套

### ✅ 功能 2：函数补全
- 触发：输入 `$`（美元符号）
- 效果：列出 debugtalk.py 中的所有公开函数
- 特性：
  - 自动插入完整的 `${func()}` 表达式
  - 自动过滤私有函数（以 `_` 开头）
  - 有参数函数使用 Snippet 模式，参数高亮，可用 Tab 跳转

## 下一步

- 查看 [README.md](README.md) 了解详细功能说明
- 查看 [USAGE.md](USAGE.md) 了解使用指南和常见问题
- 修改 [example/debugtalk.py](example/debugtalk.py) 添加自己的函数，立即生效

## 打包安装

如果要在实际项目中使用，可以打包安装：

```bash
# 安装打包工具
npm install -g @vscode/vsce

# 打包
vsce package

# 安装
code --install-extension httprunner-helper-0.0.1.vsix
```
