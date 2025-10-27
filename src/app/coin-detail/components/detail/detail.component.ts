import { Component, computed, effect, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CurrencyPipe, DecimalPipe, Location } from '@angular/common';
import { coinDetailService, CoinDetail } from '../../service/coin-detail.service';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


type RangePreset = {
  label: '24H' | '7D' | '30D' | '90D' | '1Y' | 'Max';
  days: string | number;
  interval?: 'daily' | 'hourly';
};

const PRESETS: RangePreset[] = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30, interval: 'daily' },
  { label: '90D', days: 90, interval: 'daily' },
  { label: '1Y', days: 365, interval: 'daily' },
  { label: 'Max', days: 'max', interval: 'daily' },
];

@Component({
  selector: 'detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './detail.component.html'
})
export class DetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(coinDetailService);
  private destroyRef = inject(DestroyRef); 
  private location = inject(Location);
  private router = inject(Router);

  loadingChart = signal(true);

  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  vsCurrency = signal<'usd' | 'ars'>('usd');
  ranges = PRESETS;
  selectedRange = signal<RangePreset>(this.ranges[1]);

  coins = this.api.getCoin(this.id);
  
  coin = signal<CoinDetail | undefined>(undefined);

  constructor() {
    this.coins
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(c => this.coin.set(c));
  }

  coinToFiat = signal(true);
  amount = signal(1);

  priceNow = computed(() => {
    const c = this.coin();
    if (!c) return 0;
    return c.market_data.current_price[this.vsCurrency()] ?? 0;
  });

  converted = computed(() => {
    const p = this.priceNow();
    const a = this.amount();
    if (!p) return 0;
    return this.coinToFiat() ? a * p : a / p;
  });

  swap() { this.coinToFiat.update(v => !v); }
  setRange(preset: RangePreset) { this.selectedRange.set(preset); }


  back() {
    if(window.history.length > 1) this.location.back();
    else this.router.navigate(['/menu', 'monedas'], { queryParamsHandling: 'preserve'})
  }

}
