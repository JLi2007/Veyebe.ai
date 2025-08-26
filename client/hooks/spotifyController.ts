export const GetUserPlaylists = async (accessToken: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/spotify/get-playlist`,
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
        console.log(data);
        return { success: true, playlists: data.playlists || data };
      }
      return { success: false, error: "Response is not JSON" };
    }

    return { success: false, error: `HTTP error! status: ${res.status}` };
  } catch (error) {
    console.error("Error in getting user playlists", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const CreateNewPlaylist = async (
  userId: string,
  accessToken: string,
  playlistName: string,
  songs: string[],
  description?: string
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/spotify/create-playlist/${userId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          PlaylistName: playlistName,
          Songs: songs,
          Description: description,
        }),
      }
    );

    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log(data);
        return { success: true, playlist: data };
      }
    } else {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  } catch (error) {
    console.error("Error in creating playlist", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const AddToExistingPlaylist = async (
  accessToken: string,
  playlistId: string,
  songs: string[]
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/spotify/add-songs-to-playlist`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ PlaylistId: playlistId, Songs: songs }),
      }
    );

    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log(data);
        return { success: true, data };
      }
    } else {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  } catch (error) {
    console.error("Error in adding to playlist", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const SaveToLikedSongs = async (
  accessToken: string,
  songs: string[]
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/spotify/save-to-liked-songs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ Songs: songs }),
      }
    );

    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log(data);
        return { success: true, data };
      }
    } else {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  } catch (error) {
    console.error("Error in saving to liked songs", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const PreviewSong = async (accessToken: string, songs: string[]) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/spotify/song-previews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ Songs: songs }),
      }
    );

    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log(data);
        return { success: true, previews: data.previews || data };
      }
    } else {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  } catch (error) {
    console.error("Error in getting song previews", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
