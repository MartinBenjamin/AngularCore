using Iso3166._1._1;
using Locations._1;
using System;
using System.Globalization;

namespace Iso3166._2._1
{
    public class Subdivision: GeographicSubregion
    {
        public virtual string      Code              { get; protected set; }
        public virtual Country     Country           { get; protected set; }
        public virtual Subdivision ParentSubdivision { get; protected set; }
        public virtual string      Category          { get; protected set; }

        protected Subdivision() : base()
        {
        }

        public Subdivision(
            Guid        id,
            string      code,
            string      name,
            Country     country,
            Subdivision parentSubdivision,
            string      category
            ) : base(
                id,
                name)
        {
            Code              = code;
            Country           = country;
            ParentSubdivision = parentSubdivision;
            Category          = category;
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
