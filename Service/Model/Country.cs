namespace Service.Model
{
    public class Country: GeographicRegion
    {
        public string Alpha2Code  { get; set; }
        public string Alpha3Code  { get; set; }
        public string Alpha4Code  { get; set; }
        public int    NumericCode { get; set; }
        public string ShortName   { get; set; }
    }
}
