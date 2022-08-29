import {
  Library,
  TerminologyProvider,
  ValueSet,
  ValueSetObject,
} from 'cql-execution';
import { ValueSetResolverService } from './value-set-resolver.service';

export class ApiCodeService implements TerminologyProvider {
  private readonly valueSets: ValueSetObject;
  constructor(
    private readonly valueSetResolverService: ValueSetResolverService,
  ) {
    this.valueSets = {};
  }

  async ensureValueSetsAreLoadedForLibraryWithApiKey(
    library: Library,
    apiKey: string,
  ) {
    const fetchedValueSetObject =
      await this.valueSetResolverService.loadValueSetsForLibrary(
        library,
        apiKey,
      );
    Object.keys(fetchedValueSetObject).forEach((oid) => {
      this.valueSets[oid] = fetchedValueSetObject[oid];
    });
  }

  findValueSets(oid: string) {
    return this.findValueSetsByOid(oid);
  }
  findValueSetsByOid(oid: string): ValueSet[] {
    const result: ValueSet[] = [];
    const oidValueSets = this.valueSets[oid];
    if (!!oidValueSets) {
      Object.keys(oidValueSets).forEach((version) => {
        result.push(oidValueSets[version]);
      });
    }
    return result;
  }
  findValueSet(oid: string, version?: string): ValueSet {
    const oidValueSets = this.valueSets[oid];
    if (!oidValueSets) {
      return null;
    }
    if (!!version) {
      return oidValueSets[version];
    }
    const maxVersion = Object.keys(oidValueSets).reduce((a, b) => {
      if (a > b) {
        return a;
      }
      return b;
    });
    return oidValueSets[maxVersion];
  }
}
