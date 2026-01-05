import React, { createContext, useContext, useState, ReactNode } from "react";
import type { GemItem } from "../api/auraServer";

export interface UserInfo {
  token: string;
  userId: number;
  chainId?: 'bsc-testnet' | 'soneium-testnet' | string; // 當前登入的鏈 ID
  name?: string;
  walletAddress?: string;
  deck?: number[];
  gems?: GemItem[];
  loginType?: 'google' | 'password' | 'farcaster'; // 登入類型
  farcasterId?: string; // Farcaster ID（如果是 Farcaster 登入）
  farcasterUsername?: string; // Farcaster 用戶名
  farcasterPfpUrl?: string; // Farcaster 頭像 URL
}

interface UserContextType {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
