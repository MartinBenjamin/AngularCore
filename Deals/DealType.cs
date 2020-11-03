using CommonDomainObjects;
using System;

namespace Deals
{
    public static class DealTypeIdentifier
    {
        public static readonly Guid Debt           = new Guid("cb21d02b-c709-4b15-a952-010d1b977931");
        public static readonly Guid Advisory       = new Guid("db033bfe-091e-481c-a5c3-abd2c1eda302");
        public static readonly Guid ProjectFinance = new Guid("db1b30e1-435b-414f-bff0-1e17954144f7");
    }

    public class DealType: Classifier
    {
        protected DealType() : base()
        {
        }

        public DealType(
            Guid   id,
            string name
            ) :
            base(
                id,
                name)
        {
        }
    }
}
