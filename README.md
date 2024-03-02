# VisualScripting
# ⚠️ CE PROJET EST PROTOTYPIQUE ⚠️ Se référer à la section "Limitations".

## Description

Ce projet est une alternative à Scratch qui offre une interface inspirée du blueprint d'Unreal Engine. Il a été entrepris car je trouve que Scratch utilise une approche peu ergonomique. De plus Scratch est interprété alors que ce projet converti d'abord le code en javascript avant l'executer, offrant une bien meilleure vitesse d'execution. L'objectif était donc de créer un langage de programmation visuel personnalisé en s'inspirant de Blueprint (ou Blot, pour Unity), que je considère personnellement comme plus ergonomique. Il est également possible de modifier le compilateur pour en faire un langage spécialisé dans la création de jeux vidéo (comme Scratch), dans l'automatisation (comme Node Red ou Tasker) et bien plus encore.

## Installation

Aucune étapes d'installation particulière est demandé. Il suffit donc seulement de :

1. Cloner ce dépôt sur votre machine locale.
```shell
git clone https://github.com/RaphaelNJ/VisualScripting.git
```
2. Lancer un navigateur Web et ouvrez le fichier `index.html`.

## Présentation

Le suivant est une présentation du fonctionnement et de l'utilisation de ce logiciel en l'état: 

https://github.com/RaphaelNJ/VisualScripting.js/assets/52333330/b8027943-e08a-4215-b9bd-185100055e05

## Limitations

Il est important de noter que ce projet n'est qu'un prototype et qu'il lui manque encore de nombreuses fonctionnalités. Il n'est pas prêt pour une utilisation en production, n'est pas optimisé et son code n'est pas proprement structuré. La médiocrité globale de ce projet ne sert donc pas d'exemple. Cependant, [une version finale de ce projet est en cours de développement](https://github.com/RaphaelNJ/vs_rs). JavaScript se verra remplacé par Rust grâce à la technologie WebAssembly. Toute la compilation sera gérée côté serveur. Les deux principales fonctionnalités manquantes dans ce projet, après l'optimisation, sont :

- L'ajout de fonctions. Pour l'instant, le projet ne supporte qu'une portée principale.
- L'ajout de variables. En effet, ce projet ne propose aucun support pour les variables.

## Fichiers

- VisualScripting.js : Code du moteur du language.
- index.js : Code du compilateur et exemple d'utilisation de l'API.

## Licence

Ce projet est sous licence [GPL 3.0](https://www.gnu.org/licenses/gpl-3.0.html)
