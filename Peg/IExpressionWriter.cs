namespace Peg
{
    public interface IExpressionWriter
    {
        void Write(Expression   expression  );
        void Write(Definition   definition  );
        void Write(Literal      literal     );
        void Write(CharacterSet characterSet);
        void Write(Dot          dot         );
        void Write(Optional     optional    );
        void Write(ZeroOrMore   zeroOrMore  );
        void Write(OneOrMore    oneOrMore   );
        void Write(And          and         );
        void Write(Not          not         );
        void Write(Sequence     sequence    );
        void Write(Choice       choice      );
    }
}
