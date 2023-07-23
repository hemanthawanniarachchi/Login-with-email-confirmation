import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import connection from "../service/connection.js"

/** middleware for verify user */
export async function verifyUser(req, res, next){
    const { username } = req.method == "GET" ? req.query : req.body;
    //console.log(username);
    const sql =
    "SELECT * from user_credentials where username ='" + username + "'";
    //console.log(sql)
  try {
    connection.query(sql, function (err, result, fields) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else {
        if (!result.length > 0) {
          return res.status(404).send({ error: "Can't find the user" });
          
        }else{
          //next();
          return res.status(200).send(username);

        }
      }
    });
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error"});
  }
}


/** POST: http://localhost:8000/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "fname" : "bill",
  "lname": "william",
  "profile": ""
}
*/
export async function register(req,res){

    const data = req.body;
    console.log(data);
    const exist_email_sql = "Select email from user_credentials where email = '"+ data.email+"'";
    const exist_username = "Select username from user_credentials where username = '"+ data.username+"'";
   const user_register_sql = "INSERT INTO user_credentials (username , fname ,lname ,email ,password ,profile) " + "VALUES ('"+data.username+"','"+data.fname+"','"+data.lname+"','"+data.email+"','"+data.password+"','"+data.profile+"')";
   
  
    try {
     connection.query(exist_email_sql, function (exist_email_err, result_check_email, fields) {
         if (exist_email_err) {
             console.log(exist_email_err);
             res.status(500).send(exist_email_err);
         }
         else{
            // console.log(result_check_email[0])
             if(result_check_email.length >0){
                 return res.status(500).send("This email is already registered. Please login in.")
             }else
             {
                 connection.query(exist_username, function (exist_username_err, resul_check_username, fields) {
                     if (exist_username_err) {
                         console.log(exist_username_err);
                         return res.status(500).send(exist_username_err);
                     }else{
 
                         if(resul_check_username.length >0){
                             return res.status(200).send("This username is already taken. Please login in.")
 
                         }
                         else{
                             connection.query(user_register_sql, function (err, result, fields) {
                                 if (err) {
                                     console.log(err);
                                     return res.status(500).send(err);
                                 }else{
                                     return res.status(201).send("User registered successfully.")
                                 }
                             });
     
                         }
                        
                     }
                 });
             }
         }
     });
 
     
    } catch (error) {
     console.log(error)
     return res.status(500).send({error})
    }
}


/** POST: http://localhost:8000/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req,res){
    const data = req.body;
   
    const sql = "SELECT * from user_credentials where username ='"+ data.username+"'";
    connection.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            res.status(500).send({err});
        }else{
            if(result.length>0){
                if(result[0].password === data.password){
                   const token =  jwt.sign({
                        username:data.username,
                        email:data.email
                    }, process.env.JWT_SECRET_KEY, {expiresIn: "24h"})
                    return res.status(200).send({msg:"Login successful!",
                    username:data.username,
                    token
                });
                }else{
                    return res.status(500).send("Password did not matched")

                }
            }else{
                return res.status(500).send("Entered username doesn't exist")

            }
        }
    });
}


/** GET: http://localhost:8000/api/user/example123 */
export async function getUser(req,res){
    
    const { username } = req.params;
    try {
        if(!username) return res.status(501).send({error:"Invalid Username"});
        const sql = "SELECT * from user_credentials where username ='"+ username+"'";
        connection.query(sql, function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(500).send({err});
            }else{
                if(!result.length>0){
                    return res.status(501).send({error:"Could't find a user"})
                }else{

                    const {password, ...rest} = result[0];
                    return res.status(201).send(rest);
                }
            }
        });

    } catch (error) {
        return res.status(500).send({error:error});
    }

}


/** PUT: http://localhost:8000/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req,res){
    // try {
        
    //     // const id = req.query.id;
    //     const { userId } = req.user;

    //     if(userId){
    //         const body = req.body;

    //         // update the data
    //         UserModel.updateOne({ _id : userId }, body, function(err, data){
    //             if(err) throw err;

    //             return res.status(201).send({ msg : "Record Updated...!"});
    //         })

    //     }else{
    //         return res.status(401).send({ error : "User Not Found...!"});
    //     }

    // } catch (error) {
    //     return res.status(401).send({ error });
    // }
}


/** GET: http://localhost:8000/api/generateOTP */
export async function generateOTP(req,res){
    req.app.locals.OTP =  otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
  res.status(201).send({ code: req.app.locals.OTP, msg:"OTP" })   
}


/** GET: http://localhost:8000/api/verifyOTP */
export async function verifyOTP(req,res){
    const { code } = req.query;
    console.log(req.app.locals.OTP);
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
      req.app.locals.OTP = null; // reset the OTP value
      req.app.locals.otpSession = true; // start session for reset password
      return res.status(201).send({ msg: "Verify Successsfully!" });
    }
    return res.status(400).send({ error: "Invalid OTP" });
}


// successfully redirect user when OTP is valid
/** GET: http://localhost:8000/api/createResetSession */
export async function createResetSession(req,res){
    if(req.app.locals.otpSession){
        req.app.locals.otpSession=false;
        return res.status(201).send({ msg: "access granted!"})
    }
    return res.status(440).send({ msg: "Session expired"})

}


// update the password when we have valid session
/** PUT: http://localhost:8000/api/resetPassword */
export async function resetPassword(req,res){
    // try {
        
    //     if(!req.app.locals.resetSession) return res.status(440).send({error : "Session expired!"});

    //     const { username, password } = req.body;

    //     try {
            
    //         UserModel.findOne({ username})
    //             .then(user => {
    //                 bcrypt.hash(password, 10)
    //                     .then(hashedPassword => {
    //                         UserModel.updateOne({ username : user.username },
    //                         { password: hashedPassword}, function(err, data){
    //                             if(err) throw err;
    //                             req.app.locals.resetSession = false; // reset session
    //                             return res.status(201).send({ msg : "Record Updated...!"})
    //                         });
    //                     })
    //                     .catch( e => {
    //                         return res.status(500).send({
    //                             error : "Enable to hashed password"
    //                         })
    //                     })
    //             })
    //             .catch(error => {
    //                 return res.status(404).send({ error : "Username not Found"});
    //             })

    //     } catch (error) {
    //         return res.status(500).send({ error })
    //     }

    // } catch (error) {
    //     return res.status(401).send({ error })
    // }
}


