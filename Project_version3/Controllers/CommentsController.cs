using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Project_Version1.Services;
using Project_Version1.DTOs;
using Project_Version1.Data;

namespace Project_Version1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly CommentService _commentService;
        private readonly FnfKnowledgeBaseContext _db;

        public CommentsController(CommentService commentService, FnfKnowledgeBaseContext db)
        {
            _commentService = commentService;
            _db = db;
        }

        [HttpGet("post/{postId}")]
        public async Task<IActionResult> GetForPost(int postId, [FromQuery] bool hierarchical = false)
        {
            try
            {
                if (hierarchical)
                {
                    var hierarchicalComments = await _commentService.GetCommentsHierarchyAsync(postId);
                    return Ok(hierarchicalComments);
                }
                else
                {
                    var comments = await _commentService.GetCommentsForPostAsync(postId);
                    return Ok(comments);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CommentCreateDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var comment = await _commentService.AddCommentAsync(dto, userId);

                if (comment == null)
                {
                    return BadRequest(new { message = "Failed to create comment" });
                }

                return CreatedAtAction(nameof(GetForPost), new { postId = dto.PostId }, comment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception )
            {
                return StatusCode(500, new { message = "An error occurred while creating the comment" });
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] string? commitMessage = null)
        {
            try
            {
                var comment = await _commentService.GetCommentAsync(id);
                if (comment == null) return NotFound();
                var role = User.FindFirstValue(ClaimTypes.Role);
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                if (role == "Manager")
                {
                    var manager = await _db.Managers.FirstOrDefaultAsync(m => m.UserId == userId && m.DeptId == comment.Post.DeptId);
                    if (manager == null) return Forbid();
                    if (!string.IsNullOrEmpty(commitMessage))
                    {
                        _db.Commits.Add(new Commit { PostId = id, ManagerId = manager.ManagerId, Message = commitMessage });
                    }
                    
                        await _commentService.ForceDeleteCommentAsync(comment);
                    
                    return NoContent();

                }

                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}