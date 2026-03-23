import { use } from 'react'
import { AppContext } from '../types/user.type'

const useUser = () => {
    const context = use(AppContext);
  
  // Throw a helpful error if the hook is used outside the Provider
  if (!context) {
    throw new Error("useUser must be used within an AppProvider");
  }

  return context
}

export default useUser
