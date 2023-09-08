namespace Web.Model
{
    public class Currency: Named<string>
    {
        public string AlphaCode   { get; set; }
        public int    NumericCode { get; set; }
        public int?   MinorUnit   { get; set; }
    }
}
