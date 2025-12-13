import { useState, useRef, useEffect } from "react";
import { websocketService } from "../services/websocket";
import { Message } from "../types/chat";
import { generateMessageId, getErrorMessage } from "../utils/message";

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "안녕하세요! 광운대학교 챗봇입니다. 무엇을 도와드릴까요?",
      timestamp: new Date(),
      id: "initial",
      suggestedQuestions: [
        "학과 안내는 어떻게 하나요?",
        "인공지능융합대학은 무슨 학과들이 있나요?",
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const currentResponseRef = useRef<string>("");
  const currentMessageIdRef = useRef<string>("");
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;

    websocketService.onMessage((chunk) => {
      if (!isComponentMounted.current) return;
      if (chunk === "[EOS]") {
        setIsLoading(false);
        return;
      }
      if (!currentResponseRef.current.endsWith(chunk)) {
        currentResponseRef.current += chunk;
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentMessageIdRef.current
            ? {
                ...msg,
                content: currentResponseRef.current,
                isLoading: false,
              }
            : msg
        )
      );
    });

    websocketService.onError((error) => {
      if (!isComponentMounted.current) return;
      console.error("WebSocket error:", error);

      const { errorMessage, suggestedQuestions } = getErrorMessage(
        error as Error
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentMessageIdRef.current
            ? {
                ...msg,
                content: errorMessage,
                isLoading: false,
                suggestedQuestions,
              }
            : msg
        )
      );
      setIsLoading(false);
    });

    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  const addUserMessage = (content: string) => {
    const userMessageId = generateMessageId();
    const newMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
      id: userMessageId,
    };

    setMessages((prev) => [...prev, newMessage]);
    return userMessageId;
  };

  const addAssistantMessage = () => {
    const skeletonId = generateMessageId();
    currentMessageIdRef.current = skeletonId;
    currentResponseRef.current = "";

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        timestamp: new Date(),
        id: skeletonId,
        isLoading: true,
      },
    ]);

    return skeletonId;
  };

  const removeSuggestedQuestions = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, suggestedQuestions: [] } : msg
      )
    );
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    removeSuggestedQuestions,
  };
};
