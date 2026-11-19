---
name: push
description: Push the portfolio site's commits to GitHub (origin/main). Use when the user types /push or asks to push or upload the site to GitHub.
disable-model-invocation: true
---

Push this site to GitHub.

1. Run `git status --short`. If there are uncommitted changes, commit them first with a short message.
2. Run `git push origin main`.
3. Never force-push. If the push is rejected, report the error and stop.
4. Report the result in one line, with the repo URL: https://github.com/rkim341/kimrebecca
