//variables for pmysql and pool
var pmysql = require('promise-mysql')
var pool;

//creating pool for mysql
pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
})
    .then((p) => {
        pool = p
    })
    .catch((e) => {
        console.log("error with pool:" + e)
    })

//adding to store function
function addStore(sid, location, mgrid) {
    //returns a promise
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO store (sid, location, mgrid) VALUES (?, ?, ?)', [sid, location, mgrid])
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

//get product_store function
//returns promise and selects from product_store database
function getProduct_Store() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM product_store')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}
//gets stire via ID
function getStoreViaID(storeId) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM store WHERE sid = ?', [storeId])
        .then((data) => {
          if (data.length > 0) {
            resolve(data[0]); // Assuming store_id is unique
          } else {
            resolve(null); // Store not found
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  //update store function
  function updateStore(storeId, newData) {
    return new Promise((resolve, reject) => {
      // Extract the location and mgrid values from newData
      const { location, mgrid } = newData;
 
      // Perform the update query with location and mgrid
      pool.query('UPDATE store SET location = ?, mgrid = ? WHERE sid = ?', [location, mgrid, storeId])
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function getStore() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

  async function isManagerIn(mgrid) {
    try {
        const result = await pool.query('SELECT COUNT(*) AS count FROM store WHERE mgrid = ?', [mgrid]);
        return result[0].count > 0;
    } catch (error) {
        throw error;
    }
}

// function for getting product
function getProduct() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM product')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}



module.exports = { getProduct, getStore, getProduct_Store, updateStore, getStoreViaID, addStore, isManagerIn