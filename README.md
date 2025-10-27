# CryptoTracker — Angular (v17+)

Aplicación web construida con **Angular (nueva generación, standalone + signals)** que consume la **API pública de CoinGecko** para listar y explorar criptomonedas.

> En la página principal se muestran en detalle las **4 criptomonedas que más crecieron** y, debajo, el **listado completo** con paginado. Cada página muestra **75 resultados**.

---

## ✨ Características

* **Angular v17+** con builder `@angular/build:application`, componentes standalone y **Signals**.
* **Consumo de CoinGecko** (endpoint `coins/markets`).
* **Top 4**: sección destacada con las monedas que más crecieron.
* **Listado completo** con **paginado (75 por página)** para navegar todos los resultados.
* **Búsqueda por nombre** (no exacta): filtra por **coincidencia *contiene*** del texto ingresado.
* **Ordenamiento** asc/desc por: **market_cap**, **volumen** e **ids**.
* **Detalle por moneda**: precio actual, ranking, variación/crecimiento.
* **Conversor** de criptomoneda → **USD**.
* **Mejoras a futuro**: 
    gráfico de variación de precio.
    Spinner de carga.
    Modificar el active de la barra de menu.
---

## 🧱 Stack técnico

* **Angular 17+** (standalone APIs, Signals, Router, HttpClient)
* **TypeScript**, **RxJS**
* **Tailwind CSS** para estilos (utility-first)
* **CoinGecko API v3**

---

## 🔌 API utilizada (CoinGecko)

Endpoint base usado para el listado:

```
GET https://api.coingecko.com/api/v3/coins/markets
```

Parámetros típicos:

* `vs_currency`: moneda de referencia (ej: `usd`).
* `order`: criterio de orden (ej: `market_cap_desc`, `market_cap_asc`, `volume_desc`, `volume_asc`, `id_desc`, `id_asc`).
* `per_page`: **75**.
* `page`: número de página (1..n).
* `sparkline`: `false`.
* `price_change_percentage`: por ejemplo `24h` (si aplica para métricas de crecimiento).

> La **búsqueda por nombre** se realiza **desde el frontend** filtrando por coincidencia total sobre el nombre/símbolo.

---

## 🚀 Puesta en marcha (local)

### Requisitos

* **Node.js ≥ 20**
* **npm ≥ 10**
* **Angular CLI ≥ 18** (`npm i -g @angular/cli`)
* **Git**

### 1) Clonar el repositorio

```bash
git clone <URL-DEL-REPO>
cd <carpeta-del-repo>
```

### 2) Instalar dependencias

```bash
npm install
```

Dependencias (ver `package.json` para el detalle exacto):

* `@angular/*` (core, common, router, forms, platform-browser, etc.)
* `@angular/common/http`
* `tailwindcss`, `postcss`, `autoprefixer` (si ya están incluidos en el repo)
* rxjs

### 3) Levantar en desarrollo

```bash
# opción 1 (scripts del package.json, si existen)
npm run start

# opción 2 (Angular CLI)
ng serve -o
```

La app quedará disponible por defecto en **[http://localhost:4200](http://localhost:4200)**.

🙌 Agradecimientos

ASAP Consulting por darme la oportunidad de realizar esta capacitacion.

Profesor Marcelo Bettini por todos sus conocimientos compartidos.
