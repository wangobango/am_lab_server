import sqlite from 'sqlite3'
const sq = sqlite.verbose()


class DatabaseHelper {
  constructor() {
    this.db = new sq.Database('./database/my_db.db', sq.OPEN_READWRITE, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the on-disk SQlite database.');
    });
  }

  validateLogin(login) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var validateLogin = login.match(usernameRegex);
    if (validateLogin == null) {
      return ({ text: "Your name is not valid. Only characters A-Z, a-z and 0-9 are  acceptable.", val: false });
    } {
      return ({ text: "Your login is correct!", val: true })
    }
  }

  validateScore(score) {
    var usernameRegex = /^[0-9]+$/;
    var validateLogin = login.match(usernameRegex);
    if (validateLogin == null) {
      return ({ text: "Your score is not valid. Only characters 0-9 are  acceptable.", val: false });
    } {
      return ({ text: "Your score is correct!", val: true })
    }
  }

  initializeTables() {
    this.db.run(`CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name text UNIQUE NOT NULL,
      password text NOT NULL
    );`);

    this.db.run(`CREATE TABLE IF NOT EXISTS scores(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value INTEGER,
      user_id INTEGER NOT NULL,
      time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );`)
  }

  removeTables() {
    this.db.run('DROP TABLE IF EXISTS users;')
    this.db.run('DROP TABLE IF EXISTS scores;')
  }

  closeDb() {
    this.db.close();
  }


  getUserRecord(id) {
    let sql = `SELECT value FROM scores WHERE user_id = '${id}' AND value != 'undefined' ORDER BY value desc LIMIT 1;`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else if (rows.length > 0) {
          resolve(rows[0]);
        }
      })
    })
  }

  getUserIdByLogin(login, password) {
    let sql = `SELECT id FROM users WHERE name = '${login}';`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0].id);
        }
      })
    })
  }

  getUserLoginById(id, password) {
    let sql = `SELECT name FROM users WHERE id = '${id}' and password = '${password}';`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0].name);
        }
      })
    })
  }

  addNewUser(login, password) {
    let sql = `SELECT name FROM users WHERE name = '${login}' and password = '${password}';`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          // throw err;
        }

        if (rows == undefined) {
          this.db.run(`
            INSERT INTO users(name, password) VALUES('${login}', '${password}')
          `);
          resolve();
        }
        else if (rows.length == 0) {
          this.db.run(`
            INSERT INTO users(name, password) VALUES('${login}', '${password}')
          `);
          resolve();
        } else {
          console.log("User with given login already exists")
        }
      });
    })
  }

  login(login, password) {
    let sql = `SELECT * FROM users;`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.log("There is no user with given login");
          reject(err);
        }
        console.log(rows)
        if (rows.length > 0) {
          rows.forEach((row) => {
            if (row.name == login && row.password == password) {
              console.log("There is user with given login and password");
              resolve(row.id)
            }
          });
        }
        console.log("There is no user with given login");
        reject(err);
      });
    })
  }

  getTopScores() {
    let sql = `SELECT name,value,time FROM scores INNER JOIN users ON scores.user_id = users.id WHERE value != 'undefined' ORDER BY value DESC LIMIT 10;`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  addNewScore(user_id, value) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO scores (value, user_id) VALUES('${value}', ${parseInt(user_id)});
      `)
      resolve(true);
    })
  }

  updateScore(note_id, value) {
    this.db.run(`
      UPDATE notes SET value = ${value} WHERE id = ${note_id}
    `);
  }

  getAllUserScores(user_name) {
    const sql = `SELECT * FROM scores WHERE user_id IN(SELECT id FROM users WHERE name = '${user_name}' LIMIT 1) ;`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        resolve(rows);
      });
    })
  }

  getAllScores() {
    let sql = `SELECT * FROM scores;`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
      return rows;
    });
  }

  removeScoreById(note_id) {
    this.db.run(`
      DELETE FROM notes WHERE id = ${note_id};
    `);
  }

  getAllUsers() {
    let sql = `SELECT * FROM users;`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows);
      return rows;
    });
  }

}

export default DatabaseHelper