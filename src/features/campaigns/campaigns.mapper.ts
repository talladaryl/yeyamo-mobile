import type { CampaignDraft } from './campaign-draft.store';
import type { CreateCampaignRequest } from './types';

const list = (value: string) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const optionalNumber = (value: string) => value.trim() === ''
  ? null
  : Number(value);

function iso(value: string, endOfDay = false): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Les dates de début et de fin sont obligatoires.');
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  const parsed = new Date(dateOnly
    ? `${trimmed}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`
    : trimmed);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Date invalide : ${value}`);
  return parsed.toISOString();
}

export function campaignDraftToCreateRequest(
  draft: CampaignDraft,
): CreateCampaignRequest {
  const totalBudget = Number(draft.totalBudget);
  const dailyBudget = Number(draft.dailyBudget);
  if (!draft.name.trim()) throw new Error('Le nom de la campagne est obligatoire.');
  if (!draft.promotedEntityId.trim()) throw new Error("L'identifiant du contenu est obligatoire.");
  if (!(totalBudget > 0) || !(dailyBudget > 0)) {
    throw new Error('Les budgets doivent être strictement positifs.');
  }
  if (dailyBudget > totalBudget) {
    throw new Error('Le budget journalier ne peut pas dépasser le budget total.');
  }
  if (![draft.title, draft.description, draft.imageUrl].some((value) => value.trim())) {
    throw new Error('La création doit contenir au moins un titre, une description ou une image.');
  }

  return {
    name: draft.name.trim(),
    objective: draft.objective,
    promotedEntityType: draft.promotedEntityType,
    promotedEntityId: draft.promotedEntityId.trim(),
    billingModel: draft.billingModel,
    totalBudget,
    dailyBudget,
    currency: 'XAF',
    startAt: iso(draft.startAt),
    endAt: iso(draft.endAt, true),
    targetConfiguration: {
      countryCodes: list(draft.countryCodes).map((code) => code.toUpperCase()),
      regionIds: [],
      cityIds: list(draft.cityIds),
      districtIds: [],
      latitude: null,
      longitude: null,
      radiusKm: null,
      minimumAge: optionalNumber(draft.minimumAge),
      maximumAge: optionalNumber(draft.maximumAge),
      interestIds: list(draft.interestIds),
      categoryIds: [],
      languageCodes: ['fr'],
      activeDays: [],
      startHour: null,
      endHour: null,
      excludedUserIds: [],
      frequencyCapPerUserPerDay: null,
      frequencyCapPerUserTotal: null,
    },
    creativeConfiguration: {
      title: draft.title.trim() || null,
      description: draft.description.trim() || null,
      imageUrl: draft.imageUrl.trim() || null,
      videoUrl: null,
      callToAction: draft.callToAction.trim() || null,
      destinationUrl: draft.destinationUrl.trim() || null,
    },
  };
}
