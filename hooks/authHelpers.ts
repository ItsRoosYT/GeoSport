import { useFirebaseAuthV2 } from '../hooks/useFirebaseAuthV2';

// Add to AuthView component imports
// This will be integrated into the existing handleEmailSubmit function

export const handleEmailSubmitWithFirebase = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  isRegistering: boolean,
  firebaseAuth: ReturnType<typeof useFirebaseAuthV2>,
  onSuccess: (profile: any) => void,
  onError: (msg: string) => void
) => {
  try {
    let user;
    
    if (isRegistering) {
      // Sign up with email/password
      user = await firebaseAuth.signUpWithEmail(email, password);
    } else {
      // Sign in with email/password
      user = await firebaseAuth.signInWithEmail(email, password);
    }

    // Create user profile
    const profile = {
      name: isRegistering ? `${firstName} ${lastName}` : user.displayName || email.split('@')[0],
      email: user.email,
      isVerified: user.emailVerified,
      avatarConfig: {
        skinColor: 'f8d25c',
        hairColor: '4a3b32',
        hairStyle: 'shortHair',
        clothing: 'shirtCrewNeck',
        glasses: false
      }
    };

    onSuccess(profile);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Authentication error';
    onError(msg);
  }
};
