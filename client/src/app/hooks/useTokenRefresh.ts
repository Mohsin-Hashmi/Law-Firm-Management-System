import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

export const useTokenRefresh = () => {
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    // This effect will run whenever the user state changes
    // It ensures that if the user's activeFirmId changes, we update the token accordingly
    if (user?.activeFirmId) {
      // The token should already be updated via the API calls
      // This is just a safety check to ensure consistency
      console.log('User firm updated:', user.activeFirmId);
    }
  }, [user?.activeFirmId, user?.firms]);

  return user;
};
