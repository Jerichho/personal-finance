import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import Cookies from 'js-cookie';

export function useAuth() {
  const router = useRouter();
  const { user, setUser } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Set auth cookie when user is authenticated
        Cookies.set('auth', 'true', { expires: 7 }); // Cookie expires in 7 days
      } else {
        // Remove auth cookie when user is not authenticated
        Cookies.remove('auth');
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      Cookies.remove('auth');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    signOut,
  };
} 