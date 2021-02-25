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
            TestContext.Write("[ ");
            for(var index = 0;index < combination.Length;index++)
            {
                if(index != 0)
                    TestContext.Write(", ");

                TestContext.Write(combination[index] ? 1 : 0);
            }
            TestContext.WriteLine(" ]");
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
            int w,
            int d
            )
        {
            var combination = new bool[n];
            bool[] initial  = null;
            Initialise(
                combination,
                w);
            IList<bool[]> combinations = new List<bool[]>();

            var generating = true;
            while(generating)
            {
                if(initial == null)
                {
                    WriteCombination(combination);
                    combinations.Add((bool[])combination.Clone());
                    initial = combinations[0];
                }
                else if(Distance(initial, combination) == d)
                {
                    WriteCombination(combination);
                    combinations.Add((bool[])combination.Clone());
                }

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

        public IList<int[]> GenerateCombinations(
            int n,
            int r
            )
        {
            var combination = new int[r];
            int[] initial = null;
            Initialise(combination);
            IList<int[]> combinations = new List<int[]>();
            var generating = true;
            while(generating)
            {
                if(initial == null)
                {
                    WriteCombination(combination);
                    combinations.Add((int[])combination.Clone());
                    initial = combinations[0];
                }
                else if(Distance(initial, combination, n) == r)
                {
                    WriteCombination(combination);
                    combinations.Add((int[])combination.Clone());
                }

                generating = Increment(
                   n,
                   combination);
            }
            return combinations;
        }

        public int[][] GenerateKeyCombinations(
            int           numBuns,
            int           numRequired,
            int           n,
            int           d,
            IList<bool[]> keyCombinations,
            int[]         keyCombinationCombination,
            int           position
            )
        {
            int[][] result = null;
            if(position < keyCombinationCombination.Length)
            {
                var startIndex = 0;
                if(position > 0)
                    startIndex = keyCombinationCombination[position - 1] + 1;
                for(var index = startIndex;index < keyCombinations.Count - keyCombinationCombination.Length + position + 1 && result == null;++index)
                {
                    var keyCombination = keyCombinations[index];
                    var valid = true;
                    for(var index1 = 1;index1 < position && valid;++index1)
                        valid = valid && Distance(
                            keyCombinations[keyCombinationCombination[index1]],
                            keyCombination) == d;

                    if(valid)
                    {
                        keyCombinationCombination[position] = index;
                        result = GenerateKeyCombinations(
                            numBuns,
                            numRequired,
                            n,
                            d,
                            keyCombinations,
                            keyCombinationCombination,
                            position + 1);
                    }
                }

                return result;
            }

            var numRequiredcombination         = new int[numRequired];
            var numRequiredMinusOneCombination = new int[numRequired - 1];
            var keyIsPresent                   = new bool[n];
            var rowSums                        = new int[n];

            Initialise(numRequiredcombination);
            var pass = true;
            var generating = true;

            // Optimisation.
            // To get all keys in a choice of numRequired key combinations the key combinations at indices numRequired - 1 to numBuns - 1
            // must have key n - 1.
            for(var index = numRequired - 1;index < numBuns && pass;index++)
            {
                var keyCombination = keyCombinations[keyCombinationCombination[index]];
                pass = pass && keyCombination[n - 1];
            }

            // Every choice of numRequired must have all keys.
            while(
                pass &&
                generating)
            {
                Array.Fill(
                    keyIsPresent,
                    false);

                foreach(var index in numRequiredcombination)
                {
                    var keyCombination = keyCombinations[keyCombinationCombination[index]];
                    for(var key = 0;key < n;++key)
                        keyIsPresent[key] = keyIsPresent[key] || keyCombination[key];
                }

                pass = Array.TrueForAll(keyIsPresent, p => p);
                if(pass)
                    generating = Increment(
                        numBuns,
                        numRequiredcombination);
            }

            if(pass)
            {
                // Every choice of numRequired - 1 must not have all keys.
                Initialise(numRequiredMinusOneCombination);
                generating = true;
                while(
                    pass &&
                    generating)
                {
                    Array.Fill(
                        keyIsPresent,
                        false);

                    foreach(var index in numRequiredMinusOneCombination)
                    {
                        var keyCombination = keyCombinations[keyCombinationCombination[index]];
                        for(var key = 0;key < n;++key)
                            keyIsPresent[key] = keyIsPresent[key] || keyCombination[key];
                    }

                    pass = !Array.TrueForAll(keyIsPresent, p => p);
                    if(pass)
                        generating = Increment(
                            numBuns,
                            numRequiredMinusOneCombination);
                }
            }

            if(pass)
            {
                result = new int[numBuns][];
                for(var index = 0;index < numBuns;++index)
                {
                    var keyCombination = new List<int>();
                    for(var key = 0;key < n;++key)
                        if(keyCombinations[keyCombinationCombination[index]][key])
                            keyCombination.Add(key);
                    result[index] = keyCombination.ToArray();
                }
            }

            return result;
        }

        private int[][] GenerateKeyCombinations(
            int numBuns,
            int numRequired,
            int n,
            int w,
            int d
            )
        {
            int[][] result = null;
            IList<bool[]> keyCombinations = GenerateCombinations(
                n,
                w,
                d);
            TestContext.WriteLine(keyCombinations.Count);

            if(keyCombinations.Count < numBuns)
                return null;

            return GenerateKeyCombinations(
                numBuns,
                numRequired,
                n,
                d,
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
            // d - Hamming Distance.
            
            // If there are numBuns codes and any numRequired are selected then each key must appear (at least) once in the selection.
            var repeats = numBuns - numRequired + 1;

            // If there are n keys and each key is repeated repeats times then there must be n * repeats keys (ones).
            // If there are num_buns combinations and each combination contains w keys then there must be num_buns * w keys (ones).
            // Therefore n * repeats = num_buns * w. (Design Theory: vr = bk.)
            // Therefore n/w = num_buns/repeats = (multiplier * num_buns)/(multiplier * repeats).

            // A combination of 2 codes eliminates d/2 zeros.
            // Assume subsequent blocks eliminate one zero - incorrect???
            // Therefore d/2 + (numRequired - 3) <  n - w
            // and       d/2 + (numRequired - 2) >= n - w.
            // Therefore d Upper Bound = 2*(n - w - numRequired + 3)
            // and       d Lower Bound = 2*(n - w - numRequired + 2).
            // Therefore d Upper Bound - d Lower Bound = 2.
            // Since, for a set of Constant Weight (m-by-n) codes the Hamming Distance (d) must be even, d = d Lower Bound;

            var multiplier = 1;
            while(result == null)
            {
                var n = multiplier * numBuns;
                var w = multiplier * repeats;
                var d = 2 * (n - w - numRequired + 2);
                result = GenerateKeyCombinations(
                    numBuns,
                    numRequired,
                    n,
                    w,
                    d);
                multiplier += 1;
            }

            return result;
        }

        [TestCaseSource("TestCases1"), Timeout(2000)]
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

            if(expected.Count == 0)
                return;

            Assert.That(result.Length, Is.EqualTo(expected.Count));
            for(var index1 = 0;index1 < result.Length;index1++)
            {
                var keyCombination = result[index1];
                for(var index2 = 0;index2 < keyCombination.Length;index2++)
                    Assert.That(keyCombination[index2], Is.EqualTo(expected[index1][index2]));
            }
        }

        [Test]
        public void CountCombinations()
        {
            for(var numBuns = 1;numBuns < 10;++numBuns)
                for(var numRequired = 1;numRequired <= numBuns;numRequired++)
                {
                    int repeats = numBuns - numRequired + 1;
                    var n = numBuns;
                    var w = repeats;
                    var d = 2 * (n - w - numRequired + 2);

                    TestContext.WriteLine($"numBuns: {numBuns}, numRequired: {numRequired}, repeats: {repeats}, n: {n}, w: {w}, d: {d}");
                }
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
                    }//,
                    //new object[]
                    //{
                    //    6,
                    //    3,
                    //    new TestDataList<IList<int>>
                    //    {
                    //    }
                    //}
                };
            }
        }

        public static IEnumerable<object[]> TestCases1
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
