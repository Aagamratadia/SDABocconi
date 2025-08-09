# Admin Role System Setup

This document explains how to set up and use the admin role system in the Receipt application.

## Prerequisites

1. Firebase project with Authentication, Firestore, and Storage enabled
2. Firebase Admin SDK service account credentials

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Firebase Client SDK (already in your project)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (new for admin functionality)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_client_email
FIREBASE_PRIVATE_KEY="your_service_account_private_key"
```

## Setting Up the First Admin

Since the API route requires an existing admin to grant admin privileges, you'll need to set up the first admin manually:

1. Go to the Firebase Console
2. Navigate to Authentication > Users
3. Find the user you want to make an admin
4. Click on the three dots menu and select "Set custom user claims"
5. Add the following JSON: `{"admin": true}`
6. Click Save

## Deploying Firebase Storage Rules

To deploy the storage rules:

1. Install Firebase CLI if you haven't already: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project (if not already done): `firebase init`
4. Deploy the storage rules: `firebase deploy --only storage`

## Using the Admin Panel

The `AdminPanel` component provides a UI for granting admin privileges to other users:

1. Import and add the `AdminPanel` component to your admin dashboard page
2. Only users with the admin claim can successfully use this panel
3. Enter the UID of the user you want to make an admin
4. Click "Grant Admin Privileges"

## How It Works

1. The `useAuth` hook checks for the admin claim in the user's ID token
2. The `/api/set-admin` API route verifies that the caller has admin privileges before granting admin status to another user
3. Firebase Storage rules allow access to the receipts folder for file owners OR users with the admin claim

## Security Considerations

- Keep your Firebase Admin SDK credentials secure
- Never expose admin-related functionality in client-side code without proper authorization checks
- Regularly audit your admin users list