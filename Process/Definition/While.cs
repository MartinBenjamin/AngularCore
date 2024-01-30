using System;
using System.Collections.Generic;

namespace Process.Definition
{
    public class While: Process
    {
        public Func<global::Process.Process, bool> BooleanExpression { get; protected set; }
        public Process                             Embedded          { get; protected set; }

        public While()
            : base()
        {
        }

        public While(
            Func<global::Process.Process, bool> booleanExpression,
            Process                             embedded
            )
            : base()
        {
            BooleanExpression = booleanExpression;
            Embedded          = embedded;
        }

        public override global::Process.Process New(
            global::Process.Process     parent,
            IDictionary<string, object> variables = null
            ) => new global::Process.While(
                this,
                parent,
                variables);

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);
    }
}