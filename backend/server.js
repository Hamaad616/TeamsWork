const app = require("./app")
const connectDatabase = require("./db/database")


//Error handling
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server for handling uncaught excepton`)
})

//config
if(process.env.NODE_ENV !== 'PRODUCTION'){
    require("dotenv").config({
        path:"backend/config/.env"
    })
}

//connect database
connectDatabase();

//create server
const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})


//unhandled promise rejection
process.on("unhandledRejection", (error) => {
    console.log(`Shutting down the server for ${error.message}`)
    console.log(`Shutting down the server for handling promise rejection`)

    server.close(() => {
        process.exit(1);
    })

})