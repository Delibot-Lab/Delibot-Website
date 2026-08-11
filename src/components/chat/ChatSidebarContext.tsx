"use client";

import { createContext, useContext, useState } from "react";

const ChatSidebarContext = createContext<{
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
} | null>(null);

export function ChatSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ChatSidebarContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </ChatSidebarContext.Provider>
  );
}

export function useChatSidebar() {
  const ctx = useContext(ChatSidebarContext);
  if (!ctx) throw new Error("useChatSidebar must be used within ChatSidebarProvider");
  return ctx;
}
