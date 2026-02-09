using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace Peg
{
    // http://bford.info/pub/lang/peg.pdf
    public class Parser
    {
        // Hierarchical syntax
        public Definition Grammar          = new Definition(nameof(Grammar         ));
        public Definition Definition       = new Definition(nameof(Definition      ));
        public Definition Expression       = new Definition(nameof(Expression      ));
        public Definition Sequence         = new Definition(nameof(Sequence        ));
        public Definition Prefix           = new Definition(nameof(Prefix          ));
        public Definition Suffix           = new Definition(nameof(Suffix          ));
        public Definition Primary          = new Definition(nameof(Primary         ));
                                                                                   
        // Lexical syntax                                                          
        public Definition Identifier       = new Definition(nameof(Identifier      ));
        public Definition IdentStart       = new Definition(nameof(IdentStart      ));
        public Definition IdentCont        = new Definition(nameof(IdentCont       ));
        public Definition Literal          = new Definition(nameof(Literal         ));
        public Definition CharacterSet     = new Definition(nameof(CharacterSet    ));
        public Definition Range            = new Definition(nameof(Range           ));
        public Definition DoubleStringChar = new Definition(nameof(DoubleStringChar));
        public Definition SingleStringChar = new Definition(nameof(SingleStringChar));
        public Definition CharacterSetChar = new Definition(nameof(CharacterSetChar));
        public Definition LEFTARROW        = new Definition(nameof(LEFTARROW       ));
                                                                                   
        public Definition SLASH            = new Definition(nameof(SLASH           ));
        public Definition AND              = new Definition(nameof(AND             ));
        public Definition NOT              = new Definition(nameof(NOT             ));
        public Definition QUESTION         = new Definition(nameof(QUESTION        ));
        public Definition STAR             = new Definition(nameof(STAR            ));
        public Definition PLUS             = new Definition(nameof(PLUS            ));
        public Definition OPEN             = new Definition(nameof(OPEN            ));
        public Definition CLOSE            = new Definition(nameof(CLOSE           ));
        public Definition DOT              = new Definition(nameof(DOT             ));
        public Definition Spacing          = new Definition(nameof(Spacing         ));
        public Definition Comment          = new Definition(nameof(Comment         ));
        public Definition Space            = new Definition(nameof(Space           ));
        public Definition EndOfLine        = new Definition(nameof(EndOfLine       ));
        public Definition EndOfFile        = new Definition(nameof(EndOfFile       ));

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
                    new ZeroOrMore(DoubleStringChar),
                    new CharacterSet("\""),
                    Spacing),
                new Sequence(
                    new CharacterSet("'"),
                    SingleStringChar,
                    new CharacterSet("'"),
                    Spacing));
            CharacterSet.Expression = new Sequence(
                new Literal("["),
                new ZeroOrMore(Range),
                new Literal("]"),
                Spacing);
            Range       .Expression = new Choice(new Sequence(CharacterSetChar, new Literal("-"), CharacterSetChar), CharacterSetChar);
            DoubleStringChar.Expression = new Choice(
                new Sequence(new Not(new CharacterSet("\"\\")), new Dot()),
                new Sequence(new Literal("\\"), new CharacterSet("nrt\\\"")));
            SingleStringChar.Expression = new Choice(
                new Sequence(new Not(new CharacterSet("'\\")), new Dot()),
                new Sequence(new Literal("\\"), new CharacterSet("nrt\\'")));
            CharacterSetChar.Expression = new Choice(
                new Sequence(new Not(new CharacterSet("]\\")), new Dot()),
                new Sequence(new Literal("\\"), new CharacterSet("nrt\\]")));
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
                Range                 ,
                DoubleStringChar      ,
                SingleStringChar      ,
                CharacterSetChar      ,
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

            return ExpressionWriter.Write(definitions);
        }

        public IEnumerable<Definition> ExtractDefinitions(
            Node node
            )
        {
            var definitions = (from n in node where n.Expression == Definition select (new Definition(ExtractIdentifer(n.Children[0].Children[0])), n.Children[0].Children[2])).ToList();
            var map = definitions.ToDictionary(
                t => t.Item1.Identifier,
                t => t.Item1);

            foreach(var (definition, definitionNode) in definitions)
                definition.Expression = ExtractChoice(
                    map,
                    definitionNode);

            return from definition in definitions select definition.Item1;
        }

        private string ExtractIdentifer(
            Node node
            )
        {
            var definition = (Definition)node.Expression;
            if(definition.Identifier != "Identifier")
                throw new ArgumentException($"Expected Identifier but got {definition.Identifier}.");

            var spacing = (from n in node where n.Expression == Spacing select n).First();
            return node.Input.Substring(node.Position, node.Length -  spacing.Length);
        }

        private Expression ExtractChoice(
            IDictionary<string, Definition> definitions,
            Node                            node
            )
        {
            node = node.Children[0];
            var children = new List<Expression>();
            children.Add(ExtractSequence(
                definitions,
                node.Children[0]));

            foreach(var child in node.Children[1].Children)
                children.Add(ExtractSequence(
                    definitions,
                    child.Children[1]));

            return children.Count == 1 ? children[0] : new Choice(children);
        }

        private Expression ExtractSequence(
            IDictionary<string, Definition> definitions,
            Node                            node
            )
        {
            var definition = (Definition)node.Expression;
            if(definition.Identifier != "Sequence")
                throw new ArgumentException($"Expected Sequence but got {definition.Identifier}.");

            node = node.Children[0];
            var children = node.Children.Select(child => ExtractPrefix(definitions, child)).ToList();
            return children.Count == 1 ? children[0] : new Sequence(children);
        }

        private Expression ExtractPrefix(
            IDictionary<string, Definition> definitions,
            Node                            node
            )
        {
            var definition = (Definition)node.Expression;
            if(definition.Identifier != "Prefix")
                throw new ArgumentException($"Expected Prefix but got {definition.Identifier}.");

            node = node.Children[0];
            var suffix = ExtractSuffix(
                definitions,
                node.Children[1]);
            if(node.Children[0].Children.Count == 0)
                return suffix;

            return node.Children[0].Children[0].Expression == AND ? new And(suffix) : new Not(suffix);
        }

        private Expression ExtractSuffix(
            IDictionary<string, Definition> definitions,
            Node                            node
            )
        {
            var definition = (Definition)node.Expression;
            if(definition.Identifier != "Suffix")
                throw new ArgumentException($"Expected Suffix but got {definition.Identifier}.");

            node = node.Children[0];
            var primary = ExtractPrimary(
                definitions,
                node.Children[0]);

            if(node.Children[1].Children.Count == 0)
                return primary;

            var suffix = node.Children[1].Children[0].Children[0];
            return suffix.Expression == QUESTION ? new Optional(primary) : suffix.Expression == STAR ? new ZeroOrMore(primary) : new OneOrMore(primary);
        }

        private Expression ExtractPrimary(
            IDictionary<string, Definition> definitions,
            Node                            node
            )
        {
            var definition = (Definition)node.Expression;
            if(definition.Identifier != "Primary")
                throw new ArgumentException($"Expected Primary but got {definition.Identifier}.");

            node = node.Children[0];
            var chosen = node.Children[0];
            if(chosen.Expression is Sequence)
            {
                if(chosen.Children[0].Expression == Identifier)
                    return definitions[ExtractIdentifer(chosen.Children[0])];

                else // Group.
                    return ExtractChoice(
                        definitions,
                        chosen.Children[1]);
            }

            var chosenDefinition = (Definition)chosen.Expression;
            if(chosenDefinition == Literal)
                return ExtractLiteral(chosen);

            if(chosenDefinition == CharacterSet)
                return ExtractCharacterSet(chosen);

            if(chosenDefinition == DOT)
                return new Dot();

            throw new ApplicationException($"Unexpected definition: {chosenDefinition.Identifier}.");
        }

        private Literal ExtractLiteral(
            Node node
            )
        {
            var definition = (Definition)node.Expression;
            if (definition.Identifier != "Literal")
                throw new ArgumentException($"Expected Literal but got {definition.Identifier}.");

            node = node.Children[0];
            if(node.Children[0].Value == "\"")
                return new Literal(
                    new String([.. (from n in node
                    where n.Expression == DoubleStringChar
                    let s = n.Value
                    select s[s.Length - 1])]));


            return new Literal(
                new String([.. (from n in node
                    where n.Expression == SingleStringChar
                    let s = n.Value
                    select s[s.Length - 1])]));
        }

        private CharacterSet ExtractCharacterSet(
            Node node
            )
        {
            var definition = (Definition)node.Expression;
            if (definition.Identifier != "CharacterSet")
                throw new ArgumentException($"Expected CharacterSet but got {definition.Identifier}.");

            return new CharacterSet((from n in node where n.Expression == Range select ExtractRange(n)).ToList());
        }

        private CommonDomainObjects.Range<char> ExtractRange(
            Node node
            )
        {
            var definition = (Definition)node.Expression;
            if (definition.Identifier != "Range")
                throw new ArgumentException($"Expected Range but got {definition.Identifier}.");

            var characters = (from n in node where n.Expression == CharacterSetChar select n.Value[n.Length - 1]).ToList();

            return new CommonDomainObjects.Range<char>(
                characters[0],
                characters[characters.Count - 1]);
        }
    }
}
