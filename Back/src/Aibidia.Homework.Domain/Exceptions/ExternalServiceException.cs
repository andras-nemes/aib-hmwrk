namespace Aibidia.Homework.Domain.Exceptions;

public class ExternalServiceException : Exception
{
    public ExternalServiceException(int statusCode, string? message, string? internalMessage, Uri requestUri, Exception? innerException = null)
        : base(message, innerException)
    {
        StatusCode = statusCode;
        InternalMessage = internalMessage;
        RequestUri = requestUri;
    }

    public int StatusCode { get; }

    public string? InternalMessage { get; }

    public Uri RequestUri { get; }
}