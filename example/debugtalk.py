"""
HttpRunner 测试辅助函数
"""

def get_token():
    """获取认证 token"""
    return "test_token_123456"


def get_user_id(username):
    """根据用户名获取用户ID"""
    user_map = {
        "admin": 1,
        "user1": 2,
        "user2": 3
    }
    return user_map.get(username, 0)


def generate_random_string(length=10):
    """生成指定长度的随机字符串"""
    import random
    import string
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def calculate_signature(data, secret_key):
    """计算签名"""
    import hashlib
    import json
    data_str = json.dumps(data, sort_keys=True)
    signature = hashlib.md5(f"{data_str}{secret_key}".encode()).hexdigest()
    return signature


def _private_helper():
    """私有函数，不应该在补全中显示"""
    pass
