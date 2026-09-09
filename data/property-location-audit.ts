export type PropertyLocationAuditDecision = {
  location: string | null;
  previousLocation: string | null;
  evidence: string;
};

// Excepciones verificadas durante la auditoría integral del 08/09/2026.
// Las publicaciones no incluidas aquí se resuelven únicamente con una localidad
// explícita en el título o en el texto descriptivo de la propiedad.
export const propertyLocationAudit: Record<string, PropertyLocationAuditDecision> = {
  'REB-2026-011': { location: null, previousLocation: 'Colonia Hocker', evidence: 'La publicación solo dice que está sobre la colectora y el acceso a Colonia Hocker.' },
  'REB-2026-020': { location: null, previousLocation: 'Colonia Hugues', evidence: 'La publicación solo indica proximidad a la rotonda de acceso a Colonia Hugues.' },
  'REB-2026-021': { location: 'Ejido de Colón', previousLocation: null, evidence: 'Barrio Artalaz; otra publicación auditada identifica expresamente Barrio Artalaz como Ejido de Colón (REB-2026-010).' },
  'REB-2026-033': { location: 'Colón', previousLocation: null, evidence: 'Barrio El Ombú; publicaciones auditadas lo identifican expresamente en Colón (REB-2025-070 y REB-2022-050).' },
  'REB-2026-034': { location: 'San José', previousLocation: null, evidence: 'Parcelas dentro del Parque Acuático Laguna Azul; la publicación del mismo activo lo ubica expresamente en San José (REB-2026-067).' },
  'REB-2026-050': { location: 'Colón', previousLocation: null, evidence: 'Barrio El Ombú; publicaciones auditadas lo identifican expresamente en Colón (REB-2025-070 y REB-2022-050).' },

  'REB-2025-002': { location: null, previousLocation: 'Ejido de Colón', evidence: 'La ruta se describe como unión entre el ejido, la ciudad de Colón y Paysandú; no se precisa en qué tramo está el lote.' },
  'REB-2025-004': { location: 'Colón', previousLocation: null, evidence: 'Barrio Los Bretes; publicaciones auditadas lo identifican expresamente en Colón (REB-2024-045 y REB-2022-041).' },
  'REB-2025-006': { location: null, previousLocation: 'Colón', evidence: 'El campo está a 8,5 km de Colón; la distancia no demuestra que pertenezca a esa localidad.' },
  'REB-2025-013': { location: 'Colón', previousLocation: null, evidence: 'Barrio Los Bretes; publicaciones auditadas lo identifican expresamente en Colón (REB-2024-045 y REB-2022-041).' },
  'REB-2025-014': { location: 'Colón', previousLocation: null, evidence: 'Barrio Los Bretes; publicaciones auditadas lo identifican expresamente en Colón (REB-2024-045 y REB-2022-041).' },
  'REB-2025-042': { location: 'Colonia San Anselmo', previousLocation: 'Colón', evidence: 'El título ubica expresamente el campo en Colonia San Anselmo; Colón solo aparece como referencia de distancia.' },
  'REB-2025-058': { location: null, previousLocation: 'Colón', evidence: 'Solo dice que los lotes están frente a la Escuela Agrotécnica de Colón; no declara la localidad.' },
  'REB-2025-061': { location: 'Colón', previousLocation: null, evidence: 'Barrio El Ombú; publicaciones auditadas lo identifican expresamente en Colón (REB-2025-070 y REB-2022-050).' },
  'REB-2025-072': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'El título declara “zona rural de Colón”, normalizada con las publicaciones que usan “Ejido de Colón”.' },
  'REB-2025-076': { location: null, previousLocation: 'San José', evidence: 'Solo indica distancia a la ruta Colón-San José y una referencia comercial; no declara localidad.' },
  'REB-2025-082': { location: 'Ubajay', previousLocation: null, evidence: 'El título dice expresamente “Propiedad en Ubajay”.' },

  'REB-2024-006': { location: null, previousLocation: 'Colón', evidence: 'Ruta 135 km 11 sin localidad; “Colón” provenía exclusivamente del detector histórico.' },
  'REB-2024-011': { location: null, previousLocation: 'San José', evidence: 'Solo indica Ruta 130 Colón-San José y Puente Artalaz; no declara localidad.' },
  'REB-2024-022': { location: 'Colonia San Anselmo', previousLocation: 'Colón', evidence: 'El título ubica expresamente el campo en Colonia San Anselmo.' },
  'REB-2024-038': { location: null, previousLocation: 'Colón', evidence: 'Colón aparece únicamente como localidad deseada para una permuta, no como ubicación del inmueble.' },
  'REB-2024-050': { location: null, previousLocation: 'Colón', evidence: 'Las cabañas están sobre la ruta de acceso a Liebig; no se declara la localidad y Colón provenía del detector histórico.' },
  'REB-2024-052': { location: 'San José', previousLocation: 'Concepción del Uruguay', evidence: 'El título dice “Casa en San José”; Concepción del Uruguay aparece solo como destino deseado de permuta.' },
  'REB-2024-053': { location: null, previousLocation: 'Villa Elisa', evidence: 'La propiedad está sobre Ruta 130, a 10 km de Villa Elisa; la distancia no demuestra localidad.' },
  'REB-2024-054': { location: null, previousLocation: 'Colón', evidence: 'Solo consta la dirección Sourigues 606; Colón provenía exclusivamente del detector histórico.' },
  'REB-2024-055': { location: null, previousLocation: 'Colón', evidence: 'Solo consta Camping María del Luján, lote 70; Colón provenía exclusivamente del detector histórico.' },

  'REB-2023-009': { location: 'La Clarita', previousLocation: 'Colón', evidence: 'El título ubica expresamente la propiedad en La Clarita; Colón identifica al departamento provincial.' },
  'REB-2023-015': { location: null, previousLocation: 'Colón', evidence: 'Solo consta Barrio San Bernardo; Colón provenía exclusivamente del detector histórico.' },
  'REB-2023-016': { location: 'Pueblo Liebig', previousLocation: 'Colón', evidence: 'El título dice expresamente “Casa en Liebig”.' },
  'REB-2023-023': { location: null, previousLocation: 'Colón', evidence: 'Solo consta la dirección Combatientes de Malvinas 475; Colón provenía exclusivamente del detector histórico.' },
  'REB-2023-024': { location: null, previousLocation: 'Colón', evidence: 'Solo consta la dirección Conte Grand 409; Colón provenía exclusivamente del detector histórico.' },
  'REB-2023-027': { location: null, previousLocation: 'Colón', evidence: 'El lote está sobre el acceso a Pueblo Liebig; no se declara la localidad y Colón provenía del detector histórico.' },
  'REB-2023-032': { location: 'Colón', previousLocation: 'Colón', evidence: 'La dirección Conte Grand 280 coincide con la republicación REB-2025-024, cuyo título declara Colón.' },
  'REB-2023-035': { location: 'Villa Libertad', previousLocation: 'Colón', evidence: 'La dirección declara G.B.A., General San Martín y Villa Libertad; Colón solo figuraba en el pie institucional.' },

  'REB-2022-002': { location: null, previousLocation: 'San José', evidence: 'Solo indica Camino Viejo Colón-San José; además menciona Colón como destino de permuta, no como ubicación.' },
  'REB-2022-004': { location: 'Santa Teresita', previousLocation: 'Colón', evidence: 'La dirección dice expresamente “ciudad de Santa Teresita, provincia de Buenos Aires”; Colón es destino de permuta.' },
  'REB-2022-029': { location: 'Ejido de Colón', previousLocation: 'San José', evidence: 'Barrio Artalaz; una publicación auditada lo identifica expresamente como Ejido de Colón (REB-2026-010).' },
  'REB-2022-030': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'El título declara “zona rural de Colón”, normalizada con las publicaciones que usan “Ejido de Colón”.' },
  'REB-2022-033': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'El título declara “zona rural de Colón”, normalizada con las publicaciones que usan “Ejido de Colón”.' },
  'REB-2022-037': { location: null, previousLocation: 'Colón', evidence: 'Solo indica que Loteo La Concordia está a 10 minutos de Colón; no declara localidad.' },
  'REB-2022-040': { location: 'Colonia San José', previousLocation: 'San José', evidence: 'El título ubica expresamente la casa de campo en Colonia San José.' },
  'REB-2022-059': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'Barrio San Juan 1°; REB-2024-037 lo identifica expresamente como Ejido de Colón.' },
  'REB-2022-060': { location: null, previousLocation: 'San José', evidence: 'Solo indica que el departamento está a 300 metros de Termas San José; no declara localidad.' },

  'REB-2021-001': { location: null, previousLocation: 'San José', evidence: 'La publicación dice “entre Colón y San José”; no permite elegir una de las dos localidades.' },
  'REB-2021-003': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'Acceso a Barrio San Juan 1°; REB-2024-037 lo identifica expresamente como Ejido de Colón.' },
  'REB-2021-005': { location: null, previousLocation: 'San José', evidence: 'Solo indica Camino Viejo Colón-San José; no declara localidad.' },
  'REB-2021-008': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'Barrio Artalaz; REB-2026-010 lo identifica expresamente como Ejido de Colón.' },
  'REB-2021-025': { location: 'Federación', previousLocation: null, evidence: 'El título dice expresamente “Departamentos en Federación, Entre Ríos”.' },
  'REB-2021-031': { location: null, previousLocation: 'Colón', evidence: 'Colón aparece como destino de permuta y como referencia a 5 minutos; no como localidad del complejo.' },
  'REB-2021-034': { location: null, previousLocation: 'Colón', evidence: 'Solo indica que Loteo La Concordia está a 5 minutos de Colón; no declara localidad.' },
  'REB-2021-036': { location: 'Colón', previousLocation: null, evidence: 'Barrio Los Bretes; publicaciones auditadas lo identifican expresamente en Colón (REB-2024-045 y REB-2022-041).' },
  'REB-2021-042': { location: null, previousLocation: 'San José', evidence: 'Solo indica que los lotes están a 600 metros de Termas San José; no declara localidad.' },
  'REB-2021-044': { location: null, previousLocation: 'San José', evidence: 'Solo indica “acceso a San José por Camino Viejo”; no declara localidad.' },
  'REB-2021-046': { location: null, previousLocation: 'San José', evidence: 'El título dice expresamente “entre Colón y San José”; no permite elegir una localidad.' },

  'REB-2020-003': { location: null, previousLocation: 'San José', evidence: 'Solo indica Barrio Los Fresnos, a metros de Termas San José; no declara localidad.' },
  'REB-2020-009': { location: null, previousLocation: 'San José', evidence: 'Solo indica Ruta Colón-San José frente al Cicle Club; no declara localidad.' },
  'REB-2020-010': { location: null, previousLocation: 'Colón', evidence: 'Solo indica Ruta Colón-San José frente al Cicle Club Colón; no declara localidad.' },
  'REB-2020-011': { location: 'Ejido de Colón', previousLocation: null, evidence: 'Barrio San Juan 1°; REB-2024-037 lo identifica expresamente como Ejido de Colón.' },
  'REB-2020-012': { location: 'Ejido de Colón', previousLocation: null, evidence: 'Barrio San Juan 1°; REB-2024-037 lo identifica expresamente como Ejido de Colón.' },
  'REB-2020-014': { location: 'Ejido de Colón', previousLocation: 'San José', evidence: 'Barrio Artalaz; REB-2026-010 lo identifica expresamente como Ejido de Colón.' },
  'REB-2020-021': { location: 'San José', previousLocation: null, evidence: 'Pueblo Blanco; REB-2022-042 identifica expresamente una propiedad de Pueblo Blanco como San José.' },
  'REB-2020-022': { location: 'San José', previousLocation: null, evidence: 'Pueblo Blanco; REB-2022-042 identifica expresamente una propiedad de Pueblo Blanco como San José.' },
  'REB-2020-024': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'Barrio San Juan 1°; REB-2024-037 lo identifica expresamente como Ejido de Colón.' },
  'REB-2020-026': { location: 'Ejido de Colón', previousLocation: 'Colón', evidence: 'El título declara expresamente “zona Ejido Municipal Colón”.' },
};

export function auditedPropertyLocation(importId: string, derivedLocation: string | null) {
  return Object.prototype.hasOwnProperty.call(propertyLocationAudit, importId)
    ? propertyLocationAudit[importId].location
    : derivedLocation;
}
