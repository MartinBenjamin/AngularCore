using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Process.Definition
{
    public class ProcessWriter: IVisitor
    {
        private readonly StringBuilder _builder;

        public ProcessWriter(
            StringBuilder builder
            )
        {
            _builder = builder;
        }

        bool IVisitor.Enter(
            Sequence sequence
            )
        {
            Append(
                sequence.Children,
                ";");
            return false;
        }

        bool IVisitor.Enter(
            Parallel parallel
            )
        {
            Append(
                parallel.Children,
                "||");
            return false;
        }

        bool IVisitor.Enter(
            Choice choice
            )
        {
            _builder.Append('(');

            if(choice.Alternatives.Any())
            {
                choice.Alternatives.First().Accept(this);

                foreach(var alternative in choice.Alternatives.Skip(1))
                {
                    _builder.Append("|");
                    alternative.Accept(this);
                }
            }

            _builder.Append(')');

            return false;
        }

        bool IVisitor.Enter(
            IO io
            )
        {
            _builder.Append(io.Channel);
            return true;
        }

        bool IVisitor.Enter<TInput>(
            Input<TInput> input
            )
        {
            _builder
                .Append(input.Channel)
                .Append('?')
                .Append(input.Target);
            return true;
        }

        bool IVisitor.Enter(
            GuardedProcess guardedProcess
            )
        {
            var guardExpression = (object)guardedProcess.GuardExpressionExpression ?? guardedProcess.GuardExpression;
            if(guardExpression != null)
                _builder.AppendFormat(
                    "({0})&",
                    guardExpression);

            guardedProcess.Guard.Accept(this);

            if(guardedProcess.Guarded != null)
            {
                _builder.Append("->");
                guardedProcess.Guarded.Accept(this);
            }

            return false;
        }

        bool IVisitor.Enter(
            While @while
            )
        {
            @while.ToString(_builder);
            return true;
        }

        bool IVisitor.Enter<TValue>(
            SequenceForEach<TValue> sequenceForEach
            )
        {
            throw new NotImplementedException();
        }

        bool IVisitor.Enter<TValue>(
            ParallelForEach<TValue> parallelForEach
            )
        {
            throw new NotImplementedException();
        }

        bool IVisitor.Enter<TValue>(
            ChoiceForEach<TValue> choiceForEach
            )
        {
            throw new NotImplementedException();
        }

        bool IVisitor.Exit(
            Sequence sequence
            )
        {
            return true;
        }

        bool IVisitor.Exit(
            Parallel parallel
            )
        {
            return true;
        }

        bool IVisitor.Exit(
            Choice choice
            )
        {
            return true;
        }

        bool IVisitor.Exit(
            GuardedProcess guardedProcess
            )
        {
            return true;
        }

        private void Append(
            IList<Process> processes,
            string         separator
            )
        {
            _builder.Append('(');

            if(processes.Any())
            {
                processes.First().Accept(this);

                foreach(var process in processes.Skip(1))
                {
                    _builder.Append(separator);
                    process.Accept(this);
                }
            }

            _builder.Append(')');
        }
    }
}
