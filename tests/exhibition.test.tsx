import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ send: vi.fn(), unload: vi.fn().mockResolvedValue(undefined), prepare: vi.fn(), status: vi.fn() }));
vi.mock("next/head", () => ({ default: () => null }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("../src/hooks/useUnityBuildVersion", () => ({ useUnityBuildVersion: () => ({ status: "ready", version: { buildId: "20261112-1200-abcdef", variant: "desktop" } }) }));
vi.mock("../src/context/ViewportRequirementsContext", () => ({ useViewportRequirements: () => ({ viewportHeight: 844 }) }));
vi.mock("../src/hooks/useCanvasWidth", () => ({ useCanvasWidth: () => 390 }));
vi.mock("../src/hooks/useUnityDevicePixelRatio", () => ({ useUnityDevicePixelRatio: () => ({ effectiveDevicePixelRatio: 3 }) }));
vi.mock("../src/lib/exhibitionOffline", () => ({ getOfflineStatus: () => Promise.resolve({ ready: false }), prepareExhibitionOffline: mocks.prepare }));
vi.mock("react-unity-webgl", () => ({
  Unity: () => <canvas aria-label="demo-player" />,
  useUnityContext: () => ({ unityProvider: {}, isLoaded: true, sendMessage: mocks.send, unload: mocks.unload }),
}));
import ExhibitionPage from "../src/pages/exhibition";

afterEach(() => { cleanup(); vi.clearAllMocks(); });
test("the demo starts without account identity and reset requires a deliberate second action", async () => {
  render(<ExhibitionPage />);
  fireEvent.click(screen.getByText("exhibition.play"));
  expect(screen.getByLabelText("demo-player")).toBeTruthy();
  expect(mocks.send).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText("exhibition.menu"));
  fireEvent.click(screen.getByText("exhibition.nextPlayer"));
  expect(mocks.send).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("exhibition.confirmReset"));
  expect(mocks.send).toHaveBeenCalledExactlyOnceWith("WebBridge", "ResetExhibition");
  await waitFor(() => expect(screen.queryByText("exhibition.confirmReset")).toBeNull());
});

test("tutorial replay uses the local bridge, and leaving unloads the player", async () => {
  render(<ExhibitionPage />);
  fireEvent.click(screen.getByText("exhibition.play"));
  fireEvent.click(screen.getByLabelText("exhibition.menu"));
  fireEvent.click(screen.getByText("exhibition.replay"));
  expect(mocks.send).toHaveBeenCalledExactlyOnceWith("WebBridge", "ReplayExhibitionTutorial");
  fireEvent.click(screen.getByLabelText("exhibition.menu"));
  fireEvent.click(screen.getByText("exhibition.back"));
  await waitFor(() => expect(mocks.unload).toHaveBeenCalledOnce());
  await waitFor(() => expect(screen.queryByLabelText("demo-player")).toBeNull());
});

test("a failed download leaves offline readiness false and allows retry", async () => {
  mocks.prepare.mockRejectedValue(new Error("quota exceeded"));
  render(<ExhibitionPage />);
  fireEvent.click(screen.getByText("exhibition.prepare"));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("exhibition.prepareFailed"));
  expect(screen.queryByText("exhibition.offlineReady")).toBeNull();
  expect((screen.getByText("exhibition.prepare") as HTMLButtonElement).disabled).toBe(false);
});
