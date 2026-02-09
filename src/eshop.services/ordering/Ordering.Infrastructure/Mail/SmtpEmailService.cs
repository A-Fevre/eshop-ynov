using System.Net;
using System.Net.Mail;
using Ordering.Domain.Abstractions;
using Mjml.Net; 

namespace Ordering.Infrastructure.Mail;

public class SmtpEmailService : IEmailService
{
    private readonly IMjmlRenderer _mjmlRenderer = new MjmlRenderer();

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        string finalHtmlBody;
        
        if (body.Trim().StartsWith("<mjml>")) 
        {
            var renderResult = _mjmlRenderer.Render(body);
            if (renderResult.Errors.Count == 0)
            {
                finalHtmlBody = renderResult.Html;
            }
            else
            {
                Console.WriteLine("MJML Render Error: " + string.Join(",", renderResult.Errors));
                finalHtmlBody = WrapInBeautifulHtml($"<p>Could not render email template.</p><pre>{string.Join("\n", renderResult.Errors)}</pre>");
            }
        }
        else
        {
            finalHtmlBody = WrapInBeautifulHtml(body);
        }

        var host = "sandbox.smtp.mailtrap.io";
        var port = 2525;
        var username = "f37b7a584faf1b";
        var password = "ead1941478a6a7";

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress("no-reply@eshop.com", "eshop App"),
            Subject = subject,
            Body = finalHtmlBody,
            IsBodyHtml = true,
        };
        
        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
        Console.WriteLine($"[Mailtrap SMTP] Email sent to {to}");
    }

    private string WrapInBeautifulHtml(string content)
    {
        return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    {content}
                </div>
            </body>
            </html>";
    }
}