using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Project_Version1.Helpers
{

    public class NotificationHub : Hub
    {
        public async Task SendToUser(string userId, string message)
        {
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }

        public async Task Broadcast(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}