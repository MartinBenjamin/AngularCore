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

        [TestCaseSource("TestCases")]
        public void Test(
            int               numBuns,
            int               numRequired,
            IList<IList<int>> expected
            )
        {
            var n = 10;
            var r = 6;

            var keyCombination = new int[r];
            Initialise(keyCombination);
            IList<int[]> keyCombinations = new List<int[]>();
            var generating = true;
            while(generating)
            {
                keyCombinations.Add((int[])keyCombination.Clone());
                WriteCombination(keyCombination);
                generating = Increment(
                   n,
                   keyCombination);
            }
            TestContext.WriteLine(keyCombinations.Count);

            var keyCombinationCombination = new int[numBuns];
            Initialise(keyCombinationCombination);
            int count                          = 0;
            int tested                         = 0;
            var numRequiredcombination         = new int[numRequired];
            var numRequiredMinusOneCombination = new int[numRequired - 1];
            var keyIsPresent                   = new bool[n];
            // First key combination is fixed.
            while(keyCombinationCombination[0] == 0)
            {
                count++;
                if(count == 100000000)
                    break;

                // Every choice of numRequired must have all keys.
                Initialise(numRequiredcombination);
                bool pass = true;
                generating = true;

                // Optimisation.
                // Key (n-1) can only appear in the last position of a key combination.
                // To get all keys in a choice of numRequired key combinations the key combinations at indices numRequired - 1 to numBuns - 1
                // must have (n-1) in the last position.
                for(var index = numRequired - 1;index < numBuns && pass;index++)
                {
                    keyCombination = keyCombinations[keyCombinationCombination[index]];
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
                        keyCombination = keyCombinations[keyCombinationCombination[index]];
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
                            keyCombination = keyCombinations[keyCombinationCombination[index]];
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
                    break;

                Increment(
                   keyCombinations.Count,
                   keyCombinationCombination);
            }

            TestContext.WriteLine(count);
            TestContext.WriteLine(tested);

            Assert.That(keyCombinationCombination[0], Is.EqualTo(0));
            foreach(var index in keyCombinationCombination)
                WriteCombination(keyCombinations[index]);

            Assert.That(keyCombinationCombination.Length, Is.EqualTo(expected.Count));
            for(var index = 0;index < keyCombinationCombination.Length;index++)
            {
                keyCombination = keyCombinations[keyCombinationCombination[index]];
                for(var index2 = 0;index2 < keyCombination.Length;index2++)
                    Assert.That(keyCombination[index2], Is.EqualTo(expected[index][index2]));
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
                        1,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0 },
                            new TestDataList<int>{ 0 }
                        }
                    },
                    new object[]
                    {
                        2,
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
                };
            }
        }

    }
}
