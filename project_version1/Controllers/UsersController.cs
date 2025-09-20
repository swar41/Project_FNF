using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Version1.Data;
using Project_Version1.DTOs;
using Project_Version1.Services;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Project_Version1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly FnfKnowledgeBaseContext _db;
        private readonly IMapper _mapper;
        private readonly AuthService _authService;

        public UsersController(FnfKnowledgeBaseContext db, IMapper mapper, AuthService authService)
        {
            _db = db;
            _mapper = mapper;
            _authService = authService;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAll()
        {
            var users = await _db.Users
                .ProjectTo<UserDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> Get(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst("id")!.Value);
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();

            var dto = _mapper.Map<UserDto>(user);
            return Ok(dto);
        }
        [Authorize]
        [HttpPut("update-profile")]

        public async Task<IActionResult> UpdateProfile([FromForm] UserUpdateDto dto)

        {

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null) return Unauthorized("User ID not found in token");

            var userId = int.Parse(userIdClaim.Value);

            var updatedUser = await _authService.UpdateProfileAsync(userId, dto);

            if (updatedUser == null) return NotFound("User not found");

            return Ok(updatedUser);

        }
    }
}
