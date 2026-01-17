# Variables d'environnement

## Fichier env.json

Homey utilise le fichier `env.json` à la racine du projet pour stocker les variables d'environnement.

**⚠️ Important** : Ce fichier est dans `.gitignore` car il peut contenir des secrets (clés API, tokens, etc.).

### Structure

```json
{
  "HOMEY_DEBUG": "false",
  "CLIENT_ID": "votre-client-id",
  "CLIENT_SECRET": "votre-secret"
}
```

### Variables disponibles

#### HOMEY_DEBUG
Active le mode debug pour voir tous les logs Zigbee.

- `"true"` : Active le mode debug (logs détaillés)
- `"false"` : Mode normal (par défaut)

### Utilisation dans le code

Les variables sont accessibles via `Homey.env.VARIABLE_NAME` :

```javascript
const DEBUG_MODE = Homey.env.HOMEY_DEBUG === 'true' || false;
```

### Alternative : Variables d'environnement système

Vous pouvez aussi définir les variables d'environnement directement dans le terminal :

**PowerShell (Windows)** :
```powershell
$env:HOMEY_DEBUG="true"
npx homey app run
```

**Bash/Linux/Mac** :
```bash
export HOMEY_DEBUG=true
npx homey app run
```

### Activer le mode debug

**Méthode 1 : Via env.json**
1. Modifiez `env.json` :
   ```json
   {
     "HOMEY_DEBUG": "true"
   }
   ```
2. Relancez l'app : `npx homey app run`

**Méthode 2 : Via variable d'environnement système**
```powershell
$env:HOMEY_DEBUG="true"
npx homey app run
```

### Note

Le fichier `env.json` est dans `.gitignore` pour éviter de committer des secrets. Créez-le localement si nécessaire.
