import { afterEach, expect, test } from "vitest";
import { installUnitySingleTouch } from "../src/hooks/useUnitySingleTouch";

const cleanups: (() => void)[] = [];
afterEach(() => { cleanups.splice(0).forEach(cleanup => cleanup()); document.body.replaceChildren(); });
const finger = (identifier: number) => ({ identifier, clientX: identifier * 10, clientY: 100 }) as Touch;
function setup() {
  const canvas = document.createElement("canvas");
  document.body.append(canvas);
  const received: TouchEvent[] = [];
  for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"]) {
    canvas.addEventListener(type, event => received.push(event as TouchEvent));
  }
  const cleanup = installUnitySingleTouch(canvas);
  cleanups.push(cleanup);
  const send = (type: string, changedTouches: Touch[], touches: Touch[], target: Element = canvas) => {
    const event = new TouchEvent(type, { bubbles: true, cancelable: true, changedTouches, touches, targetTouches: touches });
    target.dispatchEvent(event);
    return event;
  };
  return { canvas, received, send, cleanup };
}

test("Unity receives only the first finger, even when both fingers move in one browser event", () => {
  const { received, send } = setup();
  const a = finger(8), b = finger(9);
  const start = send("touchstart", [a], [a]);
  send("touchstart", [b], [a, b]);
  send("touchmove", [a, b], [a, b]);
  expect(start.defaultPrevented).toBe(true);
  expect(received.map(event => event.type)).toEqual(["touchstart", "touchmove"]);
  for (const event of received) {
    expect(Array.from(event.touches).map(point => point.identifier)).toEqual([8]);
    expect(Array.from(event.targetTouches).map(point => point.identifier)).toEqual([8]);
    expect(Array.from(event.changedTouches).map(point => point.identifier)).toEqual([8]);
  }
});

test("a secondary finger cannot release or cancel an active drag", () => {
  const { received, send } = setup();
  const a = finger(1), b = finger(2);
  send("touchstart", [a, b], [a, b]);
  send("touchcancel", [b], [a]);
  send("touchmove", [a], [a]);
  send("touchend", [a], []);
  expect(received.map(event => event.type)).toEqual(["touchstart", "touchmove", "touchend"]);
  expect(received.at(-1)?.touches).toHaveLength(0);
});

test("ending the owner never promotes a finger already held down; a fresh gesture works after all lift", () => {
  const { received, send } = setup();
  const a = finger(1), b = finger(2), c = finger(3), d = finger(4);
  send("touchstart", [a, b], [a, b]);
  send("touchend", [a], [b]);
  send("touchmove", [b], [b]);
  send("touchstart", [c], [b, c]);
  send("touchend", [b, c], []);
  send("touchstart", [d], [d]);
  expect(received.map(event => Array.from(event.changedTouches).map(point => point.identifier))).toEqual([[1], [1], [4]]);
});

test("primary cancellation and focus loss do not leave the next gesture locked", () => {
  const { received, send } = setup();
  const a = finger(1), b = finger(2), c = finger(3);
  send("touchstart", [a], [a]);
  send("touchcancel", [a], []);
  send("touchstart", [b], [b]);
  window.dispatchEvent(new Event("blur"));
  send("touchstart", [c], [c]);
  expect(received.map(event => event.type)).toEqual(["touchstart", "touchcancel", "touchstart", "touchstart"]);
});

test("secondary touch pointer events are blocked while primary touch and mouse pointers pass", () => {
  const { canvas } = setup();
  const received: Event[] = [];
  canvas.addEventListener("pointerdown", event => received.push(event));
  const send = (pointerType: string, isPrimary: boolean) => {
    const event = new Event("pointerdown", { bubbles: true, cancelable: true });
    Object.assign(event, { pointerType, isPrimary });
    canvas.dispatchEvent(event);
    return event;
  };
  expect(send("touch", false).defaultPrevented).toBe(true);
  send("touch", true);
  send("mouse", false);
  expect(received).toHaveLength(2);
});

test("other website controls and input after teardown retain their original events", () => {
  const { canvas, received, send, cleanup } = setup();
  const button = document.createElement("button");
  document.body.append(button);
  const other: Event[] = [];
  button.addEventListener("touchstart", event => other.push(event));
  const event = send("touchstart", [finger(1)], [finger(1)], button);
  expect(other).toEqual([event]);
  expect(event.defaultPrevented).toBe(false);
  cleanup();
  const original = send("touchstart", [finger(2), finger(3)], [finger(2), finger(3)], canvas);
  expect(received).toEqual([original]);
  expect(original.defaultPrevented).toBe(false);
});
