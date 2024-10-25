using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aibidia.Homework.Domain.Handlers;

/// <summary>
/// Custom 'date-only' DateTime converter for System.Text.Json.
/// <para>
/// By default uses yyyy-MM-dd format for the date.
/// </para>
/// </summary>
public class DateConverter : JsonConverter<DateTime>
{
    private readonly string _format;

    public DateConverter()
    {
        _format = "yyyy-MM-dd";
    }

    public DateConverter(string format)
    {
        _format = format;
    }

    public override void Write(Utf8JsonWriter writer, DateTime date, JsonSerializerOptions options)
    {
        writer.WriteStringValue(date.ToString(_format));
    }

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        DateTime.ParseExact(reader.GetDateTime().ToString(_format), _format, null);
}
