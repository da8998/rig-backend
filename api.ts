import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import morgan from "morgan";
import session from "express-session";
import axios from "axios";
import qs from "query-string";
import { FusionAuthClient } from "@fusionauth/typescript-client";
import packageJson from "./package.json" assert { type: "json" };

const api = express();

dotenv.config();

const port = process.env.API_PORT;

const client = new FusionAuthClient(process.env.API_KEY as string, "http://localhost:9011");

api.use(cors({
    origin: true,
    credentials: true,
  }), morgan("common"), express.json(),
  session({
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: "auto",
      httpOnly: false,
      maxAge: 3600000,
    },
  })
);

const config = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

const url: string = `http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/token`;

api.get("/oauth-callback", (req, res) => {
  const stateFromServer = req.query.state;
  const session: any = req.session;
  const username = req.query.username;
  const password = req.query.password;

  if (stateFromServer !== session.stateValue) {
    console.info("State doesn't match. uh-oh.");
    console.info(`Saw: ${stateFromServer}, but expected: &{req.session.stateValue}`);
    res.redirect(302, "/");
    return;
  }
  axios.post(url, qs.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "password",
        username: username,
        password: password
      }), config).then((result) => {
        session.token = result.data.access_token;
        res.redirect(`http://localhost:8080`);
    })
    .catch((error) => {
      console.error(error);
    });
});

api.get("/logout", (req, res) => {
    const session: any = req.session;
    session.destroy();
});

api.get("/login", (req, res) => {
  const session: any = req.session;

  const stateValue: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const username: any = req.query.username;
  const password: any = req.query.password;
  console.log(`${username} ${password}`);
  session.stateValue = stateValue;

  res.redirect(`http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&username=${username}&password=${password}&state=${stateValue}`);

  
});

api.post("/register", (req, res) => {
    client.register("", req.body).then((clientResponse) => {
        res.send(clientResponse);
    }).catch((error) => {
        console.error(error);
    })
});



api.get("/user", (req, res) => {
  const session: any = req.session;
  if (session.token) { 
    axios.post(`http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/introspect`, qs.stringify({
          client_id: process.env.CLIENT_ID,
          token: session.token,
        })
      ).then((result) => {
        let introspectResponse = result.data;
        if (introspectResponse) {
          axios.get(`http://localhost:${process.env.FUSIONAUTH_PORT}/api/user/registration/${introspectResponse.sub}/${process.env.APPLICATION_ID}`, {
                headers: {
                  Authorization: process.env.API_KEY,
                },
              }
            ).then((response) => {
              res.send({
                authState: "Authorized",
                introspectResponse: introspectResponse,
                body: response.data.registration,
              });
            }).catch((error) => {
              res.send({
                authState: "notAuthorized",
            });
              console.error(error);
              return;
          });
        } else {
          session.destroy();
          res.send({
            authState: "notAuthenticated",
          });
        }
      }).catch((error) => {
        console.error(error);
      });
      
    } else {
    res.send({
      authState: "notAuthenticated",
    });
    
  }
});

api.get("/logout", (req, res) => {
  const session: any = req.session;
  session.destroy();

  res.redirect(`http://localhost:${process.env.FUSIONAUTH_PORT}/oauth2/logout?client_id=${process.env.CLIENT_ID}`);
});


api.listen(port, () => {
  console.info(`Rig API v${packageJson.version}\n-------------------------------\nPort: ${port}\n--> Node.js Version: ${process.version}\n--> TypeScript Enabled!\n-----------------------------\nListening for requests...`);
});
