const express = require("express");
const router = express.Router();
const adminAuth = require("../../middleware/adminAuth");


router.post("/", async (req, res) => {
    
    try{
        res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "lax", 
    domain: ".kashmir-central.com",
    path: "/",
  });
        res.json({ message: "Logged out" });
    } catch(error){
        console.log(error.message)
        res.json(
            {message: "server side error"},
            { status : 500}
        )
    }
  
});

module.exports = router;