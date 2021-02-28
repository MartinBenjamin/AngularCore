using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Test
{
    [TestFixture]
    public class TestLevel4: Test
    {
        public void Initialise(
            bool[] combination,
            int    w
            )
        {
            Array.Fill(combination, false);
            Array.Fill(combination, true, 0, w);
        }

        public bool Increment(
            bool[] combination
            )
        {
            // Find largest index that can be incremented.
            int largestIndex = -1;

            int ones = 0;
            for(var index = combination.Length - 1;index >= 0 && largestIndex == -1;--index)
            {
                if(combination[index])
                    ones += 1;

                if(index < combination.Length - 1 &&
                   combination[index] &&
                   !combination[index + 1])
                    largestIndex = index;
            }

            if(largestIndex == -1)
                return false;

            Array.Fill(combination, false, largestIndex, combination.Length - largestIndex);
            Array.Fill(combination, true, largestIndex + 1, ones);

            return true;
        }

        public void WriteCombination(
            bool[] combination
            )
        {
            //TestContext.Write("[ ");
            //for(var index = 0;index < combination.Length;index++)
            //{
            //    if(index != 0)
            //        TestContext.Write(", ");

            //    TestContext.Write(combination[index] ? 1 : 0);
            //}
            //TestContext.WriteLine(" ]");
        }

        private int Distance(
            bool[] combination1,
            bool[] combination2
            )
        {
            int distance = 0;
            for(var index = 0;index < combination1.Length;++index)
                if(combination1[index] ^ combination2[index])
                    distance += 1;

            return distance;
        }       

        public IList<bool[]> GenerateCombinations(
            int n,
            int w
            )
        {
            var combination = new bool[n];
            Initialise(
                combination,
                w);
            IList<bool[]> combinations = new List<bool[]>();

            var generating = true;
            while(generating)
            {
                WriteCombination(combination);
                combinations.Add((bool[])combination.Clone());
                generating = Increment(combination);
            }

            return combinations;
        }

        public void Initialise(
            int[] combination
            )
        {
            for(var index = 0;index < combination.Length;index++)
                combination[index] = index;
        }

        public bool Increment(
            int   n,
            int[] combination
            )
        {
            // Find largest index that can be incremented.
            int largestIndex = -1;
            for(var index = combination.Length -1;index >= 0 && largestIndex == -1;--index)
                if(combination[index] != n - combination.Length + index)
                    largestIndex = index;

            if(largestIndex == -1)
                return false;

            var value = combination[largestIndex];
            for(var index = 0;index + largestIndex < combination.Length;++index)
                combination[largestIndex + index] = value + index + 1;

            return true;
        }

        public void WriteCombination(
            int[] combination
            )
        {
            TestContext.Write("[ ");
            for(var index = 0;index < combination.Length;index++)
            {
                if(index != 0)
                    TestContext.Write(", ");

                TestContext.Write(combination[index]);
            }
            TestContext.WriteLine(" ]");
        }

        public void WriteCombination(
            bool[][] keyCombinationCombination
            )
        {
            for(var rowIndex = 0;rowIndex < keyCombinationCombination[0].Length;++rowIndex)
            {
                for(var columnIndex = 0;columnIndex < keyCombinationCombination.Length;++columnIndex)
                {
                    TestContext.Write(keyCombinationCombination[columnIndex][rowIndex] ? 1 : 0);
                    TestContext.Write("  ");
                }
                TestContext.WriteLine(string.Empty);
            }
        }

        private int Distance(
            int[] combination1,
            int[] combination2,
            int   n
            )
        {
            int distance = 0;
            for(var index = 0;index < n;++index)
                if(Array.IndexOf(combination1, index) != -1 ^ Array.IndexOf(combination2, index) != -1)
                    distance += 1;

            return distance;
        }

        public int[][] GenerateKeyCombinations(
            int           numBuns,
            int           numRequired,
            int           n,
            IList<bool[]> keyCombinations,
            int[]         keyCombinationCombination,
            int           position
            )
        {
            int[][] result = null;
            var keyIsPresent = new bool[n];
            if(position < keyCombinationCombination.Length)
            {
                var startIndex = 0;
                if(position > 0)
                    startIndex = keyCombinationCombination[position - 1] + 1;
                for(var index = startIndex;index < keyCombinations.Count - keyCombinationCombination.Length + position + 1 && result == null;++index)
                {
                    var valid = true;
                    // Key (n-1) can only appear in the last position of a key combination.
                    // To get all keys in a choice of numRequired key combinations the key combinations at positions numRequired - 1 to numBuns - 1
                    // must have (n-1) in the last position.
                    if(position >= numRequired - 1 &&
                       !keyCombinations[index][n - 1])
                        valid = false;

                    if(valid && position + 1 >= numRequired - 1)
                    {
                        // This key combination when combined with numRequired - 2 previously selected key combinations
                        // should not contain all the keys.

                        var numRequiredMinusTwoCombination = new int[numRequired - 2];

                        Initialise(numRequiredMinusTwoCombination);
                        var generating = true;

                        while(
                            valid &&
                            generating)
                        {
                            Array.Copy(keyCombinations[index], keyIsPresent, n);

                            foreach(var keyCombinationIndex in numRequiredMinusTwoCombination)
                            {
                                var keyCombination = keyCombinations[keyCombinationCombination[keyCombinationIndex]];
                                for(var key = 0;key < n;++key)
                                    keyIsPresent[key] = keyIsPresent[key] || keyCombination[key];
                            }

                            valid = !Array.TrueForAll(keyIsPresent, p => p);
                            if(valid)
                                generating = Increment(
                                    position,
                                    numRequiredMinusTwoCombination);
                        }

                        if(valid && position + 1 >= numRequired)
                        {
                            // This key combination when combined with numRequired - 1 previously selected key combinations
                            // should contain all hte keys.
                            var numRequiredMinusOneCombination = new int[numRequired - 1];
                            Initialise(numRequiredMinusOneCombination);
                            generating = true;

                            while(
                                valid &&
                                generating)
                            {
                                Array.Copy(keyCombinations[index], keyIsPresent, n);

                                foreach(var keyCombinationIndex in numRequiredMinusOneCombination)
                                {
                                    var keyCombination = keyCombinations[keyCombinationCombination[keyCombinationIndex]];
                                    for(var key = 0;key < n;++key)
                                        keyIsPresent[key] = keyIsPresent[key] || keyCombination[key];
                                }

                                valid = Array.TrueForAll(keyIsPresent, p => p);
                                if(valid)
                                    generating = Increment(
                                        position,
                                        numRequiredMinusOneCombination);
                            }
                        }

                    }

                    if(valid)
                    {
                        keyCombinationCombination[position] = index;
                        result = GenerateKeyCombinations(
                            numBuns,
                            numRequired,
                            n,
                            keyCombinations,
                            keyCombinationCombination,
                            position + 1);
                    }
                }

                return result;
            }

            result = new int[numBuns][];
            for(var index = 0;index < numBuns;++index)
            {
                var keyCombination = new List<int>();
                for(var key = 0;key < n;++key)
                    if(keyCombinations[keyCombinationCombination[index]][key])
                        keyCombination.Add(key);
                result[index] = keyCombination.ToArray();
            }

            var displayedResult = new bool[keyCombinationCombination.Length][];
            for(var index = 0;index < keyCombinationCombination.Length;index++)
                displayedResult[index] = keyCombinations[keyCombinationCombination[index]];

            WriteCombination(displayedResult);

            return result;
        }

        private int[][] GenerateKeyCombinations(
            int numBuns,
            int numRequired,
            int n,
            int w
            )
        {
            IList<bool[]> keyCombinations = GenerateCombinations(
                n,
                w);
            TestContext.WriteLine(keyCombinations.Count);

            if(keyCombinations.Count < numBuns)
                return null;

            return GenerateKeyCombinations(
                numBuns,
                numRequired,
                n,
                keyCombinations,
                new int[numBuns],
                0);
        }

        public int[][] GenerateKeyCombinations(
            int numBuns,
            int numRequired
            )
        {
            int[][] result = null;
            if(numRequired == 0)
            {
                // No key distribution required.
                result = new int[numBuns][];
                for(var index = 0;index < numBuns;++index)
                    result[index] = Array.Empty<int>();
                return result;
            }
            else if(numRequired == 1)
            {
                // No key distribution required.
                result = new int[numBuns][];
                var singleKeyCombination = new[] { 0 };
                for(var index = 0;index < numBuns;++index)
                    result[index] = singleKeyCombination;
                return result;
            }

            // Represent a key combination by a Contant Weight (m-by-n) code where each key present is represented by a one.
            // Need to determine:
            // n - number of bits (keys).
            // w - weight/number of bits set to one.

            // If there are numBuns codes and any numRequired are selected then each key must appear (at least) once in the selection.
            var repeats = numBuns - numRequired + 1;

            // If there are n keys and each key is repeated repeats times then there must be n * repeats keys (ones).
            // If there are numBuns combinations and each combination contains w keys then there must be numBuns * w keys (ones).
            // Therefore n * repeats = numBuns * w. (Design Theory: vr = bk.)
            // Therefore n/w = numBuns/repeats = (multiplier * numBuns)/(multiplier * repeats).

            var multiplier = 1;
            while(result == null)
            {
                var n = multiplier * numBuns;
                var w = multiplier * repeats;
                TestContext.WriteLine($"n: {n}, w: {w}");
                result = GenerateKeyCombinations(
                    numBuns,
                    numRequired,
                    n,
                    w);
                multiplier += 1;
            }

            return result;
        }

        void Add(
            int[]  rowSums,
            bool[] combination
            )
        {
            for(var index = 0;index < rowSums.Length;index++)
                if(combination[index])
                    rowSums[index] += 1;
        }

        void Subtract(
            int[]  rowSums,
            bool[] combination
            )
        {
            for(var index = 0;index < rowSums.Length;index++)
                if(combination[index])
                    rowSums[index] -= 1;
        }

        public bool[][] GenerateKeyCombinationCombination(
            int           rowSum,
            IList<bool[]> keyCombinations,
            int[]         keyCombinationCombination,
            int           position,
            int[]         rowSums
            )
        {
            bool[][] result = null;
            if(position < keyCombinationCombination.Length)
            {
                var startIndex = 0;
                if(position > 0)
                    startIndex = keyCombinationCombination[position - 1] + 1;
                for(var index = startIndex;index < keyCombinations.Count - keyCombinationCombination.Length + position + 1 && result == null;++index)
                {
                    var keyCombination = keyCombinations[index];

                    Add(
                        rowSums,
                        keyCombination);

                    if(Array.TrueForAll(rowSums, sum => sum <= rowSum))
                    {
                        keyCombinationCombination[position] = index;
                        result = GenerateKeyCombinationCombination(
                            rowSum,
                            keyCombinations,
                            keyCombinationCombination,
                            position + 1,
                            rowSums);
                    }

                    Subtract(
                        rowSums,
                        keyCombination);
                }

                return result;
            }

            if(Array.TrueForAll(rowSums, sum => sum == rowSum))
            {
                result = new bool[keyCombinationCombination.Length][];
                for(var index = 0;index < keyCombinationCombination.Length;index++)
                    result[index] = keyCombinations[keyCombinationCombination[index]];
            }

            return result;
        }

        public bool[][] GenerateKeyCombinationCombination(
            int      numBuns,
            int      n,
            int      w,
            int      rowSum
            )
        {
            // Generate initial combination of key combinations
            // with column sum w and row sum rowSum.
            IList<bool[]> keyCombinations = GenerateCombinations(
                n,
                w);
            TestContext.WriteLine(keyCombinations.Count);

            if(keyCombinations.Count < numBuns)
                return null;

            return GenerateKeyCombinationCombination(
                rowSum,
                keyCombinations,
                new int[numBuns],
                0,
                new int[n]);
        }

        public void Flip(
            bool[][] keyCombinationCombination,
            int      columnIndex,
            int      rowIndex
            )
        {
            keyCombinationCombination[columnIndex][rowIndex] = !keyCombinationCombination[columnIndex][rowIndex];
        }

        public bool Increment(
            bool[][] keyCombinationCombination
            )
        {
            // Increment key combinations in lexicographic order
            // while maintain column and row sums.
            // First column is fixed.
            // Determine a pair of bits that can be flipped without altering column and row sums.
            for(var columnIndex = keyCombinationCombination.Length - 2;columnIndex >= 1;columnIndex--)
                for(var rowIndex = 0;rowIndex < keyCombinationCombination[0].Length - 2;++rowIndex)
                    if( keyCombinationCombination[columnIndex    ][rowIndex    ] &&
                       !keyCombinationCombination[columnIndex + 1][rowIndex    ] &&
                       !keyCombinationCombination[columnIndex    ][rowIndex + 1] &&
                        keyCombinationCombination[columnIndex + 1][rowIndex + 1])
                    {
                        Flip(keyCombinationCombination, columnIndex    , rowIndex    );
                        Flip(keyCombinationCombination, columnIndex    , rowIndex + 1);
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex    );
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex + 1);
                        return true;
                    }

            return false;
        }
        
        public bool Equal(
            bool[][] lhs,
            bool[][] rhs
            )
        {
            for(var columnIndex = 0;columnIndex < lhs.Length;++columnIndex)
            {
                var lhsRow = lhs[columnIndex];
                var rhsRow = rhs[columnIndex];
                for(var rowIndex = 0;rowIndex < lhsRow.Length;++rowIndex)
                    if(lhsRow[rowIndex] != rhsRow[rowIndex])
                        return false;
            }

            return true;

        }

        struct Interchange
        {
            public int  Column { get; private set; }
            public int  Row    { get; private set; }
            public bool Type   { get; private set; }

            public Interchange(
                int  column,
                int  row,
                bool type
                )
            {
                Column = column;
                Row    = row;
                Type   = type;
            }

            public void Apply(
                bool[][] matrix
                )
            {
                matrix[Column    ][Row    ] = !Type;
                matrix[Column + 1][Row    ] = Type;
                matrix[Column    ][Row + 1] = Type;
                matrix[Column + 1][Row + 1] = !Type;
            }
          
            public void Unapply(
                bool[][] matrix
                )
            {
                matrix[Column    ][Row    ] = Type;
                matrix[Column + 1][Row    ] = !Type;
                matrix[Column    ][Row + 1] = !Type;
                matrix[Column + 1][Row + 1] = Type;
            }

            public bool InverseOf(
                Interchange interchange
                )
            {
                return
                    Column == interchange.Column &&
                    Row    == interchange.Row &&
                    Type   != interchange.Type;
            }

            public override bool Equals(
                object obj
                )
            {
                return
                    obj is Interchange interchange &&
                    Column == interchange.Column &&
                    Row    == interchange.Row &&
                    Type   == interchange.Type;
            }

            public override int GetHashCode()
            {
                return HashCode.Combine(
                    Column,
                    Row,
                    Type);
            }
        }

        class TreeVertex
        {
            public Interchange?                         Interchange { get; private set; }
            public TreeVertex                           Parent      { get; private set; }
            public IDictionary<Interchange, TreeVertex> Children    { get; private set; } = new Dictionary<Interchange, TreeVertex>();

            public TreeVertex()
            {
            }

            public TreeVertex(
                Interchange interchange,
                TreeVertex  parent
                )
            {
                Interchange = interchange;
                Parent      = parent;

                Parent.Children.Add(
                    interchange,
                    this);
            }
        }

        public int Count(
            bool[][] original
            )
        {
            var count = 0;
            var root = new TreeVertex();
            var current = root;
            var keyCombinationCombination = new bool[original.Length][];
            for(var index = 0;index < original.Length;++index)
                keyCombinationCombination[index] = (bool[])original[index].Clone();

            var bits = new[] { true, false };

            // There still might be cycles?
            while(current != null)
            {
                var previousCurrent = current;
                for(var column = keyCombinationCombination.Length - 2;column >= 1 && previousCurrent == current;--column)
                    for(var row = 0;row < keyCombinationCombination[0].Length - 2 && previousCurrent == current;++row)
                        for(var bitIndex = 0;bitIndex < bits.Length && previousCurrent == current;++bitIndex)
                        {
                            var bit = bits[bitIndex];
                            if(keyCombinationCombination[column    ][row    ] == bit &&
                               keyCombinationCombination[column + 1][row    ] != bit &&
                               keyCombinationCombination[column    ][row + 1] != bit &&
                               keyCombinationCombination[column + 1][row + 1] == bit)
                            {
                                var interchange = new Interchange(
                                    column,
                                    row,
                                    bit);

                                if(current.Children.ContainsKey(interchange))
                                    continue;

                                if(current.Interchange != null &&
                                   interchange.InverseOf(current.Interchange.Value))
                                    continue;

                                interchange.Apply(keyCombinationCombination);
                                if(Equal(original, keyCombinationCombination))
                                    continue;

                                count++;
                                current = new TreeVertex(
                                    interchange,
                                    current);
                                if(count == 20)
                                {
                                    var x = root;
                                    do
                                    {
                                        x = x.Children.Values.FirstOrDefault();

                                        if(x != null)
                                            TestContext.WriteLine($"c: {x.Interchange.Value.Column}, r: {x.Interchange.Value.Row}, t: {x.Interchange.Value.Type}");

                                    } while(x != null);

                                    return count;
                                }
                            }
                        }

                if(previousCurrent == current)
                {
                    if(current.Interchange != null)
                        current.Interchange.Value.Unapply(keyCombinationCombination);

                    current = current.Parent;
                }
            }

            return count;
        }

        public void Count(
            bool[][] original,
            bool[][] keyCombinationCombination,
            int      previousInterchangeColumn,
            int      previousInterchangeRow,
            bool     type,
            ref int  count
            )
        {
            if(keyCombinationCombination == null)
            {
                keyCombinationCombination = new bool[original.Length][];
                for(var index = 0;index < original.Length;++index)
                    keyCombinationCombination[index] = (bool[])original[index].Clone();
            }

            // Increment key combinations in lexicographic order
            // while maintain column and row sums.
            // First column is fixed.
            // Determine a pair of bits that can be flipped without altering column and row sums.
            for(var columnIndex = keyCombinationCombination.Length - 2;columnIndex >= 1;--columnIndex)
                for(var rowIndex = 0;rowIndex < keyCombinationCombination[0].Length - 2;++rowIndex)
                    if( keyCombinationCombination[columnIndex    ][rowIndex    ] &&
                       !keyCombinationCombination[columnIndex + 1][rowIndex    ] &&
                       !keyCombinationCombination[columnIndex    ][rowIndex + 1] &&
                        keyCombinationCombination[columnIndex + 1][rowIndex + 1])
                    {
                        Flip(keyCombinationCombination, columnIndex    , rowIndex    );
                        Flip(keyCombinationCombination, columnIndex    , rowIndex + 1);
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex    );
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex + 1);

                        if(!Equal(original, keyCombinationCombination))
                        {
                            count += 1;
                            Count(
                                original,
                                keyCombinationCombination,
                                previousInterchangeColumn,
                                previousInterchangeRow,
                                true,
                                ref count);
                        }

                        Flip(keyCombinationCombination, columnIndex    , rowIndex    );
                        Flip(keyCombinationCombination, columnIndex    , rowIndex + 1);
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex    );
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex + 1);
                    }

            for(var columnIndex = keyCombinationCombination.Length - 2;columnIndex >= 1;--columnIndex)
                for(var rowIndex = 0;rowIndex < keyCombinationCombination[0].Length - 2;++rowIndex)
                    if(!keyCombinationCombination[columnIndex    ][rowIndex    ] &&
                        keyCombinationCombination[columnIndex + 1][rowIndex    ] &&
                        keyCombinationCombination[columnIndex    ][rowIndex + 1] &&
                       !keyCombinationCombination[columnIndex + 1][rowIndex + 1] &&
                        // Don't backtrack.
                        !(previousInterchangeColumn == columnIndex &&
                         previousInterchangeRow     == rowIndex &&
                         type))
                    {
                        Flip(keyCombinationCombination, columnIndex    , rowIndex    );
                        Flip(keyCombinationCombination, columnIndex    , rowIndex + 1);
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex    );
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex + 1);

                        if(!Equal(original, keyCombinationCombination))
                        {
                            count += 1;
                            Count(
                                original,
                                keyCombinationCombination,
                                previousInterchangeColumn,
                                previousInterchangeRow,
                                false,
                                ref count);
                        }

                        Flip(keyCombinationCombination, columnIndex    , rowIndex    );
                        Flip(keyCombinationCombination, columnIndex    , rowIndex + 1);
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex    );
                        Flip(keyCombinationCombination, columnIndex + 1, rowIndex + 1);
                    }
        }

        private int[][] GenerateKeyCombinations1(
            int numBuns,
            int numRequired,
            int n,
            int w,
            int rowSum
            )
        {
            var keyCombinationCombination = GenerateKeyCombinationCombination(
                numBuns,
                n,
                w,
                rowSum);
            var count = 0;

            WriteCombination(keyCombinationCombination);
            Increment(keyCombinationCombination);
            TestContext.WriteLine(string.Empty);
            WriteCombination(keyCombinationCombination);

            return null;
        }

        public int[][] GenerateKeyCombinations1(
            int numBuns,
            int numRequired
            )
        {
            int[][] result = null;
            if(numRequired == 0)
            {
                // No key distribution required.
                result = new int[numBuns][];
                for(var index = 0;index < numBuns;++index)
                    result[index] = Array.Empty<int>();
                return result;
            }
            else if(numRequired == 1)
            {
                // No key distribution required.
                result = new int[numBuns][];
                var singleKeyCombination = new[] { 0 };
                for(var index = 0;index < numBuns;++index)
                    result[index] = singleKeyCombination;
                return result;
            }

            // Represent a key combination by a Contant Weight (m-by-n) code where each key present is represented by a one.
            // Need to determine:
            // n - number of bits (keys).
            // w - weight/number of bits set to one.

            // If there are numBuns codes and any numRequired are selected then each key must appear (at least) once in the selection.
            var repeats = numBuns - numRequired + 1;

            // If there are n keys and each key is repeated repeats times then there must be n * repeats keys (ones).
            // If there are numBuns combinations and each combination contains w keys then there must be numBuns * w keys (ones).
            // Therefore n * repeats = numBuns * w. (Design Theory: vr = bk.)
            // Therefore n/w = numBuns/repeats = (multiplier * numBuns)/(multiplier * repeats).

            var multiplier = 2;
            while(result == null)
            {
                var n = multiplier * numBuns;
                var w = multiplier * repeats;
                TestContext.WriteLine($"n: {n}, w: {w}");
                result = GenerateKeyCombinations1(
                    numBuns,
                    numRequired,
                    n,
                    w,
                    repeats);
                break;
                //multiplier += 1;
            }

            return result;
        }

        [TestCaseSource("TestCases"), Timeout(5000)]
        public void Test(
            int               numBuns,
            int               numRequired,
            IList<IList<int>> expected
            )
        {
            var result = GenerateKeyCombinations(
                numBuns,
                numRequired);

            Assert.That(result, Is.Not.Null);
            foreach(var keyCombination in result)
                WriteCombination(keyCombination);

            Assert.That(result.Length, Is.EqualTo(expected.Count));
            for(var index1 = 0;index1 < result.Length;index1++)
            {
                var keyCombination = result[index1];
                for(var index2 = 0;index2 < keyCombination.Length;index2++)
                    Assert.That(keyCombination[index2], Is.EqualTo(expected[index1][index2]));
            }
        }

        [TestCaseSource("TestCases"), Timeout(5000)]
        public void Test1(
            int               numBuns,
            int               numRequired,
            IList<IList<int>> expected
            )
        {
            var result = GenerateKeyCombinations1(
                numBuns,
                numRequired);

            Assert.That(result, Is.Not.Null);
            foreach(var keyCombination in result)
                WriteCombination(keyCombination);

            Assert.That(result.Length, Is.EqualTo(expected.Count));
            for(var index1 = 0;index1 < result.Length;index1++)
            {
                var keyCombination = result[index1];
                for(var index2 = 0;index2 < keyCombination.Length;index2++)
                    Assert.That(keyCombination[index2], Is.EqualTo(expected[index1][index2]));
            }
        }

        [TestCaseSource("CoverageTestCases"), Timeout(10000)]
        public void Coverage(
            int               numBuns,
            int               numRequired,
            IList<IList<int>> expected
            )
        {
            var result = GenerateKeyCombinations(
                numBuns,
                numRequired);

            Assert.That(result, Is.Not.Null);
            foreach(var keyCombination in result)
                WriteCombination(keyCombination);
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        2,
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ },
                            new TestDataList<int>{ }
                        }
                    },
                    new object[]
                    {
                        2,
                        1,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0 },
                            new TestDataList<int>{ 0 }
                        }
                    },
                    new object[]
                    {
                        3,
                        1,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0 },
                            new TestDataList<int>{ 0 },
                            new TestDataList<int>{ 0 }
                        }
                    },
                    new object[]
                    {
                        3,
                        2,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1 },
                            new TestDataList<int>{ 0, 2 },
                            new TestDataList<int>{ 1, 2 }
                        }
                    },
                    new object[]
                    {
                        4,
                        3,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 2, 3 },
                            new TestDataList<int>{ 0, 1, 4, 5 },
                            new TestDataList<int>{ 2, 4, 6, 7 },
                            new TestDataList<int>{ 3, 5, 6, 7 }
                        }
                    },
                    new object[]
                    {
                        4,
                        4,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0 },
                            new TestDataList<int>{ 1 },
                            new TestDataList<int>{ 2 },
                            new TestDataList<int>{ 3 }
                        }
                    },
                    new object[]
                    {
                        5,
                        3,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 2, 3, 4, 5 },
                            new TestDataList<int>{ 0, 1, 2, 6, 7, 8 },
                            new TestDataList<int>{ 0, 3, 4, 6, 7, 9 },
                            new TestDataList<int>{ 1, 3, 5, 6, 8, 9 },
                            new TestDataList<int>{ 2, 4, 5, 7, 8, 9 }
                        }
                    },
                    new object[]
                    {
                        5,
                        4,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 2, 3 },
                            new TestDataList<int>{ 0, 4, 5, 6 },
                            new TestDataList<int>{ 1, 4, 7, 8 },
                            new TestDataList<int>{ 2, 5, 7, 9 },
                            new TestDataList<int>{ 3, 6, 8, 9 }
                        }
                    }
                };
            }
        }

        public static IEnumerable<object[]> CoverageTestCases
        {
            get
            {
                for(var numBuns = 1;numBuns < 10;++numBuns)
                    for(var numRequired = 1;numRequired <= numBuns;numRequired++)
                        yield return new object[]
                        {
                            numBuns,
                            numRequired,
                            new int[0][]
                        };
            }
        }
    }
}
