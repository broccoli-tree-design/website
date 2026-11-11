#!/bin/bash
# SessionStart: keep the local repo in step with GitHub, and say when the
# claude.ai design system has fallen behind main. Prints a short note that
# Claude sees at the start of every session; prints nothing when all is in sync.
# Never changes anything but a fast-forward of a clean `main` checkout.

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

notes=()
note() { notes+=("- $1"); }

if ! GIT_TERMINAL_PROMPT=0 git -c http.lowSpeedLimit=1 -c http.lowSpeedTime=10 fetch --prune --quiet origin 2>/dev/null; then
  note "Couldn't reach GitHub (git fetch failed), so sync wasn't checked."
  printf 'Repo sync check:\n%s\n' "${notes[@]}"
  exit 0
fi

# The main checkout is the first worktree git lists.
MAIN_DIR=$(git worktree list --porcelain | awk '/^worktree /{print substr($0,10); exit}')
MAIN_BRANCH=$(git -C "$MAIN_DIR" symbolic-ref --short -q HEAD)

if [ "$MAIN_BRANCH" != "main" ]; then
  note "The main checkout ($MAIN_DIR) is on '${MAIN_BRANCH:-a detached HEAD}', not main. It should always stay on main."
else
  behind=$(git -C "$MAIN_DIR" rev-list --count main..origin/main)
  ahead=$(git -C "$MAIN_DIR" rev-list --count origin/main..main)
  dirty=$(git -C "$MAIN_DIR" status --porcelain --untracked-files=no | head -1)
  if [ "$ahead" -gt 0 ]; then
    note "Local main has $ahead commit(s) not on GitHub. Ask the user before pushing or resetting."
  elif [ "$behind" -gt 0 ] && [ -n "$dirty" ]; then
    note "Local main is $behind commit(s) behind GitHub but has uncommitted changes, so it wasn't updated."
  elif [ "$behind" -gt 0 ]; then
    if git -C "$MAIN_DIR" merge --ff-only --quiet origin/main 2>/dev/null; then
      note "Fast-forwarded local main by $behind commit(s) to match GitHub."
    else
      note "Local main is $behind commit(s) behind GitHub and couldn't fast-forward."
    fi
  fi
fi

# This session's own branch, when it runs in a worktree.
HERE=$(git symbolic-ref --short -q HEAD)
if [ -n "$HERE" ] && [ "$HERE" != "main" ]; then
  b=$(git rev-list --count HEAD..origin/main)
  [ "$b" -gt 0 ] && note "This branch ($HERE) is $b commit(s) behind origin/main; sync it before merging."
fi

# Leftover worktrees whose branches are already merged.
git worktree list --porcelain | awk '/^worktree /{w=substr($0,10)} /^branch /{print w" "substr($0,19)}' |
  while read -r dir br; do
    [ "$dir" = "$MAIN_DIR" ] && continue
    [ "$br" = "$HERE" ] && continue
    if [ "$(git rev-list --count "origin/main..$br" 2>/dev/null)" = "0" ] &&
       [ -z "$(git -C "$dir" status --porcelain 2>/dev/null | head -1)" ]; then
      echo "LEFTOVER $br"
    fi
  done > "${TMPDIR:-/tmp}/session-sync-leftovers.$$"
left=$(sed 's/^LEFTOVER //' "${TMPDIR:-/tmp}/session-sync-leftovers.$$" | paste -sd, - | sed 's/,/, /g')
rm -f "${TMPDIR:-/tmp}/session-sync-leftovers.$$"
[ -n "$left" ] && note "Merged worktree branch(es) still on disk: $left. Offer to archive their sessions or remove them."

# Is the claude.ai design system behind main? (marker written after each sync,
# see brand/README.md → "The Claude Design system")
MARK="$HOME/.claude/website-design-system-synced"
if [ -f "$MARK" ]; then
  synced=$(cat "$MARK")
  if git cat-file -e "$synced^{commit}" 2>/dev/null; then
    n=$(git rev-list --count "$synced..origin/main" -- app components brand 2>/dev/null)
    [ "${n:-0}" -gt 0 ] && note "The Claude Design system is behind main: $n commit(s) since its last sync ($(git rev-parse --short "$synced")) touch app/, components/ or brand/. Remind the user to run the design-system sync (brand/README.md) and offer to do it now."
  fi
else
  note "No record of the Claude Design system's last sync. Remind the user to run the design-system sync (brand/README.md) and offer to do it now."
fi

[ ${#notes[@]} -gt 0 ] && printf 'Repo sync check:\n%s\n' "${notes[@]}"
exit 0
