# Team Page Not Updating - Debug Guide

## 🔍 Issue

Team page shows "No team members yet" even though team members exist in the database.

---

## 🧪 Debugging Steps

### Step 1: Check Browser Console

Open the browser console (F12) and look for:

1. **API Request**:
```
GET /team?page=1&page_size=50
```

2. **Response Status**:
- ✅ 200 OK - API call successful
- ❌ 401 Unauthorized - Authentication issue
- ❌ 403 Forbidden - Permission issue
- ❌ 404 Not Found - Endpoint not found

3. **Response Data**:
Look for the structure:
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "developer",
      "is_active": true,
      "invite_pending": false,
      "last_login": "2026-04-12T..."
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

4. **Console Logs**:
I've added debug logging. Look for:
```
Team data: { items: [...], total: X }
Members: [...]
Is loading: false
Error: null
```

---

### Step 2: Check Authentication

#### Merchant Token

Open console and check:
```javascript
console.log('Merchant token:', localStorage.getItem('merchant_token'));
console.log('API key:', localStorage.getItem('api_key'));
console.log('Merchant email:', localStorage.getItem('merchant_email'));
```

**Expected**: All three should have values if you're logged in as merchant owner.

#### Test API Call Manually

```javascript
// In browser console
const token = localStorage.getItem('merchant_token');
fetch('/team?page=1&page_size=50', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Team members:', data))
.catch(err => console.error('Error:', err));
```

---

### Step 3: Check Backend Logs

Look at your backend logs for:

```
→ GET /team
← GET /team [200] X.XXXs
```

Or errors like:
```
← GET /team [401] - Unauthorized
← GET /team [403] - Forbidden
```

---

## 🔧 Common Issues & Fixes

### Issue 1: 401 Unauthorized

**Cause**: Merchant token not set or expired

**Fix**:
1. Logout and login again
2. Check if token is stored:
```javascript
localStorage.getItem('merchant_token')
```
3. If null, login flow is broken

---

### Issue 2: 403 Forbidden

**Cause**: Plan doesn't support team features

**Fix**:
- Check if merchant has required plan
- Backend should return clear error message
- Upgrade plan if needed

---

### Issue 3: Empty Response

**Cause**: No team members in database OR wrong merchant_id

**Check Backend**:
```sql
SELECT * FROM merchant_users WHERE merchant_id = 'YOUR_MERCHANT_ID';
```

**Expected**: Should return rows if team members exist

---

### Issue 4: Wrong Data Structure

**Cause**: Backend returns different structure than expected

**Frontend expects**:
```typescript
{
  items: TeamMember[],
  total: number,
  page: number,
  page_size: number
}
```

**If backend returns**:
```typescript
{
  team_members: TeamMember[], // Wrong key!
  count: number
}
```

**Fix in team.service.ts**:
```typescript
async listTeamMembers(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<TeamMember>> {
  const response = await apiClient.get<any>('/team', { params });
  
  // Transform if needed
  return {
    items: response.team_members || response.items || [],
    total: response.count || response.total || 0,
    page: response.page || 1,
    page_size: response.page_size || 50,
  };
}
```

---

### Issue 5: CORS Error

**Cause**: Frontend and backend on different domains without CORS

**Symptoms**:
```
Access to fetch at 'http://localhost:8000/team' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Fix**: Backend needs CORS headers (should already be configured)

---

## 🎯 Quick Diagnostic Script

Run this in browser console:

```javascript
// Diagnostic script
(async () => {
  console.log('=== TEAM PAGE DIAGNOSTIC ===');
  
  // Check auth
  const token = localStorage.getItem('merchant_token');
  const apiKey = localStorage.getItem('api_key');
  console.log('1. Auth tokens:', {
    hasToken: !!token,
    hasApiKey: !!apiKey,
    tokenPreview: token?.substring(0, 20) + '...'
  });
  
  // Check API call
  try {
    const response = await fetch('/team?page=1&page_size=50', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('2. API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    const data = await response.json();
    console.log('3. Response Data:', data);
    console.log('4. Team Members:', data.items || data.team_members || []);
    console.log('5. Total Count:', data.total || data.count || 0);
    
  } catch (error) {
    console.error('6. Error:', error);
  }
  
  console.log('=== END DIAGNOSTIC ===');
})();
```

---

## 🔍 Expected vs Actual

### Expected Behavior

1. Page loads
2. `useTeamMembers()` hook calls API
3. API returns `{ items: [...], total: X }`
4. Component extracts `members = team?.items ?? []`
5. If `members.length > 0`, shows member list
6. If `members.length === 0`, shows "No team members yet"

### If Showing "No Team Members"

One of these is true:
- ✅ API call failed (check error in console)
- ✅ API returned empty array
- ✅ API returned wrong structure
- ✅ Authentication failed
- ✅ No team members in database

---

## 🛠️ Temporary Fix

If you need to see what's happening, add this to TeamMembersList.tsx:

```typescript
// After const members = team?.items ?? [];
useEffect(() => {
  console.log('=== TEAM DEBUG ===');
  console.log('Raw team data:', team);
  console.log('Members array:', members);
  console.log('Members length:', members.length);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('==================');
}, [team, members, isLoading, error]);
```

---

## 📊 What to Check

1. ✅ **Browser Console** - Any errors?
2. ✅ **Network Tab** - Is `/team` request successful?
3. ✅ **Response Data** - Does it have `items` array?
4. ✅ **Authentication** - Is `merchant_token` set?
5. ✅ **Backend Logs** - Any errors on server?
6. ✅ **Database** - Do team members exist?

---

## 🚀 Next Steps

1. Open browser console
2. Navigate to team page
3. Look for the debug logs I added
4. Share the output with me:
   - Team data
   - Members array
   - Any errors
   - Network request/response

Then I can provide a specific fix!

---

**Created**: April 12, 2026  
**Status**: 🔍 Debugging  
**Action Required**: Check browser console and share output
