# Estrategia de Pruebas

## ¿Qué NO automatizaría en este flujo y por qué?

No automatizaría login, verificación de cuenta, evasión de CAPTCHA, checkout, pagos ni compras reales contra MercadoLibre productivo. Son flujos con datos sensibles, controles de seguridad, riesgo transaccional o reglas protegidas por la plataforma. Automatizarlos contra un sitio real podría generar bloqueos, falsos negativos o efectos no deseados. Esos casos deberían cubrirse en ambientes autorizados, con cuentas de prueba, mocks o pruebas de API.

Tampoco haría aserciones estrictas sobre orden exacto de productos, stock o precios finales, porque cambian por ubicación, vendedor, promociones, cookies y pruebas A/B (variaciones de diseño, textos u orden de elementos para distintos usuarios).

## ¿Cómo manejaría un CAPTCHA en el flujo de búsqueda?

No intentaría evadirlo. Si MercadoLibre muestra CAPTCHA o verificación de cuenta, la prueba debe fallar con un mensaje claro indicando que el flujo fue bloqueado por un control de seguridad. En esta implementación se contempla la detección de verificación de cuenta para no ocultar el bloqueo.

Para CI, dejaría este E2E como una prueba smoke corta. Las validaciones más amplias las cubriría con pruebas más estables, como API o datos controlados. En un ambiente QA/Staging usaría usuarios de prueba y configuraciones permitidas para evitar bloqueos sin evadir la seguridad del sitio.

## ¿Qué riesgos de flakiness existen y cómo se mitigaron?

Riesgos principales: DOM dinámico, selectores cambiantes, filtros que no siempre aparecen, variación de productos/precios, cookies/sesión, pruebas A/B, latencia, bloqueos por demasiadas solicitudes, API pública respondiendo `403`, banners o verificación de cuenta.

Mitigaciones aplicadas: Page Object Model, localizadores por rol/texto cuando es posible, selectores CSS flexibles para resultados, auto-waiting de Playwright, assertions explícitas, sin esperas fijas como `waitForTimeout`, screenshots y traces en fallo, ejecución controlada en CI, reintentos limitados, manejo flexible del filtro de ubicación cuando no aparece y uso de datos de respaldo cuando la API responde `403`.

## ¿Qué cambiaría para integrarlo a un CI con más de 50 suites?

No ejecutaría todas las suites en cada commit. En pull requests correría solo smoke tests críticos; la regresión completa la dejaría para ejecuciones programadas o previas a release. Separaría pruebas UI E2E de pruebas de API que validen respuestas y estructura de datos, y clasificaría por tags como `@smoke`, `@regression`, `@api` y `@external`.

También reduciría la dependencia del sitio real, usaría datos de prueba estables, dividiría las pruebas en grupos para ejecutarlas más rápido, paralelismo controlado, guardaría los reportes solo por un tiempo limitado para no saturar el almacenamiento del CI y hacer seguimiento de pruebas inestables. Este test debería funcionar como una validación smoke externa, no como la base principal de toda la validación funcional.
