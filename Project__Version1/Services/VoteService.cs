using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Project_Version1.Data;
using Project_Version1.DTOs;

namespace Project_Version1.Services
{
    public class VoteService
    {
        private readonly FnfKnowledgeBaseContext _db;
        private readonly IMapper _mapper;

        public VoteService(FnfKnowledgeBaseContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<bool> VoteAsync(VoteDto dto, int userId)
        {
            if (dto.PostId == null && dto.CommentId == null) return false;

            var existing = await _db.Votes.FirstOrDefaultAsync(v =>
                v.UserId == userId &&
                v.PostId == dto.PostId &&
                v.CommentId == dto.CommentId);

            if (existing != null)
            {
                if (existing.VoteType == dto.VoteType)
                {
                    _db.Votes.Remove(existing);
                }
                else
                {
                    existing.VoteType = dto.VoteType;
                    existing.CreatedAt = DateTime.UtcNow;
                    _db.Votes.Update(existing);
                }
            }
            else
            {
                var vote = _mapper.Map<Vote>(dto);
                vote.UserId = userId;
                vote.CreatedAt = DateTime.UtcNow;
                _db.Votes.Add(vote);
            }

            await _db.SaveChangesAsync();
            await UpdateVoteCountersAsync(dto.PostId);
            return true;
        }

        private async Task UpdateVoteCountersAsync(int? postId)
        {
            if (!postId.HasValue) return;

            var pid = postId.Value;
            var upvotes = await _db.Votes.CountAsync(v => v.PostId == pid && v.VoteType == "Upvote");
            var downvotes = await _db.Votes.CountAsync(v => v.PostId == pid && v.VoteType == "Downvote");

            var post = await _db.Posts.FindAsync(pid);
            if (post != null)
            {
                post.UpvoteCount = upvotes;
                post.DownvoteCount = downvotes;
                _db.Posts.Update(post);
                await _db.SaveChangesAsync();
            }
        }
    }
}