/*
 * Copyright 2023 Google LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useEffect } from "react";

export function useClickOutside<E extends Element>(
  refOrRefs: React.RefObject<E> | React.RefObject<E>[],
  handler: (event: Event) => void
): void {
  useEffect(() => {
    const refs = Array.isArray(refOrRefs) ? refOrRefs : [refOrRefs];
    let down = false;

    const isInOneElement = (ref: React.RefObject<E>, event: Event) => {
      return (
        !ref.current ||
        (event.target instanceof Element && ref.current.contains(event.target))
      );
    };

    const isInElement = (event: Event) => {
      return refs.some((ref) => isInOneElement(ref, event));
    };

    const onMouseUp = (event: Event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!down || isInElement(event)) return;
      handler(event);
      down = false;
    };

    const onMouseDown = (event: Event) => {
      if (isInElement(event)) return;
      down = true;
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [refOrRefs, handler]);
}
