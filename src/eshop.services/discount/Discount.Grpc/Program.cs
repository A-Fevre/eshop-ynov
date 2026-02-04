using BuildingBlocks.Behaviors;
using BuildingBlocks.Middlewares;
using Discount.Grpc.Data;
using Discount.Grpc.Data.Extensions;
using Discount.Grpc.Services;
using FluentValidation;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    // Port pour gRPC (HTTP/2) et REST (HTTP/1)
    options.ListenLocalhost(5052, o =>
    {
        o.Protocols = HttpProtocols.Http1AndHttp2;
    });
});


var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddGrpc();

// MediatR avec behaviors pour validation et logging
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(typeof(Program).Assembly);
    config.AddOpenBehavior(typeof(ValidationBehavior<,>));
    config.AddOpenBehavior(typeof(LoggingBehavior<,>));
});

// FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// Controllers pour API REST
builder.Services.AddControllers();

builder.Services.AddDbContext<DiscountContext>(options => options.UseSqlite(configuration.GetConnectionString("DiscountConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Discount.API",
        Version = "v1"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Discount.API v1");
    });
}

app.UseCustomMigration();

// Middleware de gestion des exceptions
app.UseMiddleware<ExceptionHandlerMiddleware>();

app.UseHttpsRedirection();
app.UseAuthorization();

// Configure the HTTP request pipeline.
app.MapGrpcService<DiscountServiceServer>();

// Map REST controllers
app.MapControllers();

app.MapGet("/",
    () =>
        "Communication with gRPC endpoints must be made through a gRPC client. REST API available at /api/discounts. Documentation at /swagger.");

app.Run();