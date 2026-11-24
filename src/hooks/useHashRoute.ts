import { useCallback, useEffect, useState } from 'react';
import type { RouteView } from '../types/portfolio';

export const IS_STUDIO_ENABLED =
  import.meta.env.VITE_ENABLE_STUDIO !== 'false';

function parseRouteFromHash(hash: string): { route: RouteView; scrollToTimeline: boolean } {
  const normalized = hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (normalized === 'cv') return { route: 'cv', scrollToTimeline: false };
  if (normalized === 'studio') {
    return { route: IS_STUDIO_ENABLED ? 'studio' : 'home', scrollToTimeline: false };
  }
  if (normalized === 'portfolio') {
    return { route: 'home', scrollToTimeline: true };
  }
  return { route: 'home', scrollToTimeline: false };
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteView>(() => {
    if (typeof window === 'undefined') return 'home';
    if (window.location.pathname.endsWith('/studio') && IS_STUDIO_ENABLED) {
      return 'studio';
    }
    return parseRouteFromHash(window.location.hash).route;
  });

  useEffect(() => {
    const scrollTimelineIfRequested = (scroll: boolean) => {
      if (!scroll) return;
      window.setTimeout(() => {
        document
          .getElementById('portfolio-timeline')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    };

    if (window.location.pathname.endsWith('/studio') && IS_STUDIO_ENABLED) {
      const basePath = window.location.pathname.slice(0, -'/studio'.length) || '/';
      const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
      window.history.replaceState(null, '', `${normalizedBase}#/studio`);
      setRoute('studio');
    } else if (window.location.hash === '#/studio' && !IS_STUDIO_ENABLED) {
      window.history.replaceState(null, '', `${window.location.pathname}#/home`);
      setRoute('home');
    } else {
      const initial = parseRouteFromHash(window.location.hash);
      scrollTimelineIfRequested(initial.scrollToTimeline);
    }

    const handleHashChange = () => {
      const next = parseRouteFromHash(window.location.hash);
      if (window.location.hash === '#/studio' && !IS_STUDIO_ENABLED) {
        window.history.replaceState(null, '', `${window.location.pathname}#/home`);
        setRoute('home');
        return;
      }
      setRoute(next.route);
      scrollTimelineIfRequested(next.scrollToTimeline);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((nextRoute: RouteView) => {
    const safeRoute: RouteView =
      nextRoute === 'studio' && !IS_STUDIO_ENABLED ? 'home' : nextRoute;
    const targetHash = safeRoute === 'home' ? '#/home' : `#/${safeRoute}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setRoute(safeRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}
