# Module export

Module permetant d'ajouter de fonctionnalités d'export à l'application GéoNature

## Fonctionnalités principales
* Interface administrateur de gestion des exports
* Interface utilisateur permettant de réaliser des exports
* API d'Interrogation des exports
* Export nocture des exports [TODO]
* Export RDF au format Darwin-SW [TODO]


# Installation du module

## Configuration
### Mail
Le module d'export envoie des mails indiquant que l'export demandé est près. Pour cela il est nécessaire de configurer les paramètres mail dans la configuration générale de GéoNature (`config/geonature_config.toml`).

La configuration des mails utilise les paramètres définis pas Flask_mail. Pour avoir accès à l'ensemble des paramètres se référer à la [documentation complète](https://flask-mail.readthedocs.io/en/latest/).

```
[MAIL_CONFIG]
    MAIL_SERVER = "monserver.mail"
    MAIL_PORT = 465 # Si différent de 465 en SSL
    MAIL_USERNAME = "user@monserver.mail"
    MAIL_PASSWORD = "password"
    MAIL_DEFAULT_SENDER = "user@monserver.mail"
```

### Export RDF au format Darwin-SW
Le paramétrage du dossier dans lequel l'export RDF est généré, ce fait à l'aide de la clé "lod_export" du fichier de configuration.


## Commande d'installation
```
source backend/venv/bin/activate
geonature install_gn_module /PATH_TO_MODULE/gn_module_export exports
```

Pour avoir des exports disponibles il faut les renseigner au niveau de la base de données dans la table `gn_exports.t_exports`.

# Administration du module

## Création d'une nouvelle vue en base
Pour créer un nouvel export il faut au préalable créer une vue dans la base de données correspondante à l'export désiré.

Pour des questions de lisibilité il est conseillé de créer la vue dans le schéma `gn_export`

## Enregistrer l'export créé dans l'admin
L'interface d'administration est accessible dans Géonature via le menu `admin` puis `backoffice GeoNature`

Dans la rubrique Exports selectionner le menu Export puis cliquer sur create et renseigner les valeurs

## Associer les roles ayant la permission d'accéder à cet export

Aller sur la page : Associer roles aux exports

Puis créer des associations entre les rôles et l'export en question

```
Seul les roles ayant des emails peuvent être associé à un export exception faite des groupes
```

# Documentation swagger d'un export
Par défaut une documentation swagger est générée automatiquement mais il est possible de la surcharger en respectant certaines conventions.

1. Créer un fichier au format open api dévrivant votre export
2. Sauvegarder le fichier `geonature/external_modules/exports/backend/templates/swagger/api_specification_{id_export}.json`


# Export RDF au format Darwin-SW
Le module peut génèrer un export RDF au format Darwin-SW des données "Occtax" ( se baser sur "Synthèse" [TODO] ).


# Autres
CCTP de définition du projet - http://geonature.fr/documents/cctp/2017-10-CCTP-GeoNature-interoperabilite.pdf

A voir aussi : https://www.indigo-datacloud.eu

Ainsi que : https://fr.wikipedia.org/wiki/Syst%C3%A8me_d'information_taxonomique_int%C3%A9gr%C3%A9

Pour le volet Taxonomie, un travail expérimental a été réalisé : https://github.com/PnX-SI/TaxHub/issues/150
