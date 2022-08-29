# CQL Execution Fhir API Terminology Provider

The Code Service provided by [cql-exec](https://github.com/cqframework/cql-execution/blob/master/src/types/cql-code-service.interfaces.ts) is not particulary effective at working with remote caches of Fhir Defined [Value Sets](https://hl7.org/fhir/valueset.html). We should be reference ValueSets in a CQL Statement and then have them loaded from a Server based on the `id` property being the [ValueSet URL](https://github.com/cqframework/cql-exec-examples/blob/master/diabetic-foot-exam/r4/cql/DiabeticFootExam.cql#L12)
<br/>
This was the basic goal of [cql-exec-vsac](https://github.com/cqframework/cql-exec-vsac). Unfortunately, they have not kept up with the changes to VSAC and (SVS API)[https://www.nlm.nih.gov/vsac/support/usingvsac/vsacsvsapiv2.html] is being deprecated in favor of the [Fhir Terminology Service](https://www.nlm.nih.gov/vsac/support/usingvsac/vsacfhirapi.html). That is why this library has been created.


