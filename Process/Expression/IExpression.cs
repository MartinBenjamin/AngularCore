namespace Process.Expression
{
    public interface IExpression<T>
    {
        T Evaluate(IScope scope);

        void Accept(IVisitor visitor);
    }
}
