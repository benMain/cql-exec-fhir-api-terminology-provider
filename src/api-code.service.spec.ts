import { Library } from 'cql-execution';
import { ApiCodeService } from './api-code.service';
import { AxiosService } from './axios.service';
import { ValueSetResolverService } from './value-set-resolver.service';

describe('CodeService', () => {
  const oid = '2.16.840.1.113883.3.464.1003.103.12.1001';
  let axiosService: AxiosService;
  let valueSetResolverService: ValueSetResolverService;
  let codeService: ApiCodeService;
  let lib: Library;
  beforeEach(async () => {
    lib = {
      valuesets: {
        Diabetes: {
          id: `https://cts.nlm.nih.gov/fhir/ValueSet/${oid}`,
          name: 'Diabetes',
        },
      },
      includes: {
        fhirHelpers: {
          valuesets: {
            Diabetes: {
              id: `https://cts.nlm.nih.gov/fhir/ValueSet/${oid}`,
              name: 'Diabetes',
            },
          },
        },
      },
    } as any;

    axiosService = new AxiosService();
    valueSetResolverService = new ValueSetResolverService(axiosService);
    codeService = new ApiCodeService(valueSetResolverService);
  });

  it('should be defined', () => {
    expect(codeService).toBeDefined();
  });

  it('should identify ValueSets from a Library and remotely resolve them.', async () => {
    await codeService.ensureValueSetsAreLoadedForLibraryWithApiKey(
      lib,
      process.env['UMLS_API_KEY'],
    );
    const valueSets = codeService.findValueSets(oid);
    expect(valueSets).toBeDefined();
    expect(valueSets.length).toBeGreaterThan(0);
    const valSet = valueSets[0];
    expect(valSet.codes.length).toBeGreaterThan(100);

    const duplicateValSet = codeService.findValueSet(oid, '20190315');
    const triplicateValSet = codeService.findValueSet(oid);
    expect(valSet).toEqual(duplicateValSet);
    expect(duplicateValSet).toEqual(triplicateValSet);
    const nonExistintValSet = codeService.findValueSet(
      '2020203982..302398020.33023',
    );
    expect(nonExistintValSet).toBeFalsy();
  });
});
