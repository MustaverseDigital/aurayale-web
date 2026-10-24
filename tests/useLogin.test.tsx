import React, { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { UserProvider } from "../src/context/UserContext";
import { useLogin } from "../src/hooks/useLogin";

const mocks = vi.hoisted(() => ({
  privy: { ready: true, authenticated: false, user: { id: "account-a" } },
  getAccessToken: vi.fn(), login: vi.fn(), logout: vi.fn(),
  exchange: vi.fn(), gems: vi.fn(), deck: vi.fn(), replace: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => ({ ...mocks.privy, login: mocks.login, logout: mocks.logout, getAccessToken: mocks.getAccessToken }) }));
vi.mock("next/router", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("../src/api/auraServer", () => ({ loginWithPrivy: mocks.exchange, getUserGems: mocks.gems, getUserDeck: mocks.deck }));
const wrapper = ({ children }: { children: React.ReactNode }) => <StrictMode><UserProvider>{children}</UserProvider></StrictMode>;
const session = { token: "aura-jwt", userId: 42, name: "Test Player", chainId: "bsc-testnet", loginType: "email" };

beforeEach(() => {
  mocks.privy.ready = true;
  mocks.privy.authenticated = false;
  mocks.privy.user = { id: "account-a" };
  renderHook(() => useLogin(), { wrapper });
  cleanup();
  vi.clearAllMocks();
  mocks.getAccessToken.mockResolvedValue("privy-token");
  mocks.exchange.mockResolvedValue(session);
  mocks.gems.mockResolvedValue([]);
  mocks.deck.mockResolvedValue([1, 2, 3]);
  mocks.logout.mockResolvedValue(undefined);
  localStorage.clear();
});
afterEach(cleanup);

test("restores a direct battle visit and deduplicates three controls under StrictMode", async () => {
  mocks.privy.authenticated = true;
  const { result } = renderHook(() => [useLogin(), useLogin(), useLogin()], { wrapper });
  await waitFor(() => expect(result.current.every((login) => login.user?.userId === 42)).toBe(true));
  expect(mocks.exchange).toHaveBeenCalledExactlyOnceWith("privy-token", "bsc-testnet");
  expect(result.current[0].user?.deck).toEqual([1, 2, 3]);
});

test("shares failure without automatic retries and retries from any control", async () => {
  mocks.exchange.mockRejectedValueOnce(new Error("Server unavailable"));
  mocks.privy.authenticated = true;
  const { result, rerender } = renderHook(() => [useLogin(), useLogin()], { wrapper });
  await waitFor(() => expect(result.current.every((login) => login.error === "Server unavailable")).toBe(true));
  rerender();
  expect(mocks.exchange).toHaveBeenCalledTimes(1);
  act(() => result.current[1].retry());
  await waitFor(() => expect(result.current[0].user?.token).toBe("aura-jwt"));
  expect(mocks.exchange).toHaveBeenCalledTimes(2);
});

test("does not publish a partial session when deck synchronisation fails", async () => {
  mocks.deck.mockRejectedValueOnce(new Error("Deck unavailable"));
  mocks.privy.authenticated = true;
  const { result } = renderHook(() => useLogin(), { wrapper });
  await waitFor(() => expect(result.current.error).toBe("Deck unavailable"));
  expect(result.current.user).toBeNull();
  expect(result.current.loading).toBe(false);
});

test("rejects placeholder credentials", async () => {
  mocks.exchange.mockResolvedValueOnce({ ...session, token: "privy-auth-token" });
  mocks.privy.authenticated = true;
  const { result } = renderHook(() => useLogin(), { wrapper });
  await waitFor(() => expect(result.current.error).toContain("valid account session"));
  expect(result.current.user).toBeNull();
});

test("logout invalidates a pending request and never starts a replacement request", async () => {
  let finishLogin!: (value: typeof session) => void;
  let finishLogout!: () => void;
  mocks.exchange.mockImplementationOnce(() => new Promise((resolve) => { finishLogin = resolve; }));
  mocks.logout.mockImplementationOnce(() => new Promise<void>((resolve) => { finishLogout = resolve; }));
  mocks.privy.authenticated = true;
  const { result, rerender } = renderHook(() => useLogin(), { wrapper });
  await waitFor(() => expect(mocks.exchange).toHaveBeenCalledTimes(1));
  localStorage.setItem("battleDeck", "previous-account-deck");
  act(() => { void result.current.logout(); });
  await act(async () => { finishLogin(session); });
  expect(result.current.user).toBeNull();
  expect(mocks.exchange).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem("battleDeck")).toBeNull();
  mocks.privy.authenticated = false;
  await act(async () => { finishLogout(); });
  rerender();
});

test("an account switch exchanges a fresh session", async () => {
  mocks.privy.authenticated = true;
  const { result, rerender } = renderHook(() => useLogin(), { wrapper });
  await waitFor(() => expect(result.current.user?.userId).toBe(42));
  mocks.privy.user = { id: "account-b" };
  mocks.exchange.mockResolvedValueOnce({ ...session, token: "other-jwt", userId: 99 });
  rerender();
  await waitFor(() => expect(result.current.user?.userId).toBe(99));
  expect(mocks.exchange).toHaveBeenCalledTimes(2);
});

test("a requested redirect works when another control owns the exchange", async () => {
  mocks.privy.authenticated = true;
  renderHook(() => [useLogin(), useLogin({ redirectTo: "/battle" })], { wrapper });
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/battle"));
  expect(mocks.exchange).toHaveBeenCalledTimes(1);
});

test("switching accounts cancels the previous account's unfinished login", async () => {
  let finishFirst!: (value: typeof session) => void;
  mocks.exchange.mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve; }));
  mocks.privy.authenticated = true;
  const { result, rerender } = renderHook(() => useLogin(), { wrapper });
  await waitFor(() => expect(mocks.exchange).toHaveBeenCalledTimes(1));
  mocks.privy.user = { id: "account-b" };
  mocks.exchange.mockResolvedValueOnce({ ...session, token: "other-jwt", userId: 99 });
  rerender();
  await waitFor(() => expect(result.current.user?.userId).toBe(99));
  await act(async () => { finishFirst(session); });
  expect(result.current.user?.userId).toBe(99);
});
