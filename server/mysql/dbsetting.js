
const mysql = require('mysql');

require('dotenv').config();
const { sql_host, sql_user, sql_pw, sql_db, sql_port} = process.env;

//const fs = require('fs');
//const sql = fs.readFileSync('mysql/test.sql').toString();//동기식 읽기.

const pool = mysql.createPool({
    host     : sql_host,
    user     : sql_user,
    password : sql_pw,
    port     : sql_port,
    database : sql_db,
    //waitForConnections: true,
    multipleStatements: true, //프로시저 결과값 받아오기(필요)
    connectionLimit : 5,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    //timeout         : 60 * 60 * 1000,
  });

function getConnection(callback) {
  pool.getConnection(function (err, conn) {
    if(!err) {
      callback(conn);
    }else{
      console.log(err);
    }
  });
}

module.exports = getConnection;

