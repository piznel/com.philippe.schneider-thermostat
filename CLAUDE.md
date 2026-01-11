# Schneider CCTFR6400 Thermostat - Homey App

## Contexte du projet
Application Homey pour le thermostat Zigbee Schneider Electric CCTFR6400 (aussi connu sous le nom Wiser).

## Architecture de communication bidirectionnelle

### Homey → Thermostat (fonctionne)
- Utilise un **BoundCluster** : le thermostat LIT le setpoint depuis Homey via binding
- Le thermostat poll périodiquement `occupiedHeatingSetpoint` depuis Homey
- Fichier : `SchneiderThermostatBoundCluster.js`

### Thermostat → Homey (fonctionne)
- Le thermostat **NE PEUT PAS** envoyer le setpoint directement (confirmé par Z2M : "Reading (/get) this attribute is not possible")
- Solution : écouter les événements du cluster **65027 (0xFE03) wiserDeviceInfo**
- Fichier : `WiserDeviceInfoCluster.js`

## Messages wiserDeviceInfo (cluster 65027)

Format : `deviceInfo` attribute contient une string comma-separated

### Types de messages :
1. **UI,ActionName** - Actions utilisateur
   - `UI,ScreenWake` - Écran allumé
   - `UI,ScreenSleep` - Écran éteint
   - `UI,ButtonPressPlusDown` - Bouton + pressé
   - `UI,ButtonPressMinusDown` - Bouton - pressé
   - `UI,ButtonPressCenterDown` - Bouton central pressé (mode Boost)

2. **ENV,setpoint,temperature,humidity** - Données environnement (en centi-unités)
   - Exemple : `ENV,2650,2136,4214` = setpoint 26.5°C, temp 21.36°C, humidité 42.14%
   - Envoyé périodiquement, notamment après mise en veille de l'écran
   - Le setpoint est synchronisé s'il est valide (4-30°C), sinon ignoré (-32768 ou 0)

## Mode Boost (limitation connue)

Quand l'utilisateur appuie sur le bouton central, le thermostat entre en mode Boost.

**Problème** : Le thermostat ne communique jamais sa température de Boost (ni via ENV, ni via commande). Le setpoint de Homey écrasera le Boost lors du prochain poll.

**Comportement actuel** : Le mode Boost local du thermostat sera rapidement remplacé par le setpoint Homey. C'est une limitation hardware/firmware du thermostat CCTFR6400.

## Fichiers clés

- `device.js` - Logique principale, listeners, gestion boost mode
- `SchneiderThermostatBoundCluster.js` - BoundCluster pour que le thermostat lise le setpoint
- `SchneiderThermostatCluster.js` - Définition cluster thermostat avec commandes Schneider (0xE0, 0xE1)
- `WiserDeviceInfoCluster.js` - Définition cluster 65027 pour les événements UI

## Clusters Zigbee utilisés

- 0x0201 (513) - Thermostat (binding pour setpoint)
- 0x0402 (1026) - Temperature Measurement
- 0x0405 (1029) - Relative Humidity
- 0x0001 (1) - Power Configuration (batterie)
- 0xFE03 (65027) - wiserDeviceInfo (événements UI, données ENV)

## Points d'attention

1. Le setpoint est stocké en **centi-degrés** (2000 = 20.0°C)
2. Le setpoint est persisté via `setStoreValue('targetSetpointCenti', value)`
3. Les timers `_boostTimeout` et `_boostEnvTimeout` doivent être nettoyés correctement
4. Manufacturer ID Schneider : 0x105E

## Commandes pour développement

```bash
npx homey app run        # Lancer l'app en mode dev
npx homey app validate   # Valider l'app
npx homey app build      # Compiler l'app
```
