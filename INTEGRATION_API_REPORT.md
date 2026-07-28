# Rapport d'intégration API — YeYamo mobile

Date : 2026-07-27

## Portée et méthode

Validation effectuée par comparaison des appels React Native avec les contrôleurs backend, compilation TypeScript, ESLint, Expo Doctor et suites Maven des services concernés. Les 87 tests backend disponibles passent (campagnes 20, ticketing 3, commerce 6, ads 15, feed 20, staff 6, analytics 17).

Un test end-to-end sur une stack réelle n'a pas pu être exécuté : aucun conteneur n'est démarré et les variables `POSTGRES_PASSWORD`, `TICKET_QR_KEY_ID`, `TICKET_QR_PRIVATE_KEY_BASE64` et `TICKET_QR_PUBLIC_KEY_BASE64` ne sont pas configurées. Aucun compte/token partner, user et staff de test n'est fourni. Les lignes « contrat validé » ne doivent donc pas être confondues avec une recette réelle sur appareil.

## Parcours fonctionnels

| Endpoint | Écran | Payload | Status attendu | Résultat | Erreur éventuelle | Correction / décision |
|---|---|---|---:|---|---|---|
| `GET /api/v1/campaigns` | Publicité / campagnes | filtres `partnerId`, pagination | 200 | Contrat validé | Recette live non exécutée | Mapping enveloppe/page présent |
| `POST /api/v1/campaigns` | Création campagne | objectif, budget, dates, ciblage, destination | 200/201 | Contrat validé | Recette live non exécutée | Payload mappé depuis le draft |
| `GET /api/v1/campaigns/{id}` | Détail campagne | — | 200 | Contrat validé | 404 possible | État d'erreur et retry sans crash |
| `POST /api/v1/campaigns/{id}/submit` | Détail campagne | — | 200 | Contrat validé | 409/422 possibles | Erreur affichée, cache invalidé au succès |
| `POST /api/v1/campaigns/{id}/pause` | Détail campagne | — | 200 | Contrat validé | 403/409 possibles | Transition confirmée par le serveur |
| `POST /api/v1/campaigns/{id}/resume` | Détail campagne | — | 200 | Contrat validé | 403/409 possibles | Transition confirmée par le serveur |
| `GET /api/v1/analytics/partners/{partnerId}/campaigns/{id}` | Analytics campagne | `from`, `to`, `timezone`, page | 200 | Contrat validé | Analytics vide possible | Valeurs serveur conservées |
| `GET /api/v1/partners/{partnerId}/tickets/events/{eventId}/types` | Event partenaire / billets | — | 200 | Contrat validé | 401/403 | État vide/erreur contrôlé |
| `PUT /api/v1/partners/{partnerId}/tickets/configuration` puis `POST .../configurations/{id}/types` | Création VIP | configuration puis type VIP | 200/201 | Contrat validé | Création en deux appels non atomique | Le second appel utilise l'id du premier |
| Liste partenaire des commandes event | Commandes | page/statut | — | **Bloqué backend** | Aucun endpoint exposé | Le mobile retourne une erreur explicite, sans URL fictive |
| `GET /api/v1/analytics/partners/{partnerId}/ticket-events/{eventId}` | Analytics billetterie | période, timezone, page | 200 | Contrat validé | Recette live non exécutée | Totaux calculés sur dimensions `TOTAL` |
| `GET /api/v1/tickets/events/{eventId}/types` | Event public / billets | — | 200 | Contrat validé | 404/serveur indisponible | État retry, aucune donnée mock hors mode démo |
| `POST /api/v1/tickets/hold` | Checkout | event, type, quantité + `Idempotency-Key` | 200 | Contrat validé | 409 stock | Le 409 normalisé rafraîchit maintenant les disponibilités |
| `POST /api/v1/tickets/orders` | Checkout | `holdId`, `promotionCode` nullable | 200 | Contrat validé | 409/422 | Libération compensatoire du hold en cas d'échec |
| Paiement asynchrone | Checkout | événement outbox `payment.requested` | — | Contrat interne validé | Aucun endpoint mobile de paiement direct | Polling de la commande jusqu'au statut terminal |
| Émission billet | Checkout / Mes billets | événement de paiement confirmé | — | Contrat interne validé | Recette live Kafka non exécutée | Invalidation des billets sur statut payé/émis |
| `GET /api/v1/tickets/my-tickets` | Mes billets | statut optionnel | 200 | Contrat validé | 401/timeout | État vide/erreur et retry |
| `GET /api/v1/tickets/{ticketId}` | Mon billet | — | 200 | Contrat validé | 403/404 | Aucun QR affiché si billet non valide |
| `GET /api/v1/tickets/{ticketId}/qr` | Mon billet | — | 200 | Contrat validé | 403/404/timeout | Credential jamais journalisé, retry contrôlé |
| `POST /api/v1/tickets/scan` | Scanner | QR, event, gate, device, référence offline, date | 200 | Contrat + domaine validés | Accès refusé renvoyé dans le résultat métier | Réponse typée |
| `POST /api/v1/tickets/scan` (1er scan) | Scanner | QR valide | 200 `VALID` | Logique backend validée | Recette live QR non exécutée | Verrou pessimiste et passage atomique à `USED` |
| `POST /api/v1/tickets/scan` (2e scan) | Scanner | même QR | 200 `ALREADY_USED` | Logique backend validée | Recette live QR non exécutée | Premier scanner masqué |
| Historique détaillé scans | Scanner | page/statut | — | **Bloqué backend** | Seules les statistiques sont exposées | Erreur explicite ; aucune fausse route |
| `GET /api/v1/partners/{partnerId}/tickets/events/{eventId}/staff` | Staff event | — | 200 | Contrat validé | 403 | État erreur contrôlé |
| `POST /api/v1/partners/{partnerId}/staff/invitations` | Invitation staff | contact, roleId | 200/201 | Contrat validé | 409/422 possibles | Message sûr normalisé |
| `PUT /api/v1/partners/{partnerId}/tickets/events/{eventId}/staff/{assignmentId}/role` | Staff event | rôle | 200 | Contrat validé | 403/404 | Cache staff invalidé au succès |
| `DELETE /api/v1/partners/{partnerId}/tickets/events/{eventId}/staff/{assignmentId}` | Staff event | — | 204 | Contrat validé | 403/404 | Retrait après confirmation serveur |
| `POST /api/v1/commerce/partners/{partnerId}/promotions` | Création promotion | code, type/valeur, limites, dates, périmètre | 200/201 | Contrat validé | 409 code dupliqué, 422 période | Messages dédiés sans crash |
| `GET /api/v1/commerce/partners/{partnerId}/promotions` | Promotions | statut, page | 200 | Contrat validé | 403 | État vide/erreur et retry |
| Promotion dans commande ticket | Checkout | `promotionCode` | 200 | **Non supporté fonctionnellement** | `ticket-service` contient encore `TODO` et applique une remise nulle | Ne pas annoncer la remise dans le mobile |
| `GET /api/v1/commerce/partners/{partnerId}/finance/summary` | Finance | devise, période | 200 | Contrat validé | 403 | État verrouillé/erreur |
| `GET /api/v1/commerce/partners/{partnerId}/finance/transactions` | Finance | devise, période, page | 200 | Contrat validé | 403/timeout | Pagination backend utilisée |
| `GET /api/v1/commerce/partners/{partnerId}/finance/transactions/{id}` | Détail transaction | — | 200 | Contrat validé | 403/404 | État erreur, aucune exception de rendu |
| Feed + élément sponsorisé | Feed | région/contexte | 200 | Contrat service validé | Recette live non exécutée | Injection ads couverte par 9 tests feed |
| `POST /api/v1/ads/impressions` | Carte sponsorisée | token impression, date, durée | 200/204 | Contrat validé | Échec silencieux contrôlé | Token de tracking utilisé |
| `POST /api/v1/ads/clicks` | Carte sponsorisée | token click, date | 200/204 | Contrat validé | Échec réseau | Navigation destination découplée du tracking |
| Destination sponsorisée | Carte sponsorisée | destination reçue | — | Contrat UI validé | Destination invalide possible | Navigation seulement si destination supportée |

## Robustesse HTTP et réseau

| Cas | Résultat mobile | Statut |
|---|---|---|
| 401 | tentative unique de refresh ; purge session et redirection si refresh impossible | Validé par inspection/TypeScript |
| 403 | message d'autorisation sûr, écran reste monté | Validé par inspection |
| 404 | ressource introuvable, état vide/retry | Validé par inspection |
| 409 | message conflit ; checkout recharge le stock | Corrigé et compilé |
| 422 | erreurs de champs extraites si présentes, sans données techniques | Validé par inspection |
| 429 | message de limitation explicite | Validé par inspection |
| Timeout | timeout Axios 15 s, erreur réseau normalisée | Validé par inspection |
| Mode offline | requête rejetée et état erreur/retry ; aucun fallback mock hors mode démo | Validé par inspection |
| Serveur indisponible / 5xx | message générique sûr, aucun stacktrace/SQL exposé | Validé par inspection |

## Nettoyage des mocks

- Conservé : `src/features/campaigns/mockData.ts`, encore importé par `campaigns.service.ts` pour le mode démo.
- Supprimés après recherche globale sans import : `ticketing/mockData.ts`, `promotions/mockData.ts`, `finance/mockData.ts`, `partner-staff/mockData.ts`.
- Aucun mock historique hors de ces nouvelles fonctionnalités n'a été supprimé.

## Vérifications finales

- `npx tsc --noEmit` : succès, 0 erreur.
- `npx eslint . --ext .ts,.tsx` : succès, 0 erreur, 87 avertissements historiques.
- `npx expo-doctor` : 17/18. Le peer natif `react-native-svg` manquant a été installé. Le contrôle React Native Directory restant reçoit une réponse externe inattendue.
- Imports des quatre mocks supprimés : aucune occurrence.

## Conditions restantes pour une recette end-to-end réelle

1. Configurer les secrets Postgres et QR de Compose.
2. Démarrer la stack et fournir des comptes/tokens user, partner et staff avec leurs identifiants event/partner.
3. Fournir un moyen de paiement sandbox et Kafka opérationnel.
4. Ajouter côté backend la liste partenaire des commandes et, si souhaité, l'historique détaillé des scans.
5. Implémenter réellement la validation/application des promotions dans `ticket-service` avant de valider ce parcours.


