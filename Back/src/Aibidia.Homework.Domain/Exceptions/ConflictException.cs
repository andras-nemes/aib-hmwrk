namespace Aibidia.Homework.Domain.Exceptions;

public class ConflictException : Exception
{
    public ConflictException(string? message) : base(message)
    {
    }

    public ConflictException(Type type) : base($"{type.Name} already exists.")
    {
    }
}
