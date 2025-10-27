import { Component, inject, signal } from '@angular/core';
import { CoinsService } from '../../../service-generico/coins-service';
import { cryptoResponse } from '../../interfaces/top-mover.interface';
import { RouterLink } from '@angular/router'
import { CurrencyPipe, PercentPipe, UpperCasePipe, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-top-movers',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, PercentPipe, UpperCasePipe, DatePipe],
  templateUrl: './top-movers.component.html'
})
export class TopMoversComponent {
  private api = inject(CoinsService);

  top4 = signal<cryptoResponse[]>([]);
  loading = signal(true);

  constructor() {
    this.api.loadTopMoverCryptos({ perPage: 50 })
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe(list => {
      const top4 = [...list]
        .filter(c => (c.total_volume ?? 0) > 10_000_000)
        .sort((a, b) =>
          (b.price_change_percentage_24h ?? -Infinity) -
          (a.price_change_percentage_24h ?? -Infinity)
        )
        .slice(0, 4);

      this.top4.set(top4);
    });
  }

  chipClass(pct?: number | null) {
  const v = pct ?? 0;
  return {
    'px-2 py-0.5 rounded text-xs font-semibold': true,
    'bg-green-100 text-green-700': v > 0,
    'bg-red-100 text-red-700': v < 0,
    'bg-gray-100 text-gray-600': v === 0
  };
}

// Abrevia 12340000 -> 12.3M
abbr(n?: number | null) {
  const v = n ?? 0;
  if (v >= 1e12) return (v/1e12).toFixed(2) + 'T';
  if (v >= 1e9)  return (v/1e9).toFixed(2) + 'B';
  if (v >= 1e6)  return (v/1e6).toFixed(2) + 'M';
  if (v >= 1e3)  return (v/1e3).toFixed(2) + 'K';
  return v.toFixed(0);
}

chipClassStr(pct?: number | null) {
  const v = pct ?? 0;
  const base = 'px-2 py-0.5 rounded text-xs font-semibold';
  const color = v > 0 ? 'bg-green-100 text-green-700'
              : v < 0 ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600';
  return `${base} ${color}`;
}
}
