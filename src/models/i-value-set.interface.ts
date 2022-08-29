export interface IValueSet {
  id: string;
  version: string;
  url: string;
  compose: {
    include: any[];
  };
}
