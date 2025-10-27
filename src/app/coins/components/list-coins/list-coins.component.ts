import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, PercentPipe, UpperCasePipe } from '@angular/common';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CoinsService, MarketsOrder, ORDER_OPTIONS } from '../../../service-generico/coins-service';
import type { cryptoResponse } from '../../../top-movers/interfaces/top-mover.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'list-coins',
  imports: [RouterLink, CurrencyPipe, PercentPipe, UpperCasePipe, DatePipe],
  templateUrl: './list-coins.component.html'
})
export class ListCoinsComponent {
private api = inject(CoinsService);
private route = inject(ActivatedRoute);
private router = inject(Router);


// ordenar monedas
orders = ORDER_OPTIONS;

setOrder(o: MarketsOrder) {
  if(this.order() === o) return;
  this.order.set(o);
  this.page.set(1);
  this.load();
}

load() {
  this.loading.set(true);
  this.api.getMarkets({
    vs: this.vs(),
    order: this.order(),
    page: this.page(),
    perPage: this.perPage()
  }).subscribe({
    next:(rows) => this.all.set(rows),
    error: (e) => console.error(e),
    complete: () => this.loading.set(false),
  });
}

sortByVolume(dir: 'desc' | 'asc') {
  const next = dir === 'desc' ? 'volume_desc' : 'volume_asc';
  if(this.order() === next) return;
  this.order.set(next);
  this.page.set(1);
}


// Buscador de monedas
  loading = signal(true);
  all = signal<cryptoResponse[]>([]);
  
  vs = signal<'usd' | 'ars'>(( this.route.snapshot.queryParamMap.get('vs') as any) ?? 'usd');
  page = signal(Number(this.route.snapshot.queryParamMap.get('page') ?? 1 ) || 1);
  perPage = signal(Number(this.route.snapshot.queryParamMap.get('per_page') ?? 75));
  order = signal<'market_cap_desc'|'market_cap_asc'|'volume_desc'|'volume_asc'|'id_asc'|'id_desc'>(
    (this.route.snapshot.queryParamMap.get('order') as any) ?? 'market_cap_desc'
  );
  
  q = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  searchMode = computed(() => this.q().trim().length >= 2);

  
  rows = computed(() => this.all());

  setQ(v: string) {
    this.q.set(v);
    this.page.set(1);
  }

  constructor() {
    effect(() => {
      if(this.searchMode()) return;
      const vs = this.vs(), page = this.page(), per = this.perPage(), order = this.order();
      
      this.loading.set(true);
      this.router.navigate([], {
        queryParams: {vs, page, per_page: per, order: this.order, q: this.q() },
        queryParamsHandling: 'merge',
        replaceUrl: true,
        relativeTo: this.route
      });
      
      this.api.getMarkets({vs, page, perPage: per, order})
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(list => this.all.set(list));
    });
    
    effect(() => {
      if (!this.searchMode()) return;         
      const vs = this.vs(), q = this.q().trim(), per = this.perPage();
      
      this.loading.set(true);
      this.router.navigate([], {
        queryParams: { vs, q, page: 1, per },
        queryParamsHandling: 'merge',
        replaceUrl: true,
        relativeTo: this.route
      });
      
      this.api.searchIds(q)
      .pipe(
        switchMap(ids => ids.length ? this.api.getMarkets({vs, ids, order : this.order() }) : of([])),
        finalize(() => this.loading.set(false))
      )
      .subscribe(list => this.all.set(list));
    });
    
  }

  chipClassStr(pct?: number | null) {
    const v = pct ?? 0;
    const base = 'px-2 py-0.5 rounded text-xs font-semibold';
    const color =
      v > 0
        ? 'bg-green-100 text-green-700'
        : v < 0
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600';
    return `${base} ${color}`;
  }

  abbr(n?: number | null) {
    const v = n ?? 0;
    if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
    if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return v.toFixed(0);
  }

  vsCurrency() {
    return 'usd';
  }

  canNext = computed(()=> this.rows().length === this.perPage());

  pages = computed(()=> {
    const p = this.page();
    const result: number[] = [];
    if(p > 1) result.push(p - 1);
    result.push(p);
    if(this.canNext()) result.push(p + 1);
    return result;
  })

  prev() {if(this.page()>1) this.page.update(p => p - 1); }
  next() { if (this.canNext()) this.page.update(p=> p + 1);}
  goTo(n:number) { if(n >= 1 && (n <= this.page() + 1 || this.canNext())) this.page.set(n);}
}
