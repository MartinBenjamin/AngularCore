using System.Linq;
using System.Text;

namespace Peg
{
    // http://bford.info/pub/lang/peg.pdf
    public class Parser
    {
        // Hierarchical syntax
        public Definition Grammar                = new Definition(nameof(Grammar               ));
        public Definition Definition             = new Definition(nameof(Definition            ));
        public Definition Expression             = new Definition(nameof(Expression            ));
        public Definition Sequence               = new Definition(nameof(Sequence              ));
        public Definition Prefix                 = new Definition(nameof(Prefix                ));
        public Definition Suffix                 = new Definition(nameof(Suffix                ));
        public Definition Primary                = new Definition(nameof(Primary               ));

        // Lexical syntax
        public Definition Identifier             = new Definition(nameof(Identifier            ));
        public Definition IdentStart             = new Definition(nameof(IdentStart            ));
        public Definition IdentCont              = new Definition(nameof(IdentCont             ));
        public Definition Literal                = new Definition(nameof(Literal               ));
        public Definition CharacterSet           = new Definition(nameof(CharacterSet          ));
        public Definition CharacterSetComplement = new Definition(nameof(CharacterSetComplement));
        public Definition Range                  = new Definition(nameof(Range                 ));
        public Definition Char                   = new Definition(nameof(Char                  ));
        public Definition LEFTARROW              = new Definition(nameof(LEFTARROW             ));

        public Definition SLASH                  = new Definition(nameof(SLASH                 ));
        public Definition AND                    = new Definition(nameof(AND                   ));
        public Definition NOT                    = new Definition(nameof(NOT                   ));
        public Definition QUESTION               = new Definition(nameof(QUESTION              ));
        public Definition STAR                   = new Definition(nameof(STAR                  ));
        public Definition PLUS                   = new Definition(nameof(PLUS                  ));
        public Definition OPEN                   = new Definition(nameof(OPEN                  ));
        public Definition CLOSE                  = new Definition(nameof(CLOSE                 ));
        public Definition DOT                    = new Definition(nameof(DOT                   ));
        public Definition Spacing                = new Definition(nameof(Spacing               ));
        public Definition Comment                = new Definition(nameof(Comment               ));
        public Definition Space                  = new Definition(nameof(Space                 ));
        public Definition EndOfLine              = new Definition(nameof(EndOfLine             ));
        public Definition EndOfFile              = new Definition(nameof(EndOfFile             ));

        public Parser()
        {
            Grammar     .Expression = new Sequence(Spacing, new OneOrMore(Definition), EndOfFile);
            Definition  .Expression = new Sequence(Identifier, LEFTARROW, Expression);
            Expression  .Expression = new Sequence(Sequence, new ZeroOrMore(new Sequence(SLASH, Sequence)));
            Sequence    .Expression = new ZeroOrMore(Prefix);
            Prefix      .Expression = new Sequence(new Optional(new Choice(AND, NOT)), Suffix);
            Suffix      .Expression = new Sequence(Primary, new Optional(new Choice(QUESTION, STAR, PLUS)));
            Primary     .Expression = new Choice(
                new Sequence(Identifier, new Not(LEFTARROW)),
                new Sequence(OPEN, Expression, CLOSE),
                Literal,
                CharacterSet,
                CharacterSetComplement,
                DOT);
            Identifier  .Expression = new Sequence(IdentStart, new ZeroOrMore(IdentCont), Spacing);
            IdentStart  .Expression = new CharacterSet(
                new CommonDomainObjects.Range<char>('a', 'z'),
                new CommonDomainObjects.Range<char>('A', 'Z'),
                new[] { '_' });
            IdentCont   .Expression = new Choice(
                    IdentStart,
                    new CharacterSet(new CommonDomainObjects.Range<char>('0', '9')));
            Literal.Expression = new Choice(
                new Sequence(
                    new CharacterSet("\""),
                    new ZeroOrMore(
                        new Choice(
                            new Sequence(new Literal("\\"), new CharacterSet("\\\"")),
                            new CharacterSetComplement("\\\""))),
                    new CharacterSet("\""),
                    Spacing),
                new Sequence(
                    new CharacterSet("'"),
                    new ZeroOrMore(
                        new Choice(
                            new Sequence(new Literal("\\"), new CharacterSet("\\'")),
                            new CharacterSetComplement("\\'"))),
                    new CharacterSet("'"),
                    Spacing));
            CharacterSet.Expression = new Sequence(
                new Literal("["),
                new ZeroOrMore(
                    new Choice(
                        Range,
                        Char)),
                new Literal("]"),
                Spacing);
            CharacterSetComplement
                        .Expression = new Sequence(
                new Literal("[^"),
                new ZeroOrMore(
                    new Choice(
                        Range,
                        Char)),
                new Literal("]"),
                Spacing);
            Range.Expression = new Sequence(Char, new Literal("-"), Char);
            Char        .Expression = new Choice(
                new Sequence(new Literal("\\"), new CharacterSet("\\-]")),
                new CharacterSetComplement("\\-]"));
            LEFTARROW   .Expression = new Sequence(new Literal("<-"), Spacing);
            SLASH       .Expression = new Sequence(new Literal( "/"), Spacing);
            AND         .Expression = new Sequence(new Literal( "&"), Spacing);
            NOT         .Expression = new Sequence(new Literal( "!"), Spacing);
            QUESTION    .Expression = new Sequence(new Literal( "?"), Spacing);
            STAR        .Expression = new Sequence(new Literal( "*"), Spacing);
            PLUS        .Expression = new Sequence(new Literal( "+"), Spacing);
            OPEN        .Expression = new Sequence(new Literal( "("), Spacing);
            CLOSE       .Expression = new Sequence(new Literal( ")"), Spacing);
            DOT         .Expression = new Sequence(new Literal( "."), Spacing);
            Spacing     .Expression = new ZeroOrMore(new Choice(Space, Comment));
            Comment     .Expression = new Sequence(
                new Literal("#"),
                new ZeroOrMore(new Sequence(new Not(EndOfLine), new Dot())),
                EndOfLine);
            Space       .Expression = new Choice(
                new Literal(" "),
                new Literal("\t"),
                EndOfLine);
            EndOfLine   .Expression = new Choice(new Literal("\r\n"), new Literal("\n"), new Literal("\r"));
            EndOfFile   .Expression = new Not(new Dot());
        }

        public override string ToString()
        {
            var definitions = new []
            {
                Grammar               ,
                Definition            ,
                Expression            ,
                Sequence              ,
                Prefix                ,
                Suffix                ,
                Primary               ,
                Identifier            ,
                IdentStart            ,
                IdentCont             ,
                Literal               ,
                CharacterSet          ,
                CharacterSetComplement,
                Range                 ,
                Char                  ,
                LEFTARROW             ,
                SLASH                 ,
                AND                   ,
                NOT                   ,
                QUESTION              ,
                STAR                  ,
                PLUS                  ,
                OPEN                  ,
                CLOSE                 ,
                DOT                   ,
                Spacing               ,
                Comment               ,
                Space                 ,
                EndOfLine             ,
                EndOfFile
            };

            var maxIdentifierLength = definitions.Select(definition => definition.Identifier.Length).Max();
            var builder = new StringBuilder();
            IExpressionWriter writer = new ExpressionWriter(builder);
            foreach(var definition in definitions)
            {
                writer.Write(definition);
                builder.Append(" <- ");
                writer.Write(definition.Expression);
                builder.AppendLine();
            }

            return builder.ToString();
        }
    }
}
