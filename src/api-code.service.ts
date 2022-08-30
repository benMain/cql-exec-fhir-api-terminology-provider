import {
  Library,
  TerminologyProvider,
  ValueSet,
  ValueSetObject,
} from 'cql-execution';
import { AxiosService } from './axios.service';
import { ValueSetResolverService } from './value-set-resolver.service';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export class ApiCodeService implements TerminologyProvider {
  private valueSets: ValueSetObject;
  readonly valueSetResolverService: ValueSetResolverService;

  constructor(
    private readonly shouldCache: boolean,
    private readonly cacheLocation: string = `${__dirname}/cql-valueset-db.json`,
    valueSetResolverService: ValueSetResolverService = null,
  ) {
    this.valueSetResolverService =
      valueSetResolverService ??
      new ValueSetResolverService(new AxiosService());

    this.valueSets = {};
    if (this.shouldCache) {
      this.loadFromCache();
    }
  }

  async ensureValueSetsAreLoadedForLibraryWithApiKey(
    library: Library,
    apiKey: string,
  ) {
    const fetchedValueSetObject =
      await this.valueSetResolverService.loadValueSetsForLibrary(
        library,
        apiKey,
        this.valueSets,
      );
    Object.keys(fetchedValueSetObject).forEach((oid) => {
      this.valueSets[oid] = fetchedValueSetObject[oid];
    });
    if (this.shouldCache) {
      this.saveToCache();
    }
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

  loadFromCache() {
    if (existsSync(this.cacheLocation)) {
      const cachedValSets: ValueSetObject = JSON.parse(
        readFileSync(this.cacheLocation, 'utf-8'),
      );
      Object.keys(cachedValSets).forEach((oid) => {
        Object.keys(cachedValSets[oid]).forEach((version) => {
          const valSet = cachedValSets[oid][version];
          cachedValSets[oid][version] = new ValueSet(
            oid,
            version,
            valSet.codes,
          );
        });
      });
      this.valueSets = cachedValSets;
    }
  }

  saveToCache() {
    writeFileSync(this.cacheLocation, JSON.stringify(this.valueSets));
  }
}
