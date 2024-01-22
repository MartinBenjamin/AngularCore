namespace Process.Expression
{
    public class ConstantExpression<T>: IExpression<T>
    {
        public T Constant { get; private set; }

        public ConstantExpression(
            T constant
            )
        {
            Constant = constant;
        }

        T IExpression<T>.Evaluate(
            IScope scope
            ) => Constant;

        void IExpression<T>.Accept(
            IVisitor visitor
            ) => visitor.Enter<T>(this);
    }
}
