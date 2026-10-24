import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { UserProvider } from "../src/context/UserContext";
import BattlePage from "../src/pages/battle";

const mocks = vi.hoisted(() => ({
  authenticated: false,
  exchange: vi.fn(), sendMessage: vi.fn(), version: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => ({ ready: true, authenticated: mocks.authenticated, user: { id: "battle-account" }, getAccessToken: async () => "privy-token", login: vi.fn(), logout: vi.fn() }) }));
vi.mock("next/router", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock("../src/api/auraServer", () => ({ loginWithPrivy: mocks.exchange, getUserGems: async () => [], getUserDeck: async () => [1, 2, 3] }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("react-unity-webgl", () => ({ Unity: () => <canvas data-testid="unity" />, useUnityContext: () => ({ unityProvider: {}, isLoaded: true, loadingProgression: 1, sendMessage: mocks.sendMessage }) }));
vi.mock("../src/hooks/useUnityBuildVersion", () => ({ useUnityBuildVersion: () => mocks.version() }));
vi.mock("../src/context/ViewportRequirementsContext", () => ({ useViewportRequirements: () => ({ isAllowed: true, viewportHeight: 800, safeAreaInsetBottom: 0 }) }));
vi.mock("../src/hooks/useCanvasWidth", () => ({ useCanvasWidth: () => 450 }));
vi.mock("../src/hooks/useInfoPanelLayout", () => ({ useInfoPanelLayout: () => ({ isSidePanel: false }) }));
vi.mock("../src/hooks/useRewardAd", () => ({ useRewardAd: () => ({ showRewardAd: vi.fn(), claim: vi.fn() }) }));
vi.mock("../src/components/InfoMenuModal", () => ({ InfoMenuModal: () => null }));
vi.mock("../src/components/FloatingMenuButton", () => ({ FloatingMenuButton: () => null }));
vi.mock("../src/components/ExitGameButton", () => ({ ExitGameButton: () => null }));

beforeEach(() => {
  mocks.authenticated = false;
  render(<UserProvider><BattlePage /></UserProvider>);
  cleanup();
  vi.clearAllMocks();
  mocks.exchange.mockResolvedValue({ token: "aura-jwt", userId: 42, name: "Current Player", walletAddress: "0xabc" });
  mocks.version.mockReturnValue({ status: "ready", version: { buildId: "20261024-2200-test" }, error: null });
  window.matchMedia = vi.fn().mockReturnValue({ addEventListener: vi.fn(), removeEventListener: vi.fn() });
  localStorage.clear();
});
afterEach(cleanup);

test("direct unauthenticated visits show login without fetching or mounting Unity", () => {
  render(<UserProvider><BattlePage /></UserProvider>);
  expect(screen.getByText("battle.loginTitle")).toBeTruthy();
  expect(screen.queryByTestId("unity")).toBeNull();
  expect(mocks.version).not.toHaveBeenCalled();
});

test("the authenticated player receives its identity and JWT without an old account's local deck", async () => {
  mocks.authenticated = true;
  localStorage.setItem("battleDeck", "99,98,97");
  render(<UserProvider><BattlePage /></UserProvider>);
  await waitFor(() => expect(screen.getByTestId("unity")).toBeTruthy());
  expect(mocks.sendMessage).toHaveBeenCalledWith("WebBridge", "SetPlayerInfoJson", JSON.stringify({ playerId: "42", userName: "Current Player", walletAddress: "0xabc", token: "aura-jwt" }));
  expect(mocks.sendMessage.mock.calls.some((call) => call[1] === "SetCardDeck")).toBe(false);
});
