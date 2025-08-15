# Airlocker — README

Projet : Frontend **React**, Backend **Express + Prisma**, DB **PostgreSQL**  
Objectif : stockage/partage de fichiers (liens configurables, stats d’accès).

---

## 🧰 Prérequis
- Node.js ≥ 18  
- PostgreSQL ≥ 14  
- Git

---

## ⬇️ Récupérer le code
```bash
git clone <repo_url>
cd <repo_dir>
git checkout main
```

---

## 🗄️ Base de données (PostgreSQL)
Créer la base `airlocker` (ou via pgAdmin) :
```bash
psql -U postgres
CREATE DATABASE airlocker;
\q
```

---

## 🛠️ Backend (`server/`)

### a) Variables d’environnement
Créer `server/.env` :
```env
DATABASE_URL="postgres://<user>:<password>@localhost:5432/airlocker"
JWT_SECRET="<secret>"
# PORT=3001   # (optionnel si configuré ailleurs)
```

### b) Installation & Prisma
```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
```

### c) Lancement de l’API Express
Local :
```bash
npm start
```

Production (PM2) :
```bash
pm2 start dist/server.js --name airlocker-api --env production
```

---

## 🖥️ Frontend (`client/`)

### a) Variables d’environnement
Créer `client/.env` :
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### b) Installation & exécution
Local :
```bash
cd client
npm install
npm start
```

Production (build statique) :
```bash
cd client
npm install
npm run build
```

---

## 🌐 Exemple de configuration Nginx (prod)
```nginx
server {
    listen 80;
    server_name mon-site.fr;

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /chemin/vers/client/build;
        index index.html;
        try_files $uri /index.html;
    }
}
```

---

## 📝 Notes rapides
- Port API attendu : **3001** (adaptez si différent).  
- Vérifiez que PostgreSQL est démarré et que `DATABASE_URL` cible bien `airlocker`.  
- En prod, servez le frontend via Nginx et proxyez l’API sur `/api/`.
