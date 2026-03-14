import { use } from 'react'
import { AppContext } from '../types/user.type'

const useUser = () => {
    const data=use(AppContext)
  return data
}

export default useUser
