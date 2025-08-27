"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  GetUserPlaylists,
  CreateNewPlaylist,
  AddToExistingPlaylist,
} from "@/hooks/spotifyController";
import useChatbot, { MessageDTO, MessagesResponse } from "@/hooks/useChatbot";
import useChatScroll from "@/hooks/chatbotAutoscroll";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { TopNav } from "@/components/TopNav";
import { ChatMessage } from "@/components/ChatMessage";
import { SpotifyReauthNotification } from "@/components/SpotifyReauth";
import { CreatePlaylistModal } from "@/components/CreatePlaylistModal";
import { TypingIndicator } from "@/components/TypingIndicator";
import AlertFlash from "@/components/Alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  MessageCircleQuestion,
  SendHorizontal,
  RotateCcw,
} from "lucide-react";

const App = () => {
  const { messages, sendMessage, setMessages } = useChatbot();
  const ref = useChatScroll(messages);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [showWelcomeInfo, setShowWelcomeInfo] = useState(true);
  const [isBotTalking, setIsBotTalking] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");
  const [pfp, setPfp] = useState<string>("/404profile.png");
  const [input, setInput] = useState<string>(
    "a playlist for a scenic drive in the alps"
  );
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showSpotifyPage, setShowSpotifyPage] = useState<boolean>(true);
  const [shouldRenderSpotifyPage, setShouldRenderSpotifyPage] = useState(showSpotifyPage);
  const [showSpotifyFunctions, setShowSpotifyFunctions] = useState<boolean>(false);
  const [needsSpotifyReauth, setNeedsSpotifyReauth] = useState<boolean>(false);
  const { supabase, signInWithOAuth, user, signOut } = useAuth();

  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  const fetchUserPlaylists = useCallback(async () => {
    if (!user) return;

    try {
      const session = await supabase.auth.getSession();
      const providerToken = session.data.session?.provider_token;

      console.log("Session data:", session.data.session);

      if (providerToken) {
        const result = await GetUserPlaylists(providerToken);
        console.log("Full result:", result);

        if (result && result.success) {
          console.log("Playlists data:", result.playlists);
          // Ensure we're setting an array
          const playlistsArray = Array.isArray(result.playlists)
            ? result.playlists
            : [];
          setUserPlaylists(playlistsArray);
        } else {
          console.log("Failed to fetch playlists or no playlists found");
          setUserPlaylists([]);
        }
      } else {
        console.log("No provider token found - triggering reauth");
        setNeedsSpotifyReauth(true);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setUserPlaylists([]);
    }
  }, [supabase.auth, user]);

  useEffect(() => {
    if (user && showSpotifyFunctions) {
      fetchUserPlaylists();
    }
  }, [user, showSpotifyFunctions, fetchUserPlaylists]);

  const handleCreateNewPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;

    setIsCreatingPlaylist(true);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.provider_token;

      if (accessToken) {
        // Extract song IDs from messages or use selectedSongs
        const songIds = extractSongIdsFromMessages();

        await CreateNewPlaylist(
          user.id,
          accessToken,
          newPlaylistName,
          songIds,
          newPlaylistDescription
        );

        setShowCreatePlaylistModal(false);
        setNewPlaylistName("");
        setNewPlaylistDescription("");
        // Show success message
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const extractSongIdsFromMessages = (): string[] => {
    // This is a placeholder - you'll need to implement based on how song IDs are stored in messages
    const botMessages = messages.filter((msg) => msg.sender === "bot");
    const songIds: string[] = [];

    // Example implementation - adjust based on your actual message format
    botMessages.forEach((msg) => {
      // Look for Spotify track IDs in the message text
      const spotifyIdRegex = /spotify:track:([a-zA-Z0-9]{22})/g;
      const matches = msg.text.match(spotifyIdRegex);
      if (matches) {
        matches.forEach((match) => {
          const trackId = match.replace("spotify:track:", "");
          if (!songIds.includes(trackId)) {
            songIds.push(trackId);
          }
        });
      }
    });

    return songIds;
  };

  const handleAddToExistingPlaylist = async (playlistId: string) => {
    if (!user) return;

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.provider_token;

      if (accessToken) {
        const songIds = extractSongIdsFromMessages();
        await AddToExistingPlaylist(accessToken, playlistId, songIds);
        // Show success message
      }
    } catch (error) {
      console.error("Error adding to playlist:", error);
    }
  };

  useEffect(() => {
    // Load messages when user changes
    const loadMessages = async () => {
      if (!user) {
        setMessages([]);
        setUsername("");
        setPfp("/404profile.png");
        return;
      }

      try {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supabase/get-messages/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MessagesResponse = await response.json();

        if (data.success && data.messages && Array.isArray(data.messages)) {
          const formattedMessages: MessageDTO[] = data.messages.map((msg) => ({
            text: msg.text,
            sender: msg.sender,
          }));
          setMessages(formattedMessages);

          // Hide welcome info if there are existing messages
          if (formattedMessages.length > 0) {
            setShowWelcomeInfo(false);
            setShowSpotifyFunctions(true);
          }
        } else {
          console.error("Error loading messages:", data.error);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading messages from API:", error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [user, setMessages, supabase.auth]);

  const clearMessages = async () => {
    if (!user?.id) {
      setMessages([]);
      setShowWelcomeInfo(true);
      setShowSpotifyFunctions(false);
      return;
    }

    // no need to clear if its already empty
    if (!messages || messages.length === 0) {
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supabase/clear-messages/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MessagesResponse = await response.json();

      if (data.success) {
        setMessages([]);
        setShowWelcomeInfo(true);
        setShowSpotifyFunctions(false);
      } else {
        console.error("Error clearing messages:", data.error);
      }
    } catch (error) {
      console.error("Error clearing messages from API:", error);
    }
  };

  // ensures mounted/unmounted properly when the visibility of sidebar changes
  useEffect(() => {
    if (showSpotifyPage) setShouldRenderSpotifyPage(true);
  }, [showSpotifyPage]);

  // remove # from url (supabase auth auto appends) and announce page state
  useEffect(() => {
    let isFetching = false;

    history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );

    if (sessionStorage.getItem("redirectedAfterLogin") == "true" || user) {
      setShowAlert(true);
    }

    const handleMissingSpotifyToken = () => {
      // Set flag to show that Spotify needs re-authentication
      setNeedsSpotifyReauth(true);

      // Set fallback values but don't sign the user out completely
      setUsername(user?.user_metadata?.full_name || user?.email || "User");
      setPfp("/404profile.png");

      console.log("Spotify re-authentication required");
    };

    const fetchSession = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        if (!user) {
          setUsername("");
          setPfp("/404profile.png");
          setNeedsSpotifyReauth(false);
          return;
        }

        const session = await supabase.auth.getSession();
        console.log("INITIAL SESSION", session);

        const currentSession = session.data.session;

        // Now check for provider token
        if (currentSession?.provider_token) {
          // Reset the reauth flag since we have a token
          setNeedsSpotifyReauth(false);

          const accessToken = currentSession.provider_token;

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/spotify/profile`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            );

            if (res.ok) {
              const contentType = res.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                console.log("SPOTIFY FETCH DATA", data);

                setUsername(data.displayName || "User");
                setPfp(
                  data.images?.[1]?.url ||
                    data.images?.[0]?.url ||
                    "/404profile.png"
                );
              } else {
                console.error("Server returned non-JSON response");
                handleMissingSpotifyToken();
              }
            } else {
              console.error("Failed to fetch Spotify profile:", res.status);
              // If it's a 401, the token might be expired
              if (res.status === 401) {
                handleMissingSpotifyToken();
              } else {
                handleMissingSpotifyToken();
              }
            }
          } catch (fetchError) {
            console.error(
              "Network error fetching Spotify profile:",
              fetchError
            );
            handleMissingSpotifyToken();
          }
        } else if (currentSession && !currentSession.provider_token) {
          // We have a session but no provider token - set reauth flag but don't auto-refresh
          console.log("No provider token found - user needs to reconnect");
          handleMissingSpotifyToken();
        } else {
          // No session at all
          console.warn("No active session");
          handleMissingSpotifyToken();
        }
      } catch (error) {
        console.error("Error in fetchSession:", error);
        handleMissingSpotifyToken();
      } finally {
        isFetching = false;
      }
    };
    fetchSession();
  }, [user, supabase.auth]);

  async function signInWithSpotify() {
    const { data, error } = await signInWithOAuth({
      provider: "spotify",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_CLIENT_HOST}/start`,
      },
    });
    console.log(data);
    if (error) {
      console.error("ERROR IN SIGNIN", error);
    }

    sessionStorage.setItem("redirectedAfterLogin", "true");
  }

  // Add a function to handle Spotify re-authentication
  const handleSpotifyReauth = async () => {
    try {
      const { error } = await signInWithOAuth({
        provider: "spotify",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_CLIENT_HOST}/start`,
        },
      });

      if (error) {
        console.error("Error re-authenticating with Spotify:", error);
      } else {
        sessionStorage.setItem("redirectedAfterLogin", "true");
        setNeedsSpotifyReauth(false);
      }
    } catch (error) {
      console.error("Error in Spotify re-authentication:", error);
    }
  };

  const copyToClipboard = async (text: string, index: any) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getInputPlaceholder = () => {
    if (!user) {
      return "Sign in to start chatting...";
    }
    if (showSpotifyFunctions) {
      return "Use functions on the left, or describe a new playlist...";
    }
    return "playlist for a scenic drive in the alps";
  };

  const handleMessageSend = async () => {
    // Don't allow sending messages if user is not signed in
    if (!user) {
      return;
    }

    if (input.trim()) {
      // Hide welcome info when first message is sent
      if (showWelcomeInfo) {
        setShowWelcomeInfo(false);
      }

      setIsBotTalking(true);

      try {
        await sendMessage(input);
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        // Clear loading state after message is sent
        setIsBotTalking(false);
      }
    }
  };

  return (
    <>
      <div className="relative w-screen md:h-screen h-auto min-h-screen bg-stone-800">
        <div className="flex justify-center flex-row w-full h-full">
          {shouldRenderSpotifyPage && (
            <div className="w-[25%] relative h-full overflow-hidden">
              <AnimatePresence
                onExitComplete={() => setShouldRenderSpotifyPage(false)} // unmounts AFTER exit animation (avoids unmounting DURING)
              >
                {showSpotifyPage && ( // condition as the motion.div must become removed/hidden for onexitcomplete to complete
                  <motion.div
                    key="sidebar"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.4 }}
                    className="absolute w-full h-full bg-stone-900 flex justify-start border-r"
                  >
                    <div className="w-full h-full flex flex-col">
                      <ArrowLeftFromLine
                        className="absolute text-stone-100/60 right-1 top-2 cursor-pointer z-10"
                        onClick={() => setShowSpotifyPage(false)}
                      />

                      <div className="p-4">
                        <h1 className="text-stone-100 text-sm font-medium mb-4">
                          {user ? (
                            <div className="flex items-center gap-2">
                              <span>{`Spotify Functions - ${username}`}</span>
                              {needsSpotifyReauth && (
                                <div
                                  className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"
                                  title="Spotify needs reconnection"
                                />
                              )}
                            </div>
                          ) : (
                            "Sign in with Spotify first"
                          )}
                        </h1>

                        {showSpotifyFunctions && user && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-stone-300 text-sm font-medium tracking-wide">
                                Spotify Actions
                              </h2>
                              <Button
                                onClick={clearMessages}
                                className="bg-slate-600/20 hover:bg-slate-600/40 border border-slate-500/30 text-slate-300 text-xs px-3 py-1.5 h-auto flex items-center gap-1"
                                title="Start a new request"
                              >
                                <RotateCcw className="w-3 h-3" />
                                New Request
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {/* Create New Playlist */}
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Button
                                  className="relative w-full text-left justify-start bg-green-600/15 hover:bg-green-600/25 border border-green-500/30 text-green-200 text-sm h-auto py-4 px-4 rounded-lg backdrop-blur-sm overflow-hidden"
                                  onClick={() =>
                                    setShowCreatePlaylistModal(true)
                                  }
                                >
                                  {/* Background decoration */}
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-400/10 to-transparent rounded-full -translate-y-4 translate-x-4"></div>
                                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full translate-y-2 -translate-x-2"></div>

                                  {/* Spotify icon placeholder */}
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-400/40 rounded-full"></div>
                                  </div>

                                  <div className="flex flex-col items-start relative z-10">
                                    <span className="font-semibold text-green-100">
                                      Create New Playlist
                                    </span>
                                    <span className="text-xs text-green-300/80 mt-0.5">
                                      Generate a fresh playlist with all
                                      suggestions
                                    </span>
                                  </div>
                                </Button>
                              </div>

                              {/* Add to Existing Playlist */}
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative w-full bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 rounded-lg backdrop-blur-sm overflow-hidden p-4">
                                  {/* Background decoration */}
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-4 translate-x-4"></div>
                                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-2 -translate-x-2"></div>

                                  {/* Playlist icon placeholder */}
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-400/20 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-400/40 rounded-sm"></div>
                                    <div className="w-1 h-1 bg-blue-400/40 rounded-full ml-0.5"></div>
                                  </div>

                                  <div className="flex flex-col space-y-3 relative z-10">
                                    <div className="flex flex-col items-start">
                                      <span className="font-semibold text-blue-100">
                                        Add to Existing Playlist
                                      </span>
                                      <span className="text-xs text-blue-300/80 mt-0.5">
                                        Select songs to add to your playlists
                                      </span>
                                    </div>

                                    <Select
                                      onValueChange={
                                        handleAddToExistingPlaylist
                                      }
                                    >
                                      <SelectTrigger className="w-full bg-blue-600/20 border-blue-500/40 text-blue-200 text-xs h-8">
                                        <SelectValue placeholder="Choose playlist..." />
                                      </SelectTrigger>
                                      <SelectContent className="bg-stone-800 border-blue-500/40">
                                        {Array.isArray(userPlaylists) &&
                                        userPlaylists.length > 0 ? (
                                          userPlaylists.map((playlist, idx) => (
                                            <SelectItem
                                              key={`${
                                                playlist.id ?? "playlist"
                                              }-${idx}`}
                                              value={
                                                playlist.id ?? `playlist-${idx}`
                                              }
                                            >
                                              {playlist.name ??
                                                `Playlist ${idx + 1}`}
                                            </SelectItem>
                                          ))
                                        ) : (
                                          <SelectItem
                                            key="no-playlists"
                                            value="no-playlists"
                                            disabled
                                          >
                                            {/* MODIFIED: guard .length access so we don't read .length on non-array */}
                                            {Array.isArray(userPlaylists) &&
                                            userPlaylists.length === 0
                                              ? "No playlists found"
                                              : "Loading playlists..."}
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              {/* Save Individual Songs */}
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Button
                                  className="relative w-full text-left justify-start bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-200 text-sm h-auto py-4 px-4 rounded-lg backdrop-blur-sm overflow-hidden"
                                  onClick={() => {
                                    console.log(
                                      "Save individual songs clicked"
                                    );
                                  }}
                                >
                                  {/* Background decoration */}
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full -translate-y-4 translate-x-4"></div>
                                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full translate-y-2 -translate-x-2"></div>

                                  {/* Heart icon placeholder */}
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-400/20 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-purple-400/40 rounded-full relative">
                                      <div className="absolute top-0 left-1 w-1 h-1 bg-purple-400/60 rounded-full"></div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-start relative z-10">
                                    <span className="font-semibold text-purple-100">
                                      Individual Songs
                                    </span>
                                    <span className="text-xs text-purple-300/80 mt-0.5">
                                      Add selected tracks to your library
                                    </span>
                                  </div>
                                </Button>
                              </div>

                              {/* Preview Songs */}
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Button
                                  className="relative w-full text-left justify-start bg-orange-600/15 hover:bg-orange-600/25 border border-orange-500/30 text-orange-200 text-sm h-auto py-4 px-4 rounded-lg backdrop-blur-sm overflow-hidden"
                                  onClick={() => {
                                    console.log("Preview songs clicked");
                                  }}
                                >
                                  {/* Background decoration */}
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full -translate-y-4 translate-x-4"></div>
                                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full translate-y-2 -translate-x-2"></div>

                                  {/* Play icon placeholder */}
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-orange-400/20 rounded-full flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-[4px] border-l-orange-400/60 border-y-[2px] border-y-transparent ml-0.5"></div>
                                  </div>

                                  <div className="flex flex-col items-start relative z-10">
                                    <span className="font-semibold text-orange-100">
                                      Preview Songs
                                    </span>
                                    <span className="text-xs text-orange-300/80 mt-0.5">
                                      Listen to 30-second previews
                                    </span>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHANGE: Added message when functions aren't visible yet */}
                        {!showSpotifyFunctions && user && (
                          <p className="text-stone-400 text-xs">
                            Functions will appear after you send a message
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {!shouldRenderSpotifyPage && (
            <AnimatePresence>
              <motion.div
                key="arrow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute left-1 top-1/2 z-50"
              >
                <ArrowRightFromLine
                  className="text-stone-100/60 cursor-pointer"
                  onClick={() => setShowSpotifyPage(true)} // changes sidebar visibility to true --> in turn MOUNTS it via useeffect
                />
              </motion.div>
            </AnimatePresence>
          )}

          <div className="relative w-full h-full border-b">
            <TopNav
              user={user}
              pfp={pfp}
              popoverOpen={popoverOpen}
              setPopoverOpen={setPopoverOpen}
              onClearMessages={clearMessages}
              onSignIn={() => signInWithSpotify}
              onSignOut={() => {
                signOut();
                setUsername("");
                setPfp("/404profile.png");
                setMessages([]);
                setShowWelcomeInfo(true);
                setShowSpotifyFunctions(false);
                setPopoverOpen(false);
                setShowAlert(true);
              }}
            />

            <SpotifyReauthNotification
              needsSpotifyReauth={needsSpotifyReauth}
              user={user}
              onReauth={handleSpotifyReauth}
            />

            <div
              className="absolute inset-0 overflow-y-auto p-4 pt-16 pb-28"
              ref={ref}
            >
              <WelcomeScreen
                showWelcomeInfo={showWelcomeInfo}
                messagesLength={messages.length}
                user={user}
                onSignIn={signInWithSpotify}
              />

              {/* Messages */}
              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-end gap-3 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <ChatMessage message={msg} index={index} pfp={pfp} copiedIndex={copiedIndex} onCopy={copyToClipboard}/>
                  </div>
                ))}
                <AnimatePresence>
                  {isBotTalking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="w-full h-full flex items-end justify-center pb-5 text-white">
              <div className="flex-1 flex flex-col">
                <div className="w-full flex items-center justify-center gap-1 z-50">
                  <Input
                    onChange={(e) => setInput(e.target.value)}
                    className={`w-[60%] ${
                      user && !isBotTalking
                        ? "bg-stone-700/75"
                        : "bg-stone-700/50 text-stone-500 cursor-not-allowed"
                    }`}
                    placeholder={
                      isBotTalking
                        ? "Vibe is responding..."
                        : getInputPlaceholder()
                    }
                    value={input}
                    disabled={!user || isBotTalking}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && user && !isBotTalking) {
                        e.preventDefault();
                        handleMessageSend();
                      }
                    }}
                  />
                  <button
                    onClick={handleMessageSend}
                    disabled={!user || isBotTalking}
                    className={
                      user && isBotTalking
                        ? ""
                        : "opacity-50 cursor-not-allowed"
                    }
                  >
                    {isBotTalking ? (
                      <div className="w-5 h-5 border-2 border-stone-500 border-t-green-400 rounded-full animate-spin"></div>
                    ) : (
                      <SendHorizontal className="cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence
                initial={false}
                onExitComplete={() => {
                  // fixing the visibility issue (before fade out ends on alert component)
                  setShowAlert(false);
                  sessionStorage.setItem("redirectedAfterLogin", "false");
                }}
              >
                {showAlert && (
                  <>
                    <AlertFlash
                      message={
                        sessionStorage.getItem("redirectedAfterLogin") == "true"
                          ? "IN"
                          : user
                          ? "STATE"
                          : "OUT"
                      }
                      onClose={() => setShowAlert(false)}
                    />
                  </>
                )}
              </AnimatePresence>

              <Button className="absolute right-0 bottom-0 p-1 m-3 px-5 text-md border-1 border-green1/70 text-green1 cursor-pointer bg-green2/5 z-50">
                help <MessageCircleQuestion />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreatePlaylistModal
        show={showCreatePlaylistModal}
        onClose={setShowCreatePlaylistModal}
        newPlaylistName={newPlaylistName}
        setNewPlaylistName={setNewPlaylistName}
        newPlaylistDescription={newPlaylistDescription}
        setNewPlaylistDescription={setNewPlaylistDescription}
        isCreating={isCreatingPlaylist}
        onCreatePlaylist={handleCreateNewPlaylist}
      />
    </>
  );
};

export default App;
