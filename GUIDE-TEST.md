# 🧪 AfroPulse — Guide de test complet

**Date :** ___/___/2026  
**Testeur :** ___  
**Navigateur :** ___  
**Appareil :** ___

---

## 1. 🚀 Installation & prérequis

- [ ] Démarrer le serveur local : `npx serve -l 3000`
- [ ] Ouvrir `http://192.168.1.87:3000`
- [ ] Vider le cache : F12 → Clic droit recharger → **Vider le cache**
- [ ] Console F12 ouverte : aucune erreur rouge

---

## 2. 🏠 Homepage (`index.html`)

### Visuel
- [ ] Logo AfroPulse SVG affiché (cercle bleu-or + onde de pouls)
- [ ] Hero : "Votre compétence vaut de l'or"
- [ ] Compteur en ligne : nombre affiché
- [ ] Live feed : "Soyez le premier" OU liste de membres
- [ ] Section "Comment ça marche" (3 étapes)
- [ ] Section témoignages
- [ ] CTA final : "Commencer maintenant"

### Interactions
- [ ] Clic sur "Explorer le réseau" → `/talents.html`
- [ ] Clic sur "Commencer maintenant" → `/signup.html`
- [ ] Ticker fait défiler les activités

### i18n
- [ ] Clic sur "FR" → bascule tout en anglais
- [ ] Re-clic → retour en français

### Responsive
- [ ] Mobile : tout est lisible, pas de débordement
- [ ] Bottom nav visible

---

## 3. 📝 Inscription (`signup.html`)

### Formulaire Particulier
- [ ] Sélectionner "Particulier"
- [ ] 1 seul champ nom visible
- [ ] Remplir : nom, email, password (8 car., maj, min, chiffre)
- [ ] Pays → **"Choisir un pays…"** (pas pré-sélectionné)
- [ ] Choisir **Nigeria** → 40+ villes apparaissent
- [ ] Choisir **Lagos**
- [ ] Cocher les CGU
- [ ] Clic "Créer mon compte"

### Formulaire Entreprise
- [ ] Sélectionner "Entreprise"
- [ ] 3 champs apparaissent : raison sociale + responsable + RCCM
- [ ] Remplir avec des valeurs
- [ ] Compléter et envoyer

### Validation
- [ ] Sans pays → erreur + focus sur le champ
- [ ] Sans ville → erreur + focus
- [ ] Password trop court → erreur + focus
- [ ] Sans CGU → erreur

### Après inscription
- [ ] Écran "Vérifiez votre email"
- [ ] Email de confirmation reçu
- [ ] Lien dans l'email fonctionne

---

## 4. 📧 Confirmation email (`auth-callback.html`)

- [ ] Clic sur le lien dans l'email
- [ ] Console F12 → `[AUTH-CB] Session via hash/code`
- [ ] Icône verte ✅
- [ ] Prénom affiché ("Bienvenue Prénom !")
- [ ] Redirection auto vers `/dashboard.html` après 2,5s
- [ ] **Test 2e clic** sur le lien → "Lien déjà validé"

---

## 5. 🔐 Connexion (`login.html`)

- [ ] Email + password
- [ ] Clic "Se connecter"
- [ ] Redirection vers `/dashboard.html`
- [ ] Avatar visible en haut à droite

### Test email non confirmé
- [ ] Créer un compte, ne PAS confirmer
- [ ] Essayer de se connecter
- [ ] Bandeau jaune "Vérifiez votre email" apparaît
- [ ] Clic "Renvoyer" → toast succès

### Mot de passe oublié
- [ ] Clic "Mot de passe oublié ?"
- [ ] `/forgot-password.html` → email
- [ ] Email reçu
- [ ] Clic lien → `/reset-password.html`
- [ ] Nouveau password → "Mot de passe modifié !"
- [ ] Se connecter avec le nouveau

---

## 6. 🎨 Dashboard (`dashboard.html`)

- [ ] Hero : avatar + prénom + rôle
- [ ] 4 stats : Premium / Fiabilité / Portefeuille / Messages
- [ ] 4 actions rapides cliquables
- [ ] Messages récents (ou état vide)
- [ ] Contrats (ou état vide)
- [ ] Notifications

### Test i18n
- [ ] Cliquer FR → tout bascule EN
- [ ] Re-cliquer → retour FR

---

## 7. 👤 Profil (`profil.html`)

- [ ] Nom + email affichés
- [ ] Score de fiabilité en haut
- [ ] Avatar actuel
- [ ] Modifier : nom, métier, bio, téléphone
- [ ] Ajouter compétences (Tape + Entrée)
- [ ] Upload avatar → compression auto
- [ ] Upload CV PDF
- [ ] Clic "Enregistrer"
- [ ] Toast "Profil enregistré !"

---

## 8. 🎨 Talents (`talents.html`)

- [ ] Liste des profils (ou état vide)
- [ ] Recherche par nom
- [ ] Filtre par type (Particulier/Entreprise)
- [ ] Filtre par pays
- [ ] Clic sur une carte → `/profil-public.html?id=xxx`
- [ ] **Le profil s'affiche** (pas "introuvable")

---

## 9. 👥 Profil public (`profil-public.html`)

- [ ] Nom, job, ville affichés
- [ ] Badge rôle (Particulier/Entreprise)
- [ ] Score de fiabilité
- [ ] Bouton "Contacter" → `/messages.html?to=xxx`

### Test i18n
- [ ] Cliquer FR → tout bascule EN
- [ ] "Membre depuis" → "Member since"
- [ ] "Contacter" → "Contact"

---

## 10. 📋 Missions (`missions.html`)

- [ ] Liste des missions (ou état vide)
- [ ] Filtres : recherche, catégorie, localisation
- [ ] Clic "Postuler" → `/messages.html?to=businessId&prefill=...`
- [ ] Message pré-rempli

### Publier une mission (Entreprise)
- [ ] Connecté en entreprise
- [ ] Clic "Publier une mission" → `/publier-mission.html`
- [ ] Remplir tous les champs
- [ ] Clic "Publier"
- [ ] Toast succès
- [ ] Mission apparaît dans `/missions.html`

---

## 11. 💬 Messages (`messages.html`)

### Desktop
- [ ] Sidebar avec conversations
- [ ] Clic sur une conversation → chat
- [ ] Envoi message texte → apparaît en bleu à droite
- [ ] Bulles de l'autre partie → gris à gauche

### Mobile
- [ ] Ouvrir `/messages.html?to=xxx`
- [ ] Sidebar cachée, chat visible
- [ ] Zone de saisie **visible en bas** (pas cachée)
- [ ] Bouton retour fonctionne

### Vocal (Premium)
- [ ] Cliquer l'icône micro
- [ ] Si non Premium → popup "Passer Premium"
- [ ] Si Premium → enregistrement jusqu'à 2 min
- [ ] Envoi → bulle audio
- [ ] Play → audio joue

---

## 12. 💎 Abonnement (`abonnement.html`)

- [ ] Bannière statut (actif/essai/inactif)
- [ ] Cycle Mensuel / Annuel
- [ ] 4 plans affichés
- [ ] Pro a un badge "Populaire"
- [ ] Clic "Choisir Pro" → `/paiement.html?plan=pro&cycle=monthly&amount=5000`
- [ ] **Test essai gratuit** : si jamais utilisé → bouton "Activer l'essai"

---

## 13. 💳 Paiement (`paiement.html`)

- [ ] Récap plan + total
- [ ] 4 méthodes : Wave, Orange, Carte, Djamo
- [ ] Wave sélectionné par défaut
- [ ] Total 5 000 FCFA → Wave → 5 050 FCFA (+1%)
- [ ] Clic "Carte" → 5 150 FCFA (+3%)
- [ ] Remplir nom + téléphone + email
- [ ] Clic "Payer maintenant"
- [ ] Overlay "Redirection en cours…"
- [ ] Wave s'ouvre dans un nouvel onglet
- [ ] Redirection vers `/preuve-paiement.html?ref=AP-PRO-XXX`

---

## 14. 🧾 Preuve de paiement (`preuve-paiement.html`)

- [ ] Récap affiché avec ref cliquable
- [ ] Upload image (drag & drop ou clic)
- [ ] Aperçu + compression auto
- [ ] Note optionnelle
- [ ] Clic "Envoyer ma preuve"
- [ ] Écran succès avec ticket
- [ ] Countdown 5s → dashboard
- [ ] Bouton WhatsApp pré-rempli

---

## 15. 👑 Admin Premium (`12ad-premium.html`)

- [ ] Stats en haut (En attente / Approuvées / Rejetées / Revenu)
- [ ] Filtres : Toutes / En attente / Approuvées / Rejetées
- [ ] Recherche
- [ ] Demande de l'étape 14 visible
- [ ] Clic sur la carte → détails
- [ ] **Voir le reçu** → image s'affiche
- [ ] Clic "Approuver" → confirmation → validé
- [ ] Statut passe à **Approuvée**
- [ ] Vérifier dans Supabase → `user_premium` mis à jour
- [ ] Retour sur `/abonnement.html` → badge **Pro**

---

## 16. 🅰️ Admin Principal (`12ad.html`)

### Authentification
- [ ] Écran PIN → entre `1234`
- [ ] Déverrouillage OK

### Dashboard
- [ ] Stats : Membres / Missions / Premium / Retraits
- [ ] Bannière Premium avec badge count
- [ ] Derniers inscrits

### Navigation
- [ ] 13 onglets fonctionnent
- [ ] Tableau de bord
- [ ] Premium
- [ ] RCCM
- [ ] Retraits
- [ ] Litiges
- [ ] Utilisateurs
- [ ] Missions
- [ ] Contrats
- [ ] Plans
- [ ] FAQs
- [ ] Témoignages
- [ ] Statistiques
- [ ] Paramètres

### Test PIN
- [ ] Modifier PIN dans Paramètres
- [ ] Verrouiller → se reconnecter avec nouveau PIN

---

## 17. 💰 Portefeuille (`portefeuille.html`)

- [ ] Carte solde
- [ ] 3 stats : Disponible / En attente / Retiré
- [ ] Bannière affiliation
- [ ] Historique transactions
- [ ] Clic "Retirer" → modal
- [ ] Saisir montant + méthode + numéro
- [ ] Envoyer → toast succès
- [ ] Demande apparaît dans l'historique

---

## 18. 🎁 Affiliation (`affiliation.html`)

- [ ] Code unique affiché
- [ ] Lien de partage copiable
- [ ] 4 boutons de partage (WhatsApp, Telegram, LinkedIn, X)
- [ ] Progression vers 20 filleuls
- [ ] 3 paliers (20/40/100)
- [ ] Liste des filleuls (ou vide)

---

## 19. 🗺️ Carte (`carte.html`)

- [ ] Carte Leaflet s'affiche
- [ ] Markers avec avatars
- [ ] Sidebar avec liste des talents
- [ ] Recherche filtre les markers
- [ ] Clic sur un talent → zoom + popup
- [ ] Clic sur marker → popup avec lien profil
- [ ] Mobile : bouton bascule liste/carte
- [ ] Dark mode : tuiles inversées proprement

---

## 20. 📄 Pages légales

### `/conditions.html`
- [ ] Sommaire cliquable
- [ ] 11 sections
- [ ] i18n FR/EN
- [ ] Clic sur lien → scroll vers section

### `/confidentialite.html`
- [ ] 10 sections
- [ ] Mention RGPD
- [ ] i18n FR/EN

### `/mentions-legales.html`
- [ ] Éditeur : LMO SERVICES
- [ ] Directeur : Ladji Moussa Ouattara
- [ ] Hébergement : Netlify + Supabase
- [ ] i18n FR/EN

---

## 21. 🎨 Test i18n global

Sur **chaque page** :
- [ ] Cliquer FR → bascule en anglais
- [ ] Textes traduits (pas de clés brutes `nav.home`)
- [ ] Recharger → langue conservée
- [ ] Re-clic → retour français

---

## 22. 📱 Test responsive

Sur mobile (F12 → iPhone 12 et iPhone SE) :
- [ ] Header adapté
- [ ] Bottom nav visible
- [ ] Formulaires empilés
- [ ] Cartes en 1 colonne
- [ ] Modales plein écran
- [ ] Toasts au-dessus de la bottom nav
- [ ] Pas de scroll horizontal

---

## 23. 🎨 Test dark mode

- [ ] Clic sur l'icône lune
- [ ] Page bascule en sombre
- [ ] Recharger → mode conservé
- [ ] Inputs lisibles
- [ ] Contraste OK
- [ ] Tuiles carte inversées

---

## 24. 🚨 Bugs à signaler

| # | Page | Description | Priorité | Screenshot |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

**Priorité :** 🔴 Bloquant · 🟡 Important · 🟢 Nice-to-have

---

## 25. ✅ Validation finale

- [ ] Tous les parcours critiques OK
- [ ] Aucun bug bloquant
- [ ] Mobile + Desktop validés
- [ ] i18n FR/EN OK
- [ ] Prêt pour lancement public 🚀

---

**Signature testeur :** ___________  
**Date de validation :** ___/___/2026