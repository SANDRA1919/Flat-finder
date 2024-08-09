import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext'; // Import corect al AuthContext

export const useAuth = () => {
  return useContext(AuthContext);
};