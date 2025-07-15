"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GameStatusProvider } from "@/domains/game-room/components/game-status-provider";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { toast } from "sonner";

interface GameStateContextType {
  // Global game state
  isOnline: boolean;
  isConnected: boolean;
  connectionAttempts: number;
  lastError: string | null;

  // Recovery actions
  retry: () => void;
  clearError: () => void;

  // Network status
  networkStatus: "online" | "offline" | "slow";

  // Error handling flags
  hasConnectionError: boolean;
  hasDataError: boolean;
  hasTimeoutError: boolean;
}

interface GameStateProviderProps {
  children: React.ReactNode;
  roomCode?: string;
  maxRetries?: number;
  retryDelay?: number;
  connectionTimeout?: number;
  enableOfflineMode?: boolean;
}

const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined
);

export function GameStateProvider({
  children,
  roomCode,
  maxRetries = 3,
  retryDelay = 1000,
  connectionTimeout = 10000,
  enableOfflineMode = true,
}: GameStateProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<
    "online" | "offline" | "slow"
  >("online");

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkStatus("online");
      setConnectionAttempts(0);
      setLastError(null);
      if (connectionAttempts > 0) {
        toast.success("연결이 복구되었습니다!");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkStatus("offline");
      setLastError("인터넷 연결이 끊어졌습니다");
      toast.error("인터넷 연결을 확인해주세요");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connectionAttempts]);

  // Connection health check
  useEffect(() => {
    let healthCheckInterval: NodeJS.Timeout;

    if (isOnline && roomCode) {
      healthCheckInterval = setInterval(async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            connectionTimeout
          );

          const response = await fetch(`/api/health?room=${roomCode}`, {
            signal: controller.signal,
            method: "HEAD",
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            setIsConnected(true);
            setNetworkStatus("online");
            setConnectionAttempts(0);
          } else {
            throw new Error(`Health check failed: ${response.status}`);
          }
        } catch (error) {
          setIsConnected(false);
          setConnectionAttempts((prev) => prev + 1);

          if (error instanceof Error) {
            if (error.name === "AbortError") {
              setNetworkStatus("slow");
              setLastError("연결 속도가 느립니다");
            } else {
              setNetworkStatus("offline");
              setLastError("서버 연결에 실패했습니다");
            }
          }

          // Auto-retry logic
          if (connectionAttempts < maxRetries) {
            setTimeout(() => {
              setConnectionAttempts((prev) => prev + 1);
            }, retryDelay * Math.pow(2, connectionAttempts)); // Exponential backoff
          } else {
            setLastError("최대 재시도 횟수를 초과했습니다");
            toast.error(
              "연결에 계속 실패하고 있습니다. 새로고침을 시도해보세요."
            );
          }
        }
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, [
    isOnline,
    roomCode,
    connectionAttempts,
    maxRetries,
    retryDelay,
    connectionTimeout,
  ]);

  // Page visibility optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isOnline && !isConnected) {
        // Page became visible and we're not connected, trigger immediate health check
        setConnectionAttempts(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOnline, isConnected]);

  // Recovery actions
  const retry = () => {
    setConnectionAttempts(0);
    setLastError(null);
    setIsConnected(true);
    toast.info("연결을 재시도하고 있습니다...");
  };

  const clearError = () => {
    setLastError(null);
  };

  // Error categorization
  const hasConnectionError = !isOnline || !isConnected;
  const hasDataError =
    lastError?.includes("데이터") || lastError?.includes("형식") || false;
  const hasTimeoutError =
    lastError?.includes("시간") || lastError?.includes("느립") || false;

  const contextValue: GameStateContextType = {
    isOnline,
    isConnected,
    connectionAttempts,
    lastError,
    retry,
    clearError,
    networkStatus,
    hasConnectionError,
    hasDataError,
    hasTimeoutError,
  };

  // Render with error boundary
  return (
    <ErrorBoundary fallback={<GameErrorFallback onRetry={retry} />}>
      <GameStateContext.Provider value={contextValue}>
        {roomCode ? (
          <GameStatusProvider
            roomCode={roomCode}
            onGameStateChange={(status) => {
              console.log("Game state changed:", status);
              // Additional global state change logic can be added here
            }}
            onParticipantJoin={(participant) => {
              toast.success(
                `${participant.character} ${participant.nickname}님이 입장했습니다!`
              );
            }}
            onParticipantLeave={(participantId) => {
              toast.info("참가자가 퇴장했습니다");
            }}
          >
            {children}
          </GameStatusProvider>
        ) : (
          children
        )}
      </GameStateContext.Provider>
    </ErrorBoundary>
  );
}

// Error fallback component
function GameErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">😞</div>
        <h1 className="text-2xl font-bold">앗, 문제가 발생했어요!</h1>
        <p className="text-muted-foreground">
          게임을 진행하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해보거나
          페이지를 새로고침해주세요.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={onRetry}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom hook for using game state
export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
}

// Specialized hooks for different aspects of game state
export function useNetworkStatus() {
  const { isOnline, isConnected, networkStatus, hasConnectionError } =
    useGameState();
  return { isOnline, isConnected, networkStatus, hasConnectionError };
}

export function useErrorRecovery() {
  const {
    lastError,
    retry,
    clearError,
    hasDataError,
    hasTimeoutError,
    connectionAttempts,
  } = useGameState();

  return {
    lastError,
    retry,
    clearError,
    hasDataError,
    hasTimeoutError,
    connectionAttempts,
  };
}
