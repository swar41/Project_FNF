using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Project_Version1.Services;
using Project_Version1.DTOs;
using Project_Version1.Data;
using Project_Version1.Helpers;
using AutoMapper;

namespace Project_Version1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        private readonly FnfKnowledgeBaseContext _db;
        private readonly IMapper _mapper;

        public PostsController(PostService postService, FnfKnowledgeBaseContext db,IMapper mapper)
        {
            _postService = postService;
            _db = db;
            _mapper= mapper;
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

            var postDto = _mapper.Map<PostDetailDto>(post);
            return Ok(postDto);
        }

        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMyPosts()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var posts = await _db.Posts
                .Where(p => p.UserId == userId || p.Reposts.Any(r => r.UserId == userId))
                .Include(p => p.Comments)
                .Include(p => p.Reposts)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] PostCreateDto dto) // ✅ accept multipart/form-data
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Fetch the department ID of the logged-in user
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null || user.DepartmentId == 0)
            {
                return BadRequest("User department information is missing.");
            }

            dto.DeptId = user.DepartmentId;
            int deptId = user.DepartmentId;

            // Create post
            var post = await _postService.CreatePostAsync(dto, userId,deptId);
            // ✅ Handle attachments
            if (dto.Attachments != null && dto.Attachments.Count > 0)
            {
                foreach (var file in dto.Attachments)
                {
                    if(file == null) continue;
                    if (file.Length >5*1024*1024) return BadRequest("File too large ");
                    if (file.Length > 0)
                    {
                        var fileService = HttpContext.RequestServices.GetRequiredService<FileService>();
                        var (fileName, filePath, fileType) = await fileService.SaveFileAsync(file);

                        var attachment = new Attachment
                        {
                            PostId = post.PostId,
                            FileName = fileName,
                            FilePath = filePath,
                            FileType = fileType,
                            UploadedAt = DateTime.UtcNow
                        };

                        _db.Attachments.Add(attachment);
                    }
                }

                await _db.SaveChangesAsync();
            }

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
                var manager = await _db.Managers
                    .FirstOrDefaultAsync(m => m.UserId == userId && m.DeptId == post.DeptId);
                if (manager == null) return Forbid();

                if (!string.IsNullOrEmpty(commitMessage))
                {
                    _db.Commits.Add(new Commit
                    {
                        PostId = id,
                        ManagerId = manager.ManagerId,
                        Message = commitMessage,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            else if (post.UserId != userId)
            {
                // Normal users can only update their own posts
                return Forbid();
            }

            // Apply updates
            if (!string.IsNullOrEmpty(dto.Title))
                post.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Body))
                post.Body = dto.Body;

            post.UpdatedAt = DateTime.UtcNow;

            await _postService.UpdatePostAsync(post);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Post updated successfully" });
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
                await _postService.DeletePostAsync(post);
                return NoContent();
            }
            
                return Forbid();
            

           
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
