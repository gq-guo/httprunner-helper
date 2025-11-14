# 使用指南

## 快速开始

### 1. 安装和运行扩展

#### 开发模式测试

1. 打开此项目文件夹
2. 安装依赖：
   ```bash
   npm install
   ```
3. 编译代码：
   ```bash
   npm run compile
   ```
4. 按 `F5` 启动扩展开发主机（会自动打开 example 文件夹）
5. 在新窗口中打开 [example/testcases/login/test_login_success.yaml](example/testcases/login/test_login_success.yaml)

#### 打包安装

```bash
# 安装打包工具
npm install -g @vscode/vsce

# 打包扩展
vsce package

# 安装到 VS Code
code --install-extension httprunner-helper-0.0.1.vsix
```

### 2. 功能演示

#### 功能 1：目录文件自动补全

1. 打开 [example/testcases/login/test_login_success.yaml](example/testcases/login/test_login_success.yaml)
2. 找到 `api:` 字段（约第 10 行）
3. 在 `api:` 后输入 `apis/`（注意要输入斜杠）
4. 观察自动补全列表，会显示 `apis/` 目录下的所有内容：
   - `base.yaml` (文件)
   - `user/` (目录)
   - `user copy/` (目录)
5. 选择 `user/`，继续显示子目录内容：
   - `login.yaml` (文件)

**预期结果：**
```yaml
teststeps:
  - name: login with valid credentials
    api: apis/user/login.yaml  # 通过多级补全选择
```

**补充说明：**
- 触发字符是 `/`，输入斜杠后才会显示目录内容
- 选择目录后会自动添加 `/` 并继续触发下一级补全
- 支持多级嵌套目录的连续补全

#### 功能 2：debugtalk.py 函数自动补全

1. 继续编辑同一个文件
2. 找到 `token:` 字段（约第 14 行）
3. 在 `token:` 后输入 `$`（只需输入美元符号）
4. 观察自动补全列表，应该显示 debugtalk.py 中的函数：
   - `get_token()` - 无参数函数
   - `get_user_id(username)` - 单参数函数
   - `generate_random_string(length)` - 带默认值的参数
   - `calculate_signature(data, secret_key)` - 多参数函数
5. 选择 `get_token()`

**预期结果：**
```yaml
variables:
  token: ${get_token()}  # 自动补全完整表达式
```

6. 再尝试输入带参数的函数：
   - 输入 `$`
   - 选择 `get_user_id(username)`
   - 自动生成 `${get_user_id(username)}`，且 `username` 被选中高亮
   - 可以直接输入替换参数值
   - 按 Tab 跳转到下一个参数（如果有多个参数）

**预期结果：**
```yaml
variables:
  user_id: ${get_user_id(admin)}  # 参数已替换
```

### 3. 项目结构要求

扩展会自动查找包含 `debugtalk.py` 的目录作为项目根目录，因此你的项目需要满足：

```
your-project/
├── debugtalk.py          # 必需，用于标识项目根目录
├── apis/                 # 可选，API 定义目录
│   ├── base.yaml
│   └── user/
│       └── login.yaml
├── data/                 # 可选，测试数据目录
│   ├── data1.json
│   └── data2.json
└── testcases/            # 测试用例目录
    └── login/
        └── test_login_success.yaml
```

### 4. 支持的 debugtalk.py 函数格式

扩展可以正确解析以下函数定义格式：

```python
# ✅ 无参数函数
def get_token():
    return "token"

# ✅ 单参数函数
def get_user_id(username):
    return 123

# ✅ 多参数函数
def calculate_signature(data, secret_key):
    return "signature"

# ✅ 带默认值的参数
def generate_random_string(length=10):
    return "random"

# ✅ 带类型注解的参数
def process_data(data: dict, count: int = 5) -> str:
    return "result"

# ❌ 私有函数（以 _ 开头）不会显示在补全列表中
def _private_helper():
    pass
```

### 5. 常见问题

**Q: 为什么补全列表没有显示？**

A: 请检查：
1. 当前文件是否为 `.yaml` 文件
2. 项目根目录（向上查找最多 10 层）是否包含 `debugtalk.py`
3. 是否输入了正确的触发字符（路径补全用 `/`，函数补全用 `$`）

**Q: debugtalk.py 修改后补全列表没有更新？**

A: 扩展每次触发补全时都会重新解析 debugtalk.py，无需重启。如果仍未更新，请检查 debugtalk.py 的语法是否正确。

**Q: 如何输入多层嵌套的目录路径？**

A: 逐级输入即可，每次输入 `/` 后会触发新的补全。例如：
- 输入 `apis/` → 选择 `user/`
- 继续显示补全 → 选择 `login.yaml`

## 开发和调试

### 监听模式

在开发过程中，可以使用监听模式自动编译代码：

```bash
npm run watch
```

然后按 `F5` 启动调试，修改代码后会自动重新编译。

### 查看日志

在扩展开发主机窗口中：
1. 打开"帮助" → "切换开发人员工具"
2. 切换到"控制台"标签
3. 可以看到扩展的 console.log 输出

## 反馈和贡献

如有问题或建议，欢迎提交 Issue 或 Pull Request。
