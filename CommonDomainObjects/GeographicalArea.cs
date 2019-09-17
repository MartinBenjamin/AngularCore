using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;

namespace CommonDomainObjects
{
    public abstract class GeographicalArea: Named<string>
    {
        protected GeographicalArea() : base()
        {
        }

        protected GeographicalArea(
            string id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }

    // ISO 3166-1
    public class Country: GeographicalArea
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

    // ISO3166-2
    public class Subdivision: GeographicalArea
    {
        public virtual string      Code              { get; protected set; }
        public virtual Country     Country           { get; protected set; }
        public virtual string      Category          { get; protected set; }

        protected Subdivision() : base()
        {
        }

        public Subdivision(
            string      code,
            string      name,
            Country     country,
            string      category
            ) : base(
                code,
                name)
        {
            Code     = code;
            Country  = country;
            Category = category;
        }

        public virtual string CategoryTitleCase
        {
            get
            {
                return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(Category);
            }
        }
    }
}
