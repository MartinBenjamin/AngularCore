using System;
using System.Text;

namespace Peg
{
    // https://www.ietf.org/rfc/rfc4180.txt
    public class Rfc4180Parser
    {
        public Identifier File              = new Identifier(nameof(File             ));
        public Identifier Record            = new Identifier(nameof(Record           ));
        public Identifier CrLf              = new Identifier(nameof(CrLf             ));
        public Identifier Field             = new Identifier(nameof(Field            ));
        public Identifier Comma             = new Identifier(nameof(Comma            ));
        public Identifier NotEscaped        = new Identifier(nameof(NotEscaped       ));
        public Identifier Escaped           = new Identifier(nameof(Escaped          ));
        public Identifier Dquote            = new Identifier(nameof(Dquote           ));
        public Identifier DquoteDquote      = new Identifier(nameof(DquoteDquote     ));
        public Identifier NotEscapedContent = new Identifier(nameof(NotEscapedContent));
        public Identifier EscapedContent    = new Identifier(nameof(EscapedContent   ));
        public Identifier EndOfFile         = new Identifier(nameof(EndOfFile        ));

        private Action<string> _fieldAction;
        private Action         _recordAction;

        public Rfc4180Parser(
            Action<string> fieldAction,
            Action         recordAction
            )
        {
            _fieldAction  = fieldAction;
            _recordAction = recordAction;

            //File             .Expression = new Sequence(new ZeroOrMore(new Sequence(Record, CrLf)), EndOfFile);
            File             .Expression = new Sequence(Record, new ZeroOrMore(new Sequence(CrLf, Record)), new Sequence(CrLf, EndOfFile));
            Record           .Expression = new Sequence(new Not(EndOfFile), Field, new ZeroOrMore(new Sequence(Comma, Field)));
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
            Record.Match            = (expression, input, position, length) => _recordAction();
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
