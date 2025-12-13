import { useEffect, RefObject, useMemo } from 'react';
type IntersectionObserverCallback = (entry: IntersectionObserverEntry) => void;
export function useIntersectionObserver(
  ref: RefObject<Element>,
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit & { once?: boolean } = {}
) {
  const { once = true, ...observerOptions } = options;
  // Memoize options to prevent re-creating the observer unnecessarily.
  // By stringifying the options object, we get a stable primitive value for the dependency array.
  const memoizedOptions = useMemo(() => {
    return observerOptions;
  }, [JSON.stringify(observerOptions)]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback(entry);
        if (once) {
          observer.unobserve(element);
        }
      }
    }, memoizedOptions);
    observer.observe(element);
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref, callback, memoizedOptions, once]);
}