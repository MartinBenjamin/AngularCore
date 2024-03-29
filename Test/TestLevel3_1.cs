﻿using CommonDomainObjects;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Test
{
    public struct Fraction: IComparable<Fraction>
    {
        public int Numerator   { get; private set; }
        public int Denominator { get; private set; }

        public static readonly Fraction Zero = new Fraction(0);
        public static readonly Fraction One  = new Fraction(1);

        public Fraction(
            int numerator,
            int denominator = 1
            )
        {
            Numerator   = numerator;
            Denominator = numerator == 0 ? 1 : denominator;

            int gcd = Gcd(
                Math.Abs(Numerator),
                Denominator);

            Numerator   /= gcd;
            Denominator /= gcd;
        }

        public bool IsZero
        {
            get
            {
                return Numerator == 0;
            }
        }

        public bool IsOne
        {
            get
            {
                return Numerator == Denominator;
            }
        }

        public override bool Equals(
            object obj
            ) => obj is Fraction fraction &&
                Numerator   == fraction.Numerator &&
                Denominator == fraction.Denominator;

        public override int GetHashCode()
            => HashCode.Combine(
                Numerator,
                Denominator);

        public static Fraction operator -(
            Fraction fraction
            ) => new Fraction(
                -fraction.Numerator,
                fraction.Denominator);

        public static Fraction operator +(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                checked(lhs.Numerator * rhs.Denominator + rhs.Numerator * lhs.Denominator),
                checked(lhs.Denominator * rhs.Denominator));

        public static Fraction operator -(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                checked(lhs.Numerator * rhs.Denominator - rhs.Numerator * lhs.Denominator),
                checked(lhs.Denominator * rhs.Denominator));

        public static Fraction operator *(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                checked(lhs.Numerator * rhs.Numerator),
                checked(lhs.Denominator * rhs.Denominator));

        public static Fraction operator /(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                checked(lhs.Numerator * (rhs.Numerator < 0 ? -rhs.Denominator : rhs.Denominator)),
                checked(lhs.Denominator * Math.Abs(rhs.Numerator)));

        public static bool operator ==(
            Fraction lhs,
            Fraction rhs
            ) => Equals(
                lhs,
                rhs);

        public static bool operator !=(
            Fraction lhs,
            Fraction rhs
            ) => !(lhs == rhs);

        public static int Gcd(
            int a,
            int b
            )
        {
            while(a != 0 && b != 0)
            {
                if(a > b)
                    a %= b;

                else
                    b %= a;
            }

            return a > 0 ? a : b;
        }

        public override string ToString() => Numerator != 0 && Denominator != 1 ? $"{ Numerator }/{ Denominator }" : Numerator.ToString();

        int IComparable<Fraction>.CompareTo(
            Fraction other
            ) => other.Numerator * Denominator - Numerator * other.Denominator;
    }

    public struct Matrix
    {
        private readonly IDictionary<int, IDictionary<int, Fraction>> _elements;

        public Matrix(
            ICollection<int> rowIndices,
            ICollection<int> columnIndices
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(rowIndices.Count);

            foreach(var rowIndex in rowIndices)
            {
                var row = new Dictionary<int, Fraction>(columnIndices.Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in columnIndices)
                    row[columnIndex] = Fraction.Zero;
            }
        }

        public Matrix(
            IDictionary<int, IDictionary<int, Fraction>> elements
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(elements.Count);

            foreach(var rowIndex in elements.Keys)
            {
                var row = new Dictionary<int, Fraction>(elements[rowIndex].Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in elements[rowIndex].Keys)
                    row[columnIndex] = elements[rowIndex][columnIndex];
            }
        }

        public Matrix(
            IList<IList<Fraction>> elements
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(elements.Count);

            foreach(var rowIndex in Enumerable.Range(0, elements.Count))
            {
                var row = new Dictionary<int, Fraction>(elements[rowIndex].Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in Enumerable.Range(0, elements[rowIndex].Count))
                    row[columnIndex] = elements[rowIndex][columnIndex];
            }
        }

        public Matrix(
            IList<IList<int>> elements
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(elements.Count);

            foreach(var rowIndex in Enumerable.Range(0, elements.Count))
            {
                var row = new Dictionary<int, Fraction>(elements[rowIndex].Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in Enumerable.Range(0, elements[rowIndex].Count))
                    row[columnIndex] = new Fraction(elements[rowIndex][columnIndex]);
            }
        }

        public Fraction this[
            int rowIndex,
            int columnIndex
            ]
        {
            get
            {
                return _elements[rowIndex][columnIndex];
            }
        }

        public ICollection<int> RowIndices
        {
            get
            {
                return _elements.Keys;
            }
        }

        public ICollection<int> ColumnIndices
        {
            get
            {
                return _elements.First().Value.Keys;
            }
        }

        public Matrix Identity()
        {
            var result = new Matrix(
                RowIndices,
                ColumnIndices);
            foreach(var rowIndex in _elements.Keys)
                foreach(var columnIndex in _elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] = rowIndex == columnIndex ? Fraction.One : Fraction.Zero;

            return result;
        }

        public Matrix Normalise()
        {
            var result = new Matrix(_elements);
            foreach(var rowIndex in _elements.Keys)
            {
                var row       = _elements[rowIndex];
                var resultRow = result._elements[rowIndex];
                var total = row
                    .Values
                    .Aggregate(
                        Fraction.Zero,
                        (accumulator, current) => accumulator + current);

                if(!total.IsZero)
                    foreach(var columnIndex in row.Keys)
                        resultRow[columnIndex] /= total;

                else // Absorbing state.
                    resultRow[rowIndex] = Fraction.One;
            }

            return result;
        }

        public Matrix Submatrix(
            IList<int> rowIndices,
            IList<int> columnIndices
            )
        {
            var result = new Matrix(
                rowIndices,
                columnIndices);

            foreach(var rowIndex in rowIndices)
                foreach(var columnIndex in columnIndices)
                    result._elements[rowIndex][columnIndex] = _elements[rowIndex][columnIndex];

            return result;
        }

        public Fraction Det()
        {
            return Det(
                RowIndices.OrderBy(index => index).ToList(),
                ColumnIndices.OrderBy(index => index).ToList());
        }

        private Fraction Det(
            IList<int> rowIndices,
            IList<int> columnIndices
            )
        {
            var determinant = Fraction.Zero;
            bool positive = true;
            var elements = _elements;
            columnIndices.Permute(
                permutation =>
                {
                    var total = Fraction.One;
                    for(var index = 0;index < rowIndices.Count && !total.IsZero;++index)
                        total *= elements[rowIndices[index]][permutation[index]];

                    if(positive)
                        determinant += total;

                    else
                        determinant -= total;

                    // Heap's algorithm produces next permutation by one transposition.
                    positive = !positive;
                });

            return determinant;
        }

        public Matrix Transpose()
        {
            var transpose = new Matrix(
                ColumnIndices,
                RowIndices);

            foreach(var rowIndex in _elements.Keys)
                foreach(var columnIndex in _elements[rowIndex].Keys)
                    transpose._elements[columnIndex][rowIndex] = _elements[rowIndex][columnIndex];

            return transpose;
        }

        public Matrix Adj()
        {
            var rowIndices    = RowIndices.OrderBy(index => index).ToList();
            var columnIndices = ColumnIndices.OrderBy(index => index).ToList();
            if(rowIndices.Count == 1)
                return Identity().Transpose();

            var adj = new Matrix(
                columnIndices,
                rowIndices);

            // Calculate cofactors.
            for(var rowIndexIndex = 0;rowIndexIndex < rowIndices.Count;++rowIndexIndex)
                for(var columnIndexIndex = 0;columnIndexIndex < columnIndices.Count;++columnIndexIndex)
                {
                    var rowIndex    = rowIndices[rowIndexIndex   ];
                    var columnIndex = columnIndices[columnIndexIndex];
                    var minorRowIndices    = rowIndices.Where(index => index != rowIndex).ToList();
                    var minorColumnIndices = columnIndices.Where(index => index != columnIndex).ToList();

                    var cofactorValue = Det(
                        minorRowIndices,
                        minorColumnIndices);

                    adj._elements[columnIndex][rowIndex] = (rowIndexIndex + columnIndexIndex) % 2 == 0 ?
                        cofactorValue : -cofactorValue;
                }

            return adj;
        }

        public Matrix Invert() => (Fraction.One / Det()) * Adj();

        public static Matrix operator +(
            Matrix lhs,
            Matrix rhs
            )
        {
            var result = new Matrix(lhs._elements);
            foreach(var rowIndex in lhs._elements.Keys)
                foreach(var columnIndex in lhs._elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] += rhs._elements[rowIndex][columnIndex];

            return result;
        }

        public static Matrix operator -(
            Matrix lhs,
            Matrix rhs
            )
        {
            var result = new Matrix(lhs._elements);
            foreach(var rowIndex in lhs._elements.Keys)
                foreach(var columnIndex in lhs._elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] -= rhs._elements[rowIndex][columnIndex];

            return result;
        }

        public static Matrix operator *(
            Matrix lhs,
            Matrix rhs
            )
        {
            var result = new Matrix(
                lhs.RowIndices,
                rhs.ColumnIndices);
            foreach(var rowIndex in lhs.RowIndices)
                foreach(var columnIndex in rhs.ColumnIndices)
                    result._elements[rowIndex][columnIndex] = rhs.RowIndices
                        .Select(index => lhs._elements[rowIndex][index] * rhs._elements[index][columnIndex])
                        .Aggregate(
                            Fraction.Zero,
                            (accumulator, current) => accumulator + current);

            return result;
        }

        public static Matrix operator *(
            Fraction lhs,
            Matrix   rhs
            )
        {
            var result = new Matrix(rhs._elements);
            foreach(var rowIndex in rhs._elements.Keys)
                foreach(var columnIndex in rhs._elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] = rhs._elements[rowIndex][columnIndex] * lhs;

            return result;
        }

        public override string ToString()
        {
            var builder = new StringBuilder();
            foreach(var rowIndex in _elements.Keys.OrderBy(key => key))
            {
                var row = _elements[rowIndex];
                foreach(var columnIndex in row.Keys.OrderBy(key => key))
                {
                    builder.Append('\t');
                    builder.Append(_elements[rowIndex][columnIndex]);
                }

                builder.AppendLine(string.Empty);
            }

            return builder.ToString();
        }
    }

    [TestFixture]
    public class TestLevel3_1: Test
    {
        public IList<int> Probabilities(
            int               initialState,
            IList<IList<int>> matrix
            )
        {
            var transitionMatrix = new Matrix(matrix);
            TestContext.WriteLine("Given Transition Matrix:");
            TestContext.WriteLine(transitionMatrix);

            transitionMatrix = transitionMatrix.Normalise();
            TestContext.WriteLine("Normalised Transition Matrix:");
            TestContext.WriteLine(transitionMatrix);

            var transientStates = transitionMatrix.RowIndices.Where(rowIndex => !transitionMatrix[rowIndex, rowIndex].IsOne).ToList();
            var absorbingStates = transitionMatrix.RowIndices.Where(rowIndex => transitionMatrix[rowIndex, rowIndex].IsOne).ToList();
            var q = transitionMatrix.Submatrix(transientStates, transientStates);
            var r = transitionMatrix.Submatrix(transientStates, absorbingStates);
            TestContext.WriteLine("Q:");
            TestContext.WriteLine(q);

            TestContext.WriteLine("R:");
            TestContext.WriteLine(r);

            var qIdentity = q.Identity();
            TestContext.WriteLine("I:");
            TestContext.WriteLine(qIdentity);

            var iMinusQ = qIdentity - q;
            TestContext.WriteLine("I - Q:");
            TestContext.WriteLine(iMinusQ);
            TestContext.WriteLine(iMinusQ.Det());

            var n = iMinusQ.Invert();
            TestContext.WriteLine("N = (I - Q)^-1:");
            TestContext.WriteLine(n);

            var b = n * r;
            TestContext.WriteLine("B = NR:");
            TestContext.WriteLine(b);

            var denominators = b.ColumnIndices
                .Select(columnIndex => b[initialState, columnIndex])
                .Where(element => !element.IsZero)
                .Select(element => element.Denominator)
                .Distinct();

            TestContext.Write("Denominators: ");
            TestContext.WriteLine(new TestDataList<int>(denominators));

            var lcm = denominators.Aggregate((lhs, rhs) => lhs * rhs / Fraction.Gcd(lhs, rhs));
            TestContext.WriteLine("LCD: " + lcm);

            var result = b.ColumnIndices
                .Select(columnIndex => b[initialState, columnIndex])
                .Select(element => element.Numerator * lcm / element.Denominator)
                .ToList();
            result.Add(lcm);

            TestContext.WriteLine("Result: " + new TestDataList<int>(result));
            return result;
        }

        [TestCaseSource("TestCases")]
        public void Test(
            int               initialState,
            IList<IList<int>> matrix,
            IList<int>        expected
            )
        {
            var result = Probabilities(
                initialState,
                matrix);
            Assert.That(result.SequenceEqual(expected), Is.True);
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1 },
                            new TestDataList<int>{ 0, 1 }
                        },
                        new TestDataList<int>{ 1, 1 }
                    },

                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 1 },
                            new TestDataList<int>{ 0, 1, 0 },
                            new TestDataList<int>{ 0, 0, 1 }
                        },
                        new TestDataList<int>{ 1, 1, 2 }
                    },

                    new object[]
                    {
                        1,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 1, 0, 0, 0, 0 },
                            new TestDataList<int>{ 1, 0, 1, 0, 0 },
                            new TestDataList<int>{ 0, 1, 0, 1, 0 },
                            new TestDataList<int>{ 0, 0, 1, 0, 1 },
                            new TestDataList<int>{ 0, 0, 0, 0, 1 },
                        },
                        new TestDataList<int>{ 3, 1, 4 }
                    },

                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 2, 1, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 3, 4 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0 },
                        },
                        new TestDataList<int>{ 7, 6, 8, 21 }
                    },

                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 0, 0, 0, 1 },
                            new TestDataList<int>{ 4, 0, 0, 3, 2, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 }
                        },
                        new TestDataList<int>{ 0, 3, 2, 9, 14 }
                    }
                };
            }
        }
    }
}
