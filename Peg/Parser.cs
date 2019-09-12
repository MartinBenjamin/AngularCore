using System.Linq;
using System.Text;

namespace Peg
{
    // http://bford.info/pub/lang/peg.pdf
    public class Parser
    {
        // Hierarchical syntax
        public Identifier Grammar                = new Identifier(nameof(Grammar               ));
        public Identifier Definition             = new Identifier(nameof(Definition            ));
        public Identifier Expression             = new Identifier(nameof(Expression            ));
        public Identifier Sequence               = new Identifier(nameof(Sequence              ));
        public Identifier Prefix                 = new Identifier(nameof(Prefix                ));
        public Identifier Suffix                 = new Identifier(nameof(Suffix                ));
        public Identifier Primary                = new Identifier(nameof(Primary               ));

        // Lexical syntax
        public Identifier Identifier             = new Identifier(nameof(Identifier            ));
        public Identifier IdentStart             = new Identifier(nameof(IdentStart            ));
        public Identifier IdentCont              = new Identifier(nameof(IdentCont             ));
        public Identifier Literal                = new Identifier(nameof(Literal               ));
        public Identifier CharacterSet           = new Identifier(nameof(CharacterSet          ));
        public Identifier CharacterSetComplement = new Identifier(nameof(CharacterSetComplement));
        public Identifier Range                  = new Identifier(nameof(Range                 ));
        public Identifier Char                   = new Identifier(nameof(Char                  ));
        public Identifier LEFTARROW              = new Identifier(nameof(LEFTARROW             ));

        public Identifier SLASH                  = new Identifier(nameof(SLASH                 ));
        public Identifier AND                    = new Identifier(nameof(AND                   ));
        public Identifier NOT                    = new Identifier(nameof(NOT                   ));
        public Identifier QUESTION               = new Identifier(nameof(QUESTION              ));
        public Identifier STAR                   = new Identifier(nameof(STAR                  ));
        public Identifier PLUS                   = new Identifier(nameof(PLUS                  ));
        public Identifier OPEN                   = new Identifier(nameof(OPEN                  ));
        public Identifier CLOSE                  = new Identifier(nameof(CLOSE                 ));
        public Identifier DOT                    = new Identifier(nameof(DOT                   ));
        public Identifier Spacing                = new Identifier(nameof(Spacing               ));
        public Identifier Comment                = new Identifier(nameof(Comment               ));
        public Identifier Space                  = new Identifier(nameof(Space                 ));
        public Identifier EndOfLine              = new Identifier(nameof(EndOfLine             ));
        public Identifier EndOfFile              = new Identifier(nameof(EndOfFile             ));

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
            var identifiers = new []
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

            var maxIdentifierLength = identifiers.Select(identifier => identifier.Name.Length).Max();
            var builder = new StringBuilder();
            IExpressionWriter writer = new ExpressionWriter(builder);
            foreach(var identifier in identifiers)
            {
                writer.Write(identifier);
                builder.Append(" <- ");
                writer.Write(identifier.Expression);
                builder.AppendLine();
            }

            return builder.ToString();
        }
    }
}
