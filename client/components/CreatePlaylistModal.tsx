"use client";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreatePlaylistModalProps {
  show: boolean;
  onClose: (bool: boolean) => void;
  newPlaylistName: string;
  setNewPlaylistName: (name: string) => void;
  newPlaylistDescription: string;
  setNewPlaylistDescription: (desc: string) => void;
  isCreating: boolean;
  onCreatePlaylist: () => void;
}

export const CreatePlaylistModal = ({
  show,
  onClose,
  newPlaylistName,
  setNewPlaylistName,
  newPlaylistDescription,
  setNewPlaylistDescription,
  isCreating,
  onCreatePlaylist,
}: CreatePlaylistModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-stone-800 rounded-lg border border-stone-600 p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-stone-100 mb-4">
              Create New Playlist
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-stone-300 text-sm mb-2">
                  Playlist Name *
                </label>
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="bg-stone-700 border-stone-600 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-300 text-sm mb-2">
                  Description (Optional)
                </label>
                <Input
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="A playlist for..."
                  className="bg-stone-700 border-stone-600 text-stone-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => onClose(false)}
                className="bg-stone-600 hover:bg-stone-500 text-stone-100"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={onCreatePlaylist}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!newPlaylistName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create Playlist"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
