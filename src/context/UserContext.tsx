import React, { createContext, useContext, useState, ReactNode } from "react";
import type { GemItem } from "../api/auraServer";

export interface UserInfo {
  token: string;
  userId: string;
  username: string;
  walletAddress?: string;
  deck?: number[];
  gems?: GemItem[];
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

//TODO: 綁定錢包後，將使用者的卡片資料存在 context 中