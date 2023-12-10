const mysql = require("mysql2");
require("dotenv").config();

exports.connect = () => {
    mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    })
    .connect((error)=>{
        if(error){
            console.log(error)
        }
        else{
            console.log("MySQL Connected.....")
        }
    })
};
