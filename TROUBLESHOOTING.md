# Dépannage - Problèmes d'icônes dans Homey

## Problème : Rectangle vert en pointillé au lieu de l'icône

Si vous voyez un rectangle vert en pointillé lors de l'appairage au lieu de l'icône du thermostat, cela indique généralement un problème de cache ou d'images.

## Solutions

### 1. Vider le cache Homey

#### Sur Homey (interface web)
1. Connectez-vous à l'interface web de Homey
2. Allez dans **Settings** → **Apps**
3. Trouvez votre app "Schneider Thermostat"
4. Cliquez sur **Uninstall** (désinstaller)
5. Attendez quelques secondes
6. Réinstallez l'app

#### Via SSH (si vous avez accès)
```bash
# Se connecter à Homey via SSH
ssh root@<adresse-ip-homey>

# Vider le cache des apps
rm -rf /data/.homey/cache/apps/*
rm -rf /data/.homey/cache/images/*

# Redémarrer Homey
reboot
```

### 2. Vérifier les images

Assurez-vous que les fichiers d'images existent :
- `drivers/schneider_thermostat/assets/images/small.png`
- `drivers/schneider_thermostat/assets/images/large.png`

**Dimensions recommandées :**
- `small.png` : 64x64 pixels minimum
- `large.png` : 256x256 pixels minimum

### 3. Reconstruire l'app

```bash
# Arrêter l'app en cours d'exécution
# Puis reconstruire
npx homey app build

# Redémarrer en mode développement
npx homey app run
```

### 4. Vérifier les chemins dans app.json

Les chemins doivent être relatifs à la racine de l'app :
```json
"images": {
  "small": "/drivers/schneider_thermostat/assets/images/small.png",
  "large": "/drivers/schneider_thermostat/assets/images/large.png"
}
```

### 5. Forcer le rechargement dans Homey

1. Dans l'app Homey, allez dans **Settings** → **Apps**
2. Trouvez "Schneider Thermostat"
3. Cliquez sur l'app
4. Cliquez sur **Restart** (redémarrer)
5. Attendez que l'app redémarre
6. Essayez à nouveau l'appairage

### 6. Vérifier les permissions des fichiers

Les images doivent être accessibles en lecture :
```bash
# Sur votre machine de développement
chmod 644 drivers/schneider_thermostat/assets/images/*.png
```

## Vérification rapide

Pour vérifier que tout est correct :

1. ✅ Les fichiers `small.png` et `large.png` existent dans `drivers/schneider_thermostat/assets/images/`
2. ✅ Les chemins dans `app.json` sont corrects
3. ✅ Les images ont les bonnes dimensions
4. ✅ L'app a été reconstruite après modification des images
5. ✅ Le cache Homey a été vidé

## Si le problème persiste

1. Vérifiez les logs Homey : **Settings** → **System** → **Logs**
2. Recherchez des erreurs liées aux images
3. Vérifiez que les images ne sont pas corrompues (ouvrez-les dans un éditeur d'images)
4. Essayez de remplacer les images par de nouvelles images de test

## Note importante

Homey met en cache les images des apps. Après avoir modifié les images ou la configuration, il est souvent nécessaire de :
1. Désinstaller l'app
2. Attendre quelques secondes
3. Réinstaller l'app
4. Ou redémarrer Homey complètement
