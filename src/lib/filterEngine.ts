import { Stock, FilterConfig, SortConfig, FilterOperator } from '@/types/stock';

export interface FilterASTNode {
  type: 'AND' | 'OR' | 'PREDICATE';
  predicate?: (stock: Stock) => boolean;
  selectivityWeight?: number;
  children?: FilterASTNode[];
}

export interface FilterResult {
  data: Stock[];
  executionTimeMs: number;
  totalBeforeFilter: number;
  totalAfterFilter: number;
}

/**
 * Predicate factory creating optimized type-safe comparison functions
 */
export function createPredicate(filter: FilterConfig): {
  fn: (stock: Stock) => boolean;
  selectivityWeight: number;
} {
  const { field, operator, value } = filter;

  // Selectivity heuristic:
  // Numeric ranges / between / eq are usually high selectivity (fewer match => test first)
  // Categories (in, contains) have medium selectivity
  let selectivityWeight = 5;

  let fn: (stock: Stock) => boolean;

  switch (operator) {
    case 'eq':
      selectivityWeight = 2;
      fn = (stock: Stock) => {
        const val = stock[field];
        if (val === null || val === undefined) return false;
        return val === value;
      };
      break;

    case 'neq':
      selectivityWeight = 8;
      fn = (stock: Stock) => {
        const val = stock[field];
        return val !== value;
      };
      break;

    case 'gt':
      selectivityWeight = 3;
      fn = (stock: Stock) => {
        const val = stock[field];
        if (typeof val !== 'number') return false;
        return val > (value as number);
      };
      break;

    case 'gte':
      selectivityWeight = 3;
      fn = (stock: Stock) => {
        const val = stock[field];
        if (typeof val !== 'number') return false;
        return val >= (value as number);
      };
      break;

    case 'lt':
      selectivityWeight = 3;
      fn = (stock: Stock) => {
        const val = stock[field];
        if (typeof val !== 'number') return false;
        return val < (value as number);
      };
      break;

    case 'lte':
      selectivityWeight = 3;
      fn = (stock: Stock) => {
        const val = stock[field];
        if (typeof val !== 'number') return false;
        return val <= (value as number);
      };
      break;

    case 'between':
      selectivityWeight = 1; // Very selective!
      fn = (stock: Stock) => {
        const val = stock[field];
        if (typeof val !== 'number') return false;
        const [min, max] = value as [number, number];
        return val >= min && val <= max;
      };
      break;

    case 'in':
      selectivityWeight = 4;
      fn = (stock: Stock) => {
        const list = Array.isArray(value) ? value : [value];
        const stockVal = stock[field];

        if (Array.isArray(stockVal)) {
          // If field is array (e.g. indexMembership), check intersection
          return list.some((item) => (stockVal as string[]).includes(String(item)));
        }
        return list.includes(stockVal as any);
      };
      break;

    case 'notIn':
      selectivityWeight = 7;
      fn = (stock: Stock) => {
        const list = Array.isArray(value) ? value : [value];
        const stockVal = stock[field];
        return !list.includes(stockVal as any);
      };
      break;

    case 'contains':
      selectivityWeight = 5;
      fn = (stock: Stock) => {
        const val = stock[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(String(value).toLowerCase());
      };
      break;

    case 'startsWith':
      selectivityWeight = 2;
      fn = (stock: Stock) => {
        const val = stock[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().startsWith(String(value).toLowerCase());
      };
      break;

    default:
      fn = () => true;
  }

  return { fn, selectivityWeight };
}

/**
 * Executes the filter pipeline with:
 * 1. AST Construction
 * 2. Selectivity Optimization
 * 3. Short-circuit execution
 * 4. Stable sort
 */
export function filterStocks(
  stocks: Stock[],
  filters: FilterConfig[] = [],
  sortConfig?: SortConfig,
  watchlistSet?: Set<string>
): Stock[] {
  const activeFilters = filters.filter((f) => f.enabled);

  if (activeFilters.length === 0 && (!sortConfig || sortConfig.direction === 'none') && !watchlistSet) {
    return stocks;
  }

  // 1. Build predicates and optimize by selectivity (lowest weight first)
  const predicates = activeFilters.map(createPredicate);
  predicates.sort((a, b) => a.selectivityWeight - b.selectivityWeight);

  // 2. Filter with short-circuit evaluation
  const result: Stock[] = [];
  const total = stocks.length;

  for (let i = 0; i < total; i++) {
    const stock = stocks[i];
    let matches = true;

    for (let j = 0; j < predicates.length; j++) {
      if (!predicates[j].fn(stock)) {
        matches = false;
        break; // Short circuit immediately
      }
    }

    if (matches) {
      result.push(stock);
    }
  }

  // 3. Stable sort if requested
  if (sortConfig && sortConfig.direction !== 'none') {
    const { column, direction } = sortConfig;
    const isAsc = direction === 'asc';

    result.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }

      const strA = String(valA);
      const strB = String(valB);
      return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  return result;
}

/**
 * Filter runner with microsecond performance measurement
 */
export function benchmarkFilterEngine(
  stocks: Stock[],
  filters: FilterConfig[],
  sortConfig?: SortConfig
): FilterResult {
  const start = performance.now();
  const data = filterStocks(stocks, filters, sortConfig);
  const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    data,
    executionTimeMs,
    totalBeforeFilter: stocks.length,
    totalAfterFilter: data.length,
  };
}
