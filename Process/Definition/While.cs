using System;

namespace Process.Definition
{
    public class While: Process
    {
        public Func<global::Process.Process, bool> BooleanExpression { get; set; }
        public Process                             Embedded          { get; set; }

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
            global::Process.Process parent
            ) => new global::Process.While(
                this,
                parent);

        public override bool Accept(
            IVisitor visitor
            ) => visitor.Enter(this);
    }
}