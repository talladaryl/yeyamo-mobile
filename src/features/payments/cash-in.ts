/**
 * Deployment-owned cash-in capability metadata.
 *
 * This deliberately has no default country or operator. A release may expose
 * a country/operator pair only after the selected provider has supplied its
 * contractual capability confirmation. Example build value:
 * {"CM":[{"id":"mtn","label":"MTN Mobile Money"}]}
 */
type CashInOperatorDefinition = { id: string; label: string };
type CashInCapabilityMap = Record<string, CashInOperatorDefinition[]>;

export type CashInOperator = string;

const CASH_IN_CAPABILITIES = parseCapabilities(
  process.env.EXPO_PUBLIC_CASH_IN_OPERATOR_CONFIG,
);

export function cashInOperatorsForCountry(countryCode?: string | null): CashInOperator[] {
  if (!countryCode) return [];
  return (CASH_IN_CAPABILITIES[countryCode.toUpperCase()] ?? []).map((operator) => operator.id);
}

export function cashInOperatorLabel(operator: CashInOperator): string {
  for (const operators of Object.values(CASH_IN_CAPABILITIES)) {
    const match = operators.find((candidate) => candidate.id === operator);
    if (match) return match.label;
  }
  return operator;
}

function parseCapabilities(raw: string | undefined): CashInCapabilityMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).flatMap(([country, entries]) => {
      if (!/^[A-Z]{2}$/i.test(country) || !Array.isArray(entries)) return [];
      const operators = entries.flatMap((entry): CashInOperatorDefinition[] => {
        if (!entry || typeof entry !== 'object') return [];
        const candidate = entry as { id?: unknown; label?: unknown };
        if (typeof candidate.id !== 'string' || !/^[a-z0-9_-]{2,32}$/i.test(candidate.id)
          || typeof candidate.label !== 'string' || !candidate.label.trim()) return [];
        return [{ id: candidate.id.toLowerCase(), label: candidate.label.trim() }];
      });
      return [[country.toUpperCase(), operators]];
    }));
  } catch {
    return {};
  }
}
