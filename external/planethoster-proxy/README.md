# Hostiq — Proxy PlanetHoster

Petit serveur Node Express à déployer **sur votre hébergement PlanetHoster**
(par exemple `hostiq.genesis-company.net`) pour contourner la restriction IP
de l'API revendeur PlanetHoster (« reseller account has not whitelisted »).

## 1. Installation locale (test)

```bash
cd external/planethoster-proxy
cp .env.example .env
# remplissez vos identifiants PlanetHoster + générez PROXY_SHARED_SECRET
npm install
npm start
```

Test : `curl http://localhost:3000/health` → `{"ok":true,...}`.

## 2. Déploiement sur PlanetHoster

1. **Créez un sous-domaine** dans cPanel (ex. `hostiq.genesis-company.net`)
   et activez l'application Node.js (>= 18) dessus.
2. **Uploadez** le contenu de ce dossier (`package.json`, `server.js`).
3. Dans le panneau "Setup Node.js App" :
   - **Application root** : le dossier que vous venez d'upload.
   - **Application startup file** : `server.js`.
   - **Environment variables** : ajoutez `PLANETHOSTER_API_USER`,
     `PLANETHOSTER_API_KEY`, `PROXY_SHARED_SECRET` (chaîne aléatoire longue).
4. Cliquez **NPM Install**, puis **Start App**.
5. Vérifiez : `curl https://hostiq.genesis-company.net/health`.

## 3. Configurer Hostiq

Dans Hostiq (Lovable Cloud → Secrets) ajoutez :

- `PLANETHOSTER_PROXY_URL` = `https://hostiq.genesis-company.net`
- `PLANETHOSTER_PROXY_SECRET` = la **même** valeur que `PROXY_SHARED_SECRET`

C'est tout : l'application Hostiq appellera désormais l'API PlanetHoster
via votre serveur, depuis l'IP de votre hébergement (déjà whitelistée
puisque c'est votre propre compte).

## Sécurité

- Toute requête doit présenter l'en-tête `X-Proxy-Secret` correct.
- N'exposez **jamais** publiquement les identifiants PlanetHoster.
- Pensez à régénérer le secret si vous suspectez une fuite.
