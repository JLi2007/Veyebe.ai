// todo: create a route to get the users spotifyID via frontend
using Microsoft.AspNetCore.Mvc;
using server.Services;
using server.DTOS;

[ApiController]
[Route("api/[controller]")]
public class SpotifyController : ControllerBase
{
    private readonly ISpotifyService _spotifyService;

    public SpotifyController(ISpotifyService SpotifyService)
    {
        _spotifyService = SpotifyService;
    }

    private string? GetAccessTokenFromRequest()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            return authHeader.Substring("Bearer ".Length).Trim();
        }
        return null;
    }

    // POST: get user spotify profile
    [HttpPost("profile")]
    public async Task<ActionResult<PlaylistResponse>> GetProfile() // request (JSON) --> TokenDTO object with [FromBody]
    {
        Console.WriteLine("Getting profile");
        var accessToken = GetAccessTokenFromRequest();

        if (string.IsNullOrEmpty(accessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is Required"
            });
        }

        var config = await _spotifyService.GetCurrentUserProfileAsync(accessToken);
        return Ok(config);
    }

    [HttpPost("get-playlist")]
    public async Task<ActionResult<PlaylistResponse>> GetPlaylists()
    {
        Console.WriteLine("Getting playlists");
        var accessToken = GetAccessTokenFromRequest();

        if (string.IsNullOrEmpty(accessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is Required"
            });
        }

        var action = await _spotifyService.GetUserPlaylistsAsync(accessToken);

        if (!action.Success)
        {
            return StatusCode(500, action);
        }
        
        return Ok(action);
    }

    [HttpPost("create-playlist/{userId}")]
    public async Task<ActionResult<string?>> CreatePlaylist(string userId, [FromBody] PlaylistRequest request)
    {
        Console.WriteLine("Creating Playlists for: " + userId);
        var accessToken = GetAccessTokenFromRequest();

        if (string.IsNullOrEmpty(accessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is required"
            });
        }


        var action = await _spotifyService.CreatePlaylistFromSongListAsync(userId, accessToken!, request.PlaylistName!, request.Songs!, request.Description);

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
        Console.WriteLine("Adding Songs to Current Users Playlist");
        var accessToken = GetAccessTokenFromRequest();
        
        if (string.IsNullOrEmpty(accessToken))
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

        var success = await _spotifyService.AddSongsToPlaylistAsync(accessToken, request.PlaylistId, request.Songs);

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
        Console.WriteLine("Saving songs to liked songs");
        var accessToken = GetAccessTokenFromRequest();

        if (string.IsNullOrEmpty(accessToken))
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Access Token is required"
            });
        }

        if (request.Songs == null || request.Songs.Count > 0)
        {
            return BadRequest(new PlaylistResponse
            {
                Success = false,
                Message = "Songs list cannot be empty"
            });
        }

        var success = await _spotifyService.SaveSongsToLikedSongsAsync(accessToken, request.Songs);

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
        Console.WriteLine("Getting Song Previews");
        var accessToken = GetAccessTokenFromRequest();

        if (string.IsNullOrEmpty(accessToken))
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
            var previews = await _spotifyService.GetSongPreviewsAsync(accessToken, request.Songs);

            return Ok(new PlaylistResponse
            {
                Success = true,
                Message = "Song previews retrieved successfully",
                Previews = previews,
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