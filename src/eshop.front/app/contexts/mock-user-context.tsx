import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  generateMockUserId,
  getMockUserIdFromDocument,
  normalizeMockUsername,
  setMockUserId,
} from "~/lib/mock-user";

interface MockUserContextValue {
  userId: string | undefined;
  setUserId: (id: string) => void;
}

const MockUserContext = createContext<MockUserContextValue | null>(null);

export function MockUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string | undefined>(undefined);

  useEffect(() => {
    const raw = getMockUserIdFromDocument();
    const userName = normalizeMockUsername(raw) ?? generateMockUserId();
    setUserIdState(userName);
    if (userName !== raw) setMockUserId(userName);
  }, []);

  const setUserId = useCallback((id: string) => {
    setMockUserId(id);
    setUserIdState(id);
  }, []);

  return (
    <MockUserContext.Provider value={{ userId, setUserId }}>
      {children}
    </MockUserContext.Provider>
  );
}

export function useMockUserId(): string | undefined {
  const ctx = useContext(MockUserContext);
  return ctx?.userId;
}

export function useMockUserActions(): Pick<MockUserContextValue, "setUserId"> {
  const ctx = useContext(MockUserContext);
  return {
    setUserId: ctx?.setUserId ?? (() => {}),
  };
}
