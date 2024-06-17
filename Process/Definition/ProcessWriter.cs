using Process.Expression;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Process.Definition
{
    public static class StringBuilderExtensions
    {
        public static StringBuilder AppendExpression<T>(
            this StringBuilder stringBuilder,
            Func<IScope, T>    expression
            ) => stringBuilder.Append(expression.Method.GetParameters()[0].Name == "_" ? expression(null): expression);
    }

    public class ProcessWriter: IVisitor
    {
        private readonly StringBuilder       _builder;

        public ProcessWriter(
            StringBuilder builder
            )
        {
            _builder = builder;
        }

        void IVisitor.Visit(
            Sequence sequence
            ) => Append(
                sequence.Children,
                ";");

        void IVisitor.Visit(
            Parallel parallel
            ) => Append(
                parallel.Children,
                "||");

        void IVisitor.Visit(
            Choice choice
            ) => Append(
                choice.Alternatives,
                "|");

        void IVisitor.Visit(
            Input input
            ) => _builder
                .AppendExpression(input.Channel)
                .Append('?')
                .Append(input.TargetVariable);

        void IVisitor.Visit(
            Output output
            ) => _builder
                .AppendExpression(output.Channel)
                .Append('!')
                .AppendExpression(output.Source);

        void IVisitor.Visit(
            GuardedProcess guardedProcess
            )
        {
            if(guardedProcess.GuardExpression != null)
                _builder
                    .AppendExpression(guardedProcess.GuardExpression)
                    .Append('&');

            guardedProcess.Guard.Accept(this);

            if(guardedProcess.Guarded != null)
            {
                _builder.Append("->");
                guardedProcess.Guarded.Accept(this);
            }
        }

        void IVisitor.Visit(
            While @while
            )
        {
            _builder.Append('*');
            @while.Replicated.Accept(this);
        }

        void IVisitor.Visit(
            SequenceForEach sequenceForEach
            )
        {
            throw new NotImplementedException();
        }

        void IVisitor.Visit(
            ParallelForEach parallelForEach
            )
        {
            throw new NotImplementedException();
        }

        void IVisitor.Visit(
            ChoiceForEach choiceForEach
            )
        {
            throw new NotImplementedException();
        }

        private void Append(
            IEnumerable<Process> processes,
            string               separator
            )
        {
            _builder.Append('[');

            if(processes.Any())
            {
                processes.First().Accept(this);

                foreach(var process in processes.Skip(1))
                {
                    _builder.Append(separator);
                    process.Accept(this);
                }
            }

            _builder.Append(']');
        }
    }
}
