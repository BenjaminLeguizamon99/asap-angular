import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs'
import { environment } from  '../../../environment/environment.development';

@Injectable({ providedIn: 'root'})
export class coinDetailService {
    private http= inject(HttpClient);
    private baseUrl = 'https://api.coingecko.com/api/v3';

    private headers = new HttpHeaders(
        environment.cryptoApiKey
            ? { 'x-cg-demo-api-key' : environment.cryptoApiKey }
            : {}
    );

    getCoin(id: string) {
        const params = new HttpParams()
        .set('localization', 'false')
        .set('tickers', 'false')
        .set('market_data', 'true')
        .set('community_data', 'false')
        .set('developer_data', 'false')
        .set('sparkline', 'false');

        return this.http.get<CoinDetail>(`${this.baseUrl}/coins/${id}`, {
            headers: this.headers,
            params,
        })
    }

    // Obtenemos los datos en el tiempo para el grafico
    getMarketChart(
        id: string,
        vsCurrency: string,
        days: string | number,
        interval?: 'daily' | 'hourly'
    ) : Observable<MarketChart> {
        let params = new HttpParams()
        .set('vs_currency', vsCurrency)
        .set('days', String(days));
        if(interval) params = params.set('interval', interval);

        return this.http.get<MarketChart>(`${this.baseUrl}/coins/${id}/market_chart`, {
            headers: this.headers,
            params,
        })
        .pipe(shareReplay(1));
    }

    // precio simple

    getSimplePrice(ids: string[], vs: string[]) {
        const params = new HttpParams()
            .set('ids', ids.join(','))
            .set('vs_currencies', vs.join(','));
        return this.http.get<Record<string, Record<string, number>>>(
            `${this.baseUrl}/simple/price`,
            { headers: this.headers, params }
        );
    }
}


export interface MarketChart {
    prices: [number, number] [];
    market_caps: [number, number][];
    total_volumes: [number, number][];
}

export interface CoinDetail {
    id: string;
    symbol: string;
    name: string;
    image: {small: string; thumb: string; large: string};
    market_data: {
        current_price: Record<string, number>;
        market_cap: Record<string, number>;
        total_volume: Record<string, number>;
        price_change_percentage_24h: number | null;
        high_24h: Record<string, number>;
        low_24h: Record<string, number>;
    }
}