# Guide de test de l'app Schneider Thermostat

## 1. Vérifier l'installation

L'app devrait être installée dans Homey. Vérifiez dans :
- **Homey App** → **Settings** → **Apps** → Cherchez "Schneider Thermostat (CCTFR6400)"
- L'app devrait apparaître avec l'icône verte "APP"

## 2. Appairer le thermostat

### Étapes d'appairage :

1. **Retirez les piles** du thermostat
2. **Réinsérez les piles**
3. Quand l'écran **"Wiser"** apparaît, **appuyez simultanément sur les boutons + et - pendant 20 secondes**
4. Le thermostat redémarre et entre en mode appairage
5. Dans Homey :
   - **Devices** → **Add device**
   - Sélectionnez **"Schneider Thermostat (CCTFR6400)"**
   - Suivez les instructions d'appairage
   - Cliquez sur **"Next"** pour rechercher l'appareil
   - Le thermostat devrait apparaître dans la liste

## 3. Vérifier que le triangle disparaît

Après l'appairage, **regardez l'écran du thermostat** :
- ✅ **Triangle disparu** = Le thermostat détecte Homey comme hub
- ❌ **Triangle toujours visible** = Le thermostat ne peut pas communiquer avec Homey

### Si le triangle est toujours visible :

1. **Vérifiez les logs** dans le terminal où vous avez lancé `npx homey app run`
2. Cherchez des messages comme :
   ```
   [BoundCluster] Reading occupiedHeatingSetpoint: 2000
   [BoundCluster] Reading pIHeatingDemand: 0
   [BoundCluster] Reading systemMode: 4
   ```
3. Si vous ne voyez **aucun log** `[BoundCluster]`, le thermostat ne lit pas les attributs
4. Si vous voyez des logs, le thermostat communique mais il manque peut-être d'autres attributs

## 4. Tester les fonctionnalités

### Test 1 : Lire la température
- Dans Homey, ouvrez le device thermostat
- Vérifiez que la **température actuelle** s'affiche
- Elle devrait se mettre à jour automatiquement

### Test 2 : Changer la température depuis Homey
- Dans Homey, **modifiez la température cible** (target_temperature)
- **Regardez le thermostat** : la température affichée devrait changer dans les 5-10 secondes
- Le thermostat lit périodiquement le setpoint depuis Homey via binding

### Test 3 : Changer la température depuis le thermostat
- Sur le thermostat, **appuyez sur + ou -** pour changer la température
- Dans Homey, la température cible devrait se mettre à jour dans les 2-3 secondes
- Vous devriez voir dans les logs : `>>> SETPOINT FROM THERMOSTAT: 2100 = 21°C`

### Test 4 : Tester le mode thermostat
- Dans Homey, changez le **thermostat_mode** :
  - **"Heat"** → La flamme devrait s'afficher sur le thermostat
  - **"Off"** → La flamme devrait disparaître
- Le thermostat lit `pIHeatingDemand` périodiquement :
  - "Heat" = 100% (flamme allumée)
  - "Off" = 0% (flamme éteinte)

### Test 5 : Vérifier l'humidité et la batterie
- Dans Homey, vérifiez que **l'humidité** s'affiche
- Vérifiez que le **niveau de batterie** s'affiche

## 5. Activer les logs de debug

Pour voir plus de détails sur la communication :

```bash
# Dans le terminal, arrêtez l'app (Ctrl+C)
# Puis relancez avec le mode debug :
export HOMEY_DEBUG=true
npx homey app run
```

Ou dans PowerShell :
```powershell
$env:HOMEY_DEBUG="true"
npx homey app run
```

Avec le mode debug activé, vous verrez :
- Tous les événements Zigbee
- Les lectures d'attributs du BoundCluster
- Les commandes reçues du thermostat
- Les rapports du cluster wiserDeviceInfo

## 6. Vérifier les logs dans le terminal

Pendant que l'app tourne, regardez le terminal pour voir :

### Logs normaux (sans debug) :
```
[BoundCluster] Reading occupiedHeatingSetpoint: 2000
[BoundCluster] Reading pIHeatingDemand: 0
>>> SETPOINT FROM THERMOSTAT: 2100 = 21°C
```

### Logs avec debug activé :
```
[DEBUG] WISER ATTR: deviceInfo = {...}
[DEBUG] [thermostat] attr.occupiedHeatingSetpoint = 2000
[DEBUG] RAW FRAME: {...}
```

## 7. Problèmes courants

### Le triangle ne disparaît pas
- Vérifiez que le binding est bien établi (logs `Bound thermostat cluster as server`)
- Vérifiez que vous voyez des logs `[BoundCluster] Reading...`
- Le thermostat lit peut-être d'autres attributs non implémentés

### La température ne se synchronise pas
- Attendez 5-10 secondes (le thermostat poll périodiquement)
- Vérifiez les logs pour voir si le thermostat envoie des commandes
- Vérifiez que le device est en ligne dans Homey

### Le mode thermostat ne change pas la flamme
- Vérifiez que `thermostat_mode` est bien défini dans le driver
- Vérifiez les logs pour voir si `pIHeatingDemand` est lu
- Le thermostat lit `pIHeatingDemand` périodiquement, pas en temps réel

## 8. Commandes utiles

```bash
# Voir les apps installées
npx homey app list

# Voir les devices appairés
npx homey devices list

# Voir les logs en temps réel
npx homey app run

# Installer l'app depuis un fichier .homeyapp
npx homey app install .homeybuild/com.philippe.schneider-thermostat-0.0.1.homeyapp
```
