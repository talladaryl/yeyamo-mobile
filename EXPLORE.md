# Explorer — contrats backend à prévoir

Ce document décrit uniquement les contrats nécessaires pour les fonctions Explorer ajoutées côté mobile. Le mobile n'appelle aucun endpoint non existant et n'affiche aucune proposition inventée.

## Ce qui est déjà fourni par le backend

- `GET /countries` fournit la liste affichée pour la zone Explorer et pour une nouvelle aventure. Le mobile trie seulement `CM` (Cameroun) en premier ; il ne contient pas de liste locale de pays.
- `GET /countries/{code}/cities` fournit les villes d'un pays.
- `PATCH /users/me/location` enregistre le pays, la ville et le fuseau de l'utilisateur.
- `GET /regions` fournit les régions visibles dans Explorer.
- `GET /categories` fournit les centres d’intérêt proposés dans le formulaire d’aventure.
- `GET /discovery/search`, `GET /discovery/trending` et les APIs événements actuelles peuvent continuer à alimenter Explorer, mais ils ne peuvent pas produire un itinéraire journalier selon tous les critères ci-dessous.

La page **Pays et zone** ne configure donc que le pays, la ville et la région Explorer. Les critères d'une aventure restent spécifiques à cette aventure ; ils ne modifient pas le profil.

## Contrat requis : création d’un plan d’aventure

Le backend doit exposer une ressource de planification. Le nom final de l’endpoint peut être adapté au domaine backend, mais son comportement doit respecter ce contrat. Exemple recommandé :

```text
POST /explore/adventure-plans
```

### Requête

```json
{
  "countryCode": "CM",
  "cityId": null,
  "regionId": null,
  "timezone": "Africa/Douala",
  "startDate": "2026-10-05",
  "endDate": "2026-10-20",
  "startTime": "09:00",
  "endTime": "17:00",
  "partyType": "SOLO",
  "interestCodes": ["events", "culture"],
  "budget": {
    "tier": "STANDARD",
    "minimumAmount": 5000,
    "maximumAmount": 20000,
    "currencyCode": "XAF"
  }
}
```

Règles obligatoires :

- `startDate` et `endDate` sont des dates locales ISO `YYYY-MM-DD` et sont **inclusives**. Si elles sont identiques, le plan contient exactement un jour.
- `startTime` doit être strictement antérieure à `endTime`, dans le fuseau du plan.
- `partyType` accepte uniquement `SOLO`, `FAMILY`, `FRIENDS`, `COUPLE`.
- `interestCodes` doit employer les mêmes codes stables que `GET /categories`.
- Le budget est comparé dans `currencyCode`. Le backend doit définir la conversion des prix dans une autre devise, la date du taux de change et le traitement des activités gratuites ou sans prix.
- Les résultats doivent respecter pays/ville/région, date, disponibilité, horaire, centres d’intérêt et budget avant tout classement de pertinence.

### Réponse

```json
{
  "planId": "uuid",
  "criteria": { "...": "critères normalisés réellement appliqués" },
  "days": [
    {
      "date": "2026-10-05",
      "dayNumber": 1,
      "recommendations": [
        {
          "recommendationId": "uuid",
          "sourceType": "EVENT",
          "sourceId": "uuid",
          "title": "Concert au palais des congrès",
          "description": "...",
          "coverImageUrl": "https://...",
          "startsAt": "2026-10-05T14:00:00+01:00",
          "endsAt": "2026-10-05T17:00:00+01:00",
          "price": { "amount": 10000, "currencyCode": "XAF" },
          "categoryCodes": ["events"],
          "detailPath": "/events/{sourceId}",
          "matchReasons": ["budget", "culture"]
        }
      ]
    }
  ]
}
```

Chaque recommandation doit référencer une ressource réelle (`sourceType` + `sourceId`). Le mobile ouvrira alors le détail réel correspondant ; il ne doit jamais recevoir un texte ou une carte fictive sans source vérifiable.

## Contrats requis : ignorer et remplacer une proposition

Quand une activité réelle est visible dans le planning, l’utilisateur doit pouvoir l’ignorer. Le backend doit mémoriser ce choix et renvoyer une alternative réelle, sans reproposer le même élément dans ce plan.

Exemple recommandé :

```text
POST /explore/adventure-plans/{planId}/recommendations/{recommendationId}/skip
```

Réponse attendue :

```json
{
  "date": "2026-10-05",
  "removedRecommendationId": "uuid",
  "replacement": { "recommendationId": "uuid", "sourceType": "PLACE", "sourceId": "uuid" }
}
```

Si aucune alternative n’existe, le backend doit répondre explicitement avec `replacement: null`, plutôt que de créer un résultat artificiel.

## Lecture et persistance

Pour retrouver un plan après fermeture de l’application ou sur un autre appareil, prévoir :

```text
GET /explore/adventure-plans/{planId}
GET /explore/adventure-plans?status=ACTIVE
```

Le mobile conserve actuellement le brouillon seulement le temps de la navigation, afin de présenter le planning sans prétendre qu’il est sauvegardé côté serveur. Lors de l’implémentation backend, la réponse de création doit devenir la source de vérité et être enregistrée dans l’application par `planId`.

## État mobile actuel

Le parcours mobile collecte réellement : pays, dates, heures, participants, catégories et budget. Il crée les onglets de jours inclusifs (par exemple du 5 au 20 octobre : Jour 1 à Jour 16). Tant que les contrats ci-dessus ne sont pas disponibles, chaque journée affiche volontairement « Suggestions en attente » et aucune action Ignorer/Détail factice.
