const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

setGlobalOptions({
  maxInstances: 10,
});

initializeApp();

const db = getFirestore();
const auth = getAuth();

exports.createFaculty = onCall(async (request) => {
  // 1. Check whether someone is logged in
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }

  const adminUid = request.auth.uid;

  // 2. Check that the logged-in user is an admin
  const adminDoc = await db.collection('users').doc(adminUid).get();

  if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Only administrators can create faculty accounts.',
    );
  }

  // 3. Get the data from Admin Faculty form
  const { name, email, password, subject } = request.data || {};

  // 4. Validate required fields
  if (!name || !email || !password || !subject) {
    throw new HttpsError(
      'invalid-argument',
      'Name, email, password and subject are required.',
    );
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanSubject = String(subject).trim();

  if (cleanName.length < 2) {
    throw new HttpsError(
      'invalid-argument',
      'Please enter a valid faculty name.',
    );
  }

  if (password.length < 6) {
    throw new HttpsError(
      'invalid-argument',
      'Password must contain at least 6 characters.',
    );
  }

  // 5. Create Firebase Authentication account
  let facultyUser;

  try {
    facultyUser = await auth.createUser({
      email: cleanEmail,
      password: password,
      displayName: cleanName,
    });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'A faculty account with this email already exists.',
      );
    }

    if (error.code === 'auth/invalid-email') {
      throw new HttpsError(
        'invalid-argument',
        'Please enter a valid email address.',
      );
    }

    throw new HttpsError('internal', 'Could not create the Firebase account.');
  }

  // 6. Create Firestore faculty profile
  try {
    await db.collection('users').doc(facultyUser.uid).set({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      role: 'faculty',
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      createdBy: adminUid,
    });
  } catch (error) {
    // If Firestore fails, remove the Auth account
    await auth.deleteUser(facultyUser.uid);

    console.error('Failed to create faculty profile:', error);

    throw new HttpsError('internal', 'Could not create the faculty profile.');
  }

  // 7. Send success response
  return {
    success: true,
    message: 'Faculty account created successfully.',
    faculty: {
      uid: facultyUser.uid,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      role: 'faculty',
    },
  };
});
