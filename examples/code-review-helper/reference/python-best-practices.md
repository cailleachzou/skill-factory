# Python 最佳实践指南

## 概述
本文档详细描述了Python代码审查中的最佳实践、常见问题和改进建议。

## 代码风格

### PEP 8 规范
#### 命名约定
- **变量**: 小写字母，单词间用下划线分隔 (`snake_case`)
- **函数**: 小写字母，单词间用下划线分隔 (`snake_case`)
- **类**: 每个单词首字母大写 (`CamelCase`)
- **常量**: 全部大写，单词间用下划线分隔 (`UPPER_CASE`)

#### 代码布局
```python
# ✅ 正确
def calculate_total(items):
    """计算商品总价"""
    total = 0
    for item in items:
        total += item.price * item.quantity
    return total

# ❌ 错误
def calculateTotal(items):
    total=0
    for item in items:
        total+=item.price*item.quantity
    return total
```

### 行长度
- 每行不超过79个字符
- 使用括号、方括号或花括号进行隐式续行
- 使用反斜杠进行显式续行

## 类型提示

### 基本类型提示
```python
from typing import List, Dict, Optional, Union

def process_items(items: List[str]) -> Dict[str, int]:
    """处理项目列表"""
    result = {}
    for item in items:
        result[item] = len(item)
    return result

def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    """获取用户信息"""
    # 可能返回None
    pass
```

### 复杂类型
```python
from typing import TypeVar, Generic, Callable

T = TypeVar('T')

class Repository(Generic[T]):
    def __init__(self, items: List[T]):
        self.items = items

    def find(self, predicate: Callable[[T], bool]) -> Optional[T]:
        for item in self.items:
            if predicate(item):
                return item
        return None
```

## 错误处理

### 异常处理最佳实践
```python
# ✅ 正确 - 具体异常
try:
    with open('file.txt', 'r') as f:
        content = f.read()
except FileNotFoundError:
    print("文件不存在")
except PermissionError:
    print("没有文件访问权限")
except Exception as e:
    print(f"未知错误: {e}")

# ❌ 错误 - 过于宽泛
try:
    # 代码
except:
    pass
```

### 自定义异常
```python
class ValidationError(Exception):
    """数据验证错误"""
    def __init__(self, message: str, field: str = None):
        self.message = message
        self.field = field
        super().__init__(message)

def validate_user(user: Dict) -> None:
    if not user.get('name'):
        raise ValidationError("用户名不能为空", field='name')
    if len(user.get('password', '')) < 8:
        raise ValidationError("密码至少8位", field='password')
```

## 性能优化

### 循环优化
```python
# ✅ 正确 - 使用列表推导式
squares = [x**2 for x in range(10) if x % 2 == 0]

# ❌ 错误 - 不必要的复杂循环
squares = []
for x in range(10):
    if x % 2 == 0:
        squares.append(x**2)
```

### 字符串连接
```python
# ✅ 正确 - 使用join
names = ['Alice', 'Bob', 'Charlie']
result = ', '.join(names)

# ❌ 错误 - 使用+操作符
result = ''
for name in names:
    result += name + ', '
result = result.rstrip(', ')
```

### 内存管理
```python
# ✅ 正确 - 使用生成器
def read_large_file(file_path):
    with open(file_path, 'r') as f:
        for line in f:
            yield line.strip()

# ❌ 错误 - 一次性读取
def read_large_file(file_path):
    with open(file_path, 'r') as f:
        return f.readlines()  # 可能内存不足
```

## 设计模式

### 单例模式
```python
from threading import Lock

class DatabaseConnection:
    _instance = None
    _lock = Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        # 初始化连接
        self.connection = None
```

### 工厂模式
```python
from abc import ABC, abstractmethod

class Notification(ABC):
    @abstractmethod
    def send(self, message: str) -> bool:
        pass

class EmailNotification(Notification):
    def send(self, message: str) -> bool:
        # 发送邮件逻辑
        return True

class SMSNotification(Notification):
    def send(self, message: str) -> bool:
        # 发送短信逻辑
        return True

class NotificationFactory:
    @staticmethod
    def create_notification(notification_type: str) -> Notification:
        if notification_type == 'email':
            return EmailNotification()
        elif notification_type == 'sms':
            return SMSNotification()
        else:
            raise ValueError(f"未知的通知类型: {notification_type}")
```

## 测试最佳实践

### 单元测试
```python
import unittest
from unittest.mock import Mock, patch

class TestCalculator(unittest.TestCase):
    def setUp(self):
        self.calc = Calculator()

    def test_add_positive_numbers(self):
        result = self.calc.add(2, 3)
        self.assertEqual(result, 5)

    def test_add_negative_numbers(self):
        result = self.calc.add(-2, -3)
        self.assertEqual(result, -5)

    def test_add_with_zero(self):
        result = self.calc.add(5, 0)
        self.assertEqual(result, 5)
```

### 模拟和打桩
```python
@patch('module.database.query')
def test_get_user(mock_query):
    # 设置模拟返回值
    mock_query.return_value = {'id': 1, 'name': 'Alice'}

    # 执行测试
    result = get_user(1)

    # 验证结果
    assert result['name'] == 'Alice'
    mock_query.assert_called_once_with('SELECT * FROM users WHERE id = 1')
```

## 安全最佳实践

### 输入验证
```python
import re

def validate_email(email: str) -> bool:
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def sanitize_input(input_str: str) -> str:
    """清理用户输入"""
    # 移除HTML标签
    clean = re.sub(r'<[^>]*>', '', input_str)
    # 移除危险字符
    clean = re.sub(r'[<>"\']', '', clean)
    return clean.strip()
```

### 密码安全
```python
import hashlib
import secrets

def hash_password(password: str, salt: bytes = None) -> tuple:
    """使用盐值哈希密码"""
    if salt is None:
        salt = secrets.token_bytes(32)

    # 使用PBKDF2进行密钥派生
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000  # 迭代次数
    )

    return key, salt
```

## 常见反模式

### 避免魔法数字
```python
# ✅ 正确
MAX_RETRY_ATTEMPTS = 3
TIMEOUT_SECONDS = 30

def connect_with_retry():
    for attempt in range(MAX_RETRY_ATTEMPTS):
        try:
            return connect(timeout=TIMEOUT_SECONDS)
        except ConnectionError:
            if attempt == MAX_RETRY_ATTEMPTS - 1:
                raise

# ❌ 错误
def connect_with_retry():
    for attempt in range(3):  # 魔法数字
        try:
            return connect(timeout=30)  # 魔法数字
        except ConnectionError:
            if attempt == 2:  # 魔法数字
                raise
```

### 避免过度嵌套
```python
# ✅ 正确 - 使用提前返回
def process_item(item):
    if not item:
        return None

    if not item.is_valid():
        return None

    # 主要处理逻辑
    result = transform(item)
    return result

# ❌ 错误 - 过度嵌套
def process_item(item):
    if item:
        if item.is_valid():
            result = transform(item)
            return result
    return None
```

## 工具和库推荐

### 代码质量工具
- **black**: 代码格式化
- **flake8**: 代码风格检查
- **mypy**: 静态类型检查
- **pylint**: 代码分析
- **bandit**: 安全漏洞扫描

### 测试工具
- **pytest**: 测试框架
- **hypothesis**: 属性测试
- **coverage**: 测试覆盖率
- **tox**: 多环境测试

### 性能分析
- **cProfile**: 性能分析
- **memory_profiler**: 内存分析
- **line_profiler**: 行级性能分析

## 总结
遵循这些最佳实践可以帮助您编写更清晰、更安全、更高效的Python代码。在代码审查中，重点关注这些方面可以提高整体代码质量。