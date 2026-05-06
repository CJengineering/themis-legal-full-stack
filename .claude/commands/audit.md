# /audit command
# Usage: /audit  or  /audit src/app/api/

Run a full security audit on $ARGUMENTS for Themis Legal.

Check every file for:

**Authentication & authorisation**
- [ ] All API routes protected with getServerSession()
- [ ] Signer email verified against workflow before showing document
- [ ] Sequential signing order checked server-side

**Audit trail completeness**
- [ ] Every signing event has an audit_log entry
- [ ] All required fields present: workflowId, actorId, ipAddress, userAgent, timestamp
- [ ] No audit rows are being updated or deleted anywhere

**Data handling**
- [ ] No Drive file content stored in DB
- [ ] No Drive file content buffered in Node.js memory beyond one request
- [ ] No secrets or tokens in source code

**Input validation**
- [ ] All user-supplied IDs validated before DB queries (prevent IDOR)
- [ ] Email addresses validated with zod before use
- [ ] File IDs from Drive confirmed to belong to the authenticated user's Drive

**Transaction safety**
- [ ] Multi-step signing operations use prisma.$transaction()
- [ ] No partial state possible if a step fails mid-way

Report as: 🔴 Critical (block deploy) / 🟡 High (fix this sprint) / 🔵 Medium (next sprint)
