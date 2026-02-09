using BuildingBlocks.Messaging.MassTransit;
using Ordering.API.Extensions;
using Ordering.Application.Extensions;
using Ordering.Infrastructure;
using Ordering.Infrastructure.Data.Extensions;
using Microsoft.OpenApi;
using Ordering.Application.Features.Orders.Consumers;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddMessageBroker(configuration, typeof(OrderEmailConsumer).Assembly);
// Add services to the container.
builder.Services
    .AddApplicationServices(configuration)
    .AddInfraStructureServices(configuration)
    .AddApiServices(configuration);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Ordering.API",
        Version = "v1"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ordering.API v1");
    });
}

app.UseApiServices();

// Configure the HTTP request pipeline.

await app.Services.InitialiseDatabaseAsync();


app.Run();