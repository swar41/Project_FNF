
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Project_Version1.Data;
using Project_Version1.Helpers;

using Project_Version1.Services;
using System.Text;
using Project_Version1.Profiles;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<FnfKnowledgeBaseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("myCon")));
// AutoMapper
builder.Services.AddAutoMapper(cfg => { cfg.AddMaps(typeof(MappingProfile).Assembly); });
// Helpers & Services
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<PostService>();
builder.Services.AddScoped<CommentService>();
builder.Services.AddScoped<VoteService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<FileService>();

// SignalR
builder.Services.AddSignalR();



// Controllers
builder.Services.AddControllers().AddJsonOptions(options =>{

        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.JsonSerializerOptions.WriteIndented = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT
var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt["Issuer"],
        ValidAudience = jwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]))
    };
});
    
// Replace this line:
// builder.Services.AddAutoMapper(typeof(Program).Assembly);

// With this line:
builder.Services.AddAuthorization();
builder.Services.AddCors(o => o.AddPolicy("dev", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("dev");
app.UseStaticFiles(); // enables serving from wwwroot

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.Run();