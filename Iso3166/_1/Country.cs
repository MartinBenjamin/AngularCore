using Locations;

namespace Iso3166._1
{
    public class Country: GeographicRegion
    {
        public virtual string Alpha2Code  { get; protected set; }
        public virtual string Alpha3Code  { get; protected set; }
        public virtual string Alpha4Code  { get; protected set; }
        public virtual int    NumericCode { get; protected set; }
        public virtual string ShortName   { get; protected set; }

        protected Country() : base()
        {
        }

        public Country(
            string alpha2Code,
            string alpha3Code,
            string alpha4Code,
            int    numericCode,
            string shortName
            ) : base(
                alpha2Code,
                shortName)
        {
            Alpha2Code  = alpha2Code;
            Alpha3Code  = alpha3Code;
            Alpha4Code  = alpha4Code;
            NumericCode = numericCode;
            ShortName   = shortName;
        }
    }
}
