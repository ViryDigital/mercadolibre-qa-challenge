# Desafío Técnico MercadoLibre

Este repositorio contiene un framework de automatización E2E con **Playwright** y **TypeScript** para validar un flujo de búsqueda en **MercadoLibre México**.

---

## Tecnologías utilizadas

- Playwright Test
- TypeScript
- Node.js
- GitHub Actions
- Playwright HTML Reporter

---

## Flujo automatizado

El test implementado realiza el siguiente flujo:

1. Abre MercadoLibre.
2. Selecciona México.
3. Busca `playstation 5`.
4. Aplica el filtro de condición `Nuevo`.
5. Intenta aplicar el filtro de ubicación `Ciudad de México` (ver notas).
6. Ordena los resultados por menor precio.
7. Extrae los primeros 5 productos únicos desde la UI.
8. Consulta la API pública de MercadoLibre.
9. Compara productos UI vs API.
10. Registra coincidencias y discrepancias de nombre/precio.

---

## Requisitos

- Node.js 20 o superior.
- npm.
- Git.
- Navegadores instalados por Playwright.

Versiones principales usadas en el proyecto:

```text
Playwright Test: ^1.59.1
TypeScript: incluido por Playwright
dotenv: ^17.4.2
Node types: ^25.6.2
```

Las dependencias exactas quedan controladas por el archivo:

```text
package-lock.json
```

---

## Instalación

Instalar dependencias del proyecto:

```bash
npm install
```

Instalar los navegadores requeridos por Playwright:

```bash
npx playwright install
```

Para entornos CI/CD se recomienda usar:

```bash
npm ci
npx playwright install --with-deps
```


---

## Ejecutar pruebas

### En modo headless

Ejecuta las pruebas en segundo plano, sin mostrar el navegador. Es el modo recomendado para CI/CD y ejecución automática.

```bash
npm test
```

### En modo headed

Ejecuta las pruebas mostrando el navegador, útil para depuración local.

```bash
npm run test:headed
```

---

## Ver reporte HTML

```bash
npm run test:report
```

---

## Variables de entorno

El proyecto incluye un archivo de ejemplo:

```text
.env.example
```

Este archivo sirve como plantilla para indicar qué variables necesita el proyecto. No se usa directamente para ejecutar las pruebas; cada quien puede crear su propio archivo `.env` local si necesita modificar valores por ambiente.

Variables esperadas:

```env
BASE_URL=https://www.mercadolibre.com
API_BASE_URL=https://api.mercadolibre.com
SITE_ID=MLM
```

En este proyecto, las variables permiten configurar:

- La URL base de MercadoLibre.
- La URL base de la API pública.
- El sitio de MercadoLibre correspondiente a México (`MLM`).

El archivo `.env` no se sube al repositorio porque puede contener datos sensibles. Por eso está incluido en `.gitignore`.

Si no se crea un archivo `.env`, el framework usa valores por defecto definidos en el código.

---

## Notas técnicas

El sitio web de MercadoLibre puede cambiar dinámicamente por ubicación, sesión, cookies, disponibilidad de filtros o pruebas A/B (el sitio muestra pequeñas variaciones de diseño, textos u orden de elementos a distintos usuarios).

El filtro de ubicación `Ciudad de México` puede no estar disponible en la UI en las ejecuciones. En ese caso, el framework registra un warning y continúa con el flujo, ya que forzar otro filtro como `Envío local` no representa exactamente la misma condición.

La API pública de MercadoLibre puede devolver `403`, lo que significa que la petición fue rechazada por el servidor. Cuando esto ocurre, el framework utiliza un archivo local con datos de prueba controlados (fixtures/api-search-playstation-5.json) para mantener la ejecución estable en CI y permitir validar la lógica de comparación UI vs API.

---

## CI/CD

El proyecto incluye un workflow de GitHub Actions en:

```text
.github/workflows/test.yml
```

Pipeline:

- Instala dependencias con `npm ci`.
- Instala navegadores de Playwright.
- Ejecuta pruebas en modo headless.
- Publica el reporte HTML como artifact de la ejecución del workflow.

Run exitoso de GitHub Actions:

https://github.com/ViryDigital/mercadolibre-qa-challenge/actions/runs/25605102843


---

## Estructura del proyecto

```text
mercadolibre-qa-challenge/
  .github/
    workflows/
      test.yml
  data/
    search-criteria.ts
  fixtures/
    api-search-playstation-5.json
  pages/
    home.page.ts
    search-results.page.ts
  services/
    mercado-libre-api.service.ts
  tests/
    mercadolibre-search.spec.ts
  utils/
    product-comparator.ts
    product-normalizer.ts
  .env.example
  .gitignore
  package.json
  package-lock.json
  playwright.config.ts
  README.md
  TEST_STRATEGY.md
```

---

## Resultado esperado

Al ejecutar:

```bash
npm test
```

El resultado esperado es:

```text
1 passed
```
