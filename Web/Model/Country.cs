namespace Web.Model
{
    public class Country: GeographicalArea
    {
        public string Alpha2Code  { get; set; }
        public string Alpha3Code  { get; set; }
        public string Alpha4Code  { get; set; }
        public int    NumericCode { get; set; }
        public string ShortName   { get; set; }
    }
}
