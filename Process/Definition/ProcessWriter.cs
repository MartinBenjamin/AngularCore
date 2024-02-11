using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Process.Definition
{
    public class ProcessWriter: IVisitor
    {
        private readonly StringBuilder       _builder;
        private readonly Expression.IVisitor _expressionWriter;

        public ProcessWriter(
            StringBuilder builder
            )
        {
            _builder          = builder;
            _expressionWriter = new Expression.ExpressionWriter(builder);
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
            IO io
            ) => io.Channel.Name.Accept(_expressionWriter);

        void IVisitor.Visit(
            Input input
            )
        {
            input.Channel.Name.Accept(_expressionWriter);
            _builder
                .Append('?')
                .Append(input.TargetVariable);
        }

        void IVisitor.Visit(
            Output output
            )
        {
            output.Channel.Name.Accept(_expressionWriter);
            _builder.Append('!');
            output.Source.Accept(_expressionWriter);
        }

        void IVisitor.Visit(
            GuardedProcess guardedProcess
            )
        {
            if(guardedProcess.GuardExpression != null)
            {
                guardedProcess.GuardExpression.Accept(_expressionWriter);
                _builder.Append('&');
            }

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
            @while.ToString(_builder);
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
