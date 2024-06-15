namespace Process.Expression
{
    public interface IVisitor
    {
        void Enter(Definition.Channel channel);
        void Enter<T>(ConstantExpression<T> constantExpression);
        void Enter<T>(VariableExpression<T> variableExpression);
    }
}
