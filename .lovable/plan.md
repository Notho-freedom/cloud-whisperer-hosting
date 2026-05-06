J’ai vérifié le code et la base avant de proposer la suite. Le problème n’est pas seulement un bug isolé : il reste encore plusieurs zones qui affichent ou écrivent des données comme si le fournisseur avait réellement exécuté l’action, alors que l’action externe n’est pas confirmée.

Hypothèse confirmée : les tentatives précédentes ont échoué parce que certains flux ont été “branchés UI → base” mais pas “UI → fournisseur réel → confirmation → base”, et la base actuelle ne contient même pas encore la table `domain_orders` attendue par le webhook d’achat de domaine.

Ce que j’ai constaté concrètement :
- `domain_orders` n’existe pas dans la base Lovable Cloud, alors que le webhook Stripe de domaines l’utilise.
- La table `domains` contient déjà des domaines de test (`test.io`, `hostiq.io`) sans `planethoster_id`, donc pas prouvés comme achats réels.
- `src/api/domains.server.ts` contient encore explicitement un fallback synthétique avec `Math.random()`.
- `src/api/sites-api.ts` contient encore des erreurs “pas encore intégrée” pour DNS, variables d’environnement, domaines Vercel et `deployFromGithub`.
- `src/api/email-api.ts` bloque encore toute création de boîte mail avec “provisioning réel indisponible”.
- `provider-readiness.ts` marque encore DNS, email, config site et moyens de paiement comme non opérationnels.
- L’erreur PlanetHoster “reseller account has not whitelisted” est une erreur réelle du fournisseur : l’API PlanetHoster exige que l’IP appelante soit autorisée côté compte revendeur. Le code doit arrêter de masquer ça, l’exposer proprement, et ne jamais créer un domaine tant que le fournisseur n’a pas confirmé l’achat.

Plan d’exécution après approbation :

1. Remettre le projet en état buildable
   - Corriger les erreurs TypeScript actuellement signalées : imports manquants, types non sérialisables, handlers sans inputValidator, `useQuery` manquant, accès `deps.db` non typés.
   - Retirer les doublons dangereux `*.server.ts` / `*.ts` quand ils divergent, ou forcer les routes à utiliser uniquement les modules réellement utilisés.
   - Ne pas modifier les fichiers générés Lovable Cloud (`client.ts`, `client.server.ts`, `types.ts`).

2. Supprimer définitivement les fausses données et les fallbacks de simulation
   - Supprimer le fallback aléatoire dans `src/api/domains.server.ts`.
   - Rechercher et retirer toute logique `mock`, `simulation`, `synthetic`, `Math.random`, fallback fournisseur silencieux.
   - Ajouter une migration de nettoyage pour supprimer les domaines non prouvés par un identifiant fournisseur / une commande validée (`test.io`, `hostiq.io`, et équivalents de test).
   - La règle devient : si le fournisseur réel échoue, on affiche une erreur claire et on n’écrit pas de ressource “active”.

3. Réparer complètement le flux d’achat de domaine réel
   - Créer/appliquer la migration manquante `domain_orders` en base Lovable Cloud avec RLS.
   - Modifier le flux d’achat pour qu’un domaine ne soit jamais inséré dans `domains` au clic ni au checkout créé.
   - Le flux correct sera :
     ```text
     Recherche PlanetHoster réelle
       → disponibilité/prix réels
       → création d'une commande domain_orders en statut quoted
       → checkout Stripe réel
       → webhook Stripe confirmé
       → appel PlanetHoster register réel
       → seulement si succès fournisseur : insertion domains
       → si échec fournisseur : domain_orders failed + erreur visible, aucun domaine actif créé
     ```
   - Ajouter une page ou un état UI “Commandes de domaines” pour voir `quoted`, `checkout_created`, `payment_confirmed`, `completed`, `failed` avec le message fournisseur exact.
   - Transformer l’erreur “reseller account has not whitelisted” en message utilisateur propre : “PlanetHoster bloque l’appel API car l’adresse IP du serveur n’est pas autorisée sur le compte revendeur.”

4. Rendre le DNS réellement connecté ou honnêtement bloqué
   - Implémenter les endpoints PlanetHoster DNS réels : lecture de zone, ajout/modification de records, suppression si supportée par l’API.
   - Synchroniser `dns_records` depuis PlanetHoster au lieu d’être une simple table locale.
   - Si PlanetHoster bloque l’appel par whitelist, ne pas insérer de DNS local ; afficher l’erreur fournisseur et conserver l’état existant.
   - Mettre à jour l’UI DNS pour afficher “non synchronisé / erreur fournisseur” plutôt que “ajouté” si l’API n’a pas confirmé.

5. Finaliser le déploiement Vercel réel depuis GitHub
   - Corriger `createSite`, `deployFromGithub`, `redeploySite`, `listSiteDeployments` pour ne pas créer de faux projet si Vercel échoue.
   - Connecter le choix de dépôt GitHub dans l’UI de création de site : connexion GitHub, liste des repos, sélection du repo, framework, branche, variables d’environnement, puis création projet Vercel.
   - Appeler l’API Vercel réelle pour : création projet, lien GitHub, création déploiement, listing live des déploiements, récupération URL de preview/production.
   - Les déploiements ne seront écrits en base qu’après retour Vercel réel.
   - Corriger les webhooks Vercel pour mettre à jour un déploiement existant au lieu de dupliquer sans contrôle.

6. Brancher les variables d’environnement Vercel et domaines de site
   - Implémenter `upsertEnvVar` / `deleteEnvVar` avec l’API Vercel réelle, pas seulement la table locale.
   - Pour les secrets, stocker en base uniquement une valeur masquée ou un indicateur, pas le secret brut affichable.
   - Implémenter `addSiteDomain` / `removeSiteDomain` avec les endpoints Vercel réels.
   - Afficher les challenges de vérification Vercel si un domaine doit être vérifié.

7. Email professionnel : supprimer la promesse non réelle ou intégrer un vrai fournisseur disponible
   - Aujourd’hui, Gmail/Google Workspace, Microsoft 365 et Zoho sont listés mais aucun provisioning réel n’est implémenté.
   - Je vais retirer toute possibilité de “créer” une boîte fictive.
   - Je vais transformer l’écran en flux réel : fournisseur, domaine, boîte souhaitée, puis vérification de capacité.
   - Si aucun fournisseur de création de mailbox n’est réellement disponible avec les clés actuelles, l’UI affichera clairement “configuration fournisseur requise” et ne créera rien en base.
   - Si l’API PlanetHoster/World ou un autre fournisseur compatible mailbox est disponible dans les clés existantes, je l’intègre ; sinon il faudra ajouter les identifiants du fournisseur email réel choisi avant que la création de boîtes soit vendable.

8. Paiements et facturation
   - Conserver Stripe réel pour checkout et webhooks.
   - Vérifier que les abonnements payants n’écrivent la souscription qu’après webhook confirmé.
   - Pour moyens de paiement, remplacer les boutons “set default/remove” qui disent “pas encore intégré” par les vrais appels Stripe si un customer Stripe existe.
   - Si aucun customer Stripe n’existe encore, afficher une action “ajouter un moyen de paiement via Stripe Checkout/Portal” plutôt qu’un bouton qui échoue.

9. Diagnostics fournisseurs et endpoints testables
   - Ajouter des diagnostics admin réels : PlanetHoster pricing/availability, PlanetHoster DNS, Stripe API, Vercel projects/deployments, GitHub repos, Resend.
   - Chaque diagnostic retournera : `operational`, `blocked`, `misconfigured`, `provider_error`, avec le message fournisseur exact.
   - Ajouter une page admin “Santé fournisseurs” qui exécute ces checks et affiche les résultats sans rien simuler.

10. Tests et vérifications après corrections
   - Lancer les contrôles build/typecheck via le harness automatique après modifications.
   - Tester par appels serveur les endpoints publics : GitHub callback structure, Stripe webhook signature rejetée/acceptée selon cas, Vercel webhook signature rejetée/acceptée selon cas.
   - Tester les diagnostics fournisseurs depuis le runtime applicatif, pas depuis un script local, afin de reproduire les vraies conditions réseau/IP.
   - Tester les flux protégés avec les fonctions applicatives quand un token utilisateur est disponible ; sinon vérifier côté base et côté fournisseurs via diagnostics admin.
   - Documenter précisément ce qui est opérationnel, ce qui est bloqué par le fournisseur, et ce qui nécessite une clé/API supplémentaire.

Important : pour PlanetHoster, si l’erreur de whitelist persiste après correction du code, l’application sera techniquement correcte mais le fournisseur refusera toujours les appels. Dans ce cas, je ne remettrai pas de simulation : le flux indiquera clairement que l’API PlanetHoster bloque l’achat/la recherche tant que l’environnement d’appel n’est pas autorisé côté compte revendeur. Si tu veux basculer vers un autre registrar (ex. Porkbun/Namecheap), je préparerai l’adaptateur proprement, mais il faudra des clés réelles pour ce registrar.