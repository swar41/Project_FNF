using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Project_Version1.Services;
using Project_Version1.DTOs;
using Project_Version1.Data;
using Project_Version1.Helpers;

namespace Project_Version1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        private readonly FnfKnowledgeBaseContext _db;

        public PostsController(PostService postService, FnfKnowledgeBaseContext db)
        {
            _postService = postService;
            _db = db;
        }

        [HttpGet("feed")]
        public async Task<IActionResult> Feed(
            [FromQuery] int? deptId,
            [FromQuery] string? tag,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var posts = await _postService.GetPostsFeedAsync(deptId, tag, page, pageSize);
            return Ok(posts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var post = await _postService.GetPostAsync(id);
            if (post == null) return NotFound();
            return Ok(post);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PostCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Fetch the department ID of the logged-in user
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null || user.DepartmentId == null)
            {
                return BadRequest("User department information is missing.");
            }

            // Set the department ID in the DTO
            dto.DeptId = user.DepartmentId;

            var post = await _postService.CreatePostAsync(dto, userId);
            return CreatedAtAction(nameof(Get), new { id = post.PostId }, post);
        }


        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PostUpdateDto dto, [FromQuery] string? commitMessage = null)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (role == "Manager")
            {
                var manager = await _db.Managers.FirstOrDefaultAsync(m => m.UserId == userId && m.DeptId == post.DeptId);
                if (manager == null) return Forbid();
                if (!string.IsNullOrEmpty(commitMessage))
                {
                    _db.Commits.Add(new Commit { PostId = id, ManagerId = manager.ManagerId, Message = commitMessage });
                }
            }
            else if (post.UserId != userId)
            {
                return Forbid();
            }

            if (!string.IsNullOrEmpty(dto.Title)) post.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Body)) post.Body = dto.Body;
            await _postService.UpdatePostAsync(post);
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] string? commitMessage = null)
        {
            var post = await _db.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (role == "Manager")
            {
                var manager = await _db.Managers.FirstOrDefaultAsync(m => m.UserId == userId && m.DeptId == post.DeptId);
                if (manager == null) return Forbid();
                if (!string.IsNullOrEmpty(commitMessage))
                {
                    _db.Commits.Add(new Commit { PostId = id, ManagerId = manager.ManagerId, Message = commitMessage });
                }
            }
            else if (post.UserId != userId)
            {
                return Forbid();
            }

            await _postService.DeletePostAsync(post);
            return NoContent();
        }

        [Authorize]
        [HttpPost("{id}/repost")]
        public async Task<IActionResult> Repost(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _postService.RepostAsync(id, userId);
            return Ok();
        }
    }
}
