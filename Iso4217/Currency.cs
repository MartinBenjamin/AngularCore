using CommonDomainObjects;

namespace Iso4217
{
    public class Currency: Named<string>
    {
        public virtual string AlphaCode   { get; protected set; }
        public virtual int    NumericCode { get; protected set; }
        public virtual int?   MinorUnit   { get; protected set; }

        protected Currency() : base()
        {
        }

        public Currency(
            string alphaCode,
            int    numericCode,
            string name,
            int?   minorUnit
            ): base(
                alphaCode,
                name)
        {
            AlphaCode   = alphaCode;
            NumericCode = numericCode;
            MinorUnit   = minorUnit;
        }
    }
}
