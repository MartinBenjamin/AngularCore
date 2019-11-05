using CommonDomainObjects;
using Expressions;
using System;

namespace Contracts
{
    public class ContractDate: DomainObject<Guid>
    {
        public virtual Contract            Contract { get; protected set; }
        public virtual ContractDateKey     Key      { get; protected set; }
        public virtual Variable<DateTime?> Date     { get; protected set; }

        protected ContractDate() : base()
        {
        }

        public ContractDate(
            Guid                id,
            Contract            contract,
            ContractDateKey     key,
            Variable<DateTime?> date
            ) : base(id)
        {
            Contract = contract;
            Key      = key;
            Date     = date;
        }
    }
}
