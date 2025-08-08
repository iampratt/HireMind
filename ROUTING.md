# HireMind Routing Structure

This document describes the routing structure implemented using React Router.

## Routes

### Main Routes

- `/` - Dashboard (home page)
- `/upload` - Resume upload page
- `/jobs` - Job search page
- `/resumes` - Resume list page
- `/profile` - User profile page

### Dynamic Routes

- `/resumes/:resumeId` - Individual resume detail page
- `/profile/:profileId` - Individual profile page (for future use)

## Navigation

The application now uses React Router for navigation instead of state-based navigation. This provides:

1. **URL-based navigation** - Each page has its own URL
2. **Browser back/forward support** - Users can use browser navigation
3. **Direct linking** - Users can bookmark and share specific pages
4. **SEO-friendly URLs** - Better for search engine optimization

## Components Updated

### New Components

- `Profile.tsx` - Individual profile page component
- `ResumeDetail.tsx` - Individual resume detail page component

### Updated Components

- `App.tsx` - Now uses React Router with Routes and Route components
- `Dashboard.tsx` - Updated to use `useNavigate` hook
- `ResumeList.tsx` - Updated to use `useNavigate` hook and removed modal
- `ResumeUpload.tsx` - Updated to use `useNavigate` hook
- `Header.tsx` - Updated to use `useNavigate` and `useLocation` hooks

## URL Structure Examples

```
/                           # Dashboard
/upload                     # Upload resume
/jobs                       # Search jobs
/resumes                    # List all resumes
/resumes/123                # View specific resume
/profile                    # User profile
/profile/user123            # Specific user profile (future)
```

## Benefits

1. **Better UX** - Users can bookmark specific pages
2. **Shareable links** - Direct links to resumes and profiles
3. **Browser navigation** - Back/forward buttons work properly
4. **SEO friendly** - Each page has a unique URL
5. **Scalable** - Easy to add new routes and pages

## Implementation Details

- Uses React Router v6
- BrowserRouter for client-side routing
- useNavigate hook for programmatic navigation
- useLocation hook for current route detection
- Navigate component for redirects
- Route parameters for dynamic content (resumeId, profileId)
