using CommonDomainObjects;
using System;

namespace Iso4217
{
    public class Currency: Named<Guid>
    {
        public virtual string AlphabeticCode { get; protected set; }
        public virtual int    NumericCode    { get; protected set; }
        public virtual int?   MinorUnit      { get; protected set; }

        protected Currency() : base()
        {
        }

        public Currency(
            Guid   id,
            string alphabeticCode,
            int    numericCode,
            string name,
            int?   minorUnit
            ): base(
                id,
                name)
        {
            AlphabeticCode = alphabeticCode;
            NumericCode    = numericCode;
            MinorUnit      = minorUnit;
        }
    }
}
