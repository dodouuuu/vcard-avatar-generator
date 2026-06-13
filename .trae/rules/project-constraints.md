---
scene: project
alwaysApply: true
---

## Constraints for **Git**

1. Commits and pushes must proceed only when explicitly requested by the user.
2. Commit messages must follow `commitlint.config.js` conventions and use English only.
3. Commit messages must use the `AskUserQuestion` tool with a single option "Commit". Selecting "Commit" proceeds with the commit, selecting "Other" revises the message with user input, and dismissing or any other action cancels the operation.

## Constraints for **Code**

1. Code must refer to the same concept by the same name across variables, methods, parameters, etc.

## Constraints for **Comments**

1. Comments must cover at least 20% of the codebase.
2. Comments must avoid trivial or redundant statements (e.g., "if true, proceed to the next step").
3. Comments must use English only.
