using server.DTOs;
using Supabase;

namespace server.Services
{
    public interface ISupabaseService
    {
        Task<Client> GetClientAsync(string? jwt = null);

        Task<MessagesResponse> GetUserMessages(string userId, string? jwt = null);

        Task<MessagesResponse> SaveMessage(MessageRequest request, string jwt);

        Task<MessagesResponse> ClearUserMessages(string userId, string jwt);
    }
}