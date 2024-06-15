using System.Text;

namespace Process.Expression
{
    public class ExpressionWriter: IVisitor
    {
        private readonly StringBuilder _builder;

        public ExpressionWriter(
            StringBuilder builder
            )
        {
            _builder = builder;
        }

        void IVisitor.Enter(
            Definition.Channel channel
            ) => _builder.Append(channel);

        void IVisitor.Enter<T>(
            ConstantExpression<T> constantExpression
            ) => _builder.Append(constantExpression.Constant.ToString());

        void IVisitor.Enter<T>(
            VariableExpression<T> variableExpression
            ) => _builder.Append(variableExpression.Variable.ToString());
    }
}
