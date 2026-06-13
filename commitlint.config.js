// prettier-ignore
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',      // 新功能
        'fix',       // 修复 bug
        'docs',      // 文档变更
        'style',     // 代码格式（不影响逻辑）
        'refactor',  // 重构
        'perf',      // 性能优化
        'test',      // 测试
        'chore',     // 构建/工具/依赖变更
        'ci',        // CI 配置
        'revert',    // 回滚
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
}
