"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Check } from "lucide-react";

interface ChatMessageProps {
  message: {
    text: string;
    sender: string;
  };
  index: number;
  pfp: string;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const ChatMessage = ({
  message,
  index,
  pfp,
  copiedIndex,
  onCopy,
}: ChatMessageProps) => {
  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={idx} className="font-bold">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex items-end gap-2 group ${
        message.sender === "user" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.sender === "user" ? pfp : "/vibe.png"} />
        <AvatarFallback>
          {message.sender === "user" ? "profile" : "bot"}
        </AvatarFallback>
      </Avatar>

      <div
        className={`p-3 rounded-lg max-w-xl break-words whitespace-pre-wrap ${
          message.sender === "user"
            ? "bg-green-600 text-white"
            : "bg-gray-300 text-gray-800"
        }`}
      >
        {parseBoldText(message.text)}
      </div>

      <button
        onClick={() => onCopy(message.text, index)}
        className="opacity-0 group-hover:opacity-100 transition-opacity delay-200 duration-500 p-2 rounded-md hover:bg-gray-200"
        title="Copy message"
      >
        {copiedIndex === index ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-500" />
        )}
      </button>
    </div>
  );
};