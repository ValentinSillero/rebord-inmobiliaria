# Auditoría de ubicaciones — 8 de septiembre de 2026

## Resultado ejecutivo

- Propiedades publicadas revisadas: **375**.
- Cobertura: 2020 (25), 2021 (36), 2022 (47), 2023 (42), 2024 (63), 2025 (83) y 2026 (79).
- Ubicación inicial “Colón”: **215**.
- Confirmadas como Colón dentro de ese grupo: **186**.
- Corregidas desde Colón a otra localidad o a “Sin especificar”: **29**.
- Correcciones totales, incluyendo otras ubicaciones y campos antes vacíos: **63**.
- Casos finales sin localidad suficientemente acreditada: **65**. Internamente continúan como `null`, no crean una opción de filtro y conservan intacta su dirección/descripción.

Se descartó `localidad_detectada` como fuente automática para los años históricos. La localidad se deriva del contenido que describe el inmueble, con prioridad para el título y para sublocalidades explícitas. Los casos de rutas, accesos, distancias, permutas y republicaciones están documentados por ID en `data/property-location-audit.ts`.

## Correcciones desde Colón

| Propiedad | Anterior | Nueva | Evidencia |
|---|---|---|---|
| REB-2025-006 — CAMPO EN VENTA | Colón | Sin especificar | Está a 8,5 km de Colón; la distancia no acredita localidad. |
| REB-2025-042 — CAMPO EN COLONIA SAN ANSELMO | Colón | Colonia San Anselmo | El título declara Colonia San Anselmo; Colón es referencia de distancia. |
| REB-2025-058 — LOTEO AGRO | Colón | Sin especificar | Solo dice “frente a Escuela Agrotécnica de Colón”. |
| REB-2025-072 — LOTE EN ZONA RURAL DE COLÓN | Colón | Ejido de Colón | “Zona rural de Colón”, normalizada como Ejido de Colón. |
| REB-2024-006 — LOCALES SOBRE RUTA 135 | Colón | Sin especificar | Solo consta Ruta 135 km 11; Colón provenía del detector histórico. |
| REB-2024-022 — CAMPO EN COLONIA SAN ANSELMO | Colón | Colonia San Anselmo | Localidad explícita en el título. |
| REB-2024-038 — PROPIEDAD EN VENTA O PERMUTA | Colón | Sin especificar | Colón es el destino deseado de la permuta. |
| REB-2024-050 — CABAÑAS EN ACCESO A LIEBIG | Colón | Sin especificar | “Acceso a Liebig” no declara una localidad. |
| REB-2024-054 — COMPLEJO DE UNIDADES | Colón | Sin especificar | Solo consta Sourigues 606; Colón provenía del detector histórico. |
| REB-2024-055 — LOTE EN CAMPING MARÍA DEL LUJÁN | Colón | Sin especificar | Solo consta el camping y lote 70. |
| REB-2023-009 — PROPIEDAD EN LA CLARITA | Colón | La Clarita | El título declara La Clarita; Colón es el departamento provincial. |
| REB-2023-015 — CASA EN BARRIO SAN BERNARDO | Colón | Sin especificar | No declara localidad; Colón provenía del detector histórico. |
| REB-2023-016 — CASA EN LIEBIG | Colón | Pueblo Liebig | Localidad explícita en el título. |
| REB-2023-023 — COMPLEJO DE UNIDADES | Colón | Sin especificar | Solo consta Combatientes de Malvinas 475. |
| REB-2023-024 — COMPLEJO TURÍSTICO | Colón | Sin especificar | Solo consta Conte Grand 409. |
| REB-2023-027 — LOTE SOBRE ACCESO A PUEBLO LIEBIG | Colón | Sin especificar | Un acceso no acredita la localidad. |
| REB-2023-035 — DEPARTAMENTO EN BUENOS AIRES | Colón | Villa Libertad | La dirección declara G.B.A., General San Martín y Villa Libertad. |
| REB-2022-004 — DEPARTAMENTO PH EN COSTA ATLÁNTICA | Colón | Santa Teresita | La dirección declara ciudad de Santa Teresita; Colón es destino de permuta. |
| REB-2022-030 — LOTE EN ZONA RURAL DE COLÓN | Colón | Ejido de Colón | “Zona rural de Colón”, normalizada como Ejido de Colón. |
| REB-2022-033 — CASA EN ZONA RURAL DE COLÓN | Colón | Ejido de Colón | “Zona rural de Colón”, normalizada como Ejido de Colón. |
| REB-2022-037 — CASAS EN LOTEO LA CONCORDIA | Colón | Sin especificar | Solo indica una distancia de 10 minutos a Colón. |
| REB-2022-059 — CASAS EN BARRIO SAN JUAN 1° | Colón | Ejido de Colón | REB-2024-037 identifica el barrio expresamente como Ejido de Colón. |
| REB-2021-003 — LOTES EN ACCESO A BARRIO SAN JUAN 1° | Colón | Ejido de Colón | Cruce con REB-2024-037. |
| REB-2021-008 — COMPLEJO EN BARRIO ARTALAZ | Colón | Ejido de Colón | REB-2026-010 identifica Barrio Artalaz como Ejido de Colón. |
| REB-2021-031 — COMPLEJO CERCA DE ESCUELA AGROTÉCNICA | Colón | Sin especificar | Colón es destino de permuta y referencia a cinco minutos. |
| REB-2021-034 — LOTEO LA CONCORDIA | Colón | Sin especificar | Solo indica una distancia de cinco minutos a Colón. |
| REB-2020-010 — DEPARTAMENTOS FRENTE AL CICLE CLUB | Colón | Sin especificar | Solo indica Ruta Colón-San José y una referencia al club. |
| REB-2020-024 — COMPLEJO EN BARRIO SAN JUAN 1° | Colón | Ejido de Colón | Cruce con REB-2024-037. |
| REB-2020-026 — CAMPO EN EJIDO MUNICIPAL COLÓN | Colón | Ejido de Colón | El título declara expresamente el ejido. |

## Otras correcciones

| Propiedad | Anterior | Nueva | Evidencia |
|---|---|---|---|
| REB-2026-011 — CAMPO SOBRE AUTOVÍA 14 | Colonia Hocker | Sin especificar | Solo indica la colectora y el acceso a Colonia Hocker. |
| REB-2026-020 — CAMPO SOBRE AUTOVÍA 14 | Colonia Hugues | Sin especificar | Solo indica proximidad a la rotonda de acceso. |
| REB-2026-021 — COMPLEJO EN BARRIO ARTALAZ | Sin especificar | Ejido de Colón | Cruce con REB-2026-010. |
| REB-2026-033 — LOTES EN BARRIO EL OMBÚ | Sin especificar | Colón | REB-2025-070 y REB-2022-050 identifican el barrio en Colón. |
| REB-2026-034 — LOTEO LAGUNA AZUL | Sin especificar | San José | Es parte del activo REB-2026-067, ubicado expresamente en San José. |
| REB-2026-050 — CASA EN BARRIO EL OMBÚ | Sin especificar | Colón | Cruce con REB-2025-070 y REB-2022-050. |
| REB-2025-002 — LOTE SOBRE RUTA 135 | Ejido de Colón | Sin especificar | La ruta une varios lugares y no precisa el tramo. |
| REB-2025-004 — LOTE EN LOS BRETES | Sin especificar | Colón | REB-2024-045 y REB-2022-041 identifican el barrio en Colón. |
| REB-2025-013 — PROPIEDADES EN LOS BRETES | Sin especificar | Colón | Cruce con REB-2024-045 y REB-2022-041. |
| REB-2025-014 — CASA EN LOS BRETES | Sin especificar | Colón | Cruce con REB-2024-045 y REB-2022-041. |
| REB-2025-061 — LOTE EN BARRIO EL OMBÚ | Sin especificar | Colón | Cruce con REB-2025-070 y REB-2022-050. |
| REB-2025-076 — COMPLEJO TURÍSTICO | San José | Sin especificar | Solo indica distancia a Ruta Colón-San José y un comercio. |
| REB-2025-082 — PROPIEDAD EN UBAJAY | Sin especificar | Ubajay | Localidad explícita en el título. |
| REB-2024-011 — LOTE SOBRE RUTA 130 | San José | Sin especificar | Ruta Colón-San José y Puente Artalaz no acreditan localidad. |
| REB-2024-052 — CASA EN SAN JOSÉ | Concepción del Uruguay | San José | El título declara San José; Concepción del Uruguay es destino de permuta. |
| REB-2024-053 — PROPIEDAD SOBRE RUTA 130 | Villa Elisa | Sin especificar | Solo indica que está a 10 km de Villa Elisa. |
| REB-2022-002 — CAMPO SOBRE CAMINO VIEJO | San José | Sin especificar | Camino Colón-San José sin localidad; Colón es destino de permuta. |
| REB-2022-029 — LOTE EN BARRIO ARTALAZ | San José | Ejido de Colón | Cruce con REB-2026-010. |
| REB-2022-040 — CASA EN COLONIA SAN JOSÉ | San José | Colonia San José | Localidad explícita en el título. |
| REB-2022-060 — DEPARTAMENTO CERCA DE TERMAS SAN JOSÉ | San José | Sin especificar | La distancia de 300 metros no acredita localidad. |
| REB-2021-001 — CAMPO ENTRE COLÓN Y SAN JOSÉ | San José | Sin especificar | El texto no permite elegir una localidad. |
| REB-2021-005 — COMPLEJO LA ARMONIOSA | San José | Sin especificar | Solo indica Camino Viejo Colón-San José. |
| REB-2021-025 — DEPARTAMENTOS EN FEDERACIÓN | Sin especificar | Federación | Localidad explícita en el título. |
| REB-2021-036 — CASA EN LOS BRETES | Sin especificar | Colón | Cruce con REB-2024-045 y REB-2022-041. |
| REB-2021-042 — LOTES CERCA DE TERMAS SAN JOSÉ | San José | Sin especificar | La distancia de 600 metros no acredita localidad. |
| REB-2021-044 — CAMPO EN ACCESO A SAN JOSÉ | San José | Sin especificar | Un acceso no acredita la localidad. |
| REB-2021-046 — CAMPO ENTRE COLÓN Y SAN JOSÉ | San José | Sin especificar | El texto no permite elegir una localidad. |
| REB-2020-003 — CASA Y DÚPLEXS EN LOS FRESNOS | San José | Sin especificar | Solo indica proximidad a Termas San José. |
| REB-2020-009 — COMPLEJO SOBRE RUTA COLÓN-SAN JOSÉ | San José | Sin especificar | La ruta y el Cicle Club no acreditan localidad. |
| REB-2020-011 — LOTE EN BARRIO SAN JUAN 1° | Sin especificar | Ejido de Colón | Cruce con REB-2024-037. |
| REB-2020-012 — LOTE ESQUINA EN BARRIO SAN JUAN 1° | Sin especificar | Ejido de Colón | Cruce con REB-2024-037. |
| REB-2020-014 — COMPLEJO EN BARRIO ARTALAZ | San José | Ejido de Colón | Cruce con REB-2026-010. |
| REB-2020-021 — DEPARTAMENTOS EN PUEBLO BLANCO | Sin especificar | San José | REB-2022-042 identifica Pueblo Blanco como San José. |
| REB-2020-022 — DEPARTAMENTOS EN PUEBLO BLANCO | Sin especificar | San José | Cruce con REB-2022-042. |

## Casos para revisión manual

Estos 65 registros se mantienen sin localidad. Se conserva toda dirección y descripción disponible.

- **2026 (10):** REB-2026-001, REB-2026-003, REB-2026-011, REB-2026-020, REB-2026-027, REB-2026-040, REB-2026-044, REB-2026-048, REB-2026-058 y REB-2026-059.
- **2025 (11):** REB-2025-001, REB-2025-002, REB-2025-006, REB-2025-027, REB-2025-030, REB-2025-051, REB-2025-058, REB-2025-067, REB-2025-076, REB-2025-077 y REB-2025-078.
- **2024 (7):** REB-2024-006, REB-2024-011, REB-2024-038, REB-2024-050, REB-2024-053, REB-2024-054 y REB-2024-055.
- **2023 (4):** REB-2023-015, REB-2023-023, REB-2023-024 y REB-2023-027.
- **2022 (3):** REB-2022-002, REB-2022-037 y REB-2022-060.
- **2021 (17):** REB-2021-001, REB-2021-005, REB-2021-009, REB-2021-022, REB-2021-031, REB-2021-033, REB-2021-034, REB-2021-035, REB-2021-037, REB-2021-038, REB-2021-039, REB-2021-040, REB-2021-042, REB-2021-043, REB-2021-044, REB-2021-045 y REB-2021-046.
- **2020 (13):** REB-2020-003, REB-2020-004, REB-2020-006, REB-2020-007, REB-2020-008, REB-2020-009, REB-2020-010, REB-2020-015, REB-2020-016, REB-2020-017, REB-2020-019, REB-2020-020 y REB-2020-025.

Motivos: dirección sin localidad explícita; barrio/loteo sin equivalencia comprobable; inmueble “entre” dos ciudades; ruta o acceso sin tramo; proximidad a una ciudad/termas; o localidad mencionada únicamente como destino de permuta. La lista detallada con título y dirección puede regenerarse desde `properties.filter(property => property.location === null)`.

## Localidades finales y cantidad

| Localidad | Propiedades |
|---|---:|
| Capilla del Monte | 1 |
| Colón | 193 |
| Colonia Hugues | 1 |
| Colonia San Anselmo | 2 |
| Colonia San José | 1 |
| Concepción del Uruguay | 3 |
| Ejido de Colón | 42 |
| Ejido de San José | 4 |
| El Brillante | 6 |
| Federación | 1 |
| La Clarita | 1 |
| La Paloma | 1 |
| Miramar | 1 |
| Pronunciamiento | 1 |
| Pueblo Liebig | 1 |
| San José | 42 |
| Santa Teresita | 1 |
| Ubajay | 3 |
| Villa Elisa | 4 |
| Villa Libertad | 1 |
| **Sin especificar (sin opción de filtro)** | **65** |

## Filtros y pruebas

- El filtro de ubicación se deriva de los valores finales reales. `Colonia Hocker` desapareció porque quedó sin propiedades acreditadas.
- Se verificaron las 20 localidades individualmente: cada filtro tiene resultados y ningún resultado pertenece a otra localidad.
- Se verificaron las opciones dependientes para Venta y Alquiler y las 310 propiedades con Operación + Tipo + Ubicación.
- Pruebas HTTP sobre el build de producción: `/propiedades` 375 resultados; Colón 193; San José 42; Villa Elisa 4; Concepción del Uruguay 3; Pueblo Liebig 1.
- Venta + Casa + Colón: 49 resultados; página 2 con 12 tarjetas, página 5 con una tarjeta y `page=999` redirigido a página 5.
- `npm.cmd exec -- tsx scripts/audit-property-locations.ts`: correcto.
- `npm.cmd run build`: correcto; compilación, tipos y 383 páginas generadas.

## Archivos de esta auditoría

- `data/property-location-audit.ts`: decisiones y evidencia por ID.
- `data/properties.ts`: aplicación de la decisión auditada y retiro del detector histórico como autoridad.
- `lib/property-filters.ts`: normalización canónica y prioridad de evidencia geográfica.
- `scripts/audit-property-locations.ts`: controles reproducibles de cobertura, normalización, filtros dependientes y paginación.
- `docs/auditoria-ubicaciones-2026-09-08.md`: este informe.

No se modificaron precios, títulos, fotos, descripciones, tarjetas, diseño ni otros contenidos. Tampoco se hizo `git push`.
