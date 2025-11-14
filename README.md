# HttpRunner Helper

VS Code 扩展，用于便捷地编辑 httprunner 的测试用例。

## 功能特性

### 1. 目录文件自动补全

当编辑 YAML 测试文件时，输入目录路径并以 `/` 结尾时，扩展会自动显示该目录下的所有文件和子目录。

**使用方法：**
- 在 YAML 文件中输入目录路径并加上 `/`，如 `apis/`
- 自动弹出补全列表，显示该目录下的所有文件和子目录
- 选择目录后自动添加 `/` 并继续触发下一级补全
- 使用 Tab 或 Enter 键选择文件或目录
- 支持多级嵌套目录的连续补全

**示例：**
```yaml
# 在 testcases/login/test_login_success.yaml 中
- name: login
  api: apis/  # 输入 'apis/' 后显示该目录下的内容
  # 显示：base.yaml, user/, user copy/ 等
  # 选择 user/ 后继续显示：login.yaml 等
  # 最终：api: apis/user/login.yaml
```

### 2. debugtalk.py 函数自动补全

自动识别项目根目录下的 `debugtalk.py` 文件中定义的函数，并在输入 `$` 时提供智能补全。

**使用方法：**
- 在 YAML 文件中输入 `$`（美元符号）
- 自动弹出 debugtalk.py 中定义的所有公开函数
- 使用 Tab 或 Enter 键选择函数
- 自动插入完整的 `${function_name()}` 表达式
- 对于有参数的函数，会自动生成参数占位符，使用 Tab 键在参数间跳转

**示例：**
```yaml
# debugtalk.py 中定义了:
# def get_token():
#     return "token"
#
# def get_user_id(username):
#     return 123

variables:
  token: $  # 输入 $ 后会显示 get_token(), get_user_id(username) 等
  # 选择后自动变成: token: ${get_token()}
```

## 安装

### 从源码安装

1. 克隆此仓库
2. 安装依赖：
   ```bash
   npm install
   ```
3. 编译扩展：
   ```bash
   npm run compile
   ```
4. 在 VS Code 中按 F5 启动调试窗口测试扩展

### 打包安装

```bash
npm install -g @vscode/vsce
vsce package
code --install-extension httprunner-helper-0.0.1.vsix
```

## 开发

### 项目结构

```
.
├── src/
│   ├── extension.ts                      # 扩展入口
│   ├── providers/
│   │   ├── pathCompletionProvider.ts     # 路径补全提供者
│   │   └── functionCompletionProvider.ts # 函数补全提供者
│   └── utils/
│       └── debugtalkParser.ts            # debugtalk.py 解析器
├── package.json                          # 扩展配置
└── tsconfig.json                         # TypeScript 配置
```

### 运行和调试

1. 在 VS Code 中打开项目
2. 按 F5 启动扩展开发主机
3. 在新窗口中创建或打开一个 httprunner 项目进行测试

### 编译

```bash
npm run compile
```

### 监听模式

```bash
npm run watch
```

## 系统要求

- VS Code 版本 >= 1.85.0
- Node.js >= 20.x

## 许可证

MIT
