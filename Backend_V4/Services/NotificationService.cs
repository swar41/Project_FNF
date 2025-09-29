
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Project_Version1.Data;
using Project_Version1.Helpers;

namespace Project_Version1.Services
{
    public class NotificationService
    {
        private readonly IHubContext<NotificationHub> _hub;
        private readonly FnfKnowledgeBaseContext _db;
        public NotificationService(IHubContext<NotificationHub> hub, FnfKnowledgeBaseContext db)
        {
            _hub = hub; _db = db;
        }

        public async Task NotifyUserAsync(int userId, string message)
        {
            // you might persist notifications to DB table in future
            await _hub.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", message);
        }

        public async Task BroadcastAsync(string message)
        {
            await _hub.Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}