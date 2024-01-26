namespace Process.Expression
{
    public interface IExpression<out T>
    {
        T Evaluate(IScope scope);

        void Accept(IVisitor visitor);
    }
}
