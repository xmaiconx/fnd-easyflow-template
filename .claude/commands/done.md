# Feature Completion & Merge Specialist

You are now acting as a **Feature Completion & Merge Coordinator**. Your role is to finalize the feature development, commit remaining changes, merge to main/master, and clean up the feature branch.

This command COMPLETES the feature development workflow and integrates the feature into the main codebase.

## Phase 1: Identify Feature & Verify State (AUTOMATIC)

### Step 1: Detect Current Feature

Automatically identify the feature from the current branch:

```bash
# Identify feature from branch name
FEATURE_ID=$(bash .claude/scripts/identify-current-feature.sh)
CURRENT_BRANCH=$(git branch --show-current)
```

**If feature identified:**
- Display feature ID, path, and current branch
- Ask user: "Complete and merge feature `${FEATURE_ID}` to main? (yes/no)"

**If no feature identified:**
- Error: "You're not on a feature branch. Cannot proceed with /done."
- Display current branch name
- Suggest: "Switch to your feature branch first, or use git commands manually."

### Step 2: Verify Git Status

Check for uncommitted changes:

```bash
git status --porcelain
```

**If there are uncommitted changes:**
- Display list of modified/untracked files
- Ask user: "You have uncommitted changes. What would you like to do?"
  - **Option 1**: Commit all changes now (recommended)
  - **Option 2**: Discard changes and proceed
  - **Option 3**: Cancel /done (let me commit manually)

**If Option 1 (Commit all changes):**
- Ask user: "Provide a commit message (or press Enter for default):"
- Default message: `feat(${FEATURE_ID}): finalize feature implementation`
- Execute commit

**If Option 2 (Discard):**
- **WARNING**: "This will discard all uncommitted changes. Are you sure? (yes/no)"
- If yes: `git reset --hard HEAD`
- If no: Cancel /done

**If Option 3 (Cancel):**
- Exit command
- User can commit manually and run `/done` again

### Step 3: Load Feature Documentation

```bash
FEATURE_DIR="docs/features/${FEATURE_ID}"

# Check if git-pr.md exists
if [ -f "${FEATURE_DIR}/git-pr.md" ]; then
    cat "${FEATURE_DIR}/git-pr.md"
fi
```

## Phase 2: Final Push to Feature Branch (MANDATORY)

Ensure all changes are pushed to the remote feature branch:

```bash
# Push any remaining commits to feature branch
git push origin ${CURRENT_BRANCH}
```

**Verify push succeeded:**
- Check for errors
- If push fails (e.g., diverged branches), ask user how to proceed:
  - Pull and rebase: `git pull --rebase origin ${CURRENT_BRANCH}`
  - Force push (dangerous): `git push --force-with-lease origin ${CURRENT_BRANCH}`
  - Cancel and let user handle manually

## Phase 3: Switch to Main Branch (MANDATORY)

Detect the main branch name:

```bash
# Try to detect main branch (main or master)
if git show-ref --verify --quiet refs/heads/main; then
    MAIN_BRANCH="main"
elif git show-ref --verify --quiet refs/heads/master; then
    MAIN_BRANCH="master"
else
    # Ask user
    echo "Cannot detect main branch. Is it 'main' or 'master'?"
fi
```

Switch to main branch:

```bash
# Checkout main branch
git checkout ${MAIN_BRANCH}

# Pull latest changes from origin
git pull origin ${MAIN_BRANCH}
```

**Verify checkout succeeded:**
- Confirm we're now on main/master
- Confirm pull succeeded
- If conflicts during pull, ask user to resolve manually

## Phase 4: Merge Feature Branch (MANDATORY)

Ask user about merge strategy:

**"How would you like to merge this feature?"**

1. **Merge Commit** (default, preserves history)
   - Creates a merge commit
   - Keeps full feature branch history
   - Command: `git merge --no-ff ${CURRENT_BRANCH}`

2. **Squash Merge** (clean single commit)
   - Squashes all feature commits into one
   - Cleaner main branch history
   - Command: `git merge --squash ${CURRENT_BRANCH}`
   - Requires commit message after

3. **Rebase Merge** (linear history)
   - Rebases feature commits onto main
   - Linear history, no merge commit
   - Command: `git rebase ${MAIN_BRANCH} ${CURRENT_BRANCH} && git checkout ${MAIN_BRANCH} && git merge ${CURRENT_BRANCH}`

**Execute chosen merge strategy:**

### For Merge Commit (Option 1):
```bash
git merge --no-ff ${CURRENT_BRANCH} -m "Merge branch '${CURRENT_BRANCH}' - ${FEATURE_ID}

Completes implementation of ${FEATURE_ID}.

See docs/features/${FEATURE_ID}/ for complete documentation.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### For Squash Merge (Option 2):
```bash
git merge --squash ${CURRENT_BRANCH}

# Ask user for squash commit message
git commit -m "feat(${FEATURE_ID}): [user provided summary]

[Detailed description if provided]

See docs/features/${FEATURE_ID}/ for complete documentation.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### For Rebase Merge (Option 3):
```bash
git checkout ${CURRENT_BRANCH}
git rebase ${MAIN_BRANCH}
git checkout ${MAIN_BRANCH}
git merge ${CURRENT_BRANCH}
```

**Handle merge conflicts:**

If conflicts occur during merge:
1. Display conflicted files
2. Inform user: "Merge conflicts detected in:"
   - List conflicted files
3. Provide guidance:
   ```
   Please resolve conflicts manually:
   1. Edit the conflicted files
   2. Mark as resolved: git add [file]
   3. Complete merge: git commit
   4. Run /done again to continue
   ```
4. Exit /done command (user resolves and re-runs)

## Phase 5: Push Merged Changes (MANDATORY)

Push the merged changes to remote main branch:

```bash
git push origin ${MAIN_BRANCH}
```

**Verify push succeeded:**
- Check for errors
- If push rejected (non-fast-forward), inform user:
  ```
  Remote main has new commits. Please:
  1. Pull latest: git pull origin ${MAIN_BRANCH}
  2. Resolve any conflicts
  3. Push again: git push origin ${MAIN_BRANCH}
  ```

## Phase 6: Update PR/MR Status (OPTIONAL)

If `git-pr.md` exists, update it:

```bash
# Update git-pr.md status to merged
FEATURE_DIR="docs/features/${FEATURE_ID}"

# Read current git-pr.md
# Update status checkboxes
# Add merge information
```

**Update template:**
```markdown
# Pull Request / Merge Request

**Branch:** `${CURRENT_BRANCH}`
**Feature:** ${FEATURE_ID}
**Created:** [original date]
**Merged:** [current date and time]

## PR/MR Link

[original PR/MR link]

## Status

- [x] Draft
- [x] Ready for Review
- [x] Approved
- [x] Merged ✅

## Merge Details

**Merged to:** ${MAIN_BRANCH}
**Merge Date:** [current date and time]
**Merge Strategy:** [Merge Commit / Squash / Rebase]
**Merged By:** Claude Code

## Notes

[Existing notes]
```

**Commit the updated git-pr.md:**
```bash
git add "${FEATURE_DIR}/git-pr.md"
git commit -m "docs: mark ${FEATURE_ID} as merged

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin ${MAIN_BRANCH}
```

## Phase 7: Cleanup Feature Branch (OPTIONAL)

Ask user: **"Would you like to delete the feature branch?"**

**Options:**
1. **Delete local and remote** (recommended after successful merge)
2. **Delete local only** (keep remote for reference)
3. **Keep both** (no deletion)

### Delete Local and Remote (Option 1):
```bash
# Delete local branch
git branch -d ${CURRENT_BRANCH}

# Delete remote branch
git push origin --delete ${CURRENT_BRANCH}
```

### Delete Local Only (Option 2):
```bash
# Delete local branch only
git branch -d ${CURRENT_BRANCH}
```

### Keep Both (Option 3):
```bash
# No action needed
echo "Feature branch ${CURRENT_BRANCH} preserved locally and remotely."
```

**Note:** If branch deletion fails because branch is not fully merged, ask user:
- "Branch may have unmerged commits. Force delete? (yes/no)"
- If yes: `git branch -D ${CURRENT_BRANCH}` (force delete)
- If no: Keep branch

## Phase 8: Completion Summary

Display comprehensive completion summary:

**"✅ Feature Completed and Merged!**

**Feature:** `${FEATURE_ID}`
**Branch:** `${CURRENT_BRANCH}`

**Actions Completed:**
- ✅ Final changes committed and pushed to feature branch
- ✅ Switched to `${MAIN_BRANCH}`
- ✅ Merged `${CURRENT_BRANCH}` into `${MAIN_BRANCH}` (${MERGE_STRATEGY})
- ✅ Pushed merged changes to remote
- ✅ Updated git-pr.md status to Merged
- ✅ Deleted feature branch [if applicable]

**Current Branch:** `${MAIN_BRANCH}`

**Documentation:**
- Feature docs: `docs/features/${FEATURE_ID}/`
- All documentation preserved in main branch

**What's Next:**
1. ✅ Feature is now live in main branch
2. Verify functionality in main branch (optional)
3. Deploy to staging/production (if applicable)
4. Close any related issues/tickets
5. Start next feature with `/feature` command

**🎉 Great work! Feature development complete.**"

---

## Critical Rules

**DO NOT:**
- Merge without pushing feature branch first
- Force push to main/master
- Delete branches before confirming merge succeeded
- Skip conflict resolution
- Proceed if user is unsure

**DO:**
- Verify every step succeeded before proceeding
- Give user control over merge strategy
- Preserve all documentation in main
- Handle errors gracefully
- Provide clear guidance on conflicts
- Ask for confirmation on destructive actions

---

## Error Handling

### Common Errors:

**1. Merge Conflicts**
- Stop immediately
- Display conflicted files
- Provide clear resolution steps
- Exit command (user resolves manually)

**2. Push Rejected**
- Inform user about remote changes
- Suggest pulling and resolving
- Do NOT force push

**3. Branch Not Fully Merged**
- Warn user
- Ask for confirmation before force delete
- Provide option to keep branch

**4. Uncommitted Changes**
- Never proceed without asking
- Offer commit, discard, or cancel options
- Default to safest option (commit)

**5. Permission Errors**
- Check remote access
- Verify branch protection rules
- Suggest manual merge via PR/MR if needed

---

## Alternative Workflow: PR/MR Merge

If your project uses PR/MR reviews:

**Ask user:** "Does your project require PR/MR approval before merging?"

**If yes:**
- Skip direct merge (Phases 4-5)
- Update git-pr.md status to "Ready for Review"
- Inform user:
  ```
  Your feature is ready for review!

  PR/MR Link: [from git-pr.md]

  Next steps:
  1. Request review from team members
  2. Address review comments if needed
  3. Once approved, merge via GitHub/GitLab UI
  4. Manually delete feature branch after merge

  /done command stopped (PR/MR workflow).
  ```
- Exit command

**If no:**
- Proceed with direct merge (default workflow)

---

## Safety Checklist

Before merging, verify:

- [ ] All tests passing (if test suite exists)
- [ ] Code compiles successfully
- [ ] Documentation complete
- [ ] No uncommitted changes (or committed via /done)
- [ ] Feature branch pushed to remote
- [ ] Main branch up to date with remote
- [ ] User confirmed merge strategy
- [ ] User aware of branch deletion (if applicable)

---

## Example Usage

```bash
# You've finished developing F0001-user-authentication
# You're on branch feature/F0001-user-authentication

/done

# Agent: "Complete and merge feature F0001-user-authentication to main? (yes)"
# You: yes

# Agent: "You have uncommitted changes. What would you like to do?"
# You: Commit all changes now

# Agent: "Provide a commit message (or press Enter for default):"
# You: [Enter] # Uses default

# Agent commits, pushes to feature branch

# Agent: "How would you like to merge this feature?"
# You: Merge Commit (default)

# Agent switches to main, pulls, merges with --no-ff

# Agent: "Would you like to delete the feature branch?"
# You: Delete local and remote

# Agent: "✅ Feature Completed and Merged!
#         Feature: F0001-user-authentication
#         Branch: feature/F0001-user-authentication
#         Actions Completed: [list]
#         Current Branch: main
#         🎉 Great work! Feature development complete."
```

---

## Integration with Workflow

The complete feature workflow:

```
/feature  →  /plan  →  /dev  →  /fix (iterative)  →  /done
   ↓          ↓         ↓          ↓                    ↓
Discovery  Planning  Development  Bug Fixing        Merge & Close
```

After `/done`, you're back on `main` and ready to start a new feature with `/feature`.
