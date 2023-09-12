using Locations;
using System;

namespace Iso3166._1
{
    public class Country: GeographicSubregion
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
            Guid   id,
            string alpha2Code,
            string alpha3Code,
            string alpha4Code,
            int    numericCode,
            string shortName
            ) : base(
                id,
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
