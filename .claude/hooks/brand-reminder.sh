#!/bin/bash
# PostToolUse: two reminders about the claude.ai design system.
# - After `gh pr merge`: remind the user to sync it now (every time).
# - When the brand source changes or `npm run brand` runs: sync it once this
#   merges (once per session).

input=$(cat)
file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
sid=$(jq -r '.session_id // "x"' <<<"$input")

if [[ "$cmd" =~ (^|[^[:alnum:]])gh\ pr\ merge ]]; then
  jq -n '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext:
    "A PR was just merged. Remind the user to run the design-system sync (brand/README.md → \"The Claude Design system\") if it touched app/, components/ or brand/, and offer to do it now."}}'
  exit 0
fi

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
