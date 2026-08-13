import type { CampaignObjective, PromotedEntityType } from './types';

export type SuggestedCampaignAction = {
  label: string;
  recommended?: boolean;
};

/**
 * Suggestions derive only from the resource and campaign objective already
 * accepted by campaign-service. They never fabricate a destination URL.
 */
export function getSuggestedCampaignActions(context: {
  promotedEntityType: PromotedEntityType;
  objective: CampaignObjective;
}): SuggestedCampaignAction[] {
  switch (context.promotedEntityType) {
    case 'PLACE':
      return [{ label: 'Découvrir le lieu', recommended: true }, { label: 'Contacter' }];
    case 'EVENT':
      return context.objective === 'EVENT_TICKET_SALES'
        ? [{ label: 'Acheter un billet', recommended: true }, { label: 'Voir l’événement' }]
        : [{ label: 'Participer', recommended: true }, { label: 'Voir l’événement' }];
    case 'EXPERIENCE':
      return [{ label: 'Découvrir l’expérience', recommended: true }];
    case 'PARTNER_PROFILE':
      return [{ label: 'Découvrir', recommended: true }, { label: 'Suivre' }];
    case 'POST':
      return [{ label: 'Voir la publication', recommended: true }];
  }
}
