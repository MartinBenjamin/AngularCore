import { } from 'jasmine';
import { Rule } from "../EavStore/Datalog";
import { EavStore } from '../EavStore/EavStore';
import { IEavStore } from '../EavStore/IEavStore';
import { ClassAssertion } from './Assertion';
import { AxiomInterpreter } from './AxiomInterpreterDatalog';
import { Class } from './Class';
import { ClassExpressionWriter } from './ClassExpressionWriter';
import { IOntology } from './IOntology';
import { NamedIndividual } from './NamedIndividual';
import { Ontology } from "./Ontology";

describe(
    'Declare( Class( C ) )',
    () =>
    {
        const classExpressionWriter = new ClassExpressionWriter();

        describe(
            'Given an Ontology o with axioms Class(c), NamedIndividual(i) and ClassAssertion(c, i):',
            () =>
            {
                const o: IOntology = new Ontology('o');
                const c = new Class(o, 'c');
                const i = new NamedIndividual(o, 'i');
                new ClassAssertion(o, c, i);
                const store: IEavStore = new EavStore();
                const rules: Rule[] = [];
                const interpreter = new AxiomInterpreter(
                    o,
                    store,
                    rules);
                const iInterpretation = interpreter.InterpretIndividual(i);
                for(var axiom of o.Axioms)
                    axiom.Accept(interpreter);
            });
    });