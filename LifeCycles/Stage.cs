using CommonDomainObjects;
using System;

namespace LifeCycles
{
    public class Stage: Classifier
    {
        protected Stage() : base()
        {
        }

        public Stage(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
