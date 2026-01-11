{
  "name": "{{skill_name}}",
  "version": "{{version | default: '0.1.0'}}",
  "description": "{{description}}",
  "author": "{{author | default: 'Skill Factory'}}",
  "created_date": "{{now format='YYYY-MM-DD'}}",

  "type": "coordinator",
  "category": "meta-skill",

  "tools": [
    {{#each tools_needed}}
    {
      "name": "{{this}}",
      "permissions": "{{get_tool_permissions this}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ],

  "input_schema": {
    "type": "object",
    "properties": {
      "operation": {
        "type": "string",
        "description": "要执行的操作",
        "enum": ["start", "stop", "pause", "resume", "status"],
        "default": "start"
      },
      "workflow_id": {
        "type": "string",
        "description": "工作流ID",
        "pattern": "^[a-z0-9-]+$"
      },
      "parameters": {
        "type": "object",
        "description": "操作参数",
        "additionalProperties": true
      },
      "sub_skills": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "要协调的子技能列表"
      }
    },
    "required": ["operation"]
  },

  "output_schema": {
    "type": "object",
    "properties": {
      "success": {
        "type": "boolean",
        "description": "操作是否成功"
      },
      "workflow_state": {
        "type": "object",
        "description": "工作流状态",
        "properties": {
          "id": {"type": "string"},
          "status": {"type": "string"},
          "current_step": {"type": "string"},
          "progress": {"type": "number"},
          "start_time": {"type": "string"},
          "end_time": {"type": "string"}
        }
      },
      "sub_skills_status": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "status": {"type": "string"},
            "result": {"type": "any"}
          }
        },
        "description": "子技能状态"
      },
      "errors": {
        "type": "array",
        "items": {"type": "string"},
        "description": "错误信息"
      }
    }
  },

  "state_management": {
    "persistent": true,
    "storage": "file",
    "backup": true,
    "sync_interval": 30000
  },

  "workflow_engine": {
    "supported_patterns": ["sequential", "parallel", "conditional", "loop"],
    "error_handling": "continue",
    "timeout": 300000,
    "retry_policy": {
      "max_attempts": 3,
      "backoff_factor": 2
    }
  },

  "sub_skill_registry": {
    "dynamic_registration": true,
    "discovery": "manual",
    "validation": "strict"
  },

  "examples": [
    {
      "name": "启动工作流",
      "input": {
        "operation": "start",
        "workflow_id": "data-processing-001",
        "sub_skills": ["data-loader", "data-processor", "data-exporter"],
        "parameters": {
          "input_path": "./data/input.csv",
          "output_path": "./data/output.json"
        }
      },
      "output": {
        "success": true,
        "workflow_state": {
          "id": "data-processing-001",
          "status": "running",
          "current_step": "data-loader",
          "progress": 0.1,
          "start_time": "2026-01-09T10:00:00Z"
        }
      }
    }
  ],

  "monitoring": {
    "metrics": ["throughput", "latency", "error_rate", "resource_usage"],
    "logging": {
      "level": "info",
      "format": "json",
      "retention": "7d"
    },
    "alerts": ["error_rate > 0.05", "latency > 5000"]
  },

  "documentation": {
    "overview": "这是一个协调器技能，用于管理和协调多个子技能的执行。",
    "quick_start": "使用 'operation: start' 启动工作流，'operation: status' 检查状态。",
    "api_reference": "./docs/api-reference.md",
    "troubleshooting": "./docs/troubleshooting.md"
  }
}