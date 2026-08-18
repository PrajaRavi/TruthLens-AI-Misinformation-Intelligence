import {
  Link as RouterLink,
  type LinkProps,
  type To,
  useLocation,
  useNavigate,
} from "react-router-dom";

type LegacyLinkProps = Omit<LinkProps, "to"> & { href: To };

/** Adapts the project's existing Next.js-style `href` links to React Router. */
export function Link({ href, ...props }: LegacyLinkProps) {
  return <RouterLink to={href} {...props} />;
}

export default Link;

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  return new URLSearchParams(useLocation().search);
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    back: () => navigate(-1),
  };
}
