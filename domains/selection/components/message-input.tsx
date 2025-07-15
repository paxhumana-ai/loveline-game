"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  value: string;
  onChange: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  required?: boolean;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
}

export function MessageInput({
  value,
  onChange,
  placeholder = "상대방에게 전하고 싶은 메시지를 입력하세요...",
  disabled = false,
  maxLength = 50,
  required = false,
  className,
  label = "메시지",
  description = "선택과 함께 상대방에게 전달할 메시지입니다 (선택사항)",
  error,
}: MessageInputProps) {
  const [charactersLeft, setCharactersLeft] = useState(maxLength);
  const [isOverLimit, setIsOverLimit] = useState(false);

  useEffect(() => {
    const remaining = maxLength - value.length;
    setCharactersLeft(remaining);
    setIsOverLimit(remaining < 0);
  }, [value, maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Don't allow typing beyond the limit
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return "text-destructive";
    if (charactersLeft <= 10) return "text-warning";
    return "text-muted-foreground";
  };

  const getCharacterCountVariant = () => {
    if (isOverLimit) return "destructive";
    if (charactersLeft <= 10) return "default";
    return "secondary";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="message-input" className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Badge 
          variant={getCharacterCountVariant()}
          className="text-xs"
        >
          {charactersLeft}/{maxLength}
        </Badge>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        <Textarea
          id="message-input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={3}
          className={cn(
            "resize-none transition-colors",
            {
              "border-destructive focus:border-destructive": error || isOverLimit,
              "border-warning focus:border-warning": charactersLeft <= 10 && !isOverLimit,
            }
          )}
        />
        
        {/* Character count overlay for mobile */}
        <div className="absolute bottom-2 right-2 sm:hidden">
          <Badge 
            variant={getCharacterCountVariant()}
            className="text-xs opacity-75"
          >
            {charactersLeft}
          </Badge>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}

      {isOverLimit && (
        <p className="text-xs text-destructive">
          메시지가 너무 깁니다. {Math.abs(charactersLeft)}자를 줄여주세요.
        </p>
      )}

      {charactersLeft <= 10 && !isOverLimit && charactersLeft > 0 && (
        <p className="text-xs text-warning">
          {charactersLeft}자 남았습니다.
        </p>
      )}

      {value.length > 0 && !isOverLimit && (
        <div className="bg-muted/50 rounded-lg p-3 border">
          <p className="text-xs text-muted-foreground mb-1">미리보기:</p>
          <p className="text-sm text-card-foreground italic">
            "{value}"
          </p>
        </div>
      )}
    </div>
  );
}

// Usage example component for reference
export function MessageInputExample() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateMessage = () => {
    if (message.trim().length === 0) {
      setError("메시지를 입력해주세요");
      return false;
    }
    if (message.length > 50) {
      setError("메시지는 50자를 초과할 수 없습니다");
      return false;
    }
    return true;
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <MessageInput
        value={message}
        onChange={handleMessageChange}
        error={error}
        label="선택 메시지"
        description="상대방에게 전하고 싶은 마음을 담아보세요"
      />
      
      <button
        onClick={validateMessage}
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
      >
        확인
      </button>
    </div>
  );
}