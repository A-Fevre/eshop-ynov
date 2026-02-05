using BuildingBlocks.Behaviors;
using BuildingBlocks.Middlewares;
using Catalog.API.Data;
using Discount.Grpc;
using FluentValidation;
using HealthChecks.UI.Client;
using Marten;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Add services to the container.

builder.Services.AddControllers();

// Mediator Pattern - CQRS
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(typeof(Program).Assembly);
    config.AddOpenBehavior(typeof(ValidationBehavior<,>));
    config.AddOpenBehavior(typeof(LoggingBehavior<,>));

});

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

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

// Management PostGreSQl as NOSQL
builder.Services.AddMarten(options =>
    {
        options.Connection(configuration.GetConnectionString("CatalogConnection") ?? string.Empty);
    })
    .UseLightweightSessions();

// Initiate Database
if(builder.Environment.IsDevelopment())
    builder.Services.InitializeMartenWith<CatalogInitialData>();

// Health Check
builder.Services.AddHealthChecks()
    .AddNpgSql(configuration.GetConnectionString("CatalogConnection")!);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Catalog.API",
        Version = "v1"
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Catalog.API v1");
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Global Exception
app.UseMiddleware<ExceptionHandlerMiddleware>();

// Health check Endpoint
app.UseHealthChecks("/health", new HealthCheckOptions()
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.Run();