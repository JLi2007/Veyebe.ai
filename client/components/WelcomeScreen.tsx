"use client";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sparkles, LogIn } from "lucide-react";

interface WelcomeScreenProps {
  showWelcomeInfo: boolean;
  messagesLength: number;
  user: any;
  onSignIn: () => void;
}

export const WelcomeScreen = ({
  showWelcomeInfo,
  messagesLength,
  user,
  onSignIn
}: WelcomeScreenProps) => {
  return (
    <AnimatePresence>
      {showWelcomeInfo && messagesLength === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center min-h-[50vh]"
        >
          <div className="bg-gradient-to-br from-stone-700/40 to-stone-800/40 backdrop-blur-sm border border-stone-600/30 rounded-xl p-8 max-w-md text-center">
            <div className="flex justify-center mb-4">
              {user ? (
                <Sparkles className="w-12 h-12 text-green-400 animate-pulse" />
              ) : (
                <LogIn className="w-12 h-12 text-orange-400 animate-pulse" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-stone-100 mb-3">
              {user ? "Welcome to Vibe.ai" : "Sign In Required"}
            </h3>
            <p className="text-stone-300 mb-4 leading-relaxed">
              {user
                ? "I'm here to help you create the perfect playlists for any mood or occasion. Start typing a message below to begin our conversation!"
                : "Please connect your Spotify account to use Vibe.ai's playlist creation features. Click the profile button in the top right to sign in."}
            </p>
            {!user && (
              <Button
                onClick={onSignIn}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-4 h-4" />
                Sign in with Spotify
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};