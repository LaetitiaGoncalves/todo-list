// Dépendances
const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mysql = require("mysql2");
const crypto = require("crypto");

//Connexion à la BDD

function get_connection_db() {
  const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.BDD_NAME,
  });

  return connection;
}

// Modèle MySQL

const Task = {
  tableName: "tasks",
  fields: {
    id: "INT AUTO_INCREMENT PRIMARY KEY",
    name: "VARCHAR(255)",
    isDone: "BOOLEAN",
  },
};

const User = {
  tableName: "users",
  fields: {
    id: "INT AUTO_INCREMENT PRIMARY KEY",
    email: "VARCHAR(100) NOT NULL UNIQUE",
    password: "VARCHAR(255) NOT NULL",
    token: "VARCHAR(100) NOT NULL UNIQUE",
  },
};

//S'authentifier

app.post("/signup", (req, res) => {
  let connection = get_connection_db();
  const { email, password } = req.body;

  //Générer le token

  const token = crypto.randomBytes(16).toString("hex");

  let insertUser = `INSERT INTO ${User.tableName} (email,password,token) VALUES (?,?,?)`;

  connection.query(
    insertUser,
    [email, password, token],
    function addUser(error, results, fields) {
      res.json(results);
      connection.close();
    }
  );
});

// Middleware de vérification de token, non utilisé pour simplifier mes vérifications de requêtes de connection à la BDD

const isAuthenticated = (req, res, next) => {
  const token = req.get("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    console.log("Token inexistant ou au mauvais format");
    return res.status(401).json({ error: "Unauthorized" });
  }

  //Retirer Bearer du token

  const finalToken = token.split(" ")[1].trim();
  console.log("Token reçu : ", finalToken);

  // Retrouver l'id du user avec le token fourni

  let connection = get_connection_db();
  let sql = `SELECT id FROM ${User.tableName} WHERE token = ?`;

  connection.query(
    sql,
    [finalToken],
    function getUserId(error, results, fields) {
      if (error) {
        console.error(
          "Erreur lors de la récupération de l'id utilisateur",
          error
        );
        return res.status(401).json({ error: "Unauthorized 1" });
      }

      if (results.length === 0) {
        console.log("Id de l'utilisateur non trouvé");
        return res.status(401).json({ error: "Unauthorized 2" });
      }

      const userId = results[0].id;
      console.log("Id de l'utilisateur trouvé : ", userId);

      // Vérifier que le token fourni est celui enregistré en BDD

      let connection = get_connection_db();
      let sql = `SELECT token FROM ${User.tableName} WHERE id = ?`;

      connection.query(
        sql,
        [userId],
        function isTokenValid(error, results, fields) {
          if (error) {
            console.error("Erreur de récupération du token", error);
            return res.status(401).json({ error: "Unauthorized 3" });
          }

          if (results.length === 0) {
            console.log("Token utilisateur non trouvé en bdd");
            return res.status(401).json({ error: "Unauthorized 4" });
          }

          const bddToken = results[0].token;

          if (bddToken == finalToken) {
            console.log("Token valide");
            next();
          } else {
            console.log("Token invalide");
            res.status(401).json({ error: "Unauthorized 5" });
          }
        }
      );
    }
  );
};

//Récupérer la liste de toutes les tâches

app.get("/tasks", (req, res) => {
  let connection = get_connection_db();
  let sql = `SELECT * FROM ${Task.tableName}`;

  connection.query(sql, function getTasks(error, results, fields) {
    if (error) {
      console.log("Erreur de récupération des tâches");
      res.status(500).json({ error });
    }
    res.json(results);
    connection.close();
  });
});

//Récupérer la liste de toutes les tâches non faites

//Route au final non utilisée dans le frontend, j'utilise la route app.put("/tasks/done/:id"
//et j'inverse l'affichage des tâches non faites avec tasks.filter((task) => !task.isDone)

app.get("/tasks/undone", (req, res) => {
  let connection = get_connection_db();
  let sql = `SELECT * FROM ${Task.tableName} WHERE isDone = 0`;

  connection.query(sql, function getTasksUndone(error, results, fields) {
    if (error) {
      console.log("Erreur de récupération des tâches non faites");
      res.status(500).json({ error });
    }
    res.json(results);
    connection.close();
  });
});

//Ajouter une tâche

app.post("/tasks", (req, res) => {
  let connection = get_connection_db();
  const { name } = req.body;
  const isDone = false;
  let sql = `INSERT INTO ${Task.tableName} (name, isDone) VALUES (?,?)`;
  connection.query(
    sql,
    [name, isDone],
    function addTasks(error, results, fields) {
      if (error) {
        console.log("Erreur d'ajout de taches");
        res.status(500).json({ error });
      }
      res.json(results);
      connection.close();
    }
  );
});

// Marquer une tâche à Done grâce à l'id de la tâche

//J'ai modifié mon code après avoir fait le front end, j'avais déclaré la tâche à done
// en faisant UPDATE ${Task.tableName} SET isDone = true WHERE id = ?`
//mais il est plus simple d'envoyer via le frontend le statut isDone true ou false, sinon le statut ne change pas en base de donnée en cochant/décochant les cases

app.put("/tasks/done/:id", (req, res) => {
  let connection = get_connection_db();
  const taskId = req.params.id;
  const { isDone } = req.body;
  let sql = `UPDATE ${Task.tableName} SET isDone = ? WHERE id = ?`;
  connection.query(
    sql,
    [isDone, taskId],
    function updateTaskAtDone(error, results, fields) {
      if (error) {
        console.log("Erreur de mise à jour de la tache");
        res.status(500).json({ error });
      }
      res.json(results);
      connection.close();
    }
  );
});

//Supprimer une tâche

app.delete("/tasks/:id", (req, res) => {
  let connection = get_connection_db();
  const taskId = req.params.id;
  let sql = `DELETE FROM ${Task.tableName} WHERE id = ?`;
  connection.query(sql, [taskId], function deleteTask(error, results, fields) {
    if (error) {
      console.log("Erreur de suppression de la tache");
      res.status(500).json({ error });
    }
    res.json(results);
    connection.close();
  });
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
