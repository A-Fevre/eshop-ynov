using Discount.Grpc.Data;
using Discount.Grpc.Data.Extensions;
using Discount.Grpc.Services;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5052, o =>
    {
        o.Protocols = HttpProtocols.Http2;
    });

    options.ListenLocalhost(5552, o =>
    {
        o.Protocols = HttpProtocols.Http1;
    });
});


var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddGrpc();

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

// Configure the HTTP request pipeline.
app.MapGrpcService<DiscountServiceServer>();

app.MapGet("/",
    () =>
        "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

app.Run();