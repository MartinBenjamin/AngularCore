using CommonDomainObjects;
using Roles;
using System;
using System.Collections.Generic;

namespace Deals
{
    public static class DealTypeIdentifier
    {
        public static readonly Guid Advisory       = new Guid("db033bfe-091e-481c-a5c3-abd2c1eda302");
        public static readonly Guid ProjectFinance = new Guid("db1b30e1-435b-414f-bff0-1e17954144f7");
    }

    public class DealType: Named<Guid>
    {
        public virtual IList<Role>  KeyCounterparties { get; protected set; }
        //public virtual IList<Stage> Stages            { get; protected set; }

        protected DealType() : base()
        {
        }
    }
}
