# Installation depuis un fichier .homeyapp

## Créer le fichier .homeyapp

### 1. Valider l'app (optionnel mais recommandé)
```bash
npx homey app validate
```

Cette commande vérifie que votre app est correctement configurée avant de la construire.

### 2. Construire l'app
```bash
npx homey app build
```

Cette commande va :
- Créer un fichier `.homeyapp` dans le dossier `.homeybuild/`
- Le fichier sera nommé : `com.philippe.schneider-thermostat-0.0.1.homeyapp`

### 3. Localiser le fichier
Après le build, le fichier se trouve dans :
```
.homeybuild/com.philippe.schneider-thermostat-0.0.1.homeyapp
```

## Installer dans Homey

> **Note** : Si l'option "Install from file" n'existe pas dans votre interface Homey, utilisez directement la **Méthode 2 (Mode développement)** qui est plus simple et ne nécessite pas de créer le fichier `.homeyapp`.

### Méthode 1 : Via l'interface web de Homey (si l'option existe)

1. **Ouvrir l'interface web de Homey** :
   - Allez sur `http://<adresse-ip-homey>` dans votre navigateur
   - Connectez-vous avec vos identifiants Homey

2. **Aller dans les Apps** :
   - Cliquez sur **Settings** (Paramètres)
   - Cliquez sur **Apps**

3. **Installer depuis un fichier** :
   - Dans la page Apps, cherchez un bouton **"+"**, **"Add"**, **"Install"** ou un menu déroulant
   - OU cherchez un onglet/option **"Local"**, **"Upload"**, **"From file"** ou **"Developer"**
   - OU faites un clic droit sur la page Apps et cherchez une option d'upload
   - Si vous ne trouvez pas l'option, utilisez la **Méthode 2** (mode développement) ci-dessous

4. **Sélectionner le fichier** :
   - Naviguez vers le fichier `.homeyapp` sur votre ordinateur
   - Sélectionnez le fichier : `com.philippe.schneider-thermostat-0.0.1.homeyapp`
   - Cliquez sur **"Open"** ou **"Upload"**

5. **Attendre l'installation** :
   - Homey va télécharger et installer l'app
   - Vous verrez une barre de progression
   - Une fois terminé, l'app apparaîtra dans la liste des apps installées

### Méthode 2 : Mode développement (plus simple et recommandé)

Si l'option "Install from file" n'existe pas dans votre interface Homey, utilisez le mode développement :

1. **Démarrer l'app en mode développement** :
   ```bash
   npx homey app run
   ```

2. **Dans Homey** :
   - Allez dans **Settings → Apps**
   - L'app "Schneider Thermostat" devrait apparaître automatiquement
   - Elle sera marquée comme "Development" (Développement)

3. **Avantages du mode développement** :
   - Pas besoin de créer le fichier `.homeyapp`
   - Les modifications sont rechargées automatiquement
   - Parfait pour tester et développer

4. **Inconvénients** :
   - L'app doit rester connectée à votre ordinateur
   - Si vous arrêtez `npx homey app run`, l'app ne fonctionnera plus

### Méthode 3 : Via l'app mobile Homey (si disponible)

1. **Ouvrir l'app Homey** sur votre téléphone/tablette

2. **Aller dans Settings → Apps**

3. **Chercher l'option d'upload** :
   - L'option peut ne pas être disponible sur mobile
   - Utilisez plutôt la méthode 2 (mode développement)

### Méthode 3 : Via SSH (avancé)

Si vous avez accès SSH à votre Homey :

```bash
# 1. Transférer le fichier vers Homey
scp .homeybuild/com.philippe.schneider-thermostat-0.0.1.homeyapp root@<adresse-ip-homey>:/tmp/

# 2. Se connecter à Homey
ssh root@<adresse-ip-homey>

# 3. Installer l'app
homey app install /tmp/com.philippe.schneider-thermostat-0.0.1.homeyapp
```

## Vérifier l'installation

1. **Dans Homey** :
   - Allez dans **Settings → Apps**
   - Vérifiez que "Schneider Thermostat" apparaît dans la liste
   - L'app devrait être marquée comme "Installed" (Installée)

2. **Tester l'appairage** :
   - Allez dans **Devices → Add device**
   - Sélectionnez "Schneider Thermostat"
   - Vérifiez que l'icône s'affiche correctement (plus de rectangle vert !)

## Désinstaller avant réinstallation

Si vous avez déjà une version installée et que vous voulez la remplacer :

1. **Désinstaller l'ancienne version** :
   - Settings → Apps → Schneider Thermostat
   - Cliquez sur **Uninstall** (Désinstaller)
   - Attendez 10-15 secondes

2. **Installer la nouvelle version** :
   - Suivez les étapes ci-dessus pour installer depuis le fichier `.homeyapp`

## Résolution de problèmes

### Le fichier .homeyapp n'est pas créé
- Vérifiez qu'il n'y a pas d'erreurs lors du `npx homey app build`
- Vérifiez que le dossier `.homeybuild/` existe
- Vérifiez les logs pour des erreurs

### L'installation échoue
- Vérifiez que vous avez la bonne version de Homey (>= 12.2.0)
- Vérifiez les logs Homey : Settings → System → Logs
- Assurez-vous que l'app n'est pas déjà installée (désinstallez-la d'abord)

### L'icône ne s'affiche toujours pas
- Vérifiez que vous avez bien ajouté la référence à `icon.svg` dans `app.json`
- Reconstruisez l'app : `npx homey app build`
- Désinstallez et réinstallez l'app
- Redémarrez Homey si possible

## Commandes rapides

```bash
# Valider et construire
npx homey app validate && npx homey app build

# Le fichier sera dans :
# .homeybuild/com.philippe.schneider-thermostat-0.0.1.homeyapp
```

## Note importante

Le fichier `.homeyapp` est un fichier ZIP contenant toute l'app. Vous pouvez le partager avec d'autres utilisateurs ou l'utiliser pour installer l'app sur plusieurs Homey.
