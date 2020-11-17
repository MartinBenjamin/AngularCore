using CommonDomainObjects;
using System;

namespace LifeCycles
{
    public class LifeCycleStage: Classifier
    {
        protected LifeCycleStage() : base()
        {
        }

        public LifeCycleStage(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
