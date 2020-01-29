using Agents;
using System;

namespace Organisations
{
    public class OrganisationIdentificationScheme: IdentificationScheme
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
