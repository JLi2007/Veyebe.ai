"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RotateCcw } from "lucide-react";

interface TopNavProps {
  user: any;
  pfp: string;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  onClearMessages: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const TopNav = ({
  user,
  pfp,
  popoverOpen,
  setPopoverOpen,
  onClearMessages,
  onSignIn,
  onSignOut
}: TopNavProps) => {
  return (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 w-[97.5%] bg-gradient-to-tr from-gray-600/45 to-gray-600/30 backdrop-blur-md rounded-lg drop-shadow-2xl border border-white/10 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/20 before:to-transparent before:rounded-lg before:pointer-events-none">
      <div className="flex justify-between items-center mx-2 p-1">
        <Button
          onClick={onClearMessages}
          className="p-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400"
          title="Reload chat (Ctrl+Shift+D / Cmd+Shift+D)"
          disabled={!user}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-300 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          Vibe.ai
        </h1>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button className="p-5 text-lg border-1 border-green1/70 text-green1 cursor-pointer bg-green2/5">
              <Avatar>
                <AvatarImage src={pfp} />
                <AvatarFallback>profile</AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-stone-900/90 text-stone-100 border-1 border-green1/70">
            <div className="grid gap-7">
              <div className="space-y-2">
                <h4 className="font-medium leading-none flex items-center justify-center w-full">
                  {!user ? "Connect Spotify to Vibe.ai" : "Disconnect Spotify to Vibe.ai"}
                </h4>
              </div>
              <div className="flex items-center justify-center w-full my-5">
                <Button
                  onClick={user ? onSignOut : onSignIn}
                  className="p-3 rounded-lg bg-stone-700/50"
                >
                  {!user ? "configure" : "unconfigure"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};