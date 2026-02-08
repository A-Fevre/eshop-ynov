using Ordering.Domain.Abstractions;

namespace Ordering.Infrastructure.Mail;

public class SmtpEmailService : IEmailService
{
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        Console.WriteLine($"[EMAIL SENT] To: {to}, Subject: {subject}, Body: {body}");
        await Task.CompletedTask;
    }
}