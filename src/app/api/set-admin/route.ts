import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getAuth();
};

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    const adminAuth = initializeFirebaseAdmin();

    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const callerUid = decodedToken.uid;

    // Check if the caller is already an admin
    const callerUser = await adminAuth.getUser(callerUid);
    const isCallerAdmin = callerUser.customClaims?.admin === true;

    if (!isCallerAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can set admin privileges' },
        { status: 403 }
      );
    }

    // Get the target UID from the request body
    const { targetUid } = await request.json();

    if (!targetUid) {
      return NextResponse.json(
        { error: 'Bad Request: Target UID is required' },
        { status: 400 }
      );
    }

    // Set the admin claim for the target user
    await adminAuth.setCustomUserClaims(targetUid, { admin: true });

    return NextResponse.json(
      { success: true, message: `User ${targetUid} has been granted admin privileges` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting admin privileges:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}