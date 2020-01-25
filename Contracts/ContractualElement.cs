using CommonDomainObjects;
using System;

namespace Contracts
{
    public abstract class ContractualElement: DomainObject<Guid>
    {
        public virtual Contract Contract { get; protected set; }

        protected ContractualElement() : base()
        {
        }

        protected ContractualElement(
            Guid     id,
            Contract contract
            ) : base(id)
        {
            Contract = contract;
            Contract.Elements.Add(this);
        }
    }
}
