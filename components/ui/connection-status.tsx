"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";
import {
  useNetworkStatus,
  useErrorRecovery,
} from "@/components/providers/game-state-provider";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  className?: string;
  variant?: "banner" | "indicator" | "floating" | "inline";
  showDetails?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function ConnectionStatus({
  className,
  variant = "banner",
  showDetails = false,
  autoHide = false,
  autoHideDelay = 5000,
}: ConnectionStatusProps) {
  const { isOnline, isConnected, networkStatus, hasConnectionError } =
    useNetworkStatus();
  const { lastError, retry, clearError, connectionAttempts } =
    useErrorRecovery();
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-hide logic for successful connections
  useEffect(() => {
    if (autoHide && !hasConnectionError && isConnected) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, hasConnectionError, isConnected, autoHideDelay]);

  // Reset visibility when connection issues occur
  useEffect(() => {
    if (hasConnectionError) {
      setIsVisible(true);
      setIsDismissed(false);
    }
  }, [hasConnectionError]);

  const handleDismiss = () => {
    setIsDismissed(true);
    clearError();
  };

  const handleRetry = () => {
    retry();
    setIsDismissed(false);
  };

  // Don't render if dismissed or hidden
  if (!isVisible || isDismissed) {
    return null;
  }

  // Get status display info
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: "offline",
        message: "인터넷 연결이 끊어졌습니다",
        description: "네트워크 연결을 확인해주세요",
        icon: WifiOff,
        color: "destructive",
        action: "새로고침",
      };
    }

    if (!isConnected) {
      return {
        status: "disconnected",
        message: "서버 연결이 끊어졌습니다",
        description: `${connectionAttempts}번 재시도했습니다`,
        icon: AlertTriangle,
        color: "destructive",
        action: "다시 시도",
      };
    }

    if (networkStatus === "slow") {
      return {
        status: "slow",
        message: "연결 속도가 느립니다",
        description: "게임이 지연될 수 있습니다",
        icon: SignalLow,
        color: "warning",
        action: "새로고침",
      };
    }

    return {
      status: "connected",
      message: "정상 연결됨",
      description: "게임을 정상적으로 진행할 수 있습니다",
      icon: Wifi,
      color: "success",
      action: null,
    };
  };

  const statusInfo = getStatusInfo();

  // Render based on variant
  if (variant === "indicator") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Badge
          variant={
            statusInfo.color === "destructive"
              ? "destructive"
              : statusInfo.color === "warning"
              ? "secondary"
              : "default"
          }
          className="flex items-center space-x-1"
        >
          <statusInfo.icon className="h-3 w-3" />
          <span className="text-xs">{statusInfo.status}</span>
        </Badge>
        {statusInfo.action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRetry}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {statusInfo.action}
          </Button>
        )}
      </div>
    );
  }

  if (variant === "floating") {
    if (statusInfo.status === "connected") return null;

    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Card className="max-w-sm shadow-lg border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <statusInfo.icon className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{statusInfo.message}</p>
                {showDetails && (
                  <p className="text-xs text-muted-foreground">
                    {statusInfo.description}
                  </p>
                )}
                {statusInfo.action && (
                  <Button size="sm" onClick={handleRetry} className="mt-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {statusInfo.action}
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center space-x-2 text-sm", className)}>
        <statusInfo.icon className="h-4 w-4" />
        <span>{statusInfo.message}</span>
        {statusInfo.action && (
          <Button
            size="sm"
            variant="link"
            onClick={handleRetry}
            className="h-auto p-0 text-sm"
          >
            {statusInfo.action}
          </Button>
        )}
      </div>
    );
  }

  // Default banner variant
  if (statusInfo.status === "connected" && !showDetails) {
    return null;
  }

  return (
    <Alert
      className={cn(
        "border-l-4",
        statusInfo.color === "destructive" && "border-l-destructive",
        statusInfo.color === "warning" && "border-l-orange-500",
        statusInfo.color === "success" && "border-l-green-500",
        className
      )}
    >
      <statusInfo.icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-medium">{statusInfo.message}</p>
          {showDetails && lastError && (
            <p className="text-xs text-muted-foreground">{lastError}</p>
          )}
          {showDetails && statusInfo.description && (
            <p className="text-xs text-muted-foreground">
              {statusInfo.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {statusInfo.action && (
            <Button
              size="sm"
              variant={
                statusInfo.color === "destructive" ? "destructive" : "secondary"
              }
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {statusInfo.action}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Specialized components for different use cases
export function NetworkIndicator({ className }: { className?: string }) {
  const { networkStatus } = useNetworkStatus();

  const getSignalIcon = () => {
    switch (networkStatus) {
      case "offline":
        return WifiOff;
      case "slow":
        return SignalLow;
      case "online":
      default:
        return Signal;
    }
  };

  const SignalIcon = getSignalIcon();

  return (
    <div className={cn("flex items-center", className)}>
      <SignalIcon
        className={cn(
          "h-4 w-4",
          networkStatus === "offline" && "text-destructive",
          networkStatus === "slow" && "text-orange-500",
          networkStatus === "online" && "text-green-500"
        )}
      />
    </div>
  );
}

export function ConnectionBanner() {
  return (
    <ConnectionStatus variant="banner" showDetails={true} className="mb-4" />
  );
}

export function FloatingConnectionAlert() {
  return (
    <ConnectionStatus
      variant="floating"
      showDetails={true}
      autoHide={true}
      autoHideDelay={3000}
    />
  );
}
