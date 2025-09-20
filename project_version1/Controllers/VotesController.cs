
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Project_Version1.Services;
using Project_Version1.DTOs;

namespace Project_Version1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VotesController : ControllerBase
    {
        private readonly VoteService _voteService;
        public VotesController(VoteService voteService) => _voteService = voteService;

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Vote([FromBody] VoteDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var ok = await _voteService.VoteAsync(dto, userId);
            if (!ok) return BadRequest();
            return Ok();
        }
    }
}