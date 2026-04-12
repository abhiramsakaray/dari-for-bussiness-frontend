# Team RBAC Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Integration

#### Routes Setup
- [ ] Import team components in your main router file
- [ ] Add `/team/login` route with `<TeamLogin />` component
- [ ] Add `/team/dashboard` route with `<ProtectedTeamRoute>` wrapper
- [ ] Add `/team/sessions` route with `<SessionManager />` component
- [ ] Add `/team/unauthorized` route with `<Unauthorized />` component
- [ ] Wrap existing routes with `<ProtectedTeamRoute>` where needed

#### Example Route Configuration
```typescript
// Add to your router (e.g., App.tsx)
import { TeamLogin } from '@/app/components/team/TeamLogin';
import { TeamDashboard } from '@/app/components/team/TeamDashboard';
import { ProtectedTeamRoute } from '@/app/components/team/ProtectedTeamRoute';
import { Unauthorized } from '@/app/components/team/Unauthorized';
import { SessionManager } from '@/app/components/team/SessionManager';

<Route path="/team/login" element={<TeamLogin />} />
<Route path="/team/unauthorized" element={<Unauthorized />} />
<Route path="/team/dashboard" element={
  <ProtectedTeamRoute><TeamDashboard /></ProtectedTeamRoute>
} />
<Route path="/team/sessions" element={
  <ProtectedTeamRoute><SessionManager /></ProtectedTeamRoute>
} />
```

### 2. Environment Configuration

#### Development (.env.development)
- [ ] Set `VITE_API_URL=http://localhost:8000`
- [ ] Verify backend is running on port 8000
- [ ] Test CORS configuration

#### Production (.env.production)
- [ ] Set `VITE_API_URL=https://api.yourapp.com`
- [ ] Verify HTTPS is enabled
- [ ] Verify CORS allows your frontend domain
- [ ] Test API connectivity

### 3. Backend Verification

- [ ] Backend Team RBAC endpoints are deployed
- [ ] Database migrations are complete
- [ ] Test authentication endpoints work
- [ ] Test permission endpoints work
- [ ] Test session endpoints work
- [ ] Verify JWT secret is configured
- [ ] Verify token expiry times are set

### 4. Testing

#### Authentication Flow
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test logout functionality
- [ ] Test token refresh on 401 error
- [ ] Test session persistence across page reloads
- [ ] Test "Remember me" functionality (if implemented)

#### Authorization Flow
- [ ] Test route protection (try accessing protected routes without login)
- [ ] Test permission-based UI rendering
- [ ] Test role-based access control
- [ ] Test wildcard permissions (`*`, `category.*`)
- [ ] Test custom permission grants/revokes
- [ ] Test unauthorized page displays correctly

#### Session Management
- [ ] Test session list displays correctly
- [ ] Test "Revoke All Sessions" functionality
- [ ] Test current session is marked
- [ ] Test session details are accurate (IP, device, time)

#### Error Handling
- [ ] Test API error messages display correctly
- [ ] Test permission denied errors
- [ ] Test network error handling
- [ ] Test loading states display correctly
- [ ] Test account lockout message

### 5. Security Checks

- [ ] Tokens are stored securely (localStorage or httpOnly cookies)
- [ ] HTTPS is enforced in production
- [ ] CORS is configured correctly
- [ ] CSRF protection is enabled (if applicable)
- [ ] XSS protection headers are set
- [ ] Content Security Policy is configured
- [ ] Rate limiting is enabled on backend
- [ ] Password requirements are enforced
- [ ] Account lockout is working

### 6. Performance Checks

- [ ] Permission checks are cached (React Query)
- [ ] Token refresh doesn't cause UI flicker
- [ ] Loading states are smooth
- [ ] No unnecessary API calls
- [ ] Bundle size is acceptable
- [ ] Lazy loading is implemented where appropriate

### 7. UI/UX Checks

- [ ] Login page is styled correctly
- [ ] Dashboard displays all menu items
- [ ] Permission gates work correctly
- [ ] Loading spinners are visible
- [ ] Error messages are user-friendly
- [ ] Toast notifications work
- [ ] Responsive design works on mobile
- [ ] Accessibility (keyboard navigation, screen readers)

---

## 🚀 Deployment Steps

### Step 1: Build Frontend
```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Step 2: Test Build Locally
```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

### Step 3: Deploy to Hosting
- [ ] Upload build files to hosting (Vercel, Netlify, etc.)
- [ ] Configure environment variables
- [ ] Set up custom domain (if applicable)
- [ ] Enable HTTPS
- [ ] Configure redirects for SPA routing

### Step 4: Verify Production
- [ ] Test login flow in production
- [ ] Test all protected routes
- [ ] Test permission checks
- [ ] Test session management
- [ ] Check browser console for errors
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

---

## 🔍 Post-Deployment Verification

### Smoke Tests
- [ ] Can login with valid credentials
- [ ] Can access dashboard after login
- [ ] Can see appropriate menu items based on role
- [ ] Can logout successfully
- [ ] Can view active sessions
- [ ] Protected routes redirect to login when not authenticated
- [ ] Unauthorized page shows when accessing restricted resources

### Integration Tests
- [ ] Create a payment (if has permission)
- [ ] View invoices (if has permission)
- [ ] Invite team member (if has permission)
- [ ] View analytics (if has permission)
- [ ] Manage API keys (if has permission)

### Security Tests
- [ ] Try accessing protected routes without login → Should redirect
- [ ] Try accessing admin routes as viewer → Should show unauthorized
- [ ] Try using expired token → Should refresh automatically
- [ ] Try using invalid token → Should redirect to login
- [ ] Check network tab for sensitive data leaks

---

## 📊 Monitoring Setup

### Error Tracking
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure error boundaries
- [ ] Set up alerts for critical errors
- [ ] Monitor authentication failures
- [ ] Monitor permission denied errors

### Analytics
- [ ] Track login events
- [ ] Track logout events
- [ ] Track permission denied events
- [ ] Track session revocations
- [ ] Track user activity by role

### Performance Monitoring
- [ ] Monitor API response times
- [ ] Monitor token refresh frequency
- [ ] Monitor page load times
- [ ] Monitor bundle size
- [ ] Set up performance budgets

---

## 🐛 Troubleshooting Guide

### Issue: Can't login
**Check:**
- [ ] Backend is running
- [ ] VITE_API_URL is correct
- [ ] CORS is configured
- [ ] Credentials are correct
- [ ] Account is not locked

### Issue: Token refresh loop
**Check:**
- [ ] `_retry` flag is set in interceptor
- [ ] Refresh token is valid
- [ ] Backend refresh endpoint works
- [ ] Token expiry times are correct

### Issue: Permission checks fail
**Check:**
- [ ] User is authenticated
- [ ] Permissions are loaded (not in loading state)
- [ ] Wildcard matching logic is correct
- [ ] Backend returns correct permissions

### Issue: CORS errors
**Check:**
- [ ] Backend CORS allows frontend domain
- [ ] Credentials are included in requests
- [ ] Preflight requests are handled
- [ ] Headers are allowed

### Issue: Session not persisting
**Check:**
- [ ] Tokens are stored in localStorage
- [ ] Token keys are correct
- [ ] Tokens are not expired
- [ ] Browser is not blocking localStorage

---

## 📝 Documentation Updates

- [ ] Update README with team login instructions
- [ ] Document available roles and permissions
- [ ] Document how to add new permissions
- [ ] Document how to protect new routes
- [ ] Create user guide for team members
- [ ] Create admin guide for permission management

---

## 🎓 Team Training

- [ ] Train team on new login process
- [ ] Explain role-based access control
- [ ] Show how to manage sessions
- [ ] Demonstrate permission-based features
- [ ] Provide documentation links
- [ ] Set up support channel for questions

---

## 🔄 Rollback Plan

### If Issues Occur
1. **Immediate Actions**
   - [ ] Revert to previous deployment
   - [ ] Notify team of rollback
   - [ ] Document issues encountered

2. **Investigation**
   - [ ] Check error logs
   - [ ] Review failed tests
   - [ ] Identify root cause

3. **Fix and Redeploy**
   - [ ] Fix identified issues
   - [ ] Test thoroughly
   - [ ] Deploy again

---

## ✅ Final Sign-Off

### Development Team
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Ready for deployment

### QA Team
- [ ] All test cases passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Ready for production

### Product Team
- [ ] Features meet requirements
- [ ] UX is acceptable
- [ ] Documentation is clear
- [ ] Ready for users

---

## 📞 Support Contacts

### Technical Issues
- Backend Team: backend@yourapp.com
- Frontend Team: frontend@yourapp.com
- DevOps Team: devops@yourapp.com

### Security Issues
- Security Team: security@yourapp.com
- Emergency: [Emergency contact]

---

## 🎉 Success Criteria

Deployment is successful when:

- ✅ All team members can login
- ✅ Permissions are enforced correctly
- ✅ No critical errors in production
- ✅ Performance is acceptable
- ✅ Security checks pass
- ✅ Documentation is complete
- ✅ Team is trained

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Version**: 1.0.0  
**Status**: ⏳ Pending / ✅ Complete

---

## 📋 Quick Reference

### Important URLs
- Login: `https://yourapp.com/team/login`
- Dashboard: `https://yourapp.com/team/dashboard`
- Sessions: `https://yourapp.com/team/sessions`
- API Docs: `https://api.yourapp.com/api/v1/docs`

### Important Files
- Environment: `.env.production`
- Routes: `src/App.tsx` (or your router file)
- Auth Service: `src/services/teamAuth.service.ts`
- Permissions Hook: `src/hooks/usePermissions.ts`

### Important Commands
```bash
# Build
npm run build

# Preview
npm run preview

# Deploy (example)
vercel deploy --prod
```

---

**Good luck with your deployment! 🚀**
