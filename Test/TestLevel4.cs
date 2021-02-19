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
            for(var index = 0;index < combination.Length;++index)
                if(combination[index] != n - combination.Length + index)
                    largestIndex = Math.Max(largestIndex, index);

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

        public IList<int[]> GenerateCombinations(
            int n,
            int r
            )
        {
            var combination = new int[r];
            Initialise(combination);
            IList<int[]> combinations = new List<int[]>();
            var generating = true;
            while(generating)
            {
                combinations.Add((int[])combination.Clone());
                WriteCombination(combination);
                generating = Increment(
                   n,
                   combination);
            }
            return combinations;
        }
        

        private int[][] GenerateKeyCombinations(
            int numBuns,
            int numRequired,
            int n,
            int r
            )
        {
            int[][] result = null;
            IList<int[]> keyCombinations = GenerateCombinations(
                n,
                r);
            TestContext.WriteLine(keyCombinations.Count);

            var count                          = 0L;
            var tested                         = 0L;
            var keyCombinationCombination      = new int[numBuns];
            var numRequiredcombination         = new int[numRequired];
            var numRequiredMinusOneCombination = new int[numRequired - 1];
            var keyIsPresent                   = new bool[n];
            Initialise(keyCombinationCombination);
            // First key combination is fixed.
            while(
                keyCombinationCombination[0] == 0 &&
                result == null)
            {
                count++;
                if(count == int.MaxValue)
                    break;

                // Every choice of numRequired must have all keys.
                Initialise(numRequiredcombination);
                var pass = true;
                var generating = true;

                // Optimisation.
                // Key (n-1) can only appear in the last position of a key combination.
                // To get all keys in a choice of numRequired key combinations the key combinations at indices numRequired - 1 to numBuns - 1
                // must have (n-1) in the last position.
                for(var index = numRequired - 1;index < numBuns && pass;index++)
                {
                    var keyCombination = keyCombinations[keyCombinationCombination[index]];
                    if(keyCombination[r - 1] != n - 1)
                        pass = false;
                }

                if(pass)
                    tested += 1;

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
                        foreach(var key in keyCombination)
                            keyIsPresent[key] = true;
                    }

                    pass = Array.TrueForAll(keyIsPresent, p => p);
                    if(pass)
                        generating = Increment(
                            numBuns,
                            numRequiredcombination);
                }

                if(pass)
                {
                    // Every choice of numRequired - 1 must not have all keys;
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
                            foreach(var key in keyCombination)
                                keyIsPresent[key] = true;
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
                        result[index] = keyCombinations[keyCombinationCombination[index]];
                }
                else
                    Increment(
                       keyCombinations.Count,
                       keyCombinationCombination);
            }

            TestContext.WriteLine(count);
            TestContext.WriteLine(tested);

            return result;
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

            // Determine n (number of keys)
            // and r (key combination size/block size).

            // If there are num_buns combinations and any num_required are selected then each key must appear (at least) once in the selection.
            int repeats = numBuns - numRequired + 1;

            // If there are n keys and each key is repeated repeats times then there must be n * repeats keys.
            // If there are num_buns combinations and each combination contains r keys then there must be num_buns * r keys.
            // Therefore n * repeats = num_buns * r . (Design Theory: vr = bk.)
            // Therefore n/r = num_buns/repeats = (multiplier * num_buns)/(multiplier * repeats).
            var multiplier = 1;
            while(
                result == null &&
                multiplier * numBuns <= 10)
            {
                result = GenerateKeyCombinations(
                    numBuns,
                    numRequired,
                    multiplier * numBuns,
                    multiplier * repeats);
                multiplier += 1;
            }

            return result;
        }

        [TestCaseSource("TestCases")]
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
                    }
                    //,
                    //new object[]
                    //{
                    //    10,
                    //    7,
                    //    new TestDataList<IList<int>>
                    //    {
                    //    }
                    //}
                };
            }
        }

    }
}
