Créer une BDD nommée taskslist avec les tables : 
<br>tasks (id: "INT AUTO_INCREMENT PRIMARY KEY", name: "VARCHAR(255)", isDone: "BOOLEAN")
<br>users (id: "INT AUTO_INCREMENT PRIMARY KEY", email: "VARCHAR(100) NOT NULL UNIQUE", password: "VARCHAR(255) NOT NULL",token: "VARCHAR(100) NOT NULL UNIQUE")
<br>Fichier .sql ajouté dans le dossier backend pour plus de simplicité
<br>
<br>Initialiser le backend : npx nodemon express.js
<br>Initialiser le fronted : npm start (choisir un port différent du backend)
<br>Frontend créé avec React, backend avec Node.js, utilisation de Postman pour vérifier les requêtes, BDD SQL

