import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface UseNavigationOptions {
  scrollToTop?: boolean;
  replace?: boolean;
}

export function useNavigation(options: UseNavigationOptions = {}) {
  const { scrollToTop = false, replace = false } = options;
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (url: string, navOptions?: UseNavigationOptions) => {
      const finalOptions = { ...options, ...navOptions };

      if (finalOptions.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }

      if (finalOptions.scrollToTop) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    },
    [router, options]
  );

  const navigateToSearch = useCallback(
    (searchParams: URLSearchParams, navOptions?: UseNavigationOptions) => {
      const url = `${pathname}?${searchParams.toString()}`;
      navigate(url, navOptions);
    },
    [pathname, navigate]
  );

  return {
    navigate,
    navigateToSearch,
    pathname,
  };
}
