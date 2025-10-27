// top-mover.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environment/environment.development';
import type { cryptoResponse } from '../top-movers/interfaces/top-mover.interface'; 
import { Observable, forkJoin, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type MarketsOrder =
  | 'market_cap_desc' | 'market_cap_asc'
  | 'volume_desc'     | 'volume_asc'
  | 'id_desc'         | 'id_asc';

export const ORDER_OPTIONS: { label: string; value: MarketsOrder }[] = [
  { label: 'Market Cap ↓', value: 'market_cap_desc' },
  { label: 'Market Cap ↑', value: 'market_cap_asc'  },
  { label: 'Volumen ↓',    value: 'volume_desc'     },
  { label: 'Volumen ↑',    value: 'volume_asc'      },
  { label: 'ID A→Z',       value: 'id_asc'          },
  { label: 'ID Z→A',       value: 'id_desc'         },
];


@Injectable({ providedIn: 'root' })
export class CoinsService {
  private http = inject(HttpClient);
  private baseUrl = environment.cryptoUrl; 

  // Header con la API key
  private headers = new HttpHeaders({
    'x-cg-demo-api-key': environment.cryptoApiKey,
  });


  private comparator(order: MarketsOrder) {
    return(a: cryptoResponse, b: cryptoResponse) => {
      const mcA = a.market_cap ?? 0;
      const mcB = b.market_cap ?? 0;
      const volA = a.total_volume ?? 0;
      const volB = b.total_volume ?? 0;

      switch(order) {
        case 'market_cap_desc' : return mcB - mcA;
        case 'market_cap_asc' : return mcA - mcB;
        case 'volume_desc' : return volB - volA;
        case 'volume_asc' : return volA - volB;
        case 'id_desc' : return b.id.localeCompare(a.id);
        case 'id_asc' : return a.id.localeCompare(b.id);
      }
    };
  }

  // Lista de todas las monedas con paginacion
  getMarkets(opts: {
    vs: 'usd' | 'ars';
    page?: number;
    perPage?: number;
    order?: MarketsOrder;
    ids?: string[];
    includePct?: string;
  }) : Observable<cryptoResponse[]> {
    const vs = opts.vs;
    const page = opts.page ?? 1;
    const perPage = opts.perPage ?? 75;
    const order: MarketsOrder = opts.order ?? 'market_cap_desc';
    const includePct = opts.includePct ?? '1h,24h,7d';
    const ids = opts.ids; 
  
    
    let params = new HttpParams()
    .set('vs_currency', vs)
    .set('sparkline', 'false')
    .set('price_change_percentage', includePct);
    
    if (ids && ids.length) {
    params = params.set('ids', ids.join(','));
    } else {
      params = params
        .set('order', order)
        .set('per_page', String(perPage))
        .set('page', String(page));
    }
    
    return this.http.get<cryptoResponse[]>(`${this.baseUrl}/coins/markets`, {
      headers: this.headers,
      params
    }).pipe(
      map(rows => {
        if(ids?.length) {
          return [...rows].sort(this.comparator(order));
        }
        return rows;
      })
    );
  }

  
searchIds(q: string) {
  const query = q.trim().toLowerCase();
  const params = new HttpParams({ fromObject: { query: q } });
  return this.http.get<{ coins: { id: string; name: string; symbol: string }[] }>(
    `${this.baseUrl}/search`,
    { headers: this.headers, params }
  ).pipe(
    map(res =>
      res.coins
        .filter(c => (c.id + ' ' + c.name + ' ' + c.symbol).toLowerCase().includes(query))
        .map(c => c.id)
    )
  );
}


loadTopMoverCryptos(opts?: {
    vs?: string;
    ids?: string[];           
    category?: string;
    perPage?: number; 
    page?: number;    
    includePct?: string;
  }) {
    const {
      vs = 'usd',
      ids,
      category,
      perPage = 75,
      page = 1,
      includePct = '1h,24h,7d'
    } = opts ?? {};

    let params = new HttpParams()
      .set('vs_currency', vs)
      .set('per_page', String(perPage))
      .set('page', String(page))
      .set('sparkline', 'false')
      .set('price_change_percentage', includePct);

    if (ids?.length) params = params.set('ids', ids.join(','));
    if (category) params = params.set('category', category);

    return this.http.get<cryptoResponse[]>(`${this.baseUrl}/coins/markets`, {
      headers: this.headers,
      params
    });
  }
}
