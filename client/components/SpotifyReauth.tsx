"use client";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface SpotifyReauthNotificationProps {
  needsSpotifyReauth: boolean;
  user: any;
  onReauth: () => void;
}

export const SpotifyReauthNotification = ({
  needsSpotifyReauth,
  user,
  onReauth
}: SpotifyReauthNotificationProps) => {
  if (!needsSpotifyReauth || !user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 bg-amber-600/20 backdrop-blur-md border border-amber-500/30 rounded-lg p-3 mx-4"
    >
      <div className="flex items-center gap-3 text-amber-200">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        <span className="text-sm">Spotify connection expired</span>
        <Button
          onClick={onReauth}
          className="bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs px-3 py-1 h-auto"
        >
          Reconnect
        </Button>
      </div>
    </motion.div>
  );
};