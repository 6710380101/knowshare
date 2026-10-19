# Security Specification & Invariants

## 1. Data Invariants

1. **User Identity & Privilege Escalation Invariant**: A user document at `/users/{userId}` can only be created by an authenticated user where `{userId} == request.auth.uid`. A regular user can never set or modify their own `role` or `isSuspended` status. Only an Admin or Moderator can alter roles or suspension statuses.
2. **Bootstrapped Admin Integrity**: The owner `t.gan5140@gmail.com` or users with `role == 'admin'` in `/users/{uid}` possess admin privileges.
3. **Resource Ownership Invariant**: A resource at `/resources/{resourceId}` must have `authorId == request.auth.uid` upon creation. Only the author or an admin/moderator can update or delete the resource. Only an admin/moderator can alter `isHidden`.
4. **Favorite Ownership Invariant**: A document in `/favorites/{favId}` must have `favId == request.auth.uid + '_' + incoming().resourceId` or `userId == request.auth.uid`. Only the owner can create or delete their favorite bookmark.
5. **Report Integrity Invariant**: Any authenticated user can create a report with `reporterId == request.auth.uid` and initial status `'pending'`. Only an admin/moderator can update report `status`, `resolvedAt`, or `resolvedBy`.
6. **Settings Protection Invariant**: Public users can read `/settings/general`, but ONLY admins can write/update `/settings/general`.
7. **Moderation Logs Invariant**: Can only be created and read by admins or moderators; immutable once created.

## 2. The "Dirty Dozen" Payloads

1. **Self-Promotion to Admin**: Unprivileged user attempting `setDoc('/users/' + uid, { role: 'admin' })`. -> REJECTED
2. **Impersonate Author on Resource Creation**: User A creating a resource with `authorId: 'UserB'`. -> REJECTED
3. **Unauthenticated Resource Posting**: Unauthenticated client attempting `addDoc(collection(db, 'resources'), {...})`. -> REJECTED
4. **Ghost Field Injection (Shadow Update)**: User updating resource with extra injected `{ isSuperAdmin: true }`. -> REJECTED
5. **Unauthorized Resource Deletion**: User B attempting `deleteDoc('/resources/' + userA_resourceId)`. -> REJECTED
6. **Tamper Favorite Bookmark**: User A attempting to delete or overwrite User B's favorite item. -> REJECTED
7. **Bypassing Inappropriate Content Filter via Fake ID**: Injecting 2000-character malicious ID for resource document. -> REJECTED
8. **Direct Settings Overwrite**: Regular member attempting to alter site announcement or wipe categories in `/settings/general`. -> REJECTED
9. **Fake Report Resolution**: Regular user changing report status from `'pending'` to `'dismissed'`. -> REJECTED
10. **Tainted Timestamp Injection**: Client attempting to inject fake future timestamp into `createdAt`. -> REJECTED
11. **Moderation Log Forgery**: Normal member attempting to write fake audit logs into `/moderationLogs`. -> REJECTED
12. **Suspended User Resource Modification**: Suspended user attempting to create or update resources. -> REJECTED

## 3. Test Runner Invariant Summary
All 12 attacks are blocked deterministically by the rules via strict `isValidId`, `incoming()`, `isAdmin()`, `isOwner()`, and validation schemas.
