---
name: code-review-helper
description: 自动化代码审查工具，检测代码质量问题并提供改进建议。当用户需要分析代码质量、查找潜在错误、学习代码最佳实践或审查团队代码时使用。
allowed-tools: Read, Edit, Bash
user-invocable: true
---

# 代码审查助手

## 概述
本Skill帮助您审查代码质量，检测常见问题，并提供具体的改进建议。支持多种编程语言和代码模式分析。

## 快速开始

### 审查单个文件
选择要审查的代码文件，我会：
1. 分析代码结构和风格
2. 检测潜在问题和反模式
3. 提供具体的改进建议
4. 给出最佳实践示例

### 批量审查目录
审查整个目录的代码：
```
请审查当前目录下的所有Python文件。
```

## 支持的代码类型

### 主要语言
- **Python**: PEP 8规范、类型提示、错误处理
- **JavaScript/TypeScript**: ESLint规则、异步模式、类型安全
- **Java**: 编码规范、设计模式、异常处理
- **Go**: Go语言规范、错误处理、并发模式
- **C++**: 现代C++最佳实践、内存管理、性能优化

### 配置和脚本文件
- JSON/YAML配置文件
- Shell/PowerShell脚本
- Dockerfile和Kubernetes配置
- CI/CD管道配置

## 审查检查项

### 代码质量
- **命名规范**: 变量、函数、类名是否清晰一致
- **代码复杂度**: 函数长度、嵌套深度、圈复杂度
- **重复代码**: 检测重复或相似的代码片段
- **注释质量**: 注释是否清晰、及时、有用

### 最佳实践
- **错误处理**: 适当的异常捕获和处理
- **资源管理**: 文件、连接、内存的正确管理
- **安全性**: 常见安全漏洞和防范
- **性能**: 潜在的性能瓶颈和优化建议

### 架构设计
- **模块化**: 代码组织是否合理
- **依赖管理**: 依赖关系是否清晰
- **接口设计**: API是否清晰一致
- **可测试性**: 代码是否易于测试

## 使用示例

### 示例1：Python代码审查
```python
# 要审查的代码
def process_data(data):
    result = []
    for item in data:
        if item > 10:
            result.append(item * 2)
    return result
```

**审查建议**：
1. 添加类型提示：`def process_data(data: List[int]) -> List[int]:`
2. 使用列表推导式简化代码
3. 考虑使用filter和map函数式编程

### 示例2：JavaScript代码审查
```javascript
// 要审查的代码
function getUserData(id) {
    fetch('/api/users/' + id)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            return data;
        });
}
```

**审查建议**：
1. 添加错误处理：`.catch(error => console.error('Error:', error))`
2. 使用async/await语法更清晰
3. 考虑添加加载状态和超时处理

## 详细参考

### Python最佳实践
完整的最佳实践指南请参考：[python-best-practices.md](reference/python-best-practices.md)

### JavaScript/TypeScript规范
详细编码规范请参考：[js-ts-guidelines.md](reference/js-ts-guidelines.md)

### 安全审查指南
安全相关的最佳实践请参考：[security-checklist.md](reference/security-checklist.md)

## 实用脚本

### 运行代码质量检查
```bash
# 检查Python代码
python scripts/check_python.py your_file.py

# 检查JavaScript代码
node scripts/check_javascript.js your_file.js
```

### 生成审查报告
```bash
# 生成HTML格式的审查报告
python scripts/generate_report.py --format html --output review_report.html
```

## 故障排除

### Skill不触发
如果本Skill没有自动触发：
- 使用关键词：`代码审查`、`代码质量`、`代码检查`、`最佳实践`
- 明确指定语言：`Python代码审查`、`JavaScript代码检查`

### 工具权限问题
如果需要更多工具权限：
- 文件读取：需要`Read`权限
- 代码编辑建议：需要`Edit`权限
- 运行检查脚本：需要`Bash`权限

### 性能问题
如果审查过程较慢：
- 尝试先审查单个文件
- 使用`.gitignore`排除不必要的文件
- 限制文件大小和复杂度

## 最佳实践

### 审查频率
- **提交前**: 每次提交前审查修改的代码
- **定期**: 每周或每月全面审查
- **新功能**: 新功能开发完成后专项审查

### 审查重点
1. **新代码**: 重点关注新编写的代码
2. **关键路径**: 审查系统的核心组件
3. **安全敏感**: 特别注意安全相关的代码
4. **性能瓶颈**: 关注可能影响性能的代码

### 团队协作
- 建立统一的代码规范
- 使用代码审查工具辅助
- 定期分享审查发现和最佳实践
- 建立代码审查文化

## 开始审查

告诉我您要审查的代码文件或描述您的代码审查需求，我将为您提供详细的审查建议和改进方案。

**示例请求**：
- "请审查这个Python函数的代码质量"
- "检查这个JavaScript文件中的潜在问题"
- "分析这个Go项目的整体代码结构"
- "帮我改进这个Java类的设计"