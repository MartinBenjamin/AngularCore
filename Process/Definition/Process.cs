using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Process.Definition
{
    public abstract class Process: DomainObject<Guid>
    {
        protected Process()
            : base()
        {
        }

        protected Process(
            Guid id
            )
            : base(id)
        {
        }

        public abstract global::Process.Process New(
            Guid                        id,
            global::Process.Process     parent,
            IDictionary<string, object> variables = null);

        public abstract void Accept(IVisitor visitor);

        public override string ToString()
        {
            var builder = new StringBuilder();
            Accept(new ProcessWriter(builder));
            return builder.ToString();
        }
    }
}
