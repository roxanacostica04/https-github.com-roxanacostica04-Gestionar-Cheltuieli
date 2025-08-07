import { useAuth } from './useAuth';
import backend from '~backend/client';

export function useBackend() {
  const { token, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !token) {
    return backend;
  }
  
  return backend.with({
    auth: () => ({ authorization: `Basic ${token}` })
  });
}
