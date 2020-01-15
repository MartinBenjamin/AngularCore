using CommonDomainObjects;
using System;

namespace Organisations
{
    public class OrganisationIdentificationScheme: Named<Guid>
    {

        protected OrganisationIdentificationScheme() : base()
        {
        }

        protected OrganisationIdentificationScheme(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
