using System.Text.Json.Serialization;

namespace Web.Model
{
    public class DomainObject<TId>
    {
        public TId Id { get; set; }

        [JsonPropertyName("$type")]
        public string Class { get; set; }
    }
}
