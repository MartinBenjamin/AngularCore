using System;
using System.Collections.Generic;
using System.Text;

namespace Process.Expression
{
    public interface IVisitor
    {
        void Enter<T>(ConstantExpression<T> constantExpression);
        void Enter<T>(VariableExpression<T> variableExpression);
    }
}
