using System;
using System.Text;

namespace Peg
{
    // https://www.ietf.org/rfc/rfc4180.txt
    public class Rfc4180Parser
    {
        public Definition File              = new Definition(nameof(File             ));
        public Definition Record            = new Definition(nameof(Record           ));
        public Definition CrLf              = new Definition(nameof(CrLf             ));
        public Definition Field             = new Definition(nameof(Field            ));
        public Definition Comma             = new Definition(nameof(Comma            ));
        public Definition NotEscaped        = new Definition(nameof(NotEscaped       ));
        public Definition Escaped           = new Definition(nameof(Escaped          ));
        public Definition Dquote            = new Definition(nameof(Dquote           ));
        public Definition DquoteDquote      = new Definition(nameof(DquoteDquote     ));
        public Definition NotEscapedContent = new Definition(nameof(NotEscapedContent));
        public Definition EscapedContent    = new Definition(nameof(EscapedContent   ));
        public Definition EndOfFile         = new Definition(nameof(EndOfFile        ));

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
