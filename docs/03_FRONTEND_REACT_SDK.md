# FRONTEND : MODULE REACT SDK

## Composant Principal : `<HagenLogisticsModule />`
Le composant doit être "Headless" ou posséder une UI adaptable via une prop `mode`.

## Spécifications du "Switch" UI :
- **Prop `mode="service"`** :
    - Affichage Timeline des rendez-vous.
    - Marqueurs simples sur la carte.
    - Focus sur l'heure d'arrivée et la durée de l'intervention.
- **Prop `mode="delivery"`** :
    - Affichage de cartes de colis.
    - Affichage de flèches de flux (A -> B) sur la carte.
    - Outils de scan (mockup) et signature.

## Intégration Cartographique :
- Utiliser **Leaflet.js** avec les tuiles OpenStreetMap.
- Pas de dépendance Google Maps.

## Tâches pour Claude :
- Créer le composant React avec un système de "Conditional Rendering" basé sur la prop `mode`.
- Implémenter le SDK PocketBase pour le rafraîchissement des positions en temps réel.
- Créer un bouton "Optimiser" qui déclenche l'appel à la Gateway et anime le changement d'ordre des éléments dans la liste.
