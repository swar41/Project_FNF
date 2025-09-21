using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace Project_Version1.DTOs
{
    public class PostCreateDto
    {
        public int DeptId { get; set; }
        public string Title { get; set; } 
        public string Body { get; set; }
        public List<string>? Tags { get; set; }

        // ✅ New: Attachments (multiple files allowed)
        public List<IFormFile>? Attachments { get; set; }
    }

    public class PostUpdateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
    }

    public class PostBriefDto
    {
        public int PostId { get; set; }
        public string Title { get; set; } = null!;
        public string BodyPreview { get; set; } = null!;
        public int? UpvoteCount { get; set; }
        public int DownvoteCount { get; set; }
        public int CommentsCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AuthorName { get; set; }
    }
}