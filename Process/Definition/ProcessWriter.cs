﻿using System;
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
            Append(
                choice.Alternatives,
                "|");
            return false;
        }

        bool IVisitor.Enter(
            IO io
            )
        {
            io.Channel.Name.Accept(_expressionWriter);
            return true;
        }

        bool IVisitor.Enter(
            Input input
            )
        {
            input.Channel.Name.Accept(_expressionWriter);
            _builder
                .Append('?')
                .Append(input.TargetVariable);
            return true;
        }

        bool IVisitor.Enter(
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

            return false;
        }

        bool IVisitor.Enter(
            While @while
            )
        {
            @while.ToString(_builder);
            return true;
        }

        bool IVisitor.Enter(
            SequenceForEach sequenceForEach
            )
        {
            throw new NotImplementedException();
        }

        bool IVisitor.Enter(
            ParallelForEach parallelForEach
            )
        {
            throw new NotImplementedException();
        }

        bool IVisitor.Enter(
            ChoiceForEach choiceForEach
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
