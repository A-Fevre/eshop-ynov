using System.Net;
using System.Net.Mail;
using Ordering.Domain.Abstractions;
using Mjml.Net; 

namespace Ordering.Infrastructure.Mail;

public class SmtpEmailService : IEmailService
{
    // 1. Create a single instance of the renderer (it's thread-safe)
    private readonly IMjmlRenderer _mjmlRenderer = new MjmlRenderer();

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        string finalHtmlBody;

        // 2. DETECT if the body is MJML
        if (body.Trim().StartsWith("<mjml>")) 
        {
            var renderResult = _mjmlRenderer.Render(body);
            if (renderResult.Errors.Count == 0)
            {
                // If MJML renders successfully, it returns a full valid HTML document.
                // We do NOT use WrapInBeautifulHtml here.
                finalHtmlBody = renderResult.Html;
            }
            else
            {
                // Fallback in case of render error
                Console.WriteLine("MJML Render Error: " + string.Join(",", renderResult.Errors));
                finalHtmlBody = WrapInBeautifulHtml($"<p>Could not render email template.</p><pre>{string.Join("\n", renderResult.Errors)}</pre>");
            }
        }
        else
        {
            // If it's just a plain string, wrap it in our default container
            finalHtmlBody = WrapInBeautifulHtml(body);
        }

        var host = "sandbox.smtp.mailtrap.io";
        var port = 2525;
        var username = "f37b7a584faf1b"; // typical placeholder
        var password = "ead1941478a6a7"; // typical placeholder

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