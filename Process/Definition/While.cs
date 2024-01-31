using Process.Expression;
using System.Collections.Generic;

namespace Process.Definition
{
    public class While: Process
    {
        public IExpression<bool> Condition  { get; protected set; }
        public Process           Replicated { get; protected set; }

        public While()
            : base()
        {
        }

        public While(
            IExpression<bool> condition,
            Process           replicated
            )
            : base()
        {
            Condition  = condition;
            Replicated = replicated;
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