const { connection } = require("../config/pg-db.js");

function queryExecuter(query, values = [], {getRow = false} = {}) {
    return new Promise((resolve,reject) => {
      connection.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          if (result.rowCount > 0) {
            const response = result.rows.map((row) => ({ ...row }));
            resolve(response);
          } else if (getRow && result.rows) {
            resolve({rows: result.rows});
          }
          else {
            if (result.command === 'SELECT') {
              resolve([]); // Return an empty array for SELECT queries with no results
            } else {
              resolve(true); // Return true for UPDATE or DELETE queries
            }
          }
        }
      });
    });
}
  

module.exports = {queryExecuter};