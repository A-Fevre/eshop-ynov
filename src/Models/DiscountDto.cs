// ...existing code...
public class DiscountDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("isPercentage")]
    public bool IsPercentage { get; set; }

    [JsonPropertyName("code")]
    public string Code { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    // Ajoutez ici toutes les propriétés présentes dans le JSON
    // ...existing code...
}
