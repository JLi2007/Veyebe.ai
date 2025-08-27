import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const TypingIndicator = () => {
  return (
    <div className="flex items-end gap-3 justify-start">
      <div className="flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/vibe.png" />
          <AvatarFallback>bot</AvatarFallback>
        </Avatar>
      </div>

      <div className="p-3 rounded-lg bg-gray-300 text-gray-800 max-w-xl">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">Vibe is thinking</span>
          <div className="flex gap-1 ml-2">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
