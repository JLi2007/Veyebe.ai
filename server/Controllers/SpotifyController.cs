// todo: create a route to get the users spotifyID via frontend
using Microsoft.AspNetCore.Mvc;
using server.Services;
using server.DTOS;
using server.DTOs;

[ApiController]
[Route("api/[controller]")]
public class SpotifyController : ControllerBase
{
    private readonly ISpotifyService _spotifyService;

    public SpotifyController(ISpotifyService SpotifyService)
    {
        _spotifyService = SpotifyService;
    }

    // POST: get user spotify profile
    [HttpPost("profile")]
    public async Task<IActionResult> GetProfile([FromBody] TokenDTo body) // request (JSON) --> TokenDTO object with [FromBody]
    {
        var config = await _spotifyService.GetCurrentUserProfileAsync(body.AccessToken);
        return Ok(config);
    }

    [HttpPost("get-playlist")]
    public async Task<ActionResult<PlaylistResponse>> GetPlaylists([FromBody] PlaylistRequest request)
    {
        Console.WriteLine("Getting playlists");
        if (string.IsNullOrEmpty(request.AccessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is Required"
            });
        }

        var action = await _spotifyService.GetUserPlaylistsAsync(request.AccessToken);

        if (!action.Success)
        {
            return StatusCode(500, action);
        }
        
        return Ok(action);
    }

    [HttpPost("create-playlist/{userId}")]
    public async Task<ActionResult<string?>> CreatePlaylist(string userId, [FromBody] PlaylistRequest request)
    {
        var action = await _spotifyService.CreatePlaylistFromSongListAsync(userId, request.AccessToken!, request.PlaylistName!, request.Songs!, request.Description);

        if (!action.Success)
        {
            return StatusCode(500, action);
        }

        return Ok(action);
    }

    // POST: Add songs to existing playlist
    [HttpPost("add-songs-to-playlist")]
    public async Task<ActionResult<PlaylistResponse>> AddSongsToPlaylist([FromBody] PlaylistRequest request)
    {
        if (string.IsNullOrEmpty(request.AccessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is required"
            });
        }

        if (string.IsNullOrEmpty(request.PlaylistId))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Playlist ID is required"
            });
        }

        if (request.Songs == null || !request.Songs.Any())
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Songs list cannot be empty"
            });
        }

        var success = await _spotifyService.AddSongsToPlaylistAsync(request.AccessToken, request.PlaylistId, request.Songs);

        if (!success)
        {
            return StatusCode(500, new PlaylistResponse
            {
                Success = false,
                Message = "Failed to add songs to playlist"
            });
        }

        return Ok(new PlaylistResponse
        {
            Success = true,
            Message = "Songs successfully added to playlist"
        });
    }

    // POST: Save songs to user's Liked Songs
    [HttpPost("save-to-liked-songs")]
    public async Task<ActionResult<PlaylistResponse>> SaveSongsToLikedSongs([FromBody] PlaylistRequest request)
    {
        if (string.IsNullOrEmpty(request.AccessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is required"
            });
        }

        if (request.Songs == null || !request.Songs.Any())
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Songs list cannot be empty"
            });
        }

        var success = await _spotifyService.SaveSongsToLikedSongsAsync(request.AccessToken, request.Songs);

        if (!success)
        {
            return StatusCode(500, new PlaylistResponse
            {
                Success = false,
                Message = "Failed to save songs to liked songs"
            });
        }

        return Ok(new PlaylistResponse
        {
            Success = true,
            Message = "Songs successfully saved to liked songs"
        });
    }

    // POST: Get song previews with metadata
    [HttpPost("song-previews")]
    public async Task<ActionResult<PlaylistResponse>> GetSongPreviews([FromBody] PlaylistRequest request)
    {
        if (string.IsNullOrEmpty(request.AccessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is required",
                Previews = new List<SongPreview>()
            });
        }

        if (request.Songs == null || !request.Songs.Any())
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Songs list cannot be empty",
                Previews = new List<SongPreview>()
            });
        }

        try
        {
            var previews = await _spotifyService.GetSongPreviewsAsync(request.AccessToken, request.Songs);

            return Ok(new PlaylistResponse
            {
                Success = true,
                Previews = previews,
                Message = "Song previews retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new PlaylistResponse
            {
                Success = false,
                Message = $"Failed to retrieve song previews: {ex.Message}",
                Previews = new List<SongPreview>()
            });
        }
    }
}