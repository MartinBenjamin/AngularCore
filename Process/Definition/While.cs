using System;

namespace CommonDomainObjects.Process.Definition
{
    public class While: Process
    {
        public Func<CommonDomainObjects.Process.Process, bool> BooleanExpression { get; set; }
        public Process                                         Embedded          { get; set; }

        public While()
            : base()
        {
        }

        public While(
            Func<CommonDomainObjects.Process.Process, bool> booleanExpression,
            Process                                         embedded
            )
            : base()
        {
            BooleanExpression = booleanExpression;
            Embedded          = embedded;
        }

        public override CommonDomainObjects.Process.Process New(
            CommonDomainObjects.Process.Process parent
            )
        {
            return new CommonDomainObjects.Process.While(
                this,
                parent);
        }
    }
}