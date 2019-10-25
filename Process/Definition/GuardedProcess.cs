using System;
using System.Linq.Expressions;
using System.Text;

namespace Process.Definition
{
    public class GuardedProcess: Alternative
    {
        public Func<global::Process.Process, bool>
                       GuardExpression { get; set; }
        public IO      Guard           { get; set; }
        public Process Guarded         { get; set; }

        private Expression<Func<global::Process.Process, bool>> _guardExpression;

        public GuardedProcess()
            : base()
        {
        }

        public GuardedProcess(
            Func<global::Process.Process, bool>
                    guardExpression,
            IO      guard,
            Process guarded
            )
            : base()
        {
            GuardExpression = guardExpression;
            Guard           = guard;
            Guarded         = guarded;
        }

        public GuardedProcess(
            Expression<Func<global::Process.Process, bool>>
                    guardExpression,
            IO      guard,
            Process guarded
            )
            : this(
                guardExpression.Compile(),
                guard,
                guarded
            )
        {
            _guardExpression = guardExpression;
        }

        public GuardedProcess(
            IO      guard,
            Process guarded = null
            )
            : this(
                (Func<global::Process.Process, bool>)null,
                guard,
                guarded)
        {
        }

        public override global::Process.Process New(
            global::Process.Process parent
            )
        {
            return new global::Process.GuardedProcess(
                this,
                (global::Process.Choice)parent);
        }

        public override void ToString(
            StringBuilder builder
            )
        {
            var guardExpression = (object)_guardExpression ?? GuardExpression;
            if(guardExpression != null)
                builder.AppendFormat(
                    "({0})&",
                    guardExpression);

            Guard.ToString(builder);

            if(Guarded != null)
            {
                builder.Append("->");
                Guarded.ToString(builder);
            }
        }
    }
}
