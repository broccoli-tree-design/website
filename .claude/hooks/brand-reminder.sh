#!/bin/bash
# PostToolUse: when the brand source changes or `npm run brand` runs, remind
# Claude (once per session) that the claude.ai design system needs a sync after
# the change merges.

input=$(cat)
file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
sid=$(jq -r '.session_id // "x"' <<<"$input")

case "$file" in
  */brand/tokens.json|*/brand/logo/*|*/brand/design-system/*) hit=1 ;;
esac
[[ "$cmd" =~ npm\ run\ brand($|[^:]) ]] && hit=1
[ -z "$hit" ] && exit 0

flag="${TMPDIR:-/tmp}/brand-reminder-$sid"
[ -f "$flag" ] && exit 0
touch "$flag"

jq -n '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext:
  "Brand source changed. Once this merges to main, sync the Claude Design system and the canvases'"'"' token copies as brand/README.md → \"The Claude Design system\" says. Mention it in the PR description so it is not forgotten."}}'
