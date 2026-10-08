import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: '/login',
  navigate: () => {},
  params: {},
});

export function useRouter() {
  return useContext(RouterContext);
}

export function matchRoute(pattern: string, currentPath: string): { matches: boolean; params: Record<string, string> } {
  // normalize trailing slashes
  const pSegs = pattern.split('/').filter(Boolean);
  const cSegs = currentPath.split('/').filter(Boolean);

  if (pSegs.length !== cSegs.length) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < pSegs.length; i++) {
    if (pSegs[i].startsWith(':')) {
      const key = pSegs[i].slice(1);
      params[key] = decodeURIComponent(cSegs[i]);
    } else if (pSegs[i] !== cSegs[i]) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p && p !== '/' ? p : '/student/dashboard';
    }
    return '/student/dashboard';
  });

  const navigate = useCallback((to: string) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  }, [path]);

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const value = useMemo(() => {
    return {
      path,
      navigate,
      params: {},
    };
  }, [path, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function Link({
  to,
  children,
  className = '',
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
