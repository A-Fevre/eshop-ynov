using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Ordering.Domain.Abstractions;

namespace Ordering.Infrastructure.Mail
{
    public class SmtpEmailService : IEmailService
    {
        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var host = "sandbox.smtp.mailtrap.io";
            var port = 2525;
            var username = "f37b7a584faf1b";
            var password = "ead1941478a6a7";

            var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("mailtrap@example.com", "Ordering System"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            
            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
            Console.WriteLine($"[Mailtrap SMTP] Email sent to {to}");
        }
    }
}