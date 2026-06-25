---
name: status-report
description: Post a What I Did / What's Left / What Needs Your Call update to Slack.
---

# Status Report Skill

When a request for a status update is triggered, compile progress details from current task states and write a response structured strictly into the following three sections:

## 1. **What I Did**
- Enumerate the tasks successfully completed in this session or since the last report.
- Be specific about files created or modified.

## 2. **What's Left**
- List the remaining tasks that need to be accomplished to reach the current goal.
- Order them by dependency/priority.

## 3. **What Needs Your Call**
- Highlight any blocking decisions, clarifications, design choices, or inputs needed from the user.
- If there are no blockers or questions, state: "None. Proceeding as planned."
