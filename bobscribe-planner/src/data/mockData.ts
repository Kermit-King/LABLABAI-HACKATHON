import { TechnicalTask, GithubIssue, BobPrompt } from '../types';

export const mockTechnicalTask: TechnicalTask = {
  id: 'task-001',
  title: 'Implement Cookie-Based Session Logout and Token Revocation',
  description: 'Add secure logout functionality with proper session cleanup, token revocation, and cookie management to prevent security vulnerabilities.',
  riskLevel: 'medium',
  affectedFiles: [
    {
      path: 'src/routes/auth.ts',
      changeType: 'modify',
      description: 'Add POST /logout endpoint with token revocation logic'
    },
    {
      path: 'src/middleware/auth.middleware.ts',
      changeType: 'modify',
      description: 'Update authentication middleware to handle revoked tokens'
    },
    {
      path: 'src/services/token.service.ts',
      changeType: 'create',
      description: 'Create new service for token management and revocation'
    },
    {
      path: 'src/models/RevokedToken.model.ts',
      changeType: 'create',
      description: 'Create database model for storing revoked tokens'
    },
    {
      path: 'src/utils/cookie.utils.ts',
      changeType: 'modify',
      description: 'Add secure cookie clearing utilities'
    }
  ],
  implementationOrder: [
    {
      order: 1,
      description: 'Create RevokedToken database model with TTL index',
      files: ['src/models/RevokedToken.model.ts'],
      completed: false
    },
    {
      order: 2,
      description: 'Implement token service with revocation and validation methods',
      files: ['src/services/token.service.ts'],
      completed: false
    },
    {
      order: 3,
      description: 'Update authentication middleware to check revoked tokens',
      files: ['src/middleware/auth.middleware.ts'],
      completed: false
    },
    {
      order: 4,
      description: 'Add logout endpoint with proper cookie clearing',
      files: ['src/routes/auth.ts', 'src/utils/cookie.utils.ts'],
      completed: false
    },
    {
      order: 5,
      description: 'Add comprehensive error handling and logging',
      files: ['src/routes/auth.ts', 'src/middleware/auth.middleware.ts'],
      completed: false
    }
  ],
  estimatedEffort: '4-6 hours'
};

export const mockGithubIssues: GithubIssue[] = [
  {
    id: 'issue-001',
    title: 'Create RevokedToken Database Model',
    tags: ['backend', 'database', 'security'],
    description: `Create a MongoDB model to store revoked JWT tokens with automatic expiration.

**Technical Requirements:**
- Schema should include: token (hashed), userId, revokedAt timestamp
- Implement TTL index to auto-delete expired tokens
- Add compound index on userId and token for fast lookups`,
    acceptanceCriteria: [
      {
        id: 'ac-001-1',
        description: 'Model includes all required fields with proper types',
        completed: false
      },
      {
        id: 'ac-001-2',
        description: 'TTL index configured to match JWT expiration',
        completed: false
      },
      {
        id: 'ac-001-3',
        description: 'Compound index created for performance',
        completed: false
      }
    ],
    priority: 'high'
  },
  {
    id: 'issue-002',
    title: 'Implement Token Revocation Service',
    tags: ['backend', 'service', 'security'],
    description: `Create a centralized service for managing token lifecycle and revocation.

**Key Methods:**
- \`revokeToken(token, userId)\`: Add token to revocation list
- \`isTokenRevoked(token)\`: Check if token is revoked
- \`cleanupExpiredTokens()\`: Manual cleanup utility`,
    acceptanceCriteria: [
      {
        id: 'ac-002-1',
        description: 'Service implements all required methods',
        completed: false
      },
      {
        id: 'ac-002-2',
        description: 'Proper error handling for database operations',
        completed: false
      },
      {
        id: 'ac-002-3',
        description: 'Token hashing implemented for security',
        completed: false
      }
    ],
    priority: 'high'
  },
  {
    id: 'issue-003',
    title: 'Update Auth Middleware for Token Validation',
    tags: ['backend', 'middleware', 'security'],
    description: `Enhance authentication middleware to validate tokens against revocation list.

**Changes Required:**
- Add revocation check after JWT verification
- Return 401 with clear error message for revoked tokens
- Add request logging for security audit`,
    acceptanceCriteria: [
      {
        id: 'ac-003-1',
        description: 'Middleware checks token revocation status',
        completed: false
      },
      {
        id: 'ac-003-2',
        description: 'Appropriate HTTP status codes returned',
        completed: false
      },
      {
        id: 'ac-003-3',
        description: 'Security events logged properly',
        completed: false
      }
    ],
    priority: 'high'
  },
  {
    id: 'issue-004',
    title: 'Implement Logout Endpoint',
    tags: ['backend', 'api', 'security'],
    description: `Create POST /api/auth/logout endpoint with complete session cleanup.

**Implementation Details:**
- Extract token from Authorization header or cookies
- Revoke token in database
- Clear all authentication cookies (httpOnly, secure flags)
- Return success response`,
    acceptanceCriteria: [
      {
        id: 'ac-004-1',
        description: 'Endpoint accepts both header and cookie tokens',
        completed: false
      },
      {
        id: 'ac-004-2',
        description: 'Token successfully revoked in database',
        completed: false
      },
      {
        id: 'ac-004-3',
        description: 'All auth cookies cleared with proper flags',
        completed: false
      },
      {
        id: 'ac-004-4',
        description: 'Appropriate response returned on success/failure',
        completed: false
      }
    ],
    priority: 'medium'
  }
];

export const mockBobPrompt: BobPrompt = {
  systemContext: `You are implementing a secure logout system for a Node.js/Express application using JWT authentication and MongoDB. The system must handle token revocation, cookie management, and prevent security vulnerabilities.

**Current Architecture:**
- Backend: Node.js + Express + TypeScript
- Database: MongoDB with Mongoose ODM
- Auth: JWT tokens stored in httpOnly cookies
- Existing auth middleware validates JWT signatures`,
  
  taskBreakdown: `**Primary Objective:** Implement complete logout functionality with token revocation

**Implementation Steps:**

1. **Database Layer** (src/models/RevokedToken.model.ts)
   - Create Mongoose schema for revoked tokens
   - Add TTL index for automatic cleanup
   - Include userId, token hash, and timestamp fields

2. **Service Layer** (src/services/token.service.ts)
   - Implement token revocation logic
   - Add token validation against revocation list
   - Include error handling and logging

3. **Middleware Update** (src/middleware/auth.middleware.ts)
   - Add revocation check after JWT verification
   - Handle revoked token scenarios
   - Maintain backward compatibility

4. **API Endpoint** (src/routes/auth.ts)
   - Create POST /logout route
   - Extract token from request
   - Clear cookies and revoke token
   - Return appropriate responses

5. **Utilities** (src/utils/cookie.utils.ts)
   - Add secure cookie clearing function
   - Ensure proper httpOnly and secure flags`,

  fileInstructions: `**File-by-File Instructions:**

### src/models/RevokedToken.model.ts (NEW FILE)
\`\`\`typescript
import mongoose, { Schema, Document } from 'mongoose';

interface IRevokedToken extends Document {
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  revokedAt: Date;
}

const RevokedTokenSchema = new Schema({
  tokenHash: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  revokedAt: { type: Date, default: Date.now, expires: 86400 } // 24h TTL
});

RevokedTokenSchema.index({ userId: 1, tokenHash: 1 });

export default mongoose.model<IRevokedToken>('RevokedToken', RevokedTokenSchema);
\`\`\`

### src/services/token.service.ts (NEW FILE)
- Implement \`revokeToken(token: string, userId: string)\`
- Implement \`isTokenRevoked(token: string)\`
- Use crypto.createHash('sha256') for token hashing
- Add proper error handling and logging

### src/middleware/auth.middleware.ts (MODIFY)
- After JWT verification, add: \`await tokenService.isTokenRevoked(token)\`
- If revoked, return 401 with message: "Token has been revoked"
- Log security events

### src/routes/auth.ts (MODIFY)
- Add POST /logout endpoint
- Extract token from req.cookies.token or Authorization header
- Call tokenService.revokeToken()
- Clear cookies using res.clearCookie()
- Return { success: true, message: "Logged out successfully" }`,

  acceptanceCriteria: `**Acceptance Criteria:**

✓ Token revocation persists in database
✓ Revoked tokens cannot be used for authentication
✓ Cookies are properly cleared on logout
✓ TTL index automatically removes expired tokens
✓ Middleware validates against revocation list
✓ Proper error messages for all failure scenarios
✓ Security events are logged
✓ No breaking changes to existing auth flow`,

  additionalNotes: `**Security Considerations:**
- Always hash tokens before storing in database
- Use httpOnly and secure flags for cookies
- Implement rate limiting on logout endpoint
- Consider adding refresh token rotation

**Testing Checklist:**
- Test logout with valid token
- Test logout with already revoked token
- Test logout with expired token
- Verify cookies are cleared
- Verify middleware blocks revoked tokens
- Test TTL index cleanup after 24 hours`
};

// Made with Bob
