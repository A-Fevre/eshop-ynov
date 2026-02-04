// ...existing code...
public async Task<List<DiscountDto>> GetDiscountsAsync()
{
    var url = "api/discounts"; // ...existing code...
    var response = await _httpClient.GetAsync(url);
    response.EnsureSuccessStatusCode();
    var json = await response.Content.ReadAsStringAsync();

    // Ajout d'un log pour voir le JSON brut
    Console.WriteLine("Réponse Discount JSON : " + json);

    // ...existing code de désérialisation...
}
