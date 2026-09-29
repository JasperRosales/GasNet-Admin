# Authentication

Authentication system in `src/app/utils/auth.tsx`.

---

## Overview

The auth system provides:
- Session management via Supabase Auth
- Staff profile loading after authentication
- Admin-only access enforcement
- React context for consuming auth state

---

## `AuthProvider`

Wraps the entire app in `App.tsx`. Manages the authentication lifecycle.

### Behavior

1. On mount: restores any existing Supabase session
2. Listens for auth state changes (sign in, sign out, token refresh)
3. After authentication: fetches the staff profile via `getGasUser()`
4. Enforces admin-only access: if the user's role is not `"Admin"`, they are signed out immediately

### Context Value

```typescript
interface AuthContextValue {
  session: Session | null;      // Supabase session
  user: GasUser | null;         // Staff profile
  loading: boolean;             // Auth check in progress
  error: string | null;         // Auth error message
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

---

## `useAuth()`

Hook for consuming the auth context. Must be used within `AuthProvider`.

### Returns

`AuthContextValue` — see above.

### Usage

```typescript
const { user, loading, signOut } = useAuth();
```

---

## Admin-Only Access

The `AuthProvider` enforces that only users with `role === "Admin"` can access the system:

1. After sign in, the staff profile is fetched
2. If `role !== "Admin"`, the user is immediately signed out
3. An error message is displayed: `"Access denied. Admin privileges required."`

This means:
- Staff and Manager roles cannot access the admin dashboard
- The POS system is the appropriate interface for non-admin users

---

## Sign In Flow

```
1. User enters email + password on LoginPage
2. signIn(email, password) called
3. Supabase Auth validates credentials
4. On success: session is stored, profile is fetched
5. On failure: error message is displayed
```

---

## Sign Out Flow

```
1. User clicks logout button (Sidebar or LoginPage)
2. signOut() called
3. Supabase Auth session is cleared
4. User is redirected to LoginPage
```
