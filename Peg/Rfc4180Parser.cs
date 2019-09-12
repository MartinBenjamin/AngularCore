using System;
using System.Text;

namespace Peg
{
    // https://www.ietf.org/rfc/rfc4180.txt
    public class Rfc4180Parser
    {
        public Identifier File              = new Identifier();
        public Identifier Record            = new Identifier();
        public Identifier CrLf              = new Identifier();
        public Identifier Field             = new Identifier();
        public Identifier Comma             = new Identifier();
        public Identifier NotEscaped        = new Identifier();
        public Identifier Escaped           = new Identifier();
        public Identifier Dquote            = new Identifier();
        public Identifier DquoteDquote      = new Identifier();
        public Identifier NotEscapedContent = new Identifier();
        public Identifier EscapedContent    = new Identifier();
        public Identifier EndOfFile         = new Identifier();

        private Action<string> _fieldAction;
        private Action         _recordAction;

        public Rfc4180Parser(
            Action<string> fieldAction,
            Action         recordAction
            )
        {
            _fieldAction  = fieldAction;
            _recordAction = recordAction;

            File             .Expression = new Sequence(new ZeroOrMore(new Sequence(Record, CrLf)), EndOfFile);
            Record           .Expression = new Sequence(Field, new ZeroOrMore(new Sequence(Comma, Field)));
            Field            .Expression = new Choice(Escaped, NotEscaped);
            Escaped          .Expression = new Sequence(Dquote, new ZeroOrMore(new Choice(EscapedContent, DquoteDquote)), Dquote);
            NotEscaped       .Expression = new ZeroOrMore(NotEscapedContent);
            EscapedContent   .Expression = new CharacterSetComplement("\""); 
            NotEscapedContent.Expression = new CharacterSetComplement(",\r\n\"");
            DquoteDquote     .Expression = new Literal("\"\"");
            CrLf             .Expression = new Literal("\r\n");
            Dquote           .Expression = new Literal("\"");
            Comma            .Expression = new Literal(",");
            EndOfFile        .Expression = new Not(new Dot());

            var fieldBuilder = new StringBuilder();

            NotEscapedContent.Match =
            EscapedContent.Match    =
            DquoteDquote.Match      = (expression, input, position, length) => fieldBuilder.Append(input[position]);
            Field.Match             = (expression, input, position, length) =>
            {
                _fieldAction(fieldBuilder.ToString());
                fieldBuilder.Clear();
            };
            CrLf.Match              = (expression, input, position, length) => _recordAction();
        }

        public int Parse(
            string input
            )
        {
            return File.Parse(
                input,
                0);
        }
    }
}
