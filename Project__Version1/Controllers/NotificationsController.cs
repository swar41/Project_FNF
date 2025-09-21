
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Project_Version1.Services;

namespace Project_Version1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notification;
        public NotificationsController(NotificationService notification) => _notification = notification;

        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast([FromBody] string message)
        {
            await _notification.BroadcastAsync(message);
            return Ok();
        }
    }
}