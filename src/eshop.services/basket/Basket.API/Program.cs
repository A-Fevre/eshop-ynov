using Basket.API.Data.Repositories;
using Basket.API.Services;
using BuildingBlocks.Behaviors;
using BuildingBlocks.Messaging.MassTransit;
using BuildingBlocks.Middlewares;
using Discount.Grpc;
using FluentValidation;
using HealthChecks.UI.Client;
using Marten;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(typeof(Program).Assembly);
    config.AddOpenBehavior(typeof(ValidationBehavior<,>));
    config.AddOpenBehavior(typeof(LoggingBehavior<,>));

});

builder.Services.AddHttpClient<ICatalogService, CatalogService>(client =>
{
    var catalogUrl = configuration.GetValue<string>("ApiSettings:CatalogUrl") ?? "http://localhost:5050";
    client.BaseAddress = new Uri(catalogUrl);
});

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

builder.Services.AddMarten(options =>
    {
        options.Connection(configuration.GetConnectionString("BasketConnection") ?? string.Empty);
    })
    .UseLightweightSessions();

builder.Services.AddScoped<IBasketRepository, BasketRepository>();
builder.Services.Decorate<IBasketRepository, BasketRepositoryCache>();

builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = configuration.GetConnectionString("RedisConnection") ?? string.Empty;
    }
   );

builder.Services.AddGrpcClient<DiscountProtoService.DiscountProtoServiceClient>(options =>
{
    options.Address = new Uri(configuration.GetValue<string>("GrpcSettings:DiscountUrl") ?? string.Empty);   
}).ConfigurePrimaryHttpMessageHandler (() =>
{
    var handler = new HttpClientHandler();
    
    if (builder.Environment.IsDevelopment())
    {
        handler.ServerCertificateCustomValidationCallback = 
            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
    }
    return handler;
});

builder.Services.AddMessageBroker(configuration);

builder.Services.AddControllers();

builder.Services.AddHealthChecks()
    .AddNpgSql(configuration.GetConnectionString("BasketConnection")!)
    .AddRedis(configuration.GetConnectionString("RedisConnection")!);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Basket.API",
        Version = "v1"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Basket.API v1");
    });
}


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseMiddleware<ExceptionHandlerMiddleware>();

app.UseHealthChecks("/health", new HealthCheckOptions()
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.Run();