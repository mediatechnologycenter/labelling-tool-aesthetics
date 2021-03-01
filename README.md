![ETH MTC HEADER](./client/src/assets/imgs/ETHMTCHeaderOriginal.png)

# Labels collection tool

This is a fullstack labelling tool created by the [ETH Media Technology Center (MTC)](https://mtc.ethz.ch/)
in the scope of the project Aesthetic Assessment of Image and Video Content. Main contributors are
[Luca Campanella](https://github.com/lucacampanella) (luca.campanella1 +at+ gmail.com) and [Ali Uzpak](https://github.com/uzpaka) (ali.uzpak +at+ inf.ethz.ch), under the supervision of Clara Fernandez and Severin Klingler.

Note that this is a work in progress and not the final version of the tool.

### Project Description

Selecting the perfect teaser image from a huge collection of images is a difficult and very time consuming task. There are many different factors that are considered by experts when selecting images for further use: From the image composition, the mood, the camera position, colors, objects in the scene and facial expressions to whether the frame is representative of the story. In this project we devise methods for the automatic discovery of aesthetically pleasing images. For this reason, we design a labeling tool for our industry partners to rate images according to their own tastes, so that we can reproduce their picks and save them time. The editors are asked to indicate which of two simultaneously presented images they prefer aesthetically (“Which image do you like better?”). The compared images always belong to the same query so that they are similar in content and the labeller can focus on the aesthetics only. The collected data allows us not only to obtain scores per image to train our models, but also to analyze correlations between labellers and detect outliers.

<kbd><img src="./client/src/assets/imgs/readme_aesth.png" /></kbd>
<br/>
<br/>
<kbd><img src="./client/src/assets/imgs/readme_aesth_admin.png" /></kbd>

### Technologies
The backend is built with [Node.js](https://nodejs.org/en/), 
[mongoDB](https://www.mongodb.com/) and its node implementation 
[mongoose](https://mongoosejs.com/).
The front end uses [React](https://reactjs.org/) (and HTML, CSS, Javascript).


## Repository structure
#### Backend 
The server backend is contained in the main folder of the repository. 

`app.js` conntects to the mongodb and contains the express server and exposes the REST API, by linking to the 
routes contained in the `routes` folder, where each file corresponds to the respective 
front-end page. For example `admindashboard.js` replies to all the queries that are responsible
to populate the page with the same name in the frontend. <br/>
The `models` folder contains the mongodb schema definiton and some utility functions to work on it. <br/>
The `utils` folders contains files to insert content in the database when creating the server,
a script needed when deploying in Heroku and a `.service` file useful in case of a deployment on
a local machine. <br/>
The `json` folder can contain information to be added to the database, for example articles.  

`config.js` contains important configuration properties that apply to the backend. Please
refer to the comments in the file for more information.

#### Frontend
All the frontend is contained in the folder `client`, please refer to the readme in that 
folder for its explanation.

## Run on localhost in dev mode
- Install mongodb via: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/ 
- Start mongo daemon: `mongod`
- Install nodejs and npm, for example by following: https://nodejs.org/en/download/package-manager/
- Insert dummy database content: `node utils/insertDatabaseContent.js`
- `npm install` to install the packages required by the backend
- `npm start` to start the backend on port 5000
- `cd client` to locate yourself in the client folder
- `npm install` to install the packages required by the frontend
- `npm start` to start the frontend on port 3000. You'll be redirected to the browser automatically.

## Choose user registration process
Two registration processes are available, one privacy preserving, but not automatic and a second one,
automatic, but less privacy oriented.

In both cases the user is identified by a login token that corresponds to their mongodb ids.
No password or email is necessary to log in, just the authentication token that they receive upon
registration.

By default the tool runs in privacy preserving mode. In this mode the registration page explains
to the user that, in order to register, they have to send a request by email. The registration
request is processed by a human that under the admindashboard page generates a new token and
sends it back to the user. The server only retains the generated tokens and no personal info
about the user.

The automatic mode instead automatically sends a login token to the user with a predefined email
and saves in the database the name, surname, email and other info of the labellers.
To enable this mode:
- create a `.env` file in the `client` directory and insert one line stating 
`REACT_APP_AUTOMATIC_REGISTRATION="true"`
- if not existent, create a `.env` file in the main folder and add the lines:
```
EMAIL="myfavouritemail@gmail.com"
EMAIL_PASS="<pass>"
```
Where, in case of gmail, the password can be an app password generated by the gmail website.


## Deployment on Heroku

To deploy:
- Follow the guide for the regular node.js heroku deployment: https://devcenter.heroku.com/articles/deploying-nodejs
- Create a free database at https://www.mongodb.com/free-cloud-database
- In the Heroku dashboard, under `settings --> config vars`, set:
  - `MONGODB_URI` to the URI of the just created mongodb, for example 
  `mongodb+srv://myprojectnme:mypassword@myclustername.ywdlx.azure.mongodb.net/mydbname`
  - `ADMIN_TOKEN` to a random id
  - `NODE_ENV` to `heroku` 
  <br/><br/>
  Optionally, to setup the automatic email registration:
  - `REACT_APP_AUTOMATIC_REGISTRATION` to `true`
  - `EMAIL` to the sender email
  - `EMAIL_PASS` to the sender email password
  - `BASE_LINK` to the base link of your project (no slash at the end), for example
    `https://mtc-emotion-stance.herokuapp.com` 
- run `git push herku master` to finalize the deployment
  
  
## Deployment on any machine
This guide applies to any general deployment, also on ETH D-INFK virtual servers.
### General requirements
Mongodb:
- Install mongodb via: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/ 
- Start mongo daemon: `sudo systemctl start mongod`
- Check daemon is running: `sudo systemctl status mongod`
- Automatically load daemon every startup: `sudo systemctl enable mongod`

Nodejs and npm:
- Please follow any tutorial on nodejs and npm installation, for example:
https://nodejs.org/en/download/package-manager/

### Code from the repo
Clone this repository, then 

#### Client:
- `cd client`
- `npm install` to install all dependencies
- Build the react client for production: `npm run build`. This
will create an optimized version of the react client and will allow the 
backend in node to serve it.

#### Backend:
- `cd ..` (main directory)
- `npm install` to install all dependencies
- Create in the main directory of the project a `.env` file with the right information:
```
ADMIN_TOKEN="<token>"
MONGODB_URI="mongodb://localhost/labelling_tool"
NODE_ENV="production"
PORT=443
KEY_PATH="<path-to-tls-key>.key"
CERT_PATH="<path-to-tls-cert>.pem"
```
Optionally:
In `client/.env` insert `REACT_APP_AUTOMATIC_REGISTRATION="true"`
and in `.env`:
```
EMAIL="<email>"
EMAIL_PASS="<email-pass>"
EMAIL_BACKUP="<email-for-backup>"
BASE_LINK="<base-link>"
```
Optionally a different port for the http redirection service can be specified by: `HTTP_ONLY_PORT=8080`

Where `ADMIN_TOKEN` is just a secret sequence of letters and numbers that will
allow you to access the "hidden" admin page at the address: `maindomain.com//admindashboard?token=<token>`. Note
that to access this page you'll also need to be running the server on localhost or
accessing from the same subnet. (For ETH network just turn on the VPN)

`MONGODB_URI` is the URI of mongodb, it can be localhost if running a local
mongo deployment or remote otherwise.
`NODE_ENV` should be set to production for deployment. This will make sure
the connections at https work and the http ones will be redirected to https.
`KEY_PATH` and `CERT_PATH` should point to the local `*.key` and `*.pem` files
for the https / TLS deployment.

Test that everything is up and running:
- `sudo node app.js`

You should be able to access the server from the usual links and the DNS redirection, 
for example: `https://idvm-infk-mtc01.inf.ethz.ch/ `

For ETH deployment, in order to add a new DNS alias, it's necessary to contact the ISG.

#### Make the server a daemon
In order to make the server run at startup and re-start in case of crashes we need
to make it a daemon. This is done by defining one in the file `utils/labelling-tool-backend.service`
- copy the service file in the service directories: `sudo cp utils/labelling-tool-backend.service /lib/systemd/system/labelling-tool-backend.service`
- make the service run at startup: `sudo systemctl enable labelling-tool-backend.service`
- reboot or alternatively reload the service via `sudo systemctl daemon-reload labelling-tool-backend.service`
- check that the server is running in the background by looking at the logs: `sudo journalctl -u labelling-tool-backend`


### Troubleshooting
- Which service is running on which port: `sudo netstat -tulp`
- Look at the logs of the backend: `sudo journalctl -u labelling-tool-backend`
(shift-G to to the end)

## Recap of env variables 
List of environmental variables that can be declared.
In `.env` root file:
- `NODE_ENV` expresses the type of deployment, can be set to `developement`, `depolyment`, `heroku`.
Default if not preset: `developement`
- `MONGODB_URI` to the URI of the mongodb. Default if not present: `mongodb://localhost/labelling_tool`
- `ADMIN_TOKEN` a random id needed to access the `/admindashboard` page, using the link 
`/admindashboard?token=<ADMIN_TOKEN>`. Default if not present: the check of the admin token is not enforced.
- `PORT`, the port in which the backend should run. Default if not preset:
`5000`, suggested value for deployment: `443` (https)
- `HTTP_ONLY_PORT`, the port in which the http server that redirects to
https is running. Default value if not specified: `80`
- `KEY_PATH` the path to the key of the TLS certificate. (`*.key` file)
- `CERT_PATH` the path to the certificate file of the TLS certificate. (`*.pem` file)
- `BASE_LINK`, the base link of your project (no slash at the end), for example
`https://mtc-emotion-stance.herokuapp.com` <br/><br/>

Optionally, to setup the automatic email registration:
- `EMAIL`, the sender email
- `EMAIL_PASS`, the sender email password

Optionally, to setup the automatic email backup at 11PM:
- `EMAIL_BACKUP`, the email to which send the backup. `EMAIL` and `EMAIL_PASS` 
should also be set.

In `client/.env` root file:
- `REACT_APP_AUTOMATIC_REGISTRATION`, set to true `true` if you desire to activate
the fast registration mode, less privacy preserving. `EMAIL` and `EMAIL_PASS` 
should also be set.

