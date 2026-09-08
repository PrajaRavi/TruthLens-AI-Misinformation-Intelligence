import { localUser } from "@/lib/constants";
import type { ReactNode } from "react";
import { Navigate, useLocation ,Outlet} from "react-router-dom";


/**
 * Wrap any route or page that requires a signed-in user.
 * Replace the localStorage check with your real auth state when an API is connected.
 */
export function PrivateComponent() {
  const isAuthenticated =localStorage.getItem(localUser)?true:false;
;
console.log(localStorage.getItem(localUser))
  if (isAuthenticated) {
    return <Outlet/>;
  }
  return <Navigate to="/login" />;

}
