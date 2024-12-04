# Sportify Backend - Système de Gestion des Événements Sportifs

## Vue d'ensemble du projet

Le **Sportify Backend** est une application construite avec **NestJS** pour la gestion des événements sportifs, des inscriptions des utilisateurs, et l'authentification. L'architecture du projet suit une approche modulaire, favorisant la scalabilité et la maintenabilité du code. Le backend utilise **MongoDB** pour la gestion des données et est conçu pour être facilement conteneurisé avec **Docker**.

---

## Table des matières

1. [Structure du projet](#structure-du-projet)
2. [Installation et configuration](#installation-et-configuration)
3. [Configuration de l'environnement](#configuration-de-lenvironnement)
4. [Modules](#modules)
    - [Module Auth](#module-auth)
    - [Module Événements](#module-événements)
    - [Module Inscriptions](#module-inscriptions)
5. [Schémas de base de données](#schémas-de-base-de-données)
6. [Points de terminaison de l'API](#points-de-terminaison-de-lapi)
7. [Gestion des erreurs](#gestion-des-erreurs)
8. [Configuration Docker](#configuration-docker)
9. [Notes supplémentaires](#notes-supplémentaires)
10. [Documentation de l'API (Postman)](#documentation-de-lapi-postman)

---

## 1. Structure du projet

```plaintext
src/
├── main.ts                     # Point d'entrée de l'application
├── app.module.ts               # Module racine
├── auth/                       # Logique d'authentification
│   ├── guards/                 # Garde pour l'authentification
│   ├── strategies/             # Stratégies d'authentification (JWT, etc.)
│   └── auth.module.ts          # Module Auth
├── events/                     # Gestion des événements
│   ├── dto/                    # Objets de Transfert de Données
│   ├── schemas/                # Schémas Mongoose
│   ├── events.controller.ts    # Contrôleur API REST
│   ├── events.service.ts       # Logique métier des événements
│   └── events.module.ts        # Module des événements
├── registrations/              # Inscriptions des utilisateurs
│   ├── dto/                    # Objets de Transfert de Données
│   ├── schemas/                # Schéma d'inscription
│   ├── registration.controller.ts
│   ├── registration.service.ts
│   └── registration.module.ts
└── common/                     # Utilitaires partagés
     ├── filters/                # Filtres d'erreurs
     ├── interceptors/           # Intercepteurs de réponse
     └── decorators/             # Décorateurs personnalisés
```

## 2. Installation et configuration

### Prérequis

- Node.js >= 16
- MongoDB installé localement ou accessible à distance
- Docker (facultatif pour la conteneurisation)

### Étapes

1. Cloner le dépôt :

    ```bash
    git clone https://github.com/erbaiy/Sportify_Back
    cd Sportify_Back
    ```

2. Installer les dépendances :

    ```bash
    npm install
    ```

3. Démarrer l'application en mode développement :

    ```bash
    npm run start:dev
    ```

4. Lancer les tests unitaires :

    ```bash
    npm run test        # Tests unitaires
    ```

## 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```plaintext
MONGODB_URI=mongodb://localhost:27017/votre_db
JWT_SECRET=your_jwt_secret
PORT=3000
```

## 4. Modules

### Module Auth

Le module Auth gère l'authentification des utilisateurs via des stratégies JWT. Il comprend les gardes et stratégies nécessaires pour protéger les routes sensibles de l'application.

### Module Événements

Le module Événements permet de gérer les événements sportifs (création, modification, suppression). Il inclut des contrôleurs et services pour traiter la logique métier des événements.

### Module Inscriptions

Le module Inscriptions gère l'enregistrement des participants aux événements sportifs. Il inclut les contrôleurs et services nécessaires pour l'inscription et la gestion des participants.

## 5. Schémas de base de données

### Schéma des Événements

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';


export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false })
  image?: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop()
  maxParticipants?: number; // Maximum number of participants allowed

  @Prop({ required: true })
  registrationDeadline: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Registration' }], // Link to registrations
  })

  
  @Prop({
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

```

### Schéma des Inscriptions

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'registrations',
})
export class Registration extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  })
  event: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  participantName: string;

  @Prop({
    type: String,
    required: true,
  })
  participantEmail: string;

  @Prop({ type: Date, default: Date.now })
  registrationDate: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Drop any existing indexes and create new ones
RegistrationSchema.index(
  { event: 1, participantEmail: 1 }, 
  { unique: true, background: true }
);
```

## 6. Points de terminaison de l'API

### Authentification

- `POST /auth/login` : Authentifie un utilisateur et renvoie un JWT.

### Événements

- `GET /events` : Récupère la liste de tous les événements.
- `POST /events` : Crée un nouvel événement.
- `PUT /events/:id` : Modifie un événement existant.
- `DELETE /events/:id` : Supprime un événement.

### Inscriptions

- `POST /registrations` : Inscrit un utilisateur à un événement.
- `PUT /registrations/:id` : Modifie l'inscription d'un utilisateur à un événement.
- `GET /registrations/:eventId` : Liste les participants inscrits à un événement.

## 7. Gestion des erreurs

Le système inclut un middleware pour gérer les erreurs de manière centralisée et renvoyer des messages d'erreur appropriés aux utilisateurs. Chaque erreur est capturée et un message détaillé est envoyé selon le type d'erreur (ex. validation, connexion à la base de données, etc.).

## 8. Configuration Docker

### Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

# Start the backend in development mode
CMD ["npm", "run", "start:dev"]

```

## 10. Documentation de l'API (Postman)

[Documentation Postman](https://documenter.getpostman.com/view/38125361/2sAYBa8ovP)

