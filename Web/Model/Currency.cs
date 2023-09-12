using System;

namespace Web.Model
{
    public class Currency: Named<Guid>
    {
        public string AlphabeticCode { get; set; }
        public int    NumericCode    { get; set; }
        public int?   MinorUnit      { get; set; }
    }
}
