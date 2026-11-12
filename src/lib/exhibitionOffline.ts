import type { UnityBuildVersion } from "../hooks/useUnityBuildVersion";

export type OfflineStatus = { ready: boolean; buildId?: string };

async function worker(): Promise<ServiceWorker> {
  if (!("serviceWorker" in navigator)) throw new Error("Offline storage is unavailable in this browser");
  const registration = await navigator.serviceWorker.register("/exhibition/sw.js", { scope: "/exhibition" });
  if (registration.active) return registration.active;
  const installing = registration.installing || registration.waiting;
  if (!installing) throw new Error("Offline worker could not start");
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Offline worker startup timed out")), 20000);
    const check = () => {
      if (installing.state === "activated") { clearTimeout(timeout); resolve(installing); }
      else if (installing.state === "redundant") { clearTimeout(timeout); reject(new Error("Offline worker failed")); }
    };
    installing.addEventListener("statechange", check);
    check();
  });
}

async function request<T>(message: object, progress?: (done: number, total: number) => void): Promise<T> {
  const target = await worker();
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => { channel.port1.close(); reject(new Error("Offline download timed out")); }, 120000); };
    arm();
    channel.port1.onmessage = ({ data }) => {
      arm();
      if (data.type === "progress") { progress?.(data.done, data.total); return; }
      clearTimeout(timer);
      channel.port1.close();
      if (data.error) reject(new Error(data.error));
      else resolve(data.result as T);
    };
    target.postMessage(message, [channel.port2]);
  });
}

export function getOfflineStatus() { return request<OfflineStatus>({ type: "STATUS" }); }
export function prepareExhibitionOffline(version: UnityBuildVersion, progress: (done: number, total: number) => void) {
  return request<OfflineStatus>({ type: "PREPARE", variant: version.variant }, progress);
}
