import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export const useLogout = () => {
  const router = useRouter()
  
  const logout = () => {
    Cookies.remove("admin_token")
    router.push("/")
  }

  return logout
} 