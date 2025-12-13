import { useEffect, RefObject, useMemo } from 'react';
type IntersectionObserverCallback = (entry: IntersectionObserverEntry) => void;
export function useIntersectionObserver(
  ref: RefObject<Element>,
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  const memoizedOptions = useMemo(() => options, [options]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(element);
      }
    }, memoizedOptions);
    observer.observe(element);
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref, callback, memoizedOptions]);
}