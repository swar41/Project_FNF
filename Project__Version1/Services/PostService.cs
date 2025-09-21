using System;

using System.Collections.Generic;

using System.IO;

using System.Linq;

using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using AutoMapper;

using Project_Version1.Data;

using Project_Version1.DTOs;

using Microsoft.AspNetCore.Hosting;

using Microsoft.AspNetCore.Http;

namespace Project_Version1.Services

{

    public class PostService

    {

        private readonly FnfKnowledgeBaseContext _db;

        private readonly IMapper _mapper;

        private readonly IWebHostEnvironment _env;
        private readonly FileService _fileService;
        public PostService(FnfKnowledgeBaseContext db, IMapper mapper, IWebHostEnvironment env, FileService fileService )

        {

            _db = db;

            _mapper = mapper;

            _env = env;
            _fileService = fileService;
        }

        public async Task<Post> CreatePostAsync(PostCreateDto dto, int userId, int deptId)

        {

            var post = _mapper.Map<Post>(dto);

            post.UserId = userId;

            post.DeptId = deptId;

            post.CreatedAt = DateTime.UtcNow;

            _db.Posts.Add(post);

            await _db.SaveChangesAsync();

            // Handle Tags

            if (dto.Tags != null && dto.Tags.Any())

            {

                foreach (var tagName in dto.Tags.Distinct())

                {

                    var tag = await _db.Tags.FirstOrDefaultAsync(

                        x => x.TagName == tagName && x.DeptId == deptId);

                    if (tag == null)

                    {

                        tag = new Tag { TagName = tagName, DeptId = deptId };

                        _db.Tags.Add(tag);

                        await _db.SaveChangesAsync();

                    }

                    _db.PostTags.Add(new PostTag { PostId = post.PostId, TagId = tag.TagId });

                }

                await _db.SaveChangesAsync();

            }

            // Handle Attachments
            //if (dto.Attachments != null && dto.Attachments.Any())

            //{

            //    foreach (var file in dto.Attachments)

            //    {

            //        var (fileName,filePath, fileType) = await _fileService.SaveFileAsync(file);

            //        using (var stream = new FileStream(filePath, FileMode.Create))

            //        {

            //            await file.CopyToAsync(stream);

            //        }

            //        var attachment = new Attachment

            //        {

            //            PostId = post.PostId,

            //            FileName = file.FileName,

            //            FilePath = filePath, // Store in consistent format

            //            FileType = fileType,            
            //            UploadedAt = DateTime.UtcNow


            //        };

            //_db.Attachments.Add(attachment);

            //}

            //await _db.SaveChangesAsync();
            // Handle Attachments
            if (dto.Attachments != null && dto.Attachments.Any())
            {
                foreach (var file in dto.Attachments)
                {
                    var (fileName, filePath, fileType) = await _fileService.SaveFileAsync(file);

                    var attachment = new Attachment
                    {
                        PostId = post.PostId,
                        FileName = file.FileName,
                        FilePath = filePath, // This is the relative path
                        FileType = fileType,
                        UploadedAt = DateTime.UtcNow
                    };

                    _db.Attachments.Add(attachment);
                }

                await _db.SaveChangesAsync();
            }


            return post;

        }

        public IQueryable<Post> QueryPosts() =>

            _db.Posts

               .Include(p => p.User)

               .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)

               .Include(p => p.Comments)

               .Include(p => p.Reposts);

        public async Task<Post?> GetPostAsync(int id) =>

            await _db.Posts

                .Include(p => p.User)

                .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)

                .Include(p => p.Comments).ThenInclude(c => c.User)

                .Include(p => p.Attachments)

                .FirstOrDefaultAsync(p => p.PostId == id);

        public async Task<List<PostBriefDto>> GetPostsFeedAsync(int? deptId, string? tag, int page, int pageSize)

        {

            var query = _db.Posts.AsQueryable();

            if (deptId.HasValue)

                query = query.Where(p => p.DeptId == deptId.Value);

            if (!string.IsNullOrEmpty(tag))

                query = query.Where(p => p.PostTags.Any(pt => pt.Tag.TagName == tag));

            query = query.OrderByDescending(p => p.CreatedAt);

            var paged = query.Skip((page - 1) * pageSize).Take(pageSize);

            var posts = await paged

                .Include(p => p.User)

                .Include(p => p.Comments)

                .ToListAsync();

            return _mapper.Map<List<PostBriefDto>>(posts);

        }

        public async Task UpdatePostAsync(Post post)

        {

            post.UpdatedAt = DateTime.UtcNow;

            _db.Posts.Update(post);

            await _db.SaveChangesAsync();

        }

        public async Task DeletePostAsync(Post post)

        {

            _db.Posts.Remove(post);

            await _db.SaveChangesAsync();

        }

        public async Task RepostAsync(int postId, int userId)

        {

            var exists = await _db.Reposts.AnyAsync(r => r.PostId == postId && r.UserId == userId);

            if (exists) return;

            var repost = new Repost

            {

                PostId = postId,

                UserId = userId,

                CreatedAt = DateTime.UtcNow

            };

            _db.Reposts.Add(repost);

            await _db.SaveChangesAsync();

        }

    }

}