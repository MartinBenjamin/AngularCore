namespace Process.Expression
{
    public class VariableExpression<T>: IExpression<T>
    {
        public string Variable { get; private set; }

        public VariableExpression(
            string variable
            )
        {
            Variable = variable;
        }

        T IExpression<T>.Evaluate(
            IScope scope
            ) => (T)scope[Variable];

        void IExpression<T>.Accept(
            IVisitor visitor
            ) => visitor.Enter<T>(this);
    }
}
