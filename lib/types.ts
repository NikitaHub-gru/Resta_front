export interface ColumnMapping {
    [key: string]: string;
  }
  
  export type ColumnDefinition = {
    param: string;
    name: string;
    filteringAllowed: boolean;
  }; 