using Ordering.Domain.ValueObjects.Types;

namespace Ordering.Domain.Abstractions;

public interface IEmailService
{ 
    Task SendEmailAsync(string to, string subject, string message);
}