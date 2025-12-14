import { useEffect, RefObject, useMemo } from 'react';
type IntersectionObserverCallback = (entry: IntersectionObserverEntry) => void;
export function useIntersectionObserver(
  ref: RefObject<Element>,
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit & { once?: boolean } = {}
) {
  const { once = true, ...observerOptions } = options;
  // Memoize options to prevent re-creating the observer unnecessarily.
  // A simple stringify is a stable way to handle object dependency.
  const memoizedOptions = useMemo(() => observerOptions, [JSON.stringify(observerOptions)]);
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