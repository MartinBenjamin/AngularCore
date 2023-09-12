using CommonDomainObjects;

namespace Iso4217
{
    public class Currency: Named<string>
    {
        public virtual string AlphabeticCode { get; protected set; }
        public virtual int    NumericCode    { get; protected set; }
        public virtual int?   MinorUnit      { get; protected set; }

        protected Currency() : base()
        {
        }

        public Currency(
            string alphabeticCode,
            int    numericCode,
            string name,
            int?   minorUnit
            ): base(
                alphabeticCode,
                name)
        {
            AlphabeticCode = alphabeticCode;
            NumericCode    = numericCode;
            MinorUnit      = minorUnit;
        }
    }
}
