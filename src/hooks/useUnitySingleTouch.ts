import { useCallback, useEffect, useState, type RefCallback, type RefObject } from "react";

/** Keep secondary browser touches out of Unity, including on WebGL where the
 * legacy Input.multiTouchEnabled setting does not suppress every touch event. */
export function installUnitySingleTouch(canvas: HTMLCanvasElement): () => void {
  const view = canvas.ownerDocument.defaultView;
  if (!view) return () => {};
  const forwarded = new WeakSet<Event>();
  const fingers = new Set<number>();
  let owner: number | null = null;

  const stop = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const touch = (event: TouchEvent) => {
    if (event.target !== canvas || forwarded.has(event)) return;
    const changed = Array.from(event.changedTouches);
    if (event.type === "touchstart") {
      const wasEmpty = fingers.size === 0;
      changed.forEach(point => fingers.add(point.identifier));
      if (wasEmpty) owner = changed[0]?.identifier ?? null;
    }
    const primary = changed.find(point => point.identifier === owner);
    const onlyOwner = (points: TouchList) => Array.from(points).filter(point => point.identifier === owner);
    const touches = onlyOwner(event.touches);
    const targetTouches = onlyOwner(event.targetTouches);
    if (event.type === "touchend" || event.type === "touchcancel") {
      changed.forEach(point => fingers.delete(point.identifier));
      if (primary || fingers.size === 0) owner = null;
    }

    // Cancel the original event (and its compatibility mouse event), then
    // forward only the owning finger. Never promote a finger already held down.
    stop(event);
    if (!primary) return;
    const single = new view.TouchEvent(event.type, {
      bubbles: true, cancelable: true, composed: true,
      touches, targetTouches, changedTouches: [primary],
      ctrlKey: event.ctrlKey, shiftKey: event.shiftKey,
      altKey: event.altKey, metaKey: event.metaKey,
    });
    forwarded.add(single);
    canvas.dispatchEvent(single);
  };
  const pointer = (event: PointerEvent) => {
    if (event.target === canvas && event.pointerType === "touch" && !event.isPrimary) stop(event);
  };
  const reset = () => { owner = null; fingers.clear(); };
  const touchEvents = ["touchstart", "touchmove", "touchend", "touchcancel"] as const;
  const pointerEvents = ["pointerdown", "pointermove", "pointerup", "pointercancel"] as const;
  touchEvents.forEach(type => view.addEventListener(type, touch, { capture: true, passive: false }));
  pointerEvents.forEach(type => view.addEventListener(type, pointer, { capture: true, passive: false }));
  view.addEventListener("blur", reset);
  return () => {
    touchEvents.forEach(type => view.removeEventListener(type, touch, true));
    pointerEvents.forEach(type => view.removeEventListener(type, pointer, true));
    view.removeEventListener("blur", reset);
    reset();
  };
}

export function useUnitySingleTouch(canvasRef?: RefObject<HTMLCanvasElement | null>): RefCallback<HTMLCanvasElement> {
  // react-unity-webgl exposes its canvas through a deferred imperative ref.
  // Track the actual node instead of reading a still-null ref only at mount.
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const bindCanvas = useCallback((node: HTMLCanvasElement | null) => {
    if (canvasRef) canvasRef.current = node;
    setCanvas(node);
  }, [canvasRef]);
  useEffect(() => {
    if (canvas) return installUnitySingleTouch(canvas);
  }, [canvas]);
  return bindCanvas;
}
