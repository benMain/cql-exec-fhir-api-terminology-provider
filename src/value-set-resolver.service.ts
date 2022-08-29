import { Library, ValueSet, ValueSetObject } from 'cql-execution';
import { AxiosService } from './axios.service';
import { Agent } from 'https';
import { IValueSet, IValueSet_Concept } from './models';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const uniqBy = require('lodash.uniqby');

/**
 * This class does most of the actual work. It identifies Value Sets from within Libraries and then retrieves them from a server.
 */
export class ValueSetResolverService {
  constructor(private readonly axiosService: AxiosService) {}

  async loadValueSetsForLibrary(
    library: Library,
    apiKey: string,
  ): Promise<ValueSetObject> {
    const valueSetObjectResult: ValueSetObject = {};
    const valueSetKeys = this.recursivelyIdentifyValueSets(library);
    for (const valueSetKey of valueSetKeys) {
      const valSet = await this.fetchFhirValueSet(valueSetKey.id, apiKey);
      valueSetObjectResult[valSet.id] = {};
      valueSetObjectResult[valSet.id][valSet.version] =
        await this.buildCqlExecutionValueSet(valSet, apiKey);
    }
    return valueSetObjectResult;
  }

  private recursivelyIdentifyValueSets(library: Library) {
    const valueSets: { id: string; name: string }[] = [];
    if (!!library.valuesets) {
      Object.values(library.valuesets).forEach((vs) =>
        valueSets.push(vs as { id: string; name: string }),
      );
    }
    if (!!library.includes) {
      Object.values(library.includes).forEach((included) =>
        valueSets.push(
          ...this.recursivelyIdentifyValueSets(included as Library),
        ),
      );
    }

    return uniqBy(valueSets, 'id') as { id: string; name: string }[];
  }

  private async buildCqlExecutionValueSet(
    valSet: IValueSet,
    apiKey: string,
  ): Promise<ValueSet> {
    const concepts = await this.recurseConcepts(valSet, apiKey);
    return new ValueSet(valSet.id, valSet.version, concepts);
  }

  private async recurseConcepts(
    valSet: IValueSet,
    apiKey: string,
  ): Promise<Array<IValueSet_Concept>> {
    const conceptsResponse: IValueSet_Concept[] = [];
    for (const include of valSet?.compose?.include) {
      if (!!include.valueSet) {
        for (const valSetUrl of include.valueSet) {
          const childValSet = await this.fetchFhirValueSet(valSetUrl, apiKey);
          const childConcepts = await this.recurseConcepts(childValSet, apiKey);
          conceptsResponse.push(...childConcepts);
        }
      } else if (!!include.concept) {
        conceptsResponse.push(
          ...include.concept.map((x) => ({ system: include.system, ...x })),
        );
      }
    }
    return conceptsResponse;
  }

  private async fetchFhirValueSet(url: string, apiKey: string) {
    const reqConfig = {
      method: 'GET',
      headers: this.getHeaders(url, apiKey),
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    };
    return await this.axiosService.get<IValueSet>(url, reqConfig);
  }

  private getHeaders(url: string, apiKey: string) {
    return {
      Authorization:
        'Basic ' + Buffer.from('apiKey' + ':' + apiKey).toString('base64'),
        Accept: 'application/json'
    };
  }
}
