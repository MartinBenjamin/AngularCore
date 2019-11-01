using System;

namespace Contracts
{
    public abstract class ContractualDefinition: ContractualElement
    {
        public string Term { get; protected set; }

        protected ContractualDefinition() : base()
        {
        }

        public ContractualDefinition(
            Guid     id,
            Contract contract,
            string   term
            ) : base(
                id,
                contract)
        {
            Term = term;
        }
    }
}
